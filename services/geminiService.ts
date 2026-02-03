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

    **2. CONTENT FILTRATION:**
    - **DELETE** legal disclaimers, FCC warnings, "Declaration of Conformity".
    - **DELETE** addresses/phones in footers.
    - **KEEP** technical instructions, safety warnings, specifications.

    **3. VISUALS STRATEGY:**
    - **PINOUTS / WIRING:** Convert diagrams to Markdown Tables or Bullet Lists.
    - **PHOTOS:** Use \`> **[FOTO: Detailed description]**\` only for complex photos.

    **4. KEYBOARD COMMAND TABLES (CRITICAL):**
    - **FORMAT:** You MUST convert lists of keypad commands into a MARKDOWN TABLE.
    - **COLUMNS:** Use exactly these 3 columns:
      | Príkaz | Popis | Poznámka |
      | :--- | :--- | :--- |
    - **COMMAND SYNTAX:** You MUST separate every key with a space so they can be styled as buttons.
      - **WRONG:** \`100↵\`
      - **CORRECT:** \`1 0 0 ↵\`
      - **CORRECT:** \`0 2 x x ↵\`
    - **ENTER KEY:** Use the symbol '↵' for Enter.
    - **VARIABLES:** If the code uses placeholders like 'x' or 'y' (e.g. for floor number), keep them as 'x' or 'y'.

    **5. FORMATTING RULES:**
    - **TABLES:** All technical data MUST be Markdown Tables.
    - **HEADINGS:** Use H1 (#) for Main Title, H2 (##) for Chapters.
    - **STYLE:** Use bolding for key terms (e.g., **24V DC**).
    
    **PROCESS:**
    1. Read PDF.
    2. Filter junk.
    3. Apply replacements.
    4. **RECREATE TABLES:** Detect command lists and build the 3-column table described above.
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