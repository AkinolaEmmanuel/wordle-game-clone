import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';

// GET: Fetch stats
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';
    const mode = searchParams.get('mode') || 'words';

    let stats = await prisma.gameStats.findUnique({
      where: {
        userId_mode: {
          userId,
          mode,
        },
      },
    });

    // If no stats exist, create default stats
    if (!stats) {
      stats = await prisma.gameStats.create({
        data: {
          userId,
          mode,
          played: 0,
          won: 0,
          currentStreak: 0,
          maxStreak: 0,
          guessDistribution: [0, 0, 0, 0, 0, 0],
        },
      });
    }

    return NextResponse.json({ 
      data: {
        played: stats.played,
        won: stats.won,
        currentStreak: stats.currentStreak,
        maxStreak: stats.maxStreak,
        guessDistribution: stats.guessDistribution as number[],
      },
      success: true 
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', success: false },
      { status: 500 }
    );
  }
}

// POST: Update stats
export async function POST(request: Request) {
  try {
    const { userId, mode, won, guessCount } = await request.json();
    const today = new Date().toISOString().split('T')[0];

    const currentStats = await prisma.gameStats.findUnique({
      where: {
        userId_mode: {
          userId: userId || 'anonymous',
          mode,
        },
      },
    });

    let played = (currentStats?.played || 0) + 1;
    let wonCount = (currentStats?.won || 0) + (won ? 1 : 0);
    let currentStreak = currentStats?.currentStreak || 0;
    let maxStreak = currentStats?.maxStreak || 0;
    let guessDistribution = (currentStats?.guessDistribution as number[]) || [0, 0, 0, 0, 0, 0];

    // Update streak
    const lastPlayedDate = currentStats?.lastPlayedDate;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (won) {
      if (lastPlayedDate === yesterdayStr || !lastPlayedDate) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
      maxStreak = Math.max(maxStreak, currentStreak);
      
      // Update guess distribution
      if (guessCount > 0 && guessCount <= 6) {
        guessDistribution[guessCount - 1] += 1;
      }
    } else {
      currentStreak = 0;
    }

    const stats = await prisma.gameStats.upsert({
      where: {
        userId_mode: {
          userId: userId || 'anonymous',
          mode,
        },
      },
      update: {
        played,
        won: wonCount,
        currentStreak,
        maxStreak,
        guessDistribution,
        lastPlayedDate: today,
      },
      create: {
        userId: userId || 'anonymous',
        mode,
        played,
        won: wonCount,
        currentStreak,
        maxStreak,
        guessDistribution,
        lastPlayedDate: today,
      },
    });

    return NextResponse.json({ 
      data: stats,
      success: true 
    });
  } catch (error) {
    console.error('Error updating stats:', error);
    return NextResponse.json(
      { error: 'Failed to update stats', success: false },
      { status: 500 }
    );
  }
}