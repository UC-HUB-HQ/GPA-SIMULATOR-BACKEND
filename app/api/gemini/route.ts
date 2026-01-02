import { NextRequest, NextResponse } from "next/server";
import { extractDataFromTranscript } from "@/utils";

export async function POST(request: NextRequest) {

    try {

        
        const formData = await request.formData();

        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        if (file.type !== "application/pdf") {
            return NextResponse.json(
                { error: "Only PDF files are allowed" },
                { status: 400 }
            );
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File exceeds 5MB limit" },
                { status: 400 }
            );
        }

        // Convert File → Buffer → base64

        const arrayBuffer = await file.arrayBuffer();

        const buffer = Buffer.from(arrayBuffer);

        const base64Pdf = buffer.toString("base64");

        const geminiResponse = await extractDataFromTranscript(base64Pdf);

        console.log("geminiResponseeeeeeee", geminiResponse)

        return NextResponse.json(
            { data: geminiResponse},
            { status: 200 }
        );

    }
    catch (error) {
        return NextResponse.json(
            { message: "Error with extracting details from document", error },
            { status: 500 }
        );
    }
}
