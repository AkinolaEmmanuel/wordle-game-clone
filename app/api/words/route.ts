import { NextResponse } from "next/server";
import wordsJson from "@/data/possible_solutions.json";
import { seededRandom, getDailySolution } from "@/utils/seededRandom";


export async function GET() {
    try {
        const res = wordsJson.data;
        const seed = getDailySolution();
        console.log("Seed:", seed);
        const random = seededRandom(seed);
        console.log("Random number:", random());
        const word = res[Math.floor(random() * res.length)];
        console.log("Word of the day is", word)

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        

        return NextResponse.json({
            data: word,
            status: 200,
            seed: seed,
            expiresAt: tomorrow.toISOString(),
        }, {
            status: 200,
            headers: {
                'Cache-Control': `public, max-age=0, s-maxage=${Math.floor((tomorrow.getTime() - Date.now()) / 1000)}, stale-while-revalidate=59`
            }
        }
        );
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch word', status: 500 }, { status: 500 });
    }
}