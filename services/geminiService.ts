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
    
    **1. BRANDING & REPLACEMENTS (VERY IMPORTANT):**
    ${replacementInstructions}
    - **HEADER:** Start the document section with a single line: "**Manufacturer: ${mainBrand}**".
    - **BODY:** Do NOT mention the *original* manufacturer's name, address, or support email in the body text. Use neutral terms like "the device", "the unit", or the new brand name.

    **2. CONTENT FILTRATION (REMOVE JUNK):**
    - **DELETE** all legal disclaimers, FCC warnings, "Declaration of Conformity" pages, and "Terms of Use".
    - **DELETE** the original manufacturer's physical addresses, phone numbers, fax numbers, and website URLs found in footers or at the end.
    - **KEEP** only technical instructions, safety warnings (rephrased neutrally), and specifications.

    **3. VISUALS STRATEGY (CRITICAL):**
    - **DO NOT BE LAZY.** Do not just say "[FOTO]" for everything.
    - **PINOUTS / WIRING / CHARTS:** You MUST convert these into Markdown Tables or Bullet Lists. Describe the connections (Pin 1 -> +24V, etc.). A table is ALWAYS better than a placeholder.
    - **PHOTOS:** Only use a placeholder if it is a complex photograph (e.g., a photo of a PCB board, a mounting position) that is impossible to describe in text.
      - Syntax: \`> **[FOTO: Detailed description]**\`

    **4. DATA PRESENTATION & TABLES (SCREEN DISPLAYS):**
    - **COMMAND LISTS:** If you see lists of codes/commands (e.g. "0 ↵", "1 0 0 ↵"), you **MUST** format them as a Markdown Table.
    - **TABLE STRUCTURE:** Use columns: | Command | Function/Description | Notes |.
    - **CLEANUP:** Do not put too much text in the "Command" column. Keep it short (e.g. "0 ↵"). Put the explanation in the Description.
    - **SYMBOLS:** Preserve special symbols like '↵' (Enter) if they appear in the source.

    **5. FORMATTING RULES:**
    - **TABLES:** All technical data (specs, error codes) MUST be Markdown Tables.
    - **HEADINGS:** Use H1 (#) for Main Title, H2 (##) for Chapters.
    - **STYLE:** Use bolding for key terms (e.g., **24V DC**, **Connector X1**).
    
    **PROCESS:**
    1. Read the PDF content.
    2. Filter out legal/address info.
    3. Apply branding replacements.
    4. Convert visual diagrams and Command Lists to clean Tables.
    5. Translate to ${config.targetLanguage}.

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