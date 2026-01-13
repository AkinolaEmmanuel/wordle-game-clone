'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'words' | 'numbers';
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, mode }) => {
  if (!isOpen) return null;

  const examples = mode === 'words'
    ? [
        {
          letters: ['W', 'E', 'A', 'R', 'Y'],
          states: ['correct', 'empty', 'empty', 'empty', 'empty'],
          description: 'W is in the word and in the correct spot.'
        },
        {
          letters: ['P', 'I', 'L', 'L', 'S'],
          states: ['empty', 'present', 'empty', 'empty', 'empty'],
          description: 'I is in the word but in the wrong spot.'
        },
        {
          letters: ['V', 'A', 'G', 'U', 'E'],
          states: ['empty', 'empty', 'empty', 'absent', 'empty'],
          description: 'U is not in the word in any spot.'
        }
      ]
    : [
        {
          letters: ['1', '2', '3', '4', '5'],
          states: ['correct', 'empty', 'empty', 'empty', 'empty'],
          description: '1 is in the number and in the correct spot.'
        },
        {
          letters: ['6', '7', '8', '9', '0'],
          states: ['empty', 'present', 'empty', 'empty', 'empty'],
          description: '7 is in the number but in the wrong spot.'
        },
        {
          letters: ['5', '5', '5', '5', '5'],
          states: ['empty', 'empty', 'absent', 'empty', 'empty'],
          description: '5 (in position 3) is not in the number.'
        }
      ];

  const stateColors: Record<string, string> = {
    correct: 'bg-green-600 border-green-600',
    present: 'bg-yellow-500 border-yellow-500',
    absent: 'bg-gray-600 border-gray-600',
    empty: 'bg-transparent border-gray-500'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How To Play</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Instructions */}
          <div className="space-y-4 text-white">
            <p className="text-gray-300">
              Guess the {mode === 'words' ? 'WORD' : 'NUMBER'} in 6 tries.
            </p>
            <p className="text-gray-300">
              Each guess must be a valid 5-{mode === 'words' ? 'letter word' : 'digit number'}.
              Hit the enter button to submit.
            </p>
            <p className="text-gray-300">
              After each guess, the color of the tiles will change to show how close
              your guess was to the {mode === 'words' ? 'word' : 'number'}.
            </p>

            {/* Divider */}
            <div className="border-t border-gray-700 my-6" />

            {/* Examples */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Examples</h3>

              {examples.map((example, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex gap-2">
                    {example.letters.map((letter, i) => (
                      <div
                        key={i}
                        className={`
                          w-12 h-12 border-2 flex items-center justify-center 
                          text-xl font-bold rounded
                          ${stateColors[example.states[i]]} text-white
                        `}
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-300">{example.description}</p>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-700 my-6" />

            {/* Additional Info */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                <strong className="text-white">
                  A new {mode === 'words' ? 'WORD' : 'NUMBER'}
                </strong>{' '}
                will be available each day!
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
