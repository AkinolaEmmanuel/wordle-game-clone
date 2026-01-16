import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode') || 'words';
        const dateParam = searchParams.get('date');

        // Use provided date or fallback to server "today" (UTC)
        const date = dateParam || new Date().toISOString().split('T')[0];

        const results = await prisma.gameResult.findMany({
            where: {
                mode: mode,
                date: date
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
        const { userId, mode, guesses, timeTaken, date } = body;

        if (!userId || !mode || !guesses || !timeTaken) {
            return NextResponse.json(
                { error: 'Missing required fields', success: false },
                { status: 400 }
            );
        }

        const gameDate = date || new Date().toISOString().split('T')[0];

        const result = await prisma.gameResult.create({
            data: {
                userId,
                mode,
                date: gameDate,
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
