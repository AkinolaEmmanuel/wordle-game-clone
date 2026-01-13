import { NextResponse } from "next/server";
import { getDailySolution, seededRandom } from "@/utils/seededRandom";


function randomFiveNumber() {
    const seed = getDailySolution();
    const random = seededRandom(seed);
    const number = Math.floor((random() * 90000) + 10000).toString(); 
    return number;
}

export async function GET() {
    try {
       const number = randomFiveNumber();
       const tomorrow = new Date();
       tomorrow.setDate(tomorrow.getDate() + 1);
       tomorrow.setHours(0, 0, 0, 0);
       
        console.log("Number of the day is", number)
       return NextResponse.json({ 
        data: number, 
        status: 200,
        expiresAt: tomorrow.toISOString(),
        },{
            status: 200,
            headers: {
                'Cache-Control': `public, max-age=0, s-maxage=${Math.floor((tomorrow.getTime() - Date.now()) / 1000)}, stale-while-revalidate=59`
            }
        }
    );
    }
    catch (error) {
        NextResponse.json({
            status: 500, 
            error: "Failed to fetch number"
        })
    }
}
