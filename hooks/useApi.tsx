import { useMutation, useQuery } from '@tanstack/react-query';
import { GuessResult } from '@/utils/gameLogic';
import { queryClient } from '@/providers/providers';

type GameMode = 'words' | 'numbers';

interface ValidateResponse {
  success: boolean;
  valid: boolean;
  result?: GuessResult[];
  isCorrect?: boolean;
  error?: string;
}

interface StatsData {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
}

// Fetch daily word
export const useWord = (seed?: number) => {
  return useQuery({
    queryKey: ['daily-word', seed],
    queryFn: async () => {
      const url = seed ? `/api/words?seed=${seed}` : '/api/words';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch word');
      const json = await res.json();
      return json.data as string;
    },
    enabled: seed !== undefined // Wait for seed to be available
  });
};

// Fetch daily number
export const useNumber = (seed?: number) => {
  return useQuery({
    queryKey: ['daily-number', seed],
    queryFn: async () => {
        const url = seed ? `/api/numbers?seed=${seed}` : '/api/numbers';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch number');
      const json = await res.json();
      return json.data as string;
    },
    enabled: seed !== undefined // Wait for seed to be available
  });
};

// Validate guess
export const useValidateGuess = () => {
  return useMutation({
    mutationFn: async ({ 
      guess, 
      solution, 
      mode 
    }: { 
      guess: string; 
      solution: string; 
      mode: GameMode;
    }): Promise<ValidateResponse> => {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess, solution, mode }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Validation failed');
      }
      
      return res.json();
    },
  });
};

// Fetch stats
export const useStats = (mode: GameMode, userId?: string) => {
  return useQuery({
    queryKey: ['stats', mode, userId],
    queryFn: async () => {
      const url = userId 
        ? `/api/stats?mode=${mode}&userId=${userId}`
        : `/api/stats?mode=${mode}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const json = await res.json();
      return json.data as StatsData;
    },
    enabled: !!userId, // Only fetch if userId is present? Or allow anonymous? Let's allow anonymous for now, or just wait for userId.
                       // Given the login flow is now mandatory for "playing" from home, we might expect userId.
                       // But to avoid breaking if accessed directly, let's keep it robust.
  });
};

// Update stats
export const useUpdateStats = () => {
  return useMutation({
    mutationFn: async ({ 
      mode, 
      won, 
      guessCount,
      userId
    }: { 
      mode: GameMode; 
      won: boolean; 
      guessCount: number;
      userId?: string;
    }) => {
      const res = await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, won, guessCount, userId }),
      });
      
      if (!res.ok) throw new Error('Failed to update stats');
      return res.json();
    },
  });
};

interface GameStateData {
  guesses: any[];
  currentRow: number;
  gameStatus: string;
  keyStates: Record<string, any>;
}

// Fetch saved game state
export const useGameState = (userId: string, mode: string, seed: number) => {
  return useQuery({
    queryKey: ['game-state', userId, mode, seed],
    queryFn: async () => {
      const res = await fetch(`/api/game-state?userId=${userId}&mode=${mode}&seed=${seed}`);
      if (!res.ok) throw new Error('Failed to fetch game state');
      const json = await res.json();
      return json.data as GameStateData | null;
    },
  });
};

// Save game state
export const useSaveGameState = () => {
  return useMutation({
    mutationFn: async (data: {
      userId: string;
      mode: string;
      seed: number;
      guesses: any[];
      currentRow: number;
      gameStatus: string;
      keyStates: Record<string, any>;
    }) => {
      const res = await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error('Failed to save game state');
      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch game state
      queryClient.invalidateQueries({
        queryKey: ['game-state', variables.userId, variables.mode, variables.seed]
      });
    },
  });
};

// Login user
export const useLogin = () => {
    return useMutation({
        mutationFn: async (username: string) => {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });
            if (!res.ok) throw new Error('Failed to login');
            return res.json();
        }
    });
};

// Leaderboard hooks
export const useLeaderboard = (mode: string, date?: string) => {
    return useQuery({
        queryKey: ['leaderboard', mode, date],
        queryFn: async () => {
            const url = date 
                ? `/api/leaderboard?mode=${mode}&date=${date}`
                : `/api/leaderboard?mode=${mode}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch leaderboard');
            const json = await res.json();
            return json.data;
        },
        enabled: !!date
    });
};

export const useRecordResult = () => {
    return useMutation({
        mutationFn: async (data: { userId: string, mode: string, guesses: number, timeTaken: number, date: string }) => {
            const res = await fetch('/api/leaderboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to record result');
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['leaderboard', variables.mode] });
        }
    });
};