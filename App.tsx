import React, { useState, useEffect, useCallback } from 'react';
import { ALL_ITEMS, translations, availableLanguages } from './constants';
import { playSound, initializeAudio } from './services/audioService';
import type { Item } from './types';

const App: React.FC = () => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isPopping, setIsPopping] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [startEmoji, setStartEmoji] = useState('👋');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- Settings state with localStorage ---
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem('toddlerPopLanguage') || 'en';
  });
  const [emojiCount, setEmojiCount] = useState<number>(() => {
    const savedCount = localStorage.getItem('toddlerPopEmojiCount');
    return savedCount ? parseInt(savedCount, 10) : 10;
  });

  const [activeItems, setActiveItems] = useState<Item[]>([]);

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem('toddlerPopLanguage', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('toddlerPopEmojiCount', emojiCount.toString());
  }, [emojiCount]);

  // Create and shuffle the active item list when emojiCount changes
  useEffect(() => {
    const shuffleArray = (array: Item[]) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    const newActiveItems = shuffleArray(ALL_ITEMS).slice(0, emojiCount);
    setActiveItems(newActiveItems);

    if (newActiveItems.length > 0) {
      setCurrentItemIndex(Math.floor(Math.random() * newActiveItems.length));
      setStartEmoji(newActiveItems[Math.floor(Math.random() * newActiveItems.length)].emoji);
    }
  }, [emojiCount]);

  const currentItem = activeItems[currentItemIndex] || ALL_ITEMS[0];
  const { emoji, color, textColor, name } = currentItem;

  const handleInteraction = useCallback(() => {
    if (isPopping || activeItems.length === 0) return;

    const itemToPlay = activeItems[currentItemIndex];
    playSound(itemToPlay.soundFrequency);
    setIsPopping(true);

    setTimeout(() => {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * activeItems.length);
      } while (nextIndex === currentItemIndex && activeItems.length > 1);
      
      setCurrentItemIndex(nextIndex);
      setIsPopping(false);
    }, 300);
  }, [isPopping, currentItemIndex, activeItems]);

  const handleStart = () => {
    initializeAudio();
    setGameStarted(true);
  };

  const t = (key: string) => translations[language]?.[key] || translations['en'][key] || key;
  
  const mainScreenAction = gameStarted ? handleInteraction : handleStart;

  return (
    <>
      <div
        className={`w-full h-full flex flex-col items-center justify-center transition-colors duration-500 ease-in-out select-none cursor-pointer ${gameStarted ? color : 'bg-gray-100'}`}
        onClick={mainScreenAction}
        onTouchStart={mainScreenAction}
      >
        {!gameStarted ? (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-8xl mb-4 animate-bounce">{startEmoji}</div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-700">{t('startGame')}</h1>
          </div>
        ) : (
          <div className="relative flex flex-col items-center flex-grow justify-center">
            <div
              className={`text-[10rem] md:text-[14rem] transition-transform duration-300 ease-in-out drop-shadow-2xl ${
                isPopping ? 'scale-110' : 'scale-100'
              }`}
              style={{ textShadow: '4px 4px 8px rgba(0,0,0,0.2)' }}
            >
              {emoji}
            </div>
            <div
              className={`text-5xl md:text-7xl font-bold mt-4 transition-opacity duration-300 ${textColor} opacity-100`}
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
            >
              {t(name)}
            </div>
          </div>
        )}
      </div>

      {/* Settings Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen(!isMenuOpen);
        }}
        className="absolute top-4 right-4 text-3xl p-2 z-40 bg-white/30 rounded-full hover:bg-white/50 transition-transform duration-200 active:scale-90"
        aria-label="Open settings"
      >
        ⚙️
      </button>

      {/* Settings Menu Popover */}
      <div
        className={`absolute inset-0 z-30 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
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
            <button onClick={() => setIsMenuOpen(false)} className="text-2xl text-slate-600 hover:text-slate-900">&times;</button>
          </div>
          
          <div className="space-y-4">
            {/* Language Selector */}
            <div>
              <label htmlFor="language-select" className="block text-sm font-medium mb-1">{t('language')}</label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border-0 rounded-md bg-white/50 focus:ring-2 focus:ring-sky-400"
              >
                {availableLanguages.map(({ code, flag, name }) => (
                  <option key={code} value={code}>
                    {`${flag} ${name}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Emoji Count Slider */}
            <div>
              <label htmlFor="emoji-count-slider" className="block text-sm font-medium mb-1">{t('itemCount')} ({emojiCount})</label>
              <input
                id="emoji-count-slider"
                type="range"
                min="5"
                max={ALL_ITEMS.length}
                value={emojiCount}
                onChange={(e) => setEmojiCount(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-white/50 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
