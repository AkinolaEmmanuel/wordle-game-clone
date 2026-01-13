'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface GameStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
}

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  gameStatus: 'playing' | 'won' | 'lost';
  guessCount: number;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  gameStatus,
  guessCount
}) => {
  if (!isOpen) return null;

  const maxDist = Math.max(...stats.guessDistribution, 1);
  const winPercentage = stats.played > 0
    ? Math.round((stats.won / stats.played) * 100)
    : 0;

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
          className="bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {gameStatus === 'won' ? 'Congratulations!' : 
               gameStatus === 'lost' ? 'Game Over' : 'Statistics'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-8 text-center">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-3xl font-bold text-white">{stats.played}</div>
              <div className="text-xs text-gray-400 mt-1">Played</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-3xl font-bold text-white">{winPercentage}</div>
              <div className="text-xs text-gray-400 mt-1">Win %</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-3xl font-bold text-white">{stats.currentStreak}</div>
              <div className="text-xs text-gray-400 mt-1">Current Streak</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-3xl font-bold text-white">{stats.maxStreak}</div>
              <div className="text-xs text-gray-400 mt-1">Max Streak</div>
            </div>
          </div>

          {/* Guess Distribution */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Guess Distribution
            </h3>
            <div className="space-y-2">
              {stats.guessDistribution.map((count, index) => {
                const width = maxDist > 0 ? (count / maxDist) * 100 : 0;
                const isCurrentGuess = gameStatus === 'won' && index + 1 === guessCount;

                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-4 text-sm text-gray-400 font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 bg-gray-700/30 rounded-md overflow-hidden h-7">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(width, count > 0 ? 8 : 0)}%` }}
                        transition={{
                          duration: 0.8,
                          delay: index * 0.1,
                          ease: 'easeOut'
                        }}
                        className={`
                          h-full flex items-center justify-end pr-2 text-sm font-bold
                          ${isCurrentGuess
                            ? 'bg-green-600'
                            : count > 0
                            ? 'bg-gray-600'
                            : 'bg-transparent'
                          }
                        `}
                      >
                        {count > 0 && <span className="text-white">{count}</span>}
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Game Timer (Optional) */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-center text-gray-400 text-sm">
              Next puzzle in{' '}
              <span className="font-bold text-white">
                {new Date(
                  new Date().setHours(24, 0, 0, 0) - Date.now()
                ).toISOString().substr(11, 8)}
              </span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};