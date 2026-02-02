import { GoogleGenAI } from "@google/genai";
import { ManualConfig } from "../types";

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateManualFromPDF = async (
  file: File,
  config: ManualConfig
): Promise<string> => {
  // Use provided key or fallback to env var
  const apiKey = config.apiKey || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key nie je nastavený. Prosím vložte ho v nastaveniach.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Prepare the file part
  const pdfPart = await fileToGenerativePart(file);

  // Construct the replacements list string
  const replacementInstructions = config.replacements
    .map(r => `- Replace "${r.original}" with "${r.replacement}"`)
    .join('\n');

  const prompt = `
    You are an expert technical writer and translator specialized in industrial manuals (elevators, electronics). 
    Your task is to transform the attached PDF document section into a professional technical document.

    **CONFIGURATION:**
    - Target Language: ${config.targetLanguage} (Translate everything to this language).
    - Tone: ${config.tone}.
    
    **REPLACEMENT RULES (STRICT):**
    ${replacementInstructions}

    **FORMATTING RULES (CRITICAL):**
    1. **TABLES ARE MANDATORY:** If the PDF contains any tabular data (technical specifications, error codes, parameters, pin assignments), YOU MUST output it as a Markdown Table. 
       - Do NOT convert tables into lists or plain text. 
       - Maintain the headers.
       - If a table describes inputs/outputs (Pinout), keep it strictly as a table.

    2. **PINOUTS & CONNECTIONS:** 
       - Descriptions of terminals, connectors (e.g., X1, X2, Inputs), and LEDs must be formatted as TABLES or clearly defined Definition Lists.
       - Do not clump technical data into paragraphs.

    3. **IMAGES & DIAGRAMS:** 
       - Since you cannot output images directly, create a visual placeholder block.
       - Use this exact syntax for image placeholders: 
         > **[FOTO: Detailed description of what is in the image]**
       - If the image describes specific product parts, list them immediately after the placeholder.

    4. **STRUCTURE:**
       - Use H1 (#) for the main title of the section.
       - Use H2 (##) for subsections.
       - Use H3 (###) for specific component details.
       - Use **bold** for component names (e.g., **MLC-800**, **X1 Connector**).

    **PROCESS:**
    1. Read the PDF.
    2. Identify tables and pinouts.
    3. Translate and Format to Markdown.
    4. Apply replacements (e.g., change product names).

    **OUTPUT:**
    Return ONLY the Markdown string. No introduction, no markdown code block fences (like \`\`\`). Start directly with the content.
  `;

  // Use a model recommended for basic text tasks
  const modelId = 'gemini-3-flash-preview';

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          pdfPart,
          { text: prompt }
        ]
      }
    });

    return response.text || "";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Nepodarilo sa vygenerovať manuál.");
  }
};