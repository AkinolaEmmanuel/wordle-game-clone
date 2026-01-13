import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';

// GET: Fetch game state
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';
    const mode = searchParams.get('mode') || 'words';
    const seed = parseInt(searchParams.get('seed') || '0');

    const gameState = await prisma.gameState.findUnique({
      where: {
        userId_mode_seed: {
          userId,
          mode,
          seed,
        },
      },
    });

    return NextResponse.json({ 
      data: gameState,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching game state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game state', success: false },
      { status: 500 }
    );
  }
}

// POST: Save game state
export async function POST(request: Request) {
  try {
    const { userId, mode, seed, guesses, currentRow, gameStatus, keyStates } = await request.json();

    const gameState = await prisma.gameState.upsert({
      where: {
        userId_mode_seed: {
          userId: userId || 'anonymous',
          mode,
          seed,
        },
      },
      update: {
        guesses,
        currentRow,
        gameStatus,
        keyStates,
      },
      create: {
        userId: userId || 'anonymous',
        mode,
        seed,
        guesses,
        currentRow,
        gameStatus,
        keyStates,
      },
    });

    return NextResponse.json({ 
      data: gameState,
      success: true 
    });
  } catch (error) {
    console.error('Error saving game state:', error);
    return NextResponse.json(
      { error: 'Failed to save game state', success: false },
      { status: 500 }
    );
  }
}
