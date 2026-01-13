export type LetterState = 'correct' | 'present' | 'absent' | 'empty';

export interface GuessResult {
  letter: string;
  state: LetterState;
}

export interface GameState {
  guesses: string[];
  currentGuess: string;
  maxGuesses: number;
  gameStatus: 'playing' | 'won' | 'lost';
  currentRow: number;
}

export function checkGuess(guess: string, solution: string): GuessResult[] {
  const result: GuessResult[] = [];
  const targetLetters = solution.split('');
  const guessLetters = guess.split('');
  const remainingTargetLetters = [...targetLetters];
  const tempResult: (GuessResult | null)[] = Array(5).fill(null);

  // First pass: check for correct letters
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      tempResult[i] = { letter: guessLetters[i], state: 'correct' };
      remainingTargetLetters[i] = ''; // Mark this letter as used
    }
  }

  // Second pass: check for present and absent letters
  for (let i = 0; i < 5; i++) {
    if (tempResult[i] === null) {
      const letterIndex = remainingTargetLetters.indexOf(guessLetters[i]);
      if (letterIndex !== -1) {
        tempResult[i] = { letter: guessLetters[i], state: 'present' };
        remainingTargetLetters[letterIndex] = ''; // Mark this letter as used
      } else {
        tempResult[i] = { letter: guessLetters[i], state: 'absent' };
      }
    }
  }
  
  return tempResult as GuessResult[];
}

export function isValidWord(word: string): boolean {
  return word.length === 5 && /^[a-zA-Z]+$/.test(word);
}

export function isGameWon(guess: string, solution: string): boolean {
  return guess.toLowerCase() === solution.toLowerCase();
}

export function isGameLost(gameState: GameState): boolean {
  return gameState.currentRow >= gameState.maxGuesses && gameState.gameStatus !== 'won';
}

export function initializeGameState(): GameState {
    return {
        guesses: [],
        currentGuess: '',
        maxGuesses: 6,
        gameStatus: 'playing',
        currentRow: 0,
    };
}