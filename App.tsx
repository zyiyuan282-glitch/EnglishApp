
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Difficulty, WordPair, Card, GameStatus } from './types';
import { fetchWordPairs } from './services/geminiService';
import GameCard from './components/GameCard';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MIDDLE);
  const [words, setWords] = useState<WordPair[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const timerRef = useRef<number | null>(null);

  const initializeGame = async (selectedDifficulty: Difficulty) => {
    setStatus('loading');
    setDifficulty(selectedDifficulty);
    const wordPairs = await fetchWordPairs(selectedDifficulty, 8);
    setWords(wordPairs);

    const initialCards: Card[] = [];
    wordPairs.forEach((pair) => {
      initialCards.push({
        id: `en-${pair.id}`,
        pairId: pair.id,
        content: pair.en,
        type: 'en',
        isMatched: false,
      });
      initialCards.push({
        id: `zh-${pair.id}`,
        pairId: pair.id,
        content: pair.zh,
        type: 'zh',
        isMatched: false,
      });
    });

    // Shuffle
    const shuffled = initialCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setTimer(0);
    setScore(0);
    setSelectedCards([]);
    setStatus('playing');

    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  const handleCardSelect = (card: Card) => {
    if (selectedCards.some((s) => s.id === card.id) || card.isMatched) return;

    const newSelected = [...selectedCards, card];
    
    // Only allow one of each type or two cards max
    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (first.pairId === second.pairId && first.type !== second.type) {
        // Match!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.pairId === first.pairId ? { ...c, isMatched: true } : c
            )
          );
          setScore((prev) => prev + 10);
          setSelectedCards([]);
        }, 300);
      } else {
        // No match
        setSelectedCards(newSelected);
        setTimeout(() => {
          setSelectedCards([]);
        }, 800);
      }
    } else {
      setSelectedCards(newSelected);
    }
  };

  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.isMatched)) {
      setStatus('finished');
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
  }, [cards]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-8">
      {/* Header */}
      <header className="max-w-4xl w-full mb-8 text-center">
        <h1 className="text-4xl font-bold text-indigo-900 mb-2 tracking-tight">
          英语单词连连看
        </h1>
        <p className="text-slate-600 font-medium">通过趣味匹配，轻松掌握英语词汇</p>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full flex-grow flex flex-col items-center">
        {status === 'idle' && (
          <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md animate-bounce-in">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">选择游戏难度</h2>
            <div className="grid grid-cols-1 gap-3">
              {Object.values(Difficulty).map((level) => (
                <button
                  key={level}
                  onClick={() => initializeGame(level)}
                  className="w-full py-4 px-6 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold transition-all duration-200 text-left flex justify-between items-center group"
                >
                  {level}
                  <span className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                    开始 →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-800 font-semibold text-lg">Gemini 正在为你准备单词...</p>
          </div>
        )}

        {status === 'playing' && (
          <div className="w-full">
            {/* HUD */}
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex gap-8">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">分数</span>
                  <span className="text-2xl font-bold text-indigo-600">{score}</span>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">用时</span>
                  <span className="text-2xl font-bold text-slate-700">{formatTime(timer)}</span>
                </div>
              </div>
              <button 
                onClick={() => setStatus('idle')}
                className="text-sm font-semibold text-slate-400 hover:text-red-500 transition-colors"
              >
                退出游戏
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {cards.map((card) => (
                <GameCard
                  key={card.id}
                  card={card}
                  isSelected={selectedCards.some((s) => s.id === card.id)}
                  onSelect={handleCardSelect}
                />
              ))}
            </div>
          </div>
        )}

        {status === 'finished' && (
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl animate-bounce-in text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-800">做得好！</h2>
              <p className="text-slate-500 mt-2">你用了 {formatTime(timer)} 完成了所有匹配</p>
            </div>

            <div className="grid grid-cols-1 gap-2 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {words.map((word) => (
                <div key={word.id} className="bg-slate-50 p-3 rounded-xl flex items-center justify-between group">
                  <div className="text-left">
                    <span className="font-bold text-indigo-700">{word.en}</span>
                    <span className="text-slate-400 mx-2">|</span>
                    <span className="text-slate-700 font-medium">{word.zh}</span>
                    <p className="text-xs text-slate-400 mt-1">{word.explanation}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStatus('idle')}
                className="flex-1 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all"
              >
                更换难度
              </button>
              <button
                onClick={() => initializeGame(difficulty)}
                className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
              >
                再玩一次
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 text-slate-400 text-sm">
        基于 Gemini AI 构建 &middot; 知识就是力量
      </footer>
    </div>
  );
};

export default App;
