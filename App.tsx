import React, { useState, useEffect, useCallback } from 'react';
import { ALL_ITEMS, translations, availableLanguages } from './constants';
import { playSound, initializeAudio } from './services/audioService';
import type { Item } from './types';

const App: React.FC = () => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isPopping, setIsPopping] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [language, setLanguage] = useState('en');
  const [startEmoji, setStartEmoji] = useState('👋');

  // Initialize with a default item before useEffect runs
  const currentItem = ALL_ITEMS[currentItemIndex] || ALL_ITEMS[0];
  const { emoji, color, textColor, name } = currentItem;

  const handleInteraction = useCallback(() => {
    if (isPopping) return;

    const itemToPlay = ALL_ITEMS[currentItemIndex];
    playSound(itemToPlay.soundFrequency);
    setIsPopping(true);

    setTimeout(() => {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * ALL_ITEMS.length);
      } while (nextIndex === currentItemIndex);
      
      setCurrentItemIndex(nextIndex);
      setIsPopping(false);
    }, 300);
  }, [isPopping, currentItemIndex]);

  useEffect(() => {
      const initialGameIndex = Math.floor(Math.random() * ALL_ITEMS.length);
      setCurrentItemIndex(initialGameIndex);
      
      const startEmojiIndex = Math.floor(Math.random() * ALL_ITEMS.length);
      setStartEmoji(ALL_ITEMS[startEmojiIndex].emoji);
  }, []);

  const handleStart = () => {
    initializeAudio();
    setGameStarted(true);
  };

  const t = (key: string) => translations[language]?.[key] || key;

  return (
    <div
      className={`w-screen h-screen flex flex-col items-center justify-center transition-colors duration-500 ease-in-out select-none overflow-hidden ${gameStarted ? color : 'bg-gray-100'}`}
      onClick={gameStarted ? handleInteraction : handleStart}
      onTouchStart={gameStarted ? handleInteraction : handleStart}
    >
      <div 
        className="absolute top-4 right-4 bg-white/50 p-2 rounded-lg shadow-md flex gap-2 z-10"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {availableLanguages.map(({ code, flag }) => (
          <button
            key={code}
            onClick={() => setLanguage(code)}
            className={`text-2xl p-2 rounded-md transition-transform duration-200 ${language === code ? 'scale-125 ring-2 ring-blue-500' : 'scale-100 hover:scale-110'}`}
            aria-label={`Select language: ${code}`}
          >
            {flag}
          </button>
        ))}
      </div>

      {!gameStarted ? (
        <div className="flex flex-col items-center justify-center text-center cursor-pointer">
          <div className="text-8xl mb-4 animate-bounce">{startEmoji}</div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-700">{t('startGame')}</h1>
        </div>
      ) : (
        <div className="relative flex flex-col items-center flex-grow justify-center">
          <div
            className={`text-[10rem] md:text-[14rem] cursor-pointer transition-transform duration-300 ease-in-out drop-shadow-2xl ${
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
  );
};

export default App;