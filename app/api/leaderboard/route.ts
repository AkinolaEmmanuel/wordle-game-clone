import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode') || 'words';
        // Get stats for 'today' or all time? The prompt implies daily stats for the leaderboard.
        // "The user with the least number of guesses and time taken to complete the guess is top of the stats leaderboard"
        // Usually daily leaderboards are more common for Wordle. Let's assume daily for now, based on "return stats each day".

        // However, getting "today" correctly requires timezone handling. For simplicity, let's query the GameResult table.
        // We'll filter by the current UTC date string or just return the top results globally for now, maybe filtered by date if the frontend sends it.

        // Let's implement a general leaderboard fetcher.

        const today = new Date().toISOString().split('T')[0];

        const results = await prisma.gameResult.findMany({
            where: {
                mode: mode,
                date: today
            },
            orderBy: [
                { guesses: 'asc' },
                { timeTaken: 'asc' }
            ],
            take: 10,
            include: {
                user: {
                    select: {
                        name: true
                    }
                }
            }
        });

        return NextResponse.json({
            data: results,
            success: true
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard', success: false },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, mode, guesses, timeTaken } = body;

        if (!userId || !mode || !guesses || !timeTaken) {
            return NextResponse.json(
                { error: 'Missing required fields', success: false },
                { status: 400 }
            );
        }

        const today = new Date().toISOString().split('T')[0];

        // Ensure user hasn't already submitted for today? The prompt doesn't strictly say one per day but it's implied by "Wordle".
        // Use upsert or create. A user might play multiple times if we allow it, but usually it's once.
        // Let's assume multiple tries aren't strictly blocked by DB constraints other than what we set.
        // But for a leaderboard, we usually want their *first* winning result or *best*. 
        // Wordle is usually once per day.

        // Let's just create a record.

        const result = await prisma.gameResult.create({
            data: {
                userId,
                mode,
                date: today,
                guesses,
                timeTaken
            }
        });

        return NextResponse.json({
            data: result,
            success: true
        });

    } catch (error) {
        console.error('Error recording game result:', error);
        return NextResponse.json(
            { error: 'Failed to record result', success: false },
            { status: 500 }
        );
    }
}
