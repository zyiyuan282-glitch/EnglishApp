
import React from 'react';
import { Card } from '../types';

interface GameCardProps {
  card: Card;
  isSelected: boolean;
  onSelect: (card: Card) => void;
}

const GameCard: React.FC<GameCardProps> = ({ card, isSelected, onSelect }) => {
  if (card.isMatched) {
    return (
      <div className="w-full h-24 sm:h-32 bg-gray-100 border-2 border-transparent rounded-xl flex items-center justify-center opacity-30 cursor-default">
        <span className="text-gray-400 text-sm font-medium line-through">{card.content}</span>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(card)}
      className={`
        w-full h-24 sm:h-32 rounded-xl border-2 cursor-pointer transition-all duration-300
        flex items-center justify-center p-2 text-center shadow-sm hover:shadow-md
        ${isSelected 
          ? 'border-indigo-600 bg-indigo-50 transform scale-105 z-10' 
          : 'border-white bg-white hover:border-indigo-200'
        }
      `}
    >
      <span className={`
        font-semibold select-none
        ${card.type === 'en' ? 'text-indigo-800 text-lg sm:text-xl' : 'text-slate-700 text-md sm:text-lg'}
      `}>
        {card.content}
      </span>
    </div>
  );
};

export default GameCard;
