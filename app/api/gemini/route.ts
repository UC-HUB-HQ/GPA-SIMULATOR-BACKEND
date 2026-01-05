import { NextRequest, NextResponse } from "next/server";
import { extractDataFromTranscript } from "@/utils";


interface geminiErrorFormat{
    error: {
        code: number;
        message: string;
        status: string
    }
}

export async function POST(request: NextRequest) {

    try {

        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        
        const formData = await request.formData();

        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
              { message: "No file uploaded" },
              { status: 400 }
            );
        }

        if (file.type !== "application/pdf") {
            return NextResponse.json(
              { message: "Only PDF files are allowed" },
              { status: 400 }
            );
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
              { message: "File exceeds 5MB limit" },
              { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();

        const buffer = Buffer.from(arrayBuffer);

        const base64Pdf = buffer.toString("base64");

        const geminiResponse = await extractDataFromTranscript(
          base64Pdf,
          apiKey ?? ""
        );

        return NextResponse.json(
            { message: geminiResponse},
            { status: 200 }
        );

    }

    catch (err: unknown) {
        let message = "Our analysis model is currently not available, try again later or proceed manually.";
        let status = 500;
    
        if (err instanceof Error) {
          try {
            const cleaned = err.message.replace("Error [ApiError]: ", "");
            const parsed = JSON.parse(cleaned);
    
            if (parsed?.error?.code) {
                console.log(parsed.error.message)
              status = parsed.error.code;
            }
          } catch {
          }
    
          if (status === 500 && err.message) {
            message = err.message;
          }
        }
    
        return NextResponse.json(
          { message },
          { status }
        );
    }
}
