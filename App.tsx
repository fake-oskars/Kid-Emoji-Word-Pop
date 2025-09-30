
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ALL_ITEMS, translations, availableLanguages } from './constants';
import { 
  playSound, 
  initializeAudio, 
  playUIClick, 
  playMenuOpen, 
  playMenuClose, 
  playCorrectSound, 
  playIncorrectSound,
  playTransitionSound
} from './services/audioService';
import { 
  trackPageView,
  trackScreenView, 
  trackGameStart, 
  trackGameEnd, 
  trackAnswer, 
  trackSettingsChange,
  trackInteraction,
  trackAppInit
} from './services/analyticsService';
import type { Item } from './types';

// --- Helper Functions ---
const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getOptimalGridClass = (itemCount: number) => {
  // Determine optimal grid layout based on item count and screen size
  if (itemCount <= 2) return 'grid-cols-2 grid-rows-1';
  if (itemCount <= 4) return 'grid-cols-2 grid-rows-2';
  if (itemCount <= 6) return 'grid-cols-2 sm:grid-cols-3 grid-rows-3 sm:grid-rows-2';
  if (itemCount <= 9) return 'grid-cols-3 grid-rows-3';
  if (itemCount <= 12) return 'grid-cols-3 sm:grid-cols-4 grid-rows-4 sm:grid-rows-3';
  return 'grid-cols-4 sm:grid-cols-5 grid-rows-4 sm:grid-rows-3';
};

// --- Game Components ---

// Simple Stats Component
const SimpleStats: React.FC<{ correct: number; total: number; t: (key: string) => string }> = ({ correct, total, t }) => {
    if (total === 0) return null;
    
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-white/40">
            <div className="text-sm font-semibold text-gray-800">
                {correct} {t('correct')} • {total} {t('total')}
            </div>
        </div>
    );
};

// Game 1: Name It! (previously PopItGame)
const NameItGame: React.FC<{ activeItems: Item[]; t: (key: string) => string; onBack: () => void; }> = ({ activeItems, t, onBack }) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isPopping, setIsPopping] = useState(false);

  useEffect(() => {
    if (activeItems.length > 0) {
      setCurrentItemIndex(Math.floor(Math.random() * activeItems.length));
    }
  }, [activeItems]);
  
  const handleInteraction = useCallback(() => {
    if (isPopping || activeItems.length === 0) return;

    const itemToPlay = activeItems[currentItemIndex];
    playSound(itemToPlay.soundFrequency);
    trackInteraction('name_it_tap', { item: itemToPlay.name });
    setIsPopping(true);

    setTimeout(() => {
      let nextIndex;
      let attempts = 0;
      const maxAttempts = 10;
      
      // Try to find a different emoji, but also avoid showing the same one too recently
      do {
        nextIndex = Math.floor(Math.random() * activeItems.length);
        attempts++;
      } while (nextIndex === currentItemIndex && activeItems.length > 1 && attempts < maxAttempts);
      
      setCurrentItemIndex(nextIndex);
      setIsPopping(false);
    }, 300);
  }, [isPopping, currentItemIndex, activeItems]);

  const currentItem = activeItems[currentItemIndex] || ALL_ITEMS[0];
  const { emoji, color, textColor, name } = currentItem;

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center transition-colors duration-500 ease-in-out select-none cursor-pointer ${color}`}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <div className="absolute top-4 left-4 z-20">
        <BackButton onClick={onBack} />
      </div>
      <div className="relative flex flex-col items-center flex-grow justify-center">
        <div
          className={`transition-transform duration-300 ease-in-out ${
            isPopping ? 'scale-110' : 'scale-100'
          }`}
          style={{
            fontSize: `${Math.max(180, Math.min(400, Math.min(window.innerWidth, window.innerHeight) * 0.4))}px`
          }}
        >
          {emoji}
        </div>
        <div
          className={`font-bold mt-4 transition-opacity duration-300 ${textColor} opacity-100`}
          style={{
            fontSize: `${Math.max(48, Math.min(120, Math.min(window.innerWidth, window.innerHeight) * 0.12))}px`
          }}
        >
          {t(name)}
        </div>
      </div>
    </div>
  );
};

// Game 2: Find It!
type Difficulty = 'easy' | 'medium' | 'hard';
const FindItGame: React.FC<{ activeItems: Item[]; t: (key: string) => string; onBack: () => void; difficulty: Difficulty; emojiCount: number; onGameEnd?: (stats: {correct: number; total: number}) => void }> = ({ activeItems, t, onBack, difficulty, emojiCount, onGameEnd }) => {
    const [target, setTarget] = useState<Item | null>(null);
    const [options, setOptions] = useState<Item[]>([]);
    const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
    const [hardModePositions, setHardModePositions] = useState<React.CSSProperties[]>([]);
    const [incorrectlyClicked, setIncorrectlyClicked] = useState<string | null>(null);
    const [stats, setStats] = useState({ correct: 0, total: 0 });
    const [scatteredItemSize, setScatteredItemSize] = useState<number>(60);
    const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

    // New logic: use emojiCount directly, with different layouts based on count
    const isCardLayout = emojiCount <= 6;
    const isScatteredLayout = emojiCount >= 7;

    const handleBack = () => {
        if (onGameEnd) {
            onGameEnd(stats);
        }
        onBack();
    };

    const generateChallenge = useCallback(() => {
        if (activeItems.length < emojiCount) return;
        
        const shuffled = shuffleArray(activeItems);
        const newTarget = shuffled[0];
        const otherOptions = shuffled.slice(1, emojiCount);
        const allOptions = shuffleArray([newTarget, ...otherOptions]);
        
        setTarget(newTarget);
        setOptions(allOptions);
        setFeedback('idle');
        setQuestionStartTime(Date.now());

        if (isScatteredLayout) {
            // GUARANTEED NON-OVERLAPPING GRID SYSTEM
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const headerHeight = 200;
            const footerHeight = 100;
            const padding = 40;
            
            const availableWidth = viewportWidth - (padding * 2);
            const availableHeight = viewportHeight - headerHeight - footerHeight;
            
            // Calculate grid dimensions to fit all items
            const cols = Math.ceil(Math.sqrt(emojiCount));
            const rows = Math.ceil(emojiCount / cols);
            
            // Calculate cell size to fit grid in available space
            const cellWidth = availableWidth / cols;
            const cellHeight = availableHeight / rows;
            const cellSize = Math.min(cellWidth, cellHeight);
            
            // Calculate emoji size to fit in cells with padding
            // Use larger multipliers for bigger, more visible emoji
            const isMobile = viewportWidth < 768;
            const isHighCount = emojiCount >= 24;
            
            // Use percentage of cellSize - bigger emoji for better visibility
            let sizeMultiplier;
            if (isMobile && isHighCount) {
                sizeMultiplier = 0.65; // 65% of cell on mobile with many items (was 0.45)
            } else if (isMobile) {
                sizeMultiplier = 0.75; // 75% of cell on mobile (was 0.55)
            } else if (isHighCount) {
                sizeMultiplier = 0.7; // 70% of cell on desktop with many items (was 0.5)
            } else {
                sizeMultiplier = 0.85; // 85% of cell on desktop (was 0.6)
            }
            
            const itemSize = Math.max(40, cellSize * sizeMultiplier); // Minimum 40px, otherwise proportional
            
            setScatteredItemSize(itemSize);
            
            // Generate grid positions with random offsets within cells
            const positions: React.CSSProperties[] = [];
            
            for (let i = 0; i < emojiCount; i++) {
                const row = Math.floor(i / cols);
                const col = i % cols;
                
                // Chess pattern: offset every other row by half a cell width
                const isOddRow = row % 2 === 1;
                const chessOffset = isOddRow ? cellWidth * 0.5 : 0;
                
                // Calculate base grid position with chess pattern offset
                const baseLeft = padding + (col * cellWidth) + chessOffset;
                const baseTop = headerHeight + (row * cellHeight);
                
                // Add random offset within cell (but keep emoji centered-ish)
                // Calculate safe offset that won't push items outside bounds
                const safeOffsetMultiplier = (isMobile && isHighCount) ? 0.1 : 0.2;
                const maxSafeOffset = (cellSize - itemSize) * safeOffsetMultiplier;
                const randomOffsetX = (Math.random() - 0.5) * maxSafeOffset;
                const randomOffsetY = (Math.random() - 0.5) * maxSafeOffset;
                
                // Center the emoji in the cell and add random offset
                const finalLeft = baseLeft + (cellWidth - itemSize) / 2 + randomOffsetX;
                const finalTop = baseTop + (cellHeight - itemSize) / 2 + randomOffsetY;
                
                // Ensure position stays within bounds (account for chess offset)
                const clampedLeft = Math.max(padding, Math.min(finalLeft, viewportWidth - padding - itemSize));
                const clampedTop = Math.max(headerHeight, Math.min(finalTop, viewportHeight - footerHeight - itemSize));
                
                positions.push({
                    top: `${clampedTop}px`,
                    left: `${clampedLeft}px`,
                    transform: `rotate(${Math.random() * 30 - 15}deg) scale(${Math.random() * 0.2 + 0.9})`
                });
            }
            
            setHardModePositions(positions);
        }

    }, [activeItems, emojiCount, isScatteredLayout]);

    useEffect(() => {
        generateChallenge();
    }, [generateChallenge]);

    const handleOptionClick = (item: Item) => {
        if (feedback !== 'idle' || !target) return;

        const responseTime = Date.now() - questionStartTime;

        if (item.name === target.name) {
            playCorrectSound();
            // Play the item sound slightly after the success chime starts
            setTimeout(() => playSound(target.soundFrequency), 200);
            setFeedback('correct');
            setStats(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
            trackAnswer('correct', item.name, 'find-it', responseTime);
            setTimeout(generateChallenge, 1200);
        } else {
            playIncorrectSound();
            setFeedback('incorrect');
            setIncorrectlyClicked(item.name);
            trackAnswer('incorrect', item.name, 'find-it', responseTime);
            setStats(prev => ({ ...prev, total: prev.total + 1 }));
            setTimeout(() => {
              setFeedback('idle');
              setIncorrectlyClicked(null);
            }, 820);
        }
    };
    
    if (activeItems.length < emojiCount) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
          <BackButton onClick={handleBack} />
          <h2 className="text-2xl text-gray-700">Need more items to play!</h2>
          <p className="text-gray-500">Open settings and set the number of items to {emojiCount} or more.</p>
        </div>
      );
    }
    
    if (!target) return null; // Loading state

    const containerClass = isScatteredLayout ? 'bg-sky-100' : target.color;

    return (
        <div className={`w-full h-full flex flex-col items-center justify-start transition-colors duration-300 select-none p-4 pt-20 ${containerClass}`}>
            <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-4 z-20">
                <BackButton onClick={handleBack} />
                <SimpleStats correct={stats.correct} total={stats.total} t={t} />
                <div className="w-12"></div> {/* Spacer for settings button alignment */}
            </div>
            <div className={`text-center mb-8 transition-transform duration-300 z-10 ${feedback === 'correct' ? 'scale-110' : ''}`}>
                <h2 className={`text-4xl md:text-6xl font-bold ${target.textColor}`}>
                    {t('findThe')} {t(target.name)}?
                </h2>
            </div>
            
            {isScatteredLayout ? (
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    {options.map((item, index) => (
                        <button
                            key={item.name}
                            onClick={() => handleOptionClick(item)}
                            className={`absolute transition-all duration-200 active:scale-90 will-change-transform flex items-center justify-center
                                        ${incorrectlyClicked === item.name ? 'animate-shake bg-red-200/60 backdrop-blur-sm rounded-full p-2' : ''}
                                        ${feedback === 'correct' && item.name === target.name ? 'scale-[1.3] ring-4 ring-white rounded-full' : ''}
                                        `}
                            style={{
                                ...hardModePositions[index],
                                width: `${scatteredItemSize}px`,
                                height: `${scatteredItemSize}px`,
                            }}
                        >
                            <span 
                                className="emoji-responsive"
                                style={{
                                    fontSize: `${scatteredItemSize * 0.8}px`,
                                    lineHeight: '1',
                                }}
                            >
                                {item.emoji}
                            </span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className={`grid gap-2 sm:gap-3 md:gap-4 w-full h-full max-w-6xl mx-auto px-4 sm:px-6 py-4 ${getOptimalGridClass(emojiCount)}`}>
                    {options.map((item) => {
                        // Calculate emoji size based on available space and grid layout
                        const cols = emojiCount <= 2 ? 2 : emojiCount <= 4 ? 2 : emojiCount <= 6 ? 3 : 4;
                        const rows = Math.ceil(emojiCount / cols);
                        
                        // Use viewport dimensions to calculate cell size
                        const vw = window.innerWidth;
                        const vh = window.innerHeight;
                        const maxWidth = Math.min(vw * 0.9, 1536); // max-w-6xl with padding
                        const maxHeight = vh * 0.7; // Available height for grid
                        
                        const cellWidth = maxWidth / cols;
                        const cellHeight = maxHeight / rows;
                        const cellSize = Math.min(cellWidth, cellHeight);
                        
                        // Emoji should be 60-70% of cell size
                        const emojiSize = Math.max(40, Math.min(cellSize * 0.65, 180));
                        
                        return (
                            <button
                                key={item.name}
                                onClick={() => handleOptionClick(item)}
                                className={`w-full h-full flex items-center justify-center rounded-2xl sm:rounded-3xl shadow-lg transition-all duration-200 active:scale-90
                                            ${incorrectlyClicked === item.name ? 'animate-shake bg-red-200/60' : 'bg-white/30'}
                                            ${feedback === 'correct' && item.name === target.name ? 'scale-110 ring-4 ring-white' : ''}
                                            `}
                            >
                                <span 
                                    className="emoji-responsive"
                                    style={{
                                        fontSize: `${emojiSize}px`,
                                        lineHeight: '1',
                                    }}
                                >
                                    {item.emoji}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
            
            {feedback === 'correct' && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none z-20">
                    <div className="text-[12rem] animate-bounce">🎉</div>
                </div>
            )}
        </div>
    );
};


// Game Selection Screen
const GameSelection: React.FC<{ onSelect: (mode: 'name-it' | 'find-it') => void; t: (key: string) => string; }> = ({ onSelect, t }) => {
  const [currentEmoji, setCurrentEmoji] = useState(0);
  const emojis = ['🐄', '🍎', '🚗', '🎈', '🌟'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmoji(prev => (prev + 1) % emojis.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [emojis.length]);

  const handleSelection = (mode: 'name-it' | 'find-it') => {
    playTransitionSound();
    setTimeout(() => onSelect(mode), 150);
  };
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 select-none" style={{ backgroundColor: '#FCF7E1' }}>
      {/* Clean Title */}
      <div className="text-center mb-8">
        <h1 
          className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent"
          style={{ backgroundImage: 'linear-gradient(to right, #FF6F00, #FF0090)' }}
        >
          {t('selectGame')}
        </h1>
      </div>

      {/* Game Cards */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 w-full max-w-4xl flex-1 max-h-[70vh]">
        
        {/* Name It! Game Card - Changing Emojis */}
        <button
          onClick={() => handleSelection('name-it')}
          className="group flex-1 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-8 sm:p-10 transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-xl flex flex-col items-center justify-center min-h-[200px] sm:min-h-[250px]"
        >
          {/* Animated Emoji Container */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 flex items-center justify-center relative">
            <span 
              className="text-7xl sm:text-8xl transition-all duration-500 transform" 
              key={currentEmoji}
              style={{
                animation: 'fadeInScale 0.5s ease-in-out'
              }}
            >
              {emojis[currentEmoji]}
            </span>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">
            {t('popItGameTitle')}
          </h2>
        </button>

        {/* Find It! Game Card - Train with Magnifying Glass */}
        <button
          onClick={() => handleSelection('find-it')}
          className="group flex-1 bg-gradient-to-br from-orange-500 to-pink-500 rounded-3xl p-8 sm:p-10 transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-orange-300 shadow-xl flex flex-col items-center justify-center min-h-[200px] sm:min-h-[250px]"
        >
          {/* Animated Icon Container */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 flex items-center justify-center relative">
            {/* Train Emoji */}
            <span className="text-7xl sm:text-8xl">🚂</span>
            
            {/* Animated Magnifying Glass */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                <span 
                  className="absolute text-4xl sm:text-5xl orbit-animation top-1/2 left-1/2"
                  style={{
                    transformOrigin: '-32px 0px',
                    marginTop: '-24px',
                    marginLeft: '-24px'
                  }}
                >
                  🔍
                </span>
              </div>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">
            {t('findItGameTitle')}
          </h2>
        </button>
      </div>
      
      {/* Custom Animations */}
      <style jsx>{`
        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(48px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(48px) rotate(-360deg);
          }
        }
        
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .orbit-animation {
          animation: orbit 5s linear infinite;
        }
      `}</style>
    </div>
  );
};


// Main App Component
const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<'name-it' | 'find-it' | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [gameStats, setGameStats] = useState<{correct: number; total: number} | null>(null);

  // --- Settings state with localStorage ---
  const [language, setLanguage] = useState<string>(() => localStorage.getItem('toddlerPopLanguage') || 'lv');
  const [emojiCount, setEmojiCount] = useState<number>(() => {
    const savedCount = localStorage.getItem('toddlerPopEmojiCount');
    return savedCount ? parseInt(savedCount, 10) : 10;
  });
  const [difficulty, setDifficulty] = useState<Difficulty>(() => (localStorage.getItem('toddlerPopDifficulty') as Difficulty) || 'easy');

  const activeItems = useMemo(() => {
    // Always provide a large pool of emojis for variety, but games will use only what they need
    const minPoolSize = Math.max(emojiCount, 20); // Always have at least 20 emojis for variety
    const maxPoolSize = Math.min(ALL_ITEMS.length, minPoolSize + 10); // Add extra 10 for more variety
    return shuffleArray(ALL_ITEMS).slice(0, maxPoolSize);
  }, [emojiCount]);

  useEffect(() => {
    localStorage.setItem('toddlerPopLanguage', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('toddlerPopEmojiCount', emojiCount.toString());
  }, [emojiCount]);

  useEffect(() => {
    localStorage.setItem('toddlerPopDifficulty', difficulty);
  }, [difficulty]);
  
  // Initialize analytics and audio
  useEffect(() => {
    // Track app initialization
    trackAppInit();
    trackPageView('/', 'Teo Spēles - Bērnu Emoji spēles');
    trackScreenView('menu');

    const initAudioOnFirstInteraction = () => {
      initializeAudio();
    };

    window.addEventListener('touchstart', initAudioOnFirstInteraction, { once: true });
    window.addEventListener('click', initAudioOnFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('touchstart', initAudioOnFirstInteraction);
      window.removeEventListener('click', initAudioOnFirstInteraction);
    };
  }, []);


  useEffect(() => {
    // Ensure minimum emoji count for hard difficulty
    if (difficulty === 'hard' && emojiCount < 12) {
      setEmojiCount(12);
    }
  }, [difficulty]);
  
  const handleSelectGame = (mode: 'name-it' | 'find-it') => {
    setGameMode(mode);
    trackScreenView(mode);
    if (mode === 'find-it') {
      trackGameStart(mode, difficulty, emojiCount);
    } else {
      trackGameStart(mode);
    }
  };

  const handleGoBack = () => {
    playUIClick();
    if (gameMode) {
      // Track game end with stats if available
      trackGameEnd(gameStats || undefined);
    }
    setGameMode(null);
    setGameStats(null);
    trackScreenView('menu');
  };

  const handleGameEnd = (stats: {correct: number; total: number}) => {
    setGameStats(stats);
  };

  const t = (key: string) => translations[language]?.[key] || translations['en'][key] || key;
  
  const renderContent = () => {
    if (!gameMode) {
      return <GameSelection onSelect={handleSelectGame} t={t} />;
    }

    if (gameMode === 'name-it') {
      return <NameItGame activeItems={activeItems} t={t} onBack={handleGoBack} />;
    }

    if (gameMode === 'find-it') {
      return <FindItGame activeItems={activeItems} t={t} onBack={handleGoBack} difficulty={difficulty} emojiCount={emojiCount} onGameEnd={handleGameEnd} />;
    }
  };


  return (
    <>
      {renderContent()}

      {/* Settings Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isMenuOpen) {
            playMenuOpen();
          } else {
            playMenuClose();
          }
          setIsMenuOpen(!isMenuOpen);
        }}
        className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-3xl z-40 bg-white/30 rounded-full hover:bg-white/50 transition-transform duration-200 active:scale-90"
        aria-label="Open settings"
      >
        ⚙️
      </button>

      {/* Settings Menu Popover */}
      <div
        className={`absolute inset-0 z-30 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          playMenuClose();
          setIsMenuOpen(false);
        }}
      >
        <div
            className={`absolute top-16 right-4 w-[280px] p-4 rounded-xl shadow-2xl origin-top-right
                        bg-white/40 backdrop-blur-xl border border-white/20 text-slate-800
                        transition-all duration-300 ease-in-out
                        ${isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{t('Settings')}</h2>
            <button onClick={() => { playMenuClose(); setIsMenuOpen(false); }} className="text-2xl text-slate-600 hover:text-slate-900">&times;</button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="language-select" className="block text-sm font-medium mb-1">{t('language')}</label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => {
                  playUIClick();
                  setLanguage(e.target.value);
                }}
                className="w-full p-2 border-0 rounded-md bg-white/50 focus:ring-2 focus:ring-sky-400"
              >
                {availableLanguages.map(({ code, flag, name }) => (
                  <option key={code} value={code}>
                    {`${flag} ${name}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="emoji-count-slider" className="block text-sm font-medium mb-1">{t('itemCount')} ({emojiCount})</label>
              <input
                id="emoji-count-slider"
                type="range"
                min={4}
                max={36}
                value={emojiCount}
                onChange={(e) => {
                  playUIClick();
                  const newCount = parseInt(e.target.value, 10);
                  setEmojiCount(newCount);
                  trackSettingsChange('emoji_count', newCount);
                  
                  // Automatically set difficulty based on emoji count
                  if (newCount === 4) {
                    setDifficulty('easy');
                    trackSettingsChange('difficulty', 'easy');
                  } else if (newCount === 6) {
                    setDifficulty('medium');
                    trackSettingsChange('difficulty', 'medium');
                  } else if (newCount >= 7) {
                    setDifficulty('hard');
                    trackSettingsChange('difficulty', 'hard');
                  }
                }}
                className="w-full h-2 bg-white/50 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-500 mt-1">
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('difficulty')}</label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      playUIClick();
                      setDifficulty(level);
                      // Set appropriate emoji count based on difficulty
                      if (level === 'easy') {
                        setEmojiCount(4);
                      } else if (level === 'medium') {
                        setEmojiCount(6);
                      } else if (level === 'hard') {
                        setEmojiCount(12);
                      }
                    }}
                    className={`p-2 rounded-md text-sm font-semibold transition-colors ${
                      difficulty === level
                        ? 'bg-sky-500 text-white shadow'
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                  >
                    {t(level)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const BackButton: React.FC<{onClick: () => void}> = ({onClick}) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="w-12 h-12 flex items-center justify-center text-3xl bg-white/30 rounded-full hover:bg-white/50 transition-transform duration-200 active:scale-90"
        aria-label="Go back"
    >
      ⬅️
    </button>
);


export default App;
