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
    .map(r => `- STRICTLY REPLACE "${r.original}" WITH "${r.replacement}" everywhere.`)
    .join('\n');

  // Find the primary company name replacement (usually the first rule or generic)
  const mainBrand = config.replacements.length > 0 ? config.replacements[0].replacement : "Elift Solutions";

  const prompt = `
    You are an expert technical writer re-authoring a manual for a new brand.
    Your goal is to create a clean, professional Markdown document based on the attached PDF.

    **CONFIGURATION:**
    - Target Language: ${config.targetLanguage} (Translate everything).
    - Tone: ${config.tone}.
    
    **1. BRANDING & REPLACEMENTS:**
    ${replacementInstructions}
    - **HEADER:** Start the document section with a single line: "**Manufacturer: ${mainBrand}**".
    - **BODY:** Do NOT mention the *original* manufacturer's name in the body text.

    **2. CONTENT FILTRATION:**
    - DELETE legal disclaimers, FCC warnings.
    - KEEP technical instructions, safety warnings, specifications.

    **3. INTELLIGENT TABLE STRUCTURE (CRITICAL):**
    
    **Type A: KEYPAD COMMANDS (Simple Lists)**
    - IF the table lists simple button combinations (e.g., "0 1 ENTER" -> "Action"), use this EXACT 3-column structure:
      | Príkaz | Popis | Poznámka |
      | :--- | :--- | :--- |
    - **Separate keys with spaces** (e.g., "1 0 0", "0 2 x x").
    - Use '↵' for Enter.

    **Type B: MENU STRUCTURES (Hierarchical Trees - The Problem Area)**
    - IF the table shows a Menu Tree (e.g., "1. Menu level", "2. Menu level"...), **DO NOT squash it into 3 columns.**
    - **REPLICATE THE COLUMNS EXACTLY.** If the PDF has 5 columns (Level 1, Level 2, Level 3, Level 4, Description), you MUST create a 5-column Markdown table.
    - **Structure:**
      | Úroveň 1 | Úroveň 2 | Úroveň 3 | Úroveň 4 | Popis |
      | :--- | :--- | :--- | :--- | :--- |
    - **IMPORTANT:** Keep parent cells EMPTY if they are empty in the PDF. Do not merge text across rows inappropriately. The visual hierarchy relies on empty cells.

    **Type C: PINOUTS / WIRING**
    - Convert distinct tables to Markdown Tables.

    **4. FORMATTING RULES:**
    - **HEADINGS:** Use H1 (#) for Main Title, H2 (##) for Chapters.
    - **VISUALS:** Use \`> **[FOTO: Detailed description]**\` only for complex photos.
    
    **PROCESS:**
    1. Analyze the table type (Keypad Command vs. Menu Structure).
    2. Choose the correct column layout (3 columns vs. Multi-column).
    3. Translate and Format.

    **OUTPUT:**
    Return ONLY the Markdown string. No chat interaction.
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