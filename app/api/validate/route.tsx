import { NextResponse } from 'next/server';
import { checkGuess } from '@/utils/gameLogic';
import nonwordle from '@/data/five_letter_words.json';
import wordle from '@/data/possible_solutions.json';
export async function POST(request: Request) {
  try {
    const { guess, solution, mode } = await request.json();

    if (!guess || !solution || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      );
    }

    // Validate guess length
    if (guess.length !== 5) {
      return NextResponse.json(
        { 
          error: 'Guess must be 5 characters',
          success: false,
          valid: false 
        },
        { status: 400 }
      );
    }

    // Validate word exists in dictionary for word mode
    if (mode === 'words') {
      const data = [...wordle.data, ...nonwordle.data];
      const wordList = data.map((w: any) => w.toUpperCase());
      if (!wordList.includes(guess.toUpperCase())) {
        return NextResponse.json({
          error: 'Word not in dictionary',
          success: false,
          valid: false
        });
      }
    }

    // Validate number for number mode
    if (mode === 'numbers' && !/^\d{5}$/.test(guess)) {
      return NextResponse.json({
        error: 'Must be a 5-digit number',
        success: false,
        valid: false
      });
    }

    // Check the guess against solution
    const result = checkGuess(guess.toUpperCase(), solution.toUpperCase());
    const isCorrect = guess.toUpperCase() === solution.toUpperCase();

    return NextResponse.json({
      success: true,
      valid: true,
      result,
      isCorrect
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Validation failed', success: false },
      { status: 500 }
    );
  }
}