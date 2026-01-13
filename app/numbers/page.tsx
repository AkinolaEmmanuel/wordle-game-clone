'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useNumber, useValidateGuess, useStats, useUpdateStats, useRecordResult } from '@/hooks/useApi';
import { GameBoard } from '@/components/gameboard';
import { GameKeyboard } from '@/components/gamekeyboard';
import { StatsModal } from '@/components/statsmodal';
import { HelpModal } from '@/components/helpmodal';
import { LeaderboardModal } from '@/components/leaderboardmodal';
import { GuessResult, LetterState } from '@/utils/gameLogic';
import { getDailySolution } from '@/utils/seededRandom';
import { HelpCircle, BarChart3, Loader2, Trophy } from 'lucide-react';

import { Suspense } from 'react';

function NumbersGame() {
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get('userId');
  const [userId, setUserId] = useState<string | undefined>(userIdParam || undefined);

  // Fallback to localstorage user if not in params
  useEffect(() => {
    if (!userId) {
      const savedUser = localStorage.getItem('wordle_user');
      if (savedUser) {
        setUserId(JSON.parse(savedUser).id);
      }
    }
  }, [userId]);

  const { data: solution, isLoading, error } = useNumber();
  const { data: stats, refetch: refetchStats } = useStats('numbers', userId);
  const validateGuess = useValidateGuess();
  const updateStats = useUpdateStats();
  const recordResult = useRecordResult();

  const [guesses, setGuesses] = useState<GuessResult[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [keyStates, setKeyStates] = useState<Record<string, LetterState>>({});
  const [revealingRow, setRevealingRow] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [message, setMessage] = useState('');
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Load saved state
  useEffect(() => {
    if (!userId) return;

    const seed = getDailySolution();
    const storageKey = userId ? `numbers_game_${userId}_${seed}` : `numbers_game_${seed}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const state = JSON.parse(saved);
      setGuesses(state.guesses);
      setCurrentRow(state.currentRow);
      setGameStatus(state.gameStatus);
      setKeyStates(state.keyStates);
      if (state.startTime) setStartTime(state.startTime);
    } else {
        setStartTime(Date.now());
    }
  }, [userId]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing') return;

      if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Backspace') {
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (/^[0-9]$/.test(e.key) && currentGuess.length < 5) {
        setCurrentGuess(prev => prev + e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, gameStatus]);

  const handleKeyPress = (key: string) => {
    if (gameStatus !== 'playing') return;

    if (key === 'ENTER') {
      handleSubmit();
    } else if (key === 'BACK') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
    }
  };

  const handleSubmit = async () => {
    if (!solution) return;

    if (currentGuess.length !== 5) {
      setMessage('Not enough digits');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    setMessage('Checking...');

    try {
      const response = await validateGuess.mutateAsync({
        guess: currentGuess,
        solution,
        mode: 'numbers'
      });

      if (!response.valid) {
        setMessage(response.error || 'Invalid number');
        setShake(true);
        setTimeout(() => setShake(false), 400);
        setTimeout(() => setMessage(''), 2000);
        return;
      }

      setMessage('');
      const newGuesses = [...guesses, response.result!];
      setGuesses(newGuesses);

      setRevealingRow(currentRow);
      setTimeout(() => setRevealingRow(null), 5 * 150 + 300);

      const newKeyStates = { ...keyStates };
      response.result!.forEach(tile => {
        const currentState = newKeyStates[tile.letter];
        if (!currentState || tile.state === 'correct' || 
           (tile.state === 'present' && currentState !== 'correct')) {
          newKeyStates[tile.letter] = tile.state;
        }
      });
      setKeyStates(newKeyStates);

      if (response.isCorrect) {
        setGameStatus('won');
        if (userId) {
            await updateStats.mutateAsync({ mode: 'numbers', won: true, guessCount: currentRow + 1, userId });
            const timeTaken = Math.floor((Date.now() - startTime) / 1000);
            await recordResult.mutateAsync({ userId, mode: 'numbers', guesses: currentRow + 1, timeTaken });
        }
        refetchStats();
        setTimeout(() => setShowStats(true), 1500);
      } else if (currentRow >= 5) {
        setGameStatus('lost');
        if (userId) {
            await updateStats.mutateAsync({ mode: 'numbers', won: false, guessCount: 0, userId });
        }
        refetchStats();
        setMessage(`The number was ${solution}`);
        setTimeout(() => setShowStats(true), 1500);
      } else {
        setCurrentRow(currentRow + 1);
      }

      setCurrentGuess('');

      const seed = getDailySolution();
      const storageKey = userId ? `numbers_game_${userId}_${seed}` : `numbers_game_${seed}`;
      localStorage.setItem(storageKey, JSON.stringify({
        guesses: newGuesses,
        currentRow: currentRow + 1,
        gameStatus: response.isCorrect ? 'won' : (currentRow >= 5 ? 'lost' : 'playing'),
        keyStates: newKeyStates,
        startTime
      }));
    } catch (error: any) {
      setMessage(error.message || 'Validation failed');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">Failed to load daily number</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="flex items-center justify-between max-w-sm mx-auto mb-8 px-4 sm:px-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">NUMBERLE</h1>
          
          <div className="flex gap-2 sm:gap-4">
            <button onClick={() => setShowLeaderboard(true)} className="text-white hover:text-gray-300 transition-colors">
              <Trophy size={24} />
            </button>
            <button onClick={() => setShowStats(true)} className="text-white hover:text-gray-300 transition-colors">
              <BarChart3 size={24} />
            </button>
            <button onClick={() => setShowHelp(true)} className="text-white hover:text-gray-300 transition-colors">
              <HelpCircle size={24} />
            </button>
          </div>
        </div>

        {message && (
          <div className="text-center text-white mb-4 font-semibold animate-pulse">
            {message}
          </div>
        )}

        <GameBoard
          guesses={guesses}
          currentGuess={currentGuess}
          currentRow={currentRow}
          revealingRow={revealingRow}
          shake={shake}
        />

        <GameKeyboard
          mode="numbers"
          keyStates={keyStates}
          onKeyPress={handleKeyPress}
        />

        {stats && (
          <StatsModal
            isOpen={showStats}
            onClose={() => setShowStats(false)}
            stats={stats}
            gameStatus={gameStatus}
            guessCount={currentRow}
          />
        )}

        <HelpModal
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
          mode="numbers"
        />
        
        <LeaderboardModal 
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          mode="numbers"
        />
      </div>
    </div>
  );
}

export default function NumbersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    }>
      <NumbersGame />
    </Suspense>
  );
}
