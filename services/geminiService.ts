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
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Prepare the file part
  const pdfPart = await fileToGenerativePart(file);

  // Construct the replacements list string
  const replacementInstructions = config.replacements
    .map(r => `- Replace "${r.original}" with "${r.replacement}"`)
    .join('\n');

  const prompt = `
    You are an expert technical writer and translator. Your task is to transform the attached PDF manual into a new, professional technical document.

    **CONFIGURATION:**
    - Target Language: ${config.targetLanguage} (Translate everything to this language).
    - Tone: ${config.tone}.
    
    **CRITICAL REPLACEMENT RULES:**
    You must strictly apply the following find-and-replace rules across the entire text:
    ${replacementInstructions}

    **INSTRUCTIONS:**
    1. **Analyze:** Read the PDF content carefully.
    2. **Restructure:** Reorganize the content logically. Group related sections together. If the flow is confusing, improve it.
    3. **Format:** Output the result in clean, structured Markdown.
       - Use H1 for the main title.
       - Use H2 and H3 for sections.
       - Use bullet points for lists.
       - Use > blockquotes for warnings, notes, or tips.
       - Use **bold** for key terms or UI elements.
       - Use tables where appropriate for technical data.
    4. **Refine:** Remove any references to the old company name or product codes if they were in the replacement list. Ensure the new manual reads as if it was originally written for the new brand.
    5. **Visuals:** Since you cannot output images, where an image existed in the original, insert a placeholder like: *[Image: Description of what should be here]* so the user knows to add it later.

    **OUTPUT:**
    Return ONLY the Markdown string. Do not include prologue or epilogue text.
  `;

  // Use a model with a large context window capable of handling PDFs
  const modelId = 'gemini-2.5-flash-latest';

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

    return response.text || "No content generated.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate manual.");
  }
};
