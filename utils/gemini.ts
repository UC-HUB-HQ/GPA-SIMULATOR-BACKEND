import { GoogleGenAI } from "@google/genai";

export const extractDataFromTranscript = async (
  base64Pdf: string,
  apiKey: string
) => {

  const ai = new GoogleGenAI({ apiKey });

  const modelId = "gemini-2.5-flash";

  const config = {
    responseMimeType: "application/json",
    thinkingConfig: {
      thinkingBudget: 0,
    },
    systemInstruction: `
    {
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
          "Ensure you return  faculty like this "FACULTY OF SCIENCE". All in upper case and start with FACULTY OF.",
          "Ensure you return the level only e.g 100, 200, 300, 400, 500. Do not specify if the student has graduated, do not add level just the actual level only",
          "Ensure you return department name only do not attach DEPARTMENT OF, e.g COMPUTER SCIENCE, PHYSICS. no need for "DEPARTMENT OF"."
        ],
        exception: "If the uploaded document does not contain any of the required output information, and does not resemble an academic transcript or report, send this data in this exact output format {"error": "error message"}"
      },
      "input": {
        "document_type": "PDF",
        "description": "University CGPA result slip containing semester-by-semester academic records",
        "file": "{{CGPA_PDF_FILE}}"
      },
      "output_format": [
        if successful =  {
          "cgpa": "number",
          "total_units_completed_ctnup": "number",
          "faculty": "string",
          "department": "string",
          "inferred_current_level": "string",
          "confidence": "number between 0 and 1"
        }
        if error = {
          "error": "error message"
        }
      ]
  }`,
  };

  const cleanBase64 = base64Pdf.split(",").pop() || "";

  const response = await ai.models.generateContent({
    model: modelId,
    config,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: cleanBase64,
            },
          },
          { text: "Extract the data from this transcript." },
        ],
      },
    ],
  });

  if (!response?.text) {
    throw new Error("Response text is undefined or empty.");
  }
  return JSON.parse(response.text);
};
