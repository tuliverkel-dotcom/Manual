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

/**
 * STRICT TABLE FIXER
 * Scans markdown, identifies tables, determines required column count from the header separator,
 * and forces every row to have that many cells by appending empty ones.
 */
const fixTableFormatting = (markdown: string): string => {
  const lines = markdown.split('\n');
  const processedLines: string[] = [];
  
  let inTable = false;
  let expectedPipes = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 1. Detect Header Separator (e.g., |---|---|)
    if (line.match(/^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/)) {
      inTable = true;
      // Count pipes to determine columns. Standard md table row: | A | B | -> 3 pipes for 2 cols (if enclosed)
      // Robust way: split by pipe, filter empty strings if it starts/ends with pipe
      expectedPipes = (line.match(/\|/g) || []).length;
      processedLines.push(line);
      continue;
    }

    // 2. Process Table Rows
    if (inTable) {
      // Check if we are still in a table (line starts with pipe)
      if (line.startsWith('|')) {
        const currentPipes = (line.match(/\|/g) || []).length;
        
        if (currentPipes < expectedPipes) {
          // Fix ragged row: Add missing cells
          const missingPipes = expectedPipes - currentPipes;
          let fixedLine = line;
          
          // If line ends with |, we need to add " |" N times.
          // If it doesn't end with |, we need to add " |" N+1 times to close it + add cols.
          // Assuming standard "enclosed" tables from LLM.
          
          if (fixedLine.endsWith('|')) {
             fixedLine += " |".repeat(missingPipes);
          } else {
             fixedLine += " |".repeat(missingPipes + 1);
          }
          processedLines.push(fixedLine);
        } else {
          processedLines.push(line);
        }
      } else {
        // End of table
        inTable = false;
        expectedPipes = 0;
        processedLines.push(lines[i]); // Push original line
      }
    } else {
      // Normal text
      processedLines.push(lines[i]);
    }
  }

  return processedLines.join('\n');
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

  const prompt = `
    You are a rigorous Technical Documentation Engine. 
    
    **TASK:** 
    Convert this PDF page to structurally perfect Markdown in ${config.targetLanguage}.
    
    **CRITICAL ALIGNMENT RULES (DO NOT IGNORE):**
    1. **MENU TABLES (> [!MENU]):** 
       - MUST have exactly **4 COLUMNS**: \`| Level 1 | Level 2 | Level 3 | Description |\`.
       - **NEVER** merge columns. If a menu item is at Level 2, Level 1 MUST be an empty cell \`| |\`.
       - **BAD:** \`| Settings | Time |\` (Only 2 cols -> Broken alignment)
       - **GOOD:** \`| | Settings | Time | |\` (4 cols -> Aligned)
    
    2. **KEYPAD TABLES (> [!KEYPAD]):**
       - MUST have exactly **3 COLUMNS**: \`| Input | Function | Note |\`.
       
    3. **GENERAL TABLES:**
       - Ensure every row has the same number of cells as the header.
       - Do not wrap text onto new lines within the markdown source.

    **BRANDING:**
    - Manufacturer: "**${mainBrand}**".
    - ${replacementInstructions}

    **MARKDOWN SYNTAX:**
    - Use \`> [!MENU]\` wrapper for Menu trees.
    - Use \`> [!KEYPAD]\` wrapper for Button/Code lists.
    - Use \`> [!WARNING]\` for safety alerts.
    - Use \`> **[FOTO: description]**\` for images.

    **OUTPUT:**
    Raw Markdown only.
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

    const rawMarkdown = response.text || "";
    
    // Apply the Fixer to repair any "ragged" tables from Gemini
    return fixTableFormatting(rawMarkdown);

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Nepodarilo sa vygenerovať manuál.");
  }
};