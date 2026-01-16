'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Timer, Target } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useApi';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'words' | 'numbers';
  date?: string;
}

interface LeaderboardEntry {
  id: string;
  user: {
    name: string;
  };
  guesses: number;
  timeTaken: number;
  date: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  mode,
  date
}) => {
  const { data: leaderboard, isLoading } = useLeaderboard(mode, date);

  if (!isOpen) return null;

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
            <div className="flex items-center gap-3">
              <Trophy className="text-yellow-500" size={32} />
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Leaderboard</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-4">
            <h3 className="text-lg text-gray-400 capitalize mb-4">Top Players Today ({mode})</h3>
            
            {isLoading ? (
              <div className="text-center py-8 text-white">Loading...</div>
            ) : !leaderboard || leaderboard.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No games played today yet!</div>
            ) : (
              <div className="space-y-3">
                 <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 uppercase font-semibold mb-2 px-3">
                    <div className="col-span-1">#</div>
                    <div className="col-span-5">Player</div>
                    <div className="col-span-3 text-center">Guesses</div>
                    <div className="col-span-3 text-right">Time</div>
                 </div>
                
                {leaderboard.map((entry: LeaderboardEntry, index: number) => (
                  <div 
                    key={entry.id} 
                    className={`grid grid-cols-12 gap-2 items-center p-3 rounded-lg ${
                      index === 0 ? 'bg-yellow-500/10 border border-yellow-500/20' : 
                      index === 1 ? 'bg-gray-400/10 border border-gray-400/20' :
                      index === 2 ? 'bg-orange-700/10 border border-orange-700/20' :
                      'bg-gray-700/30'
                    }`}
                  >
                    <div className="col-span-1 font-bold text-white">
                        {index + 1}
                    </div>
                    <div className="col-span-5 font-medium text-white truncate">
                      {entry.user.name}
                    </div>
                    <div className="col-span-3 flex items-center justify-center gap-1 text-gray-300">
                      <Target size={14} />
                      {entry.guesses}
                    </div>
                    <div className="col-span-3 flex items-center justify-end gap-1 text-gray-300">
                      <Timer size={14} />
                      {entry.timeTaken}s
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
