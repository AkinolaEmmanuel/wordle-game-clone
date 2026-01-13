'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LetterState } from '@/utils/gameLogic';
import { Delete } from 'lucide-react';

interface KeyProps {
  letter: string;
  state: LetterState;
  onClick: () => void;
  isWide?: boolean;
}

const Key: React.FC<KeyProps> = ({ letter, state, onClick, isWide }) => {
  const stateColors = {
    correct: 'bg-green-600 hover:bg-green-700',
    present: 'bg-yellow-500 hover:bg-yellow-600',
    absent: 'bg-gray-700 hover:bg-gray-600',
    empty: 'bg-gray-500 hover:bg-gray-400'
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        ${isWide ? 'px-3 sm:px-4 text-xs sm:text-sm' : 'px-2 sm:px-3'} 
        py-3 sm:py-4 rounded font-bold text-white 
        ${stateColors[state]} 
        transition-colors duration-200
        min-w-[32px] sm:min-w-[40px]
        flex items-center justify-center
      `}
    >
      {letter === 'BACK' ? <Delete size={20} /> : letter}
    </motion.button>
  );
};

interface GameKeyboardProps {
  mode: 'words' | 'numbers';
  keyStates: Record<string, LetterState>;
  onKeyPress: (key: string) => void;
}

export const GameKeyboard: React.FC<GameKeyboardProps> = ({
  mode,
  keyStates,
  onKeyPress
}) => {
  const letterRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
  ];

  const numberRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['ENTER', '0', 'BACK']
  ];

  const rows = mode === 'words' ? letterRows : numberRows;

  return (
    <div className="w-full max-w-xl mx-auto space-y-2">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center">
          {row.map((key) => (
            <Key
              key={key}
              letter={key}
              state={keyStates[key] || 'empty'}
              onClick={() => onKeyPress(key)}
              isWide={key === 'ENTER' || key === 'BACK'}
            />
          ))}
        </div>
      ))}
    </div>
  );
};