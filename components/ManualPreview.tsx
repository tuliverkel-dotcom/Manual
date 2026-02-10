import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Printer, Download, ArrowLeft, HelpCircle, Palette, Image as ImageIcon, Edit3, Save, Upload, FolderDown, PlusSquare, Table, AlertTriangle, Terminal, Grid, List, ChevronRight, FileJson, Camera, CircuitBoard } from 'lucide-react';
import { ManualTheme, ManualConfig, SavedProject } from '../types';

interface ManualPreviewProps {
  content: string;
  config: ManualConfig;
  onContentChange: (newContent: string) => void;
  onBack: () => void;
  theme: ManualTheme;
  onThemeChange: (theme: ManualTheme) => void;
}

// --- VISUAL COMPONENTS (POWERED BY JSON) ---

// 1. Keypad Key Component
const KeyCap: React.FC<{ text: string, themeClasses: any }> = ({ text, themeClasses }) => {
  const isEnter = ['↵', 'ENTER', 'Enter'].includes(text);
  const isVar = ['x', 'y', 'X', 'Y', 'N', 'n', '...'].includes(text);
  
  if (isEnter) {
    return <span className={`inline-flex items-center justify-center h-6 px-2 text-[10px] font-black uppercase tracking-wider rounded shadow-sm border mx-0.5 ${themeClasses.enterKey}`}>ENTER</span>;
  }
  if (isVar) {
     return <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1 text-xs italic font-serif text-gray-500 bg-gray-100 border border-gray-300 rounded mx-0.5">{text}</span>;
  }
  return <span className={`inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1 text-xs font-bold border-b-2 rounded mx-0.5 ${themeClasses.keycap}`}>{text}</span>;
};

// 2. Custom Table of Contents Component (JSON)
const TocComponent = ({ data, themeClasses }: { data: any[], themeClasses: any }) => {
  if (!Array.isArray(data)) return <div className="text-red-500 bg-red-50 p-2 text-xs border border-red-200 rounded">Chyba v dátach obsahu (očakávané pole)</div>;

  return (
    <div className="not-prose my-10 w-full max-w-[210mm] break-inside-avoid page-break-inside-avoid">
      <h4 className={`text-center text-lg font-black uppercase tracking-widest mb-8 border-b-2 border-gray-900 pb-2 ${themeClasses.strong.split(' ')[0]}`}>Obsah</h4>
      <div className="flex flex-col gap-0.5 w-full">
        {data.map((item, idx) => (
          <div key={idx} className="toc-row">
            <span className="toc-title text-sm">{item.chapter}</span>
            <span className="toc-dots"></span>
            <span className="toc-page text-sm">{item.page}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Custom Menu Component (JSON)
const MenuComponent = ({ data, themeClasses }: { data: any[], themeClasses: any }) => {
  if (!Array.isArray(data)) return <div className="text-red-500 bg-red-50 p-2 text-xs border border-red-200 rounded">Chyba v dátach menu (očakávané pole)</div>;

  return (
    <div className="not-prose my-8 w-full max-w-[210mm] border border-gray-200 rounded-lg overflow-hidden shadow-sm break-inside-avoid page-break-inside-avoid">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
        <span>Cesta / Položka</span>
        <span>Popis</span>
      </div>
      <div className="divide-y divide-gray-100 bg-white">
        {data.map((item, idx) => {
          const levels = item.path || [];
          return (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center p-3 sm:px-4 sm:py-2 hover:bg-blue-50/30 transition-colors">
              <div className="flex-1 flex flex-wrap items-center gap-1 mb-1 sm:mb-0">
                {levels.map((lvl: string, lIdx: number) => (
                  <React.Fragment key={lIdx}>
                    {lIdx > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                    <span className={`text-sm ${lIdx === levels.length - 1 ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
                      {lvl}
                    </span>
                  </React.Fragment>
                ))}
              </div>
              {item.description && (
                <div className="sm:w-1/2 text-sm text-gray-600 pl-4 border-l border-gray-100 italic">
                  {item.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 4. Custom Keypad Component (JSON)
const KeypadComponent = ({ data, themeClasses }: { data: any[], themeClasses: any }) => {
  if (!Array.isArray(data)) return <div className="text-red-500 bg-red-50 p-2 text-xs border border-red-200 rounded">Chyba v dátach klávesnice (očakávané pole)</div>;

  return (
    <div className="not-prose my-8 w-full max-w-[210mm] bg-[#f8f9fa] border border-gray-200 rounded-lg p-1 break-inside-avoid page-break-inside-avoid">
      <table className="w-full border-collapse">
         <thead>
             <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-200">
                 <th className="p-3 font-medium">Vstup / Kód</th>
                 <th className="p-3 font-medium">Funkcia</th>
                 <th className="p-3 font-medium">Poznámka</th>
             </tr>
         </thead>
         <tbody className="bg-white divide-y divide-gray-100">
            {data.map((item, idx) => {
                const inputKeys = item.inputs ? String(item.inputs).split(' ') : [];
                return (
                    <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 align-middle">
                            <div className="flex flex-wrap gap-0.5">
                                {inputKeys.map((k: string, ki: number) => <KeyCap key={ki} text={k} themeClasses={themeClasses} />)}
                            </div>
                        </td>
                        <td className="p-3 text-sm font-bold text-gray-800 align-middle">{item.function}</td>
                        <td className="p-3 text-sm text-gray-500 italic align-middle">{item.note}</td>
                    </tr>
                )
            })}
         </tbody>
      </table>
    </div>
  );
};

// 5. Generic Table Component (JSON)
const TableComponent = ({ data, themeClasses }: { data: any, themeClasses: any }) => {
  if (!data || !data.headers || !data.rows) return <div className="text-red-500 bg-red-50 p-2 text-xs border border-red-200 rounded">Chyba v dátach tabuľky</div>;

  return (
    <div className={`not-prose w-full ${themeClasses.tableContainer} manual-table-root break-inside-avoid page-break-inside-avoid`}>
      <table className={themeClasses.table}>
        <thead className={themeClasses.tableHeader}>
          <tr>
            {data.headers.map((h: string, i: number) => (
                <th key={i} className={themeClasses.tableTh}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className={themeClasses.tableBody}>
          {data.rows.map((row: string[], rI: number) => (
            <tr key={rI} className={rI % 2 !== 0 ? themeClasses.tableRowEven : ""}>
               {row.map((cell: string, cI: number) => (
                 <td key={cI} className={themeClasses.tableTd}>{cell}</td>
               ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 6. Smart Image Component (JSON)
const ImageBlockComponent = ({ data, themeClasses, onUpload }: { data: any, themeClasses: any, onUpload: (file: File) => void }) => {
  if (!data) return null;
  
  // Icon based on type
  const Icon = data.type === 'diagram' ? CircuitBoard : Camera;

  return (
    <div className="not-prose w-full my-8 break-inside-avoid page-break-inside-avoid">
       <figure className="flex flex-col items-center w-full">
         <label className={`w-full ${themeClasses.imagePlaceholder} relative flex flex-col items-center justify-center min-h-[160px]`}>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                 if(e.target.files?.[0]) onUpload(e.target.files[0]);
            }} />
            
            <Icon className="w-10 h-10 text-gray-300 mb-2" />
            
            <span className="font-bold text-gray-500 group-hover:text-gray-800 transition-colors">
              {data.type === 'diagram' ? 'Vložiť Diagram / Schému' : 'Vložiť Fotografiu'}
            </span>
            
            <div className="text-xs text-gray-400 mt-2 px-8 italic">
               "{data.description || 'Žiadny popis'}"
            </div>
            
            <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded border shadow-sm text-[10px] font-mono text-gray-400 uppercase">
               AUTO-ID: {data.type}
            </div>
         </label>
         
         {data.caption && (
            <figcaption className="mt-3 text-sm text-gray-600 font-medium italic text-center w-full max-w-[80%] border-b border-gray-100 pb-2">
                {data.caption}
            </figcaption>
         )}
       </figure>
    </div>
  );
};


const ManualPreview: React.FC<ManualPreviewProps> = ({ content, config, onContentChange, onBack, theme, onThemeChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePrint = () => {
    const originalTitle = document.title;
    const brandName = config.replacements.length > 0 ? config.replacements[0].replacement : 'Elift';
    const cleanBrand = brandName.replace(/[^a-zA-Z0-9]/g, '');
    const timestamp = new Date().toISOString().slice(0, 10);
    document.title = `Manual_${cleanBrand}_${theme}_${timestamp}`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 500);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manual_elift_${theme}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveProject = () => {
    const currentConfig = { ...config, theme };
    const projectData: SavedProject = {
      version: "1.0",
      timestamp: Date.now(),
      config: currentConfig,
      content: content
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projekt_elift_${new Date().toISOString().slice(0,10)}.elift`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- EDITOR INSERTION ---
  const insertTextAtCursor = (textToInsert: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = content.substring(0, start) + textToInsert + content.substring(end);
    onContentChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  // UPDATED TEMPLATES TO USE JSON
  const insertTemplates = {
    tocTable: `
\`\`\`json:toc
[
  {"chapter": "1. Úvod", "page": 5},
  {"chapter": "2. Bezpečnosť", "page": 8},
  {"chapter": "3. Inštalácia", "page": 12}
]
\`\`\`
`,
    menuTable: `
\`\`\`json:menu
[
  {"path": ["HLAVNÉ", "Nastavenia", "Čas"], "description": "Nastavenie hodín systému"},
  {"path": ["HLAVNÉ", "Displej"], "description": "Jas a kontrast"}
]
\`\`\`
`,
    keypadTable: `
\`\`\`json:keypad
[
  {"inputs": "1 0 0 ENTER", "function": "Volanie na poschodie", "note": "Zadajte číslo"},
  {"inputs": "MENU ENTER", "function": "Vstup do menu", "note": "Iba servis"}
]
\`\`\`
`,
    standardTable: `
\`\`\`json:table
{
  "headers": ["Parameter", "Hodnota", "Jednotka"],
  "rows": [
    ["Napätie", "230", "V"],
    ["Prúd", "10", "A"]
  ]
}
\`\`\`
`,
    imageJson: `
\`\`\`json:image
{
  "caption": "Obr. 1: Popis obrázku",
  "description": "Technický nákres zariadenia",
  "type": "diagram"
}
\`\`\`
`,
    alertInfo: `\n> [!NOTE]\n> **UPOZORNENIE:** Sem napíšte dôležitú informáciu pre technika.\n`,
    alertDanger: `\n> [!WARNING]\n> **NEBEZPEČENSTVO:** Práce pod napätím! Dodržujte BOZP.\n`
  };

  // HELPER: Sort object keys recursively to ensure JSON equality checks work
  // regardless of key order (e.g. {"a":1, "b":2} === {"b":2, "a":1})
  const sortObj = (o: any): any => {
    if (typeof o !== 'object' || o === null) return o;
    if (Array.isArray(o)) return o.map(sortObj);
    return Object.keys(o).sort().reduce((r: any, k) => {
        r[k] = sortObj(o[k]);
        return r;
    }, {});
  };

  // Handler for replacing the JSON block with an actual Image Markdown
  // IMPROVED: Uses Object comparison instead of String comparison
  const handleSmartImageUpload = (originalRawContent: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      let caption = "Obrázok";
      let targetObj: any = null;

      // 1. Try to parse the content we clicked on
      try {
          targetObj = JSON.parse(originalRawContent);
          if (targetObj.caption) caption = targetObj.caption;
      } catch(e) {
          // If the clicked content isn't valid JSON, we will fall back to loose string matching
          console.warn("Clicked content is not valid JSON, falling back to string match");
      }

      const newImageMarkdown = `\n![${caption}](${base64String})\n*${caption}*\n`;
      
      // 2. Find all json:image blocks in the document
      const regex = /```json:image([\s\S]*?)```/g;
      
      let match;
      let newContent = content;
      let found = false;

      while ((match = regex.exec(content)) !== null) {
          const fullBlockStr = match[0];
          const innerJsonStr = match[1];
          
          let isMatch = false;

          if (targetObj) {
            // Compare as Objects (Robust)
            try {
                const blockObj = JSON.parse(innerJsonStr);
                // Compare sorted stringified objects to ignore whitespace and key order
                if (JSON.stringify(sortObj(blockObj)) === JSON.stringify(sortObj(targetObj))) {
                    isMatch = true;
                }
            } catch (e) {
                // Ignore invalid JSON blocks in content
            }
          } else {
             // Compare as Strings (Fallback, ignore whitespace)
             if (innerJsonStr.replace(/\s+/g, '').trim() === originalRawContent.replace(/\s+/g, '').trim()) {
                 isMatch = true;
             }
          }

          if (isMatch) {
              const startIndex = match.index;
              const endIndex = startIndex + fullBlockStr.length;

              newContent = content.substring(0, startIndex) + 
                           newImageMarkdown + 
                           content.substring(endIndex);
              found = true;
              break; // Stop after first match
          }
      }

      if (found) {
        onContentChange(newContent);
      } else {
        alert("Nepodarilo sa nájsť tento blok v texte. Skúste prosím vymazať blok v editore a vložiť obrázok manuálne.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            const imageMarkdown = `\n![Vložený obrázok](${base64})\n`;
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newContent = content.substring(0, start) + imageMarkdown + content.substring(end);
            onContentChange(newContent);
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'swiss':
        return {
          wrapper: "font-sans",
          h1: "text-5xl font-black text-gray-900 tracking-tighter mb-8 pt-4 uppercase leading-none break-after-avoid",
          h2: "text-2xl font-bold text-gray-900 mt-12 mb-6 flex items-center gap-4 before:content-[''] before:block before:w-6 before:h-6 before:bg-[#dc2626] break-after-avoid",
          h3: "text-lg font-bold text-[#dc2626] mt-8 mb-4 uppercase tracking-widest border-b border-gray-200 pb-1 break-after-avoid",
          tableContainer: "my-8 w-full border-t-4 border-[#dc2626] bg-white shadow-sm overflow-x-auto",
          table: "w-full border-collapse text-left",
          tableHeader: "bg-gray-100 text-[#dc2626] font-black text-xs uppercase tracking-widest border-b-2 border-[#dc2626]",
          tableTh: "px-4 py-3 border border-gray-300 align-bottom",
          tableBody: "bg-white",
          tableRowEven: "bg-gray-50",
          tableTd: "px-4 py-2 text-sm text-gray-900 font-medium align-top leading-relaxed border border-gray-300",
          keycap: "bg-white border-gray-300 text-gray-800 shadow-sm",
          enterKey: "bg-[#dc2626] text-white border-[#b91c1c]",
          blockquote: "border-l-[6px] border-[#dc2626] bg-gray-50 text-gray-900 p-6 my-8 font-medium italic shadow-sm",
          code: "bg-gray-100 text-[#dc2626] px-1.5 py-0.5 rounded-sm font-mono text-sm font-bold border border-gray-200",
          strong: "text-gray-900 font-black",
          link: "text-[#dc2626] hover:text-[#b91c1c] underline decoration-2 underline-offset-2",
          imagePlaceholder: "bg-gray-100 border-2 border-dashed border-[#dc2626] p-6 my-6 flex flex-col items-center justify-center text-center rounded-lg transition-all hover:bg-red-50 cursor-pointer group shadow-sm hover:shadow-md hover:border-red-400"
        };
      case 'industrial':
        return {
          wrapper: "font-mono bg-[#e5e5e5]",
          h1: "text-3xl font-black text-gray-900 uppercase border-b-4 border-orange-600 pb-4 mb-8 tracking-tight break-after-avoid",
          h2: "text-2xl font-bold text-gray-900 border-l-[12px] border-orange-600 pl-4 uppercase tracking-wide mt-10 mb-6 bg-gray-200 py-2 break-after-avoid",
          h3: "text-lg font-bold text-gray-800 mt-8 mb-4 underline decoration-orange-600 decoration-4 underline-offset-4 break-after-avoid",
          tableContainer: "my-10 w-full bg-[#1a1a1a] border-4 border-gray-800 rounded-lg shadow-xl overflow-x-auto",
          table: "w-full border-collapse text-left text-gray-300",
          tableHeader: "bg-gray-900 text-orange-500 uppercase text-xs tracking-widest border-b border-gray-700",
          tableTh: "px-5 py-3 border border-gray-700 align-top",
          tableBody: "divide-y divide-gray-800",
          tableRowEven: "bg-[#222222]",
          tableTd: "px-5 py-3 text-sm border border-gray-700 align-top leading-relaxed",
          keycap: "bg-[#333] border-gray-600 text-green-400 font-mono border-2",
          enterKey: "bg-orange-600 text-white border-orange-700",
          blockquote: "border-l-4 border-orange-600 bg-gray-200 text-gray-900 p-4 my-4 font-bold italic shadow-sm border-t border-b border-gray-300",
          code: "bg-black text-green-400 px-2 py-0.5 rounded text-sm font-mono border border-gray-700",
          strong: "text-orange-700 font-black",
          link: "text-orange-700 underline hover:text-orange-900",
          imagePlaceholder: "bg-gray-200 border-4 border-gray-400 p-6 my-6 flex flex-col items-center justify-center text-center hover:bg-orange-100 cursor-pointer group hover:border-orange-500 transition-colors"
        };
      case 'construction':
        return {
          wrapper: "font-sans",
          h1: "text-4xl font-black text-black border-b-[8px] border-yellow-400 pb-2 mb-8 uppercase tracking-tighter break-after-avoid",
          h2: "text-2xl font-bold bg-black text-yellow-400 px-6 py-3 mt-12 mb-6 inline-block uppercase transform -skew-x-6 shadow-[8px_8px_0px_0px_rgba(250,204,21,1)] break-after-avoid",
          h3: "text-lg font-bold text-black mt-8 mb-4 border-l-[10px] border-yellow-400 pl-3 uppercase break-after-avoid",
          tableContainer: "my-8 w-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-x-auto",
          table: "w-full border-collapse text-left",
          tableHeader: "bg-yellow-400 text-black font-black uppercase text-sm border-b-4 border-black",
          tableTh: "px-4 py-3 border-2 border-black align-top",
          tableBody: "bg-white",
          tableRowEven: "bg-yellow-50",
          tableTd: "px-4 py-2 text-sm text-black font-bold border-2 border-black align-top leading-relaxed",
          keycap: "bg-black border-black text-yellow-400 font-black rounded-none shadow-[2px_2px_0px_0px_rgba(250,204,21,1)] border-b-0",
          enterKey: "bg-yellow-400 text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border",
          blockquote: "bg-yellow-100 border-4 border-black p-6 my-6 font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          code: "bg-black text-yellow-400 px-2 py-0.5 font-mono text-sm font-bold",
          strong: "bg-yellow-300 px-1 text-black font-black box-decoration-clone",
          link: "text-black underline decoration-yellow-400 decoration-4 hover:bg-yellow-400 transition-colors",
          imagePlaceholder: "bg-yellow-50 border-4 border-black border-dashed p-8 my-8 flex flex-col items-center justify-center text-center font-bold text-black hover:bg-yellow-200 cursor-pointer group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        };
      case 'elegant':
        return {
          wrapper: "font-serif",
          h1: "text-4xl font-normal text-emerald-900 border-b border-emerald-200 pb-4 mb-8 italic text-center break-after-avoid",
          h2: "text-2xl font-normal text-emerald-800 mt-10 mb-6 flex items-center gap-2 break-after-avoid",
          h3: "text-xl font-medium text-emerald-700 mt-8 mb-4 italic break-after-avoid",
          tableContainer: "my-8 w-full border border-emerald-100 rounded-xl overflow-hidden shadow-lg bg-white overflow-x-auto",
          table: "w-full border-collapse text-left",
          tableHeader: "bg-emerald-50 text-emerald-900 font-medium tracking-wide border-b border-emerald-200",
          tableTh: "px-6 py-5 border border-emerald-100 align-top",
          tableBody: "bg-white",
          tableRowEven: "bg-[#fafcfb]",
          tableTd: "px-6 py-4 text-sm text-emerald-800 border border-emerald-100 align-top leading-relaxed",
          keycap: "bg-white border-emerald-200 text-emerald-800 rounded-md shadow-sm font-sans",
          enterKey: "bg-emerald-100 text-emerald-900 border-emerald-300",
          blockquote: "border-l-2 border-emerald-300 bg-emerald-50/50 text-emerald-800 p-6 my-6 italic text-lg relative",
          code: "bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 font-sans text-sm",
          strong: "text-emerald-900 font-semibold",
          link: "text-emerald-600 border-b border-emerald-300 hover:text-emerald-800 no-underline",
          imagePlaceholder: "bg-emerald-50/30 border border-emerald-200 p-8 my-8 flex flex-col items-center justify-center text-center rounded-lg hover:bg-emerald-100 cursor-pointer group hover:border-emerald-400 transition-colors"
        };
      case 'modern':
      default:
        return {
          wrapper: "font-sans",
          h1: "text-3xl font-bold text-brand-900 border-b-2 border-brand-100 pb-2 mb-6 break-after-avoid",
          h2: "text-2xl font-semibold text-brand-700 mt-10 mb-6 flex items-center break-after-avoid",
          h3: "text-lg font-semibold text-brand-600 mt-8 mb-4 break-after-avoid",
          tableContainer: "my-8 w-full border border-gray-200 rounded-lg overflow-hidden shadow-md bg-white ring-1 ring-gray-100 overflow-x-auto",
          table: "w-full border-collapse text-left",
          tableHeader: "bg-gray-50 text-brand-900",
          tableTh: "px-4 py-3 font-bold border border-gray-300 align-top tracking-wide text-xs uppercase text-gray-600",
          tableBody: "bg-white",
          tableRowEven: "bg-blue-50/20",
          tableTd: "px-4 py-2 text-sm text-gray-700 border border-gray-300 align-top leading-relaxed",
          keycap: "bg-white border-gray-200 text-gray-700 shadow-sm rounded border-b-2",
          enterKey: "bg-brand-50 border-brand-200 text-brand-600 font-bold",
          blockquote: "border-l-4 border-brand-400 bg-blue-50 text-brand-900 p-4 my-4 rounded-r-lg",
          code: "bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border border-gray-200 font-mono text-sm font-bold shadow-sm",
          strong: "text-brand-800 font-bold",
          link: "text-brand-600 hover:underline",
          imagePlaceholder: "bg-gray-50 border-2 border-dashed border-gray-300 p-8 my-6 flex flex-col items-center justify-center text-center rounded-lg hover:border-brand-400 hover:bg-white transition-all cursor-pointer group hover:shadow-sm"
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Toolbar - Same as before */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm no-print sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Späť
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-gray-500" />
            <select
              value={theme}
              onChange={(e) => onThemeChange(e.target.value as ManualTheme)}
              disabled={isEditing}
              className="text-sm border-gray-300 border rounded-md shadow-sm py-1.5 pl-2 pr-8 bg-gray-50 cursor-pointer"
            >
              <option value="modern">Moderný (Modrý)</option>
              <option value="construction">Technický (Žltý)</option>
              <option value="industrial">Industrial (Terminál)</option>
              <option value="elegant">Elegantný (Zelený)</option>
              <option value="swiss">Swiss (Červený)</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-2">
           <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
              isEditing 
                ? 'bg-yellow-100 text-yellow-800 border-yellow-300' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {isEditing ? <><Save className="w-4 h-4" /> Ukončiť úpravy</> : <><Edit3 className="w-4 h-4" /> Upraviť text</>}
          </button>
          
          <button
            onClick={handleSaveProject}
            disabled={isEditing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-md hover:bg-brand-100 disabled:opacity-50"
          >
            <FolderDown className="w-4 h-4" />
            Uložiť Projekt
          </button>

          <button 
            onClick={handleDownloadMarkdown}
            disabled={isEditing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Stiahnuť MD
          </button>
          <button 
            onClick={handlePrint}
            disabled={isEditing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 shadow-sm disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            Vytvoriť PDF
          </button>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-8 flex justify-center bg-gray-200 print:bg-white`}>
        
        {isEditing ? (
          <div className="w-full max-w-[210mm] h-full flex flex-col">
            <div className="bg-gray-50 border border-gray-300 border-b-0 rounded-t-lg p-2 flex flex-wrap gap-2 items-center text-sm shadow-sm sticky top-0 z-10">
              <span className="text-gray-500 font-bold px-2 text-xs uppercase tracking-wider">Vložiť:</span>
              <button onClick={() => insertTextAtCursor(insertTemplates.tocTable)} className="px-3 py-1.5 bg-white border rounded hover:bg-gray-50 flex gap-1"><List className="w-4 h-4"/> Obsah</button>
              <button onClick={() => insertTextAtCursor(insertTemplates.menuTable)} className="px-3 py-1.5 bg-white border rounded hover:bg-gray-50 flex gap-1"><Grid className="w-4 h-4"/> Menu</button>
              <button onClick={() => insertTextAtCursor(insertTemplates.keypadTable)} className="px-3 py-1.5 bg-white border rounded hover:bg-gray-50 flex gap-1"><Terminal className="w-4 h-4"/> Klávesnica</button>
              <button onClick={() => insertTextAtCursor(insertTemplates.standardTable)} className="px-3 py-1.5 bg-white border rounded hover:bg-gray-50 flex gap-1"><Table className="w-4 h-4"/> Tabuľka</button>
              <button onClick={() => insertTextAtCursor(insertTemplates.imageJson)} className="px-3 py-1.5 bg-white border rounded hover:bg-gray-50 flex gap-1"><ImageIcon className="w-4 h-4"/> Obrázok (JSON)</button>
              <div className="h-4 w-px bg-gray-300 mx-1"></div>
              <button onClick={() => insertTextAtCursor(insertTemplates.alertInfo)} className="px-3 py-1.5 bg-white border rounded hover:bg-blue-50 flex gap-1 text-blue-600"><HelpCircle className="w-4 h-4"/> Info</button>
              <button onClick={() => insertTextAtCursor(insertTemplates.alertDanger)} className="px-3 py-1.5 bg-white border rounded hover:bg-red-50 flex gap-1 text-red-600"><AlertTriangle className="w-4 h-4"/> Pozor</button>
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              onPaste={handlePaste}
              className="w-full h-full min-h-[500px] p-12 font-mono text-sm bg-white border border-gray-300 shadow-xl resize-none focus:ring-2 focus:ring-brand-500 outline-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* THIS IS THE RENDERER */}
            <article className={`print-content prose max-w-none w-[210mm] min-h-[297mm] p-[20mm] bg-white shadow-2xl ${themeClasses.wrapper} print:shadow-none print:p-0`}>
              <ReactMarkdown
                urlTransform={(url) => url} 
                components={{
                  // Unwrap PRE to avoid black box around code blocks
                  pre: ({children}) => <>{children}</>,
                  
                  // MAIN LOGIC MOVED TO CODE COMPONENT
                  code: ({node, className, children, ...props}) => {
                    const match = /language-([\w:.-]+)/.exec(className || '');
                    let type = match ? match[1] : '';
                    
                    // IMPORTANT: Do NOT trim() here, or we lose exact match for replacement logic
                    const contentStr = String(children);

                    // 1. Handle Special JSON Components
                    if (type.includes('toc') || type.includes('menu') || type.includes('keypad') || type.includes('table') || type.includes('image')) {
                         try {
                             const jsonData = JSON.parse(contentStr);
                             if (type.includes('toc')) return <TocComponent data={jsonData} themeClasses={themeClasses} />;
                             if (type.includes('menu')) return <MenuComponent data={jsonData} themeClasses={themeClasses} />;
                             if (type.includes('keypad')) return <KeypadComponent data={jsonData} themeClasses={themeClasses} />;
                             if (type.includes('table')) return <TableComponent data={jsonData} themeClasses={themeClasses} />;
                             // Pass the raw string so we can replace it later
                             if (type.includes('image')) return <ImageBlockComponent data={jsonData} themeClasses={themeClasses} onUpload={(f) => handleSmartImageUpload(contentStr, f)} />;
                         } catch (e) {
                             // Error Boundary for Invalid JSON
                             return (
                                <div className="not-prose border border-red-300 bg-red-50 p-4 rounded my-4">
                                    <div className="text-red-600 text-sm font-bold mb-2 flex items-center gap-2">
                                      <AlertTriangle className="w-4 h-4"/> Chyba formátovania (Neplatný JSON)
                                    </div>
                                    <pre className="text-xs bg-red-100 p-2 overflow-x-auto text-red-800 rounded">
                                      {contentStr}
                                    </pre>
                                </div>
                             )
                         }
                    }

                    // 2. Handle Normal Code Blocks (since we unwrapped the pre, we must re-wrap standard code)
                    const isBlock = match !== null;

                    if (isBlock) {
                        return (
                          <pre className="not-prose my-6 w-full overflow-x-auto rounded bg-gray-900 p-4 text-sm text-white print:bg-gray-100 print:text-black print:border print:border-gray-300 break-inside-avoid page-break-inside-avoid">
                            <code className={className} {...props}>{children}</code>
                          </pre>
                        );
                    }

                    // 3. Inline Code
                    return <code className={themeClasses.code} {...props}>{children}</code>;
                  },

                  h1: ({node, ...props}) => <h1 className={`${themeClasses.h1}`} {...props} />,
                  h2: ({node, ...props}) => <h2 className={`${themeClasses.h2}`} {...props} />,
                  h3: ({node, ...props}) => <h3 className={`${themeClasses.h3}`} {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 text-justify hyphens-auto" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4" {...props} />,
                  
                  // STANDARD TABLE (Only for simple lists)
                  table: ({node, children, ...props}) => {
                    return (
                        <div className={`w-full ${themeClasses.tableContainer} manual-table-root break-inside-avoid page-break-inside-avoid`}>
                            <table className={themeClasses.table} {...props}>
                                {children}
                            </table>
                        </div>
                    );
                  },
                  thead: ({node, ...props}) => <thead className={themeClasses.tableHeader} {...props} />,
                  tbody: ({node, ...props}) => <tbody className={themeClasses.tableBody} {...props} />,
                  tr: ({node, ...props}) => <tr className={`even:${themeClasses.tableRowEven} border-b border-gray-200 last:border-0`} {...props} />,
                  th: ({node, ...props}) => <th className={themeClasses.tableTh} {...props} />,
                  td: ({node, children, ...props}) => <td className={themeClasses.tableTd} {...props}>{children}</td>,
                  
                  // Clean Blockquotes & IMAGE PLACEHOLDER (Legacy support)
                  blockquote: ({node, children, ...props}) => {
                    const contentStr = String(children);
                    if (contentStr.includes('[!WARNING]')) {
                         return (
                            <div className="not-prose my-6 w-full p-4 border-l-8 border-red-500 bg-red-50 rounded-r shadow-sm flex gap-4 items-start print:bg-white print:border-red-600 break-inside-avoid page-break-inside-avoid">
                                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
                                <div className="text-red-900 font-medium print:text-black">
                                    {contentStr.replace('[!WARNING]', '')}
                                </div> 
                            </div>
                         )
                    }
                    if (contentStr.includes('[!NOTE]')) {
                         return (
                            <div className="not-prose my-6 w-full p-4 border-l-8 border-blue-500 bg-blue-50 rounded-r shadow-sm flex gap-4 items-start print:bg-white print:border-blue-600 break-inside-avoid page-break-inside-avoid">
                                <HelpCircle className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                                <div className="text-blue-900 italic font-medium print:text-black">
                                    {contentStr.replace('[!NOTE]', '')}
                                </div>
                            </div>
                         )
                    }
                    return <blockquote className={`w-full ${themeClasses.blockquote} break-inside-avoid page-break-inside-avoid`} {...props}>{children}</blockquote>;
                  },
                  img: ({node, ...props}) => (
                    <div className="not-prose my-6 w-full flex flex-col items-center break-inside-avoid page-break-inside-avoid">
                      <img {...props} className="max-w-full max-h-[100mm] object-contain border border-gray-200 rounded-sm shadow-sm" />
                    </div>
                  ),
                  strong: ({node, ...props}) => <strong className={themeClasses.strong} {...props} />,
                  a: ({node, ...props}) => <a className={themeClasses.link} {...props} />,
                  
                  // PAGE BREAK RENDERER (HR)
                  hr: ({node, ...props}) => (
                     <div className="not-prose h-12 bg-gray-200 border-none relative flex items-center justify-center print:hidden -mx-[20mm] my-[20mm] shadow-inner page-break-always">
                        <span className="bg-gray-200 px-4 text-gray-400 text-xs font-mono uppercase">Koniec strany</span>
                        <div className="page-break-always hidden print:block"></div>
                     </div>
                  )
                }}
              >
                {content}
              </ReactMarkdown>

               {/* FIXED PRINT FOOTER */}
               <div className="print-footer-container hidden print:flex">
                  <span>{config.replacements[0]?.replacement || 'Elift'} Manuál</span>
                  <span>{new Date().toLocaleDateString('sk-SK')}</span>
               </div>
            </article>
            <div className="mt-12 pt-6 border-t border-gray-200 flex justify-between text-xs text-gray-400 print:hidden w-full max-w-[210mm]">
              <span>Elift Documentation</span>
              <span>{new Date().toLocaleDateString('sk-SK')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualPreview;