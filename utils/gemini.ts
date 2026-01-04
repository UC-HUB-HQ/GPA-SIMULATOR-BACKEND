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
        "goal": "Extract CGPA-related information from a student's university result PDF, map the data to the provided faculty/department list, and infer the correct current academic level.",
        "rules": [
          "Read and analyze the uploaded PDF academic result.",
          "Extract the student's CGPA (usually found in the 'Academic Summary' or 'Summary' section).",
          "Extract the total course units registered (CTNU). Do NOT extract CTNUP (units passed) or CTCP.",
          "Identify the Faculty and Department from the PDF and MAP them to the provided dictionary below.",
          "The returned 'department' must match the specific name in the dictionary (e.g., use 'SCIENCE AND TECHNOLOGY EDUCATION (COMPUTER SCIENCE OPTION)' instead of just 'COMPUTER SCIENCE' if that is the mapping).",
          "Ensure the faculty name is returned in ALL CAPS and starts with 'FACULTY OF'.",
          "Ensure the department name is returned in ALL CAPS and does NOT include 'DEPARTMENT OF'.",
          "Each academic level consists of two semesters: First Semester and Second Semester.",
          "Level Inference Logic: If the highest result is for 'First Semester', return that same level. If it is 'Second Semester', return the next higher level (e.g., 200 Level becomes 300). Exception: If the transcript indicates the student has graduated or is in their final semester (e.g., 'Student needs 0 Semester(s) to Graduate'), return the current level.",
          "Return the inferred_current_level as a number string only (e.g., '100', '200', '400').",
          "Do not guess values. If a value is missing, leave it blank or null.",
          "Return the result strictly in valid JSON format without markdown or extra text."
        ],
        "faculty_dictionary": {
          "01": { "facultyName": "FACULTY OF EDUCATION", "departments": { "0143": "EDUCATIONAL MANAGEMENT (ACCOUNTING EDUCATION OPTION)", "0121": "ARABIC EDUCATION", "0111": "SCIENCE AND TECHNOLOGY EDUCATION (BIOLOGY OPTION)", "0144": "EDUCATIONAL MANAGEMENT (BUSINESS EDUCATION OPTION)", "0112": "SCIENCE AND TECHNOLOGY EDUCATION (CHEMISTRY OPTION)", "0122": "CHRISTIAN RELIGIOUS STUDIES EDUCATION", "0115": "SCIENCE AND TECHNOLOGY EDUCATION (COMPUTER SCIENCE OPTION)", "0129": "ECONOMICS EDUCATION", "0161": "EDUCATIONAL FOUNDATION", "0145": "EDUCATIONAL MANAGEMENT", "0194": "SCIENCE AND TECHNOLOGY EDUCATION (EDUCATIONAL TECHNOLOGY OPTION)", "0123": "ENGLISH EDUCATION", "0124": "FRENCH EDUCATION", "0128": "GEOGRAPHY EDUCATION", "0142": "HEALTH EDUCATION", "0125": "ISLAMIC RELIGIOUS STUDIES EDUCATION", "0126": "HISTORY EDUCATION", "0113": "SCIENCE AND TECHNOLOGY EDUCATION (MATHEMATICS OPTION)", "0141": "PHYSICAL & HEALTH EDUCATION", "0114": "SCIENCE AND TECHNOLOGY EDUCATION (PHYSICS OPTION)", "0130": "POLITICAL SCIENCE EDUCATION", "0127": "YORUBA EDUCATION", "0151": "GUIDANCE AND COUNSELING EDUCATION", "0152": "EARLY CHILDHOOD AND PRIMARY EDUCATION", "0160": "SOCIAL STUDIES AND CIVIC EDUCATION", "0153": "SPECIAL EDUCATION" } },
          "02": { "facultyName": "FACULTY OF ENGINEERING", "departments": { "0231": "CHEMICAL ENGINEERING", "0211": "ELECTRONICS AND COMPUTER ENGINEERING", "0221": "MECHANICAL ENGINEERING", "0241": "CIVIL ENGINEERING", "0251": "AEROSPACE ENGINEERING", "0261": "INDUSTRIAL & PRODUCTION ENGINEERING" } },
          "03": { "facultyName": "FACULTY OF ARTS", "departments": { "0331": "ARABIC", "0351": "CHRISTIAN RELIGIOUS STUDIES", "0321": "ENGLISH LANGUAGE", "0322": "ENGLISH LITERATURE", "0332": "FRENCH", "0341": "HISTORY AND INTERNATIONAL STUDIES", "0352": "ISLAMIC RELIGIOUS STUDIES", "0372": "MUSIC", "0361": "PHILOSOPHY", "0333": "PORTUGUESE / ENGLISH", "0311": "YORUBA & COMMUNICATION ARTS", "0353": "PEACE STUDIES", "0391": "LINGUISTICS", "0311_its": "LINGUISTICS, AFRICAN LANGUAGES AND COMMUNICATION ARTS" } },
          "04": { "facultyName": "FACULTY OF LAW", "departments": { "0412": "COMMON AND ISLAMIC LAW", "0411": "COMMON/CIVIL LAW" } },
          "05": { "facultyName": "FACULTY OF SCIENCE", "departments": { "0511": "BIOCHEMISTRY", "0521": "BOTANY", "0531": "CHEMISTRY", "0541": "FISHERIES AND AQUATIC BIOLOGY", "0551": "MATHEMATICS", "0561": "MICROBIOLOGY", "0571": "PHYSICS", "0581": "ZOOLOGY", "0501": "SCIENCE LABORATORY TECHNOLOGY", "0562": "MICROBIOLOGY" } },
          "06": { "facultyName": "FACULTY OF SOCIAL SCIENCE", "departments": { "0611": "ECONOMICS", "0621": "GEOGRAPHY AND PLANNING", "0631": "POLITICAL SCIENCE", "0651": "PSYCHOLOGY", "0641": "SOCIOLOGY" } },
          "08": { "facultyName": "FACULTY OF MANAGEMENT SCIENCE", "departments": { "0811": "ACCOUNTING", "0812": "BANKING AND FINANCE", "0821": "BUSINESS ADMINISTRATION", "0831": "INDUSTRIAL RELATIONS & HUMAN RESOURCES MANAGEMENT", "0813": "INSURANCE", "0822": "PROJECT MANAGEMENT TECHNOLOGY", "0823": "MARKETING", "0832": "PUBLIC ADMINISTRATION", "0833": "LOCAL GOVERNMENT DEVELOPMENT AND ADMINISTRATION", "0814": "TAXATION STUDIES", "0841": "TAXATION" } },
          "09": { "facultyName": "FACULTY OF COMMUNICATION AND MEDIA STUDIES", "departments": { "0961": "BOOK PUBLISHING", "0911": "CINEMATOGRAPHY", "0912": "COMMUNICATION TECHNOLOGY", "0932": "HUMAN COMMUNICATION", "0922": "JOURNALISM", "0910": "MASS COMMUNICATION", "0921": "PHOTOJOURNALISM", "0933": "PUBLIC RELATIONS AND ADVERTISING", "0913": "RADIO AND TELEVISION BROADCAST" } },
          "10": { "facultyName": "SCHOOL OF TRANSPORT AND LOGISTICS STUDIES", "departments": { "1001": "TRANSPORT MANAGEMENT AND OPERATIONS", "1004": "LOGISTICS AND SUPPLY CHAIN MANAGEMENT" } },
          "13": { "facultyName": "SCHOOL OF AGRICULTURE", "departments": { "1311": "AGRICULTURE", "1321": "AGRICULTURAL ECONOMICS AND FARM MANAGEMENT", "1322": "AGRICULTURAL EXTENTION AND RURAL MANAGEMENT", "1323": "ANIMAL SCIENCE", "1324": "CROP PRODUCTION" } },
          "18": { "facultyName": "FACULTY OF ENVIRONMENTAL SCIENCE", "departments": { "1821": "BUILDING", "1881": "URBAN AND REGIONAL PLANNING", "1861": "SURVEY AND GEO-INFORMATICS", "1871": "QUANTITY SURVEYING", "1851": "INDUSTRIAL DESIGN", "1891": "FINE ARTS", "1831": "ESTATE MANAGEMENT", "1811": "ARCHITECTURE", "1841": "ENVIRONMENTAL MANAGEMENT" } }
        },
        "exception": "If the document is not a transcript or missing key data, return: {"error": "The provided document is not an academic transcript and does not contain the required CGPA, total units registered, faculty, department, or academic level information."}"
      },
      "output_format": {
        "cgpa": "number",
        "total_units_registered_ctnu": "number",
        "faculty": "string",
        "department": "string",
        "inferred_current_level": "string",
        "confidence": "number"
      }
    }
`,
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
