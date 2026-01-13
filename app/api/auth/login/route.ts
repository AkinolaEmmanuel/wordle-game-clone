import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username } = body;

        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            return NextResponse.json(
                { error: 'Username is required', success: false },
                { status: 400 }
            );
        }

        const trimmedUsername = username.trim();

        // Upsert user: create if not exists, return if exists
        const user = await prisma.user.upsert({
            where: { name: trimmedUsername },
            update: {}, // No updates needed if found
            create: { name: trimmedUsername },
        });

        return NextResponse.json({
            data: user,
            success: true,
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        return NextResponse.json(
            { error: 'Failed to login user', success: false },
            { status: 500 }
        );
    }
}
