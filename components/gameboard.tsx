'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GuessResult, LetterState } from '@/utils/gameLogic';

interface TileProps {
  letter: string;
  state: LetterState;
  index: number;
  isRevealing: boolean;
}

const Tile: React.FC<TileProps> = ({ letter, state, index, isRevealing }) => {
  const stateColors = {
    correct: 'bg-green-600 border-green-600 text-white',
    present: 'bg-yellow-500 border-yellow-500 text-white',
    absent: 'bg-gray-600 border-gray-600 text-white',
    empty: 'bg-transparent border-gray-500 text-white'
  };

  const variants = {
    idle: { rotateX: 0, scale: 1 },
    flip: { rotateX: 90, scale: 0.95 },
    reveal: { rotateX: 0, scale: 1 }
  };

  return (
    <motion.div
      initial="idle"
      animate={isRevealing ? ['flip', 'reveal'] : letter ? { scale: [1, 1.1, 1] } : 'idle'}
      variants={variants}
      transition={{
        duration: isRevealing ? 0.6 : 0.1,
        delay: isRevealing ? index * 0.15 : 0,
        times: isRevealing ? [0, 0.5, 1] : undefined
      }}
      className={`w-14 h-14 sm:w-16 sm:h-16 border-2 flex items-center justify-center text-2xl sm:text-3xl font-bold rounded transition-colors ${
        stateColors[state]
      }`}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      {letter}
    </motion.div>
  );
};

interface GameBoardProps {
  guesses: GuessResult[][];
  currentGuess: string;
  currentRow: number;
  revealingRow: number | null;
  shake: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  guesses,
  currentGuess,
  currentRow,
  revealingRow,
  shake
}) => {
  return (
    <div className="grid gap-2 mb-8">
      {Array.from({ length: 6 }).map((_, rowIndex) => {
        const isCurrentRow = rowIndex === currentRow;
        const isRevealingRow = rowIndex === revealingRow;
        
        let rowData: { letter: string; state: LetterState }[];
        
        if (rowIndex < guesses.length) {
          // Completed guess
          rowData = guesses[rowIndex];
        } else if (isCurrentRow) {
          // Current guess being typed
          rowData = currentGuess.split('').map(letter => ({
            letter,
            state: 'empty' as LetterState
          }));
          // Fill remaining slots
          while (rowData.length < 5) {
            rowData.push({ letter: '', state: 'empty' });
          }
        } else {
          // Empty row
          rowData = Array(5).fill({ letter: '', state: 'empty' });
        }

        return (
          <motion.div
            key={rowIndex}
            animate={shake && isCurrentRow ? {
              x: [-10, 10, -10, 10, -5, 5, 0],
              transition: { duration: 0.5 }
            } : {}}
            className="flex gap-2 justify-center"
          >
            {rowData.map((tile, index) => (
              <Tile
                key={`${rowIndex}-${index}`}
                letter={tile.letter}
                state={tile.state}
                index={index}
                isRevealing={isRevealingRow}
              />
            ))}
          </motion.div>
        );
      })}
    </div>
  );
};