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
    You are an expert technical writer and translator. Your task is to transform the attached PDF document (which is part of a larger manual) into a professional technical document section.

    **CONFIGURATION:**
    - Target Language: ${config.targetLanguage} (Translate everything to this language).
    - Tone: ${config.tone}.
    
    **CRITICAL REPLACEMENT RULES:**
    You must strictly apply the following find-and-replace rules across the entire text:
    ${replacementInstructions}

    **INSTRUCTIONS:**
    1. **Analyze:** Read the PDF content carefully.
    2. **Restructure:** Reorganize the content logically. Group related sections together.
    3. **Format:** Output the result in clean, structured Markdown.
       - Use H1, H2, H3 for sections (maintain hierarchy).
       - Use bullet points for lists.
       - Use > blockquotes for warnings, notes, or tips.
       - Use **bold** for key terms or UI elements.
       - Use tables where appropriate.
    4. **Refine:** Remove any references to the old company name or product codes if they were in the replacement list.
    5. **Visuals:** Insert a placeholder like: *[Obrázok: Description]* where images should be.

    **OUTPUT:**
    Return ONLY the Markdown string. Do not include prologue (like "Here is the translation") or epilogue. Start directly with the content.
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