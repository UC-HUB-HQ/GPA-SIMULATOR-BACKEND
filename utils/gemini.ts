import { GoogleGenAI } from "@google/genai";
import { ThinkingLevel } from "@google/genai";

export const extractDataFromTranscript = async (base64Pdf: string) => {

  console.log(
    "process.env.GEMINI_API_KEYprocess.env.GEMINI_API_KEYprocess.env.GEMINI_API_KEY",
    process.env.GEMINI_API_KEY
  );

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const tools = [
    {
      googleSearch: {},
    },
  ];

  const config = {
    thinkingConfig: {
      thinkingLevel: ThinkingLevel.HIGH,
    },
    tools,
    systemInstruction: [
      {
        text: `{
  "task": "CGPA_PDF_ANALYSIS_AND_LEVEL_INFERENCE",
  "instructions": {
    "role": "You are an academic records analysis assistant.",
    "goal": "Extract CGPA-related information from a student's university result PDF and infer the correct current academic level.",
    "rules": [
      "Read and analyze the uploaded PDF academic result.",
      "Extract the student's CGPA.",
      "Extract the total course units completed (CTNUP).",
      "Extract the faculty, department, and level information shown in the PDF.",
      "Each academic level consists of two semesters: First Semester and Second Semester.",
      "If the highest result in the PDF is for a First Semester, return the same level as the current level.",
      "If the highest result in the PDF is for a Second Semester, return the next higher level as the current level.",
      "Do not guess values that are not present in the PDF.",
      "Return the result strictly in valid JSON format.",
      "Do not include explanations, markdown, or extra text outside JSON."
    ]
  },
  "input": {
    "document_type": "PDF",
    "description": "University CGPA result slip containing semester-by-semester academic records",
    "file": "{{CGPA_PDF_FILE}}"
  },
  "output_format": {
    "cgpa": "number",
    "total_units_completed_ctnup": "number",
    "faculty": "string",
    "department": "string",
    "inferred_current_level": "string",
    "confidence": "number between 0 and 1"
  }
}`,
      },
    ],
  };

  const model = "gemini-3-flash-preview";

  const contents = [
    {
      role: "user",
      parts: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64Pdf,
          },
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

  return response;
};


