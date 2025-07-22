import { NextResponse } from "next/server";
import { data } from "@/data/five_letter_words.json"

export async function GET() {
    
        const res = data;

        const word = res[Math.floor(Math.random() * res.length)];


        return NextResponse.json({
            data: word,
            status: 200
        }
        );
}