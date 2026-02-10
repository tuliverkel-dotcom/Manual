import { GoogleGenAI } from "@google/genai";
import { ManualConfig } from "../types";

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
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
  const apiKey = config.apiKey || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key nie je nastavený. Prosím vložte ho v nastaveniach.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const pdfPart = await fileToGenerativePart(file);

  const replacementInstructions = config.replacements
    .map(r => `- STRICTLY REPLACE "${r.original}" WITH "${r.replacement}" everywhere.`)
    .join('\n');

  const mainBrand = config.replacements.length > 0 ? config.replacements[0].replacement : "Elift Solutions";

  // PROMPT UPDATE: Added json:image instructions and GmbH removal
  const prompt = `
    You are a Technical Documentation Expert.
    
    **TASK:** 
    Extract technical content and convert it into **STRUCTURED MARKDOWN**.
    
    **🚫 STRICT EXCLUSION RULES (DELETE THESE):**
    1. **LEGAL:** Remove copyright (©), "All rights reserved", disclaimers, addresses, fax, emails, websites in footers.
    2. **METADATA:** Remove document IDs, revision dates, "Original Instructions".
    3. **CORPORATE:** Remove "GmbH", "Co. KG", "Inc.", "S.r.o" from company names. Just use the brand name.
    4. **Start directly with the content.**

    **✅ DATA BLOCK RULES (USE JSON FOR ALL STRUCTURED DATA):**
    
    1. **TABLE OF CONTENTS:**
       Output as a code block with language \`json:toc\`. 
       Format: Array of objects with \`chapter\` (string) and \`page\` (number/string).

    2. **MENU / LCD STRUCTURES:**
       Output as a code block with language \`json:menu\`.
       Format: Array of objects. \`path\` is an array of strings. \`description\` is optional.

    3. **KEYPAD / COMMANDS:**
       Output as a code block with language \`json:keypad\`.
       Format: Array of objects with \`inputs\` (string), \`function\` (string), \`note\` (string).

    4. **DATA TABLES:**
       Output as a code block with language \`json:table\`.
       Format: JSON Object with "headers" (array of strings) and "rows" (array of arrays of strings).

    5. **IMAGES / FIGURES:**
       **DO NOT USE** standard markdown images like \`![alt](...)\`.
       Output as a code block with language \`json:image\`.
       Format: JSON Object.
       Properties: 
         - \`caption\`: The text label (e.g., "Obr. 1: Schéma zapojenia").
         - \`description\`: A visual description of what should be in the image.
         - \`type\`: "diagram" or "photo" or "icon".
       Example:
       \`\`\`json:image
       {
         "caption": "Obr. 2: Hlavná riadiaca doska",
         "description": "Pohľad zhora na PCB dosku s konektormi X1 a X2",
         "type": "photo"
       }
       \`\`\`

    **CONTENT INSTRUCTIONS:**
    - Manufacturer Name: "**${mainBrand}**".
    - ${replacementInstructions}
    - Translate to ${config.targetLanguage}.
    - Warnings: Use \`> [!WARNING] Text\`
    - Notes: Use \`> [!NOTE] Text\`

    **OUTPUT:**
    Return the raw Markdown. Ensure JSON blocks are valid JSON.
  `;

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