import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Printer, Download, ArrowLeft, HelpCircle, Palette, Image as ImageIcon, Edit3, Save, Upload, FolderDown, PlusSquare, Table, AlertTriangle, Terminal, Grid } from 'lucide-react';
import { ManualTheme, ManualConfig, SavedProject } from '../types';

interface ManualPreviewProps {
  content: string;
  config: ManualConfig;
  onContentChange: (newContent: string) => void;
  onBack: () => void;
  theme: ManualTheme;
  onThemeChange: (theme: ManualTheme) => void;
}

// Moved outside component to avoid re-creation and fix types
const isCommandContent = (text: string) => {
  const trimmed = text.trim();
  if (trimmed.includes('↵') || trimmed.includes('ENTER')) return true;
  if (trimmed.length < 50 && /^[\d\sxyXY]+(↵|ENTER)?$/.test(trimmed)) return true;
  return false;
};

// Made children optional to fix TS error
const CommandCell = ({ children, themeClasses }: { children?: React.ReactNode, themeClasses: any }) => {
  const text = String(children || '');
  const parts = text.split(/(\s+|↵|ENTER|Enter)/).filter(p => p.trim() !== '');
  return (
    <div className="flex flex-row flex-wrap items-center gap-1.5 align-middle">
      {parts.map((part, index) => {
        const isEnter = ['↵', 'ENTER', 'Enter'].includes(part);
        const isVar = ['x', 'y', 'X', 'Y'].includes(part);
        if (isEnter) {
          return <span key={index} className={`inline-flex items-center justify-center h-7 px-2.5 text-[11px] font-black uppercase tracking-wider rounded shadow-sm ml-1 border ${themeClasses.enterKey}`}>ENTER ↵</span>;
        }
        if (isVar) {
           return <span key={index} className="inline-flex items-center justify-center w-7 h-7 text-sm italic font-serif text-gray-500 bg-gray-100 border border-gray-300 rounded">{part}</span>;
        }
        return <span key={index} className={`inline-flex items-center justify-center w-7 h-7 text-sm font-bold border-b-[3px] active:border-b-0 active:translate-y-[3px] transition-all rounded ${themeClasses.keycap}`}>{part}</span>;
      })}
    </div>
  );
};

const ManualPreview: React.FC<ManualPreviewProps> = ({ content, config, onContentChange, onBack, theme, onThemeChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePrint = () => {
    // 1. Store original title
    const originalTitle = document.title;
    
    // 2. Generate a filename-friendly title
    const brandName = config.replacements.length > 0 ? config.replacements[0].replacement : 'Elift';
    const cleanBrand = brandName.replace(/[^a-zA-Z0-9]/g, '');
    const timestamp = new Date().toISOString().slice(0, 10);
    
    document.title = `Manual_${cleanBrand}_${theme}_${timestamp}`;

    // 3. Trigger Print (User selects "Save as PDF")
    window.print();

    // 4. Restore original title after a short delay
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
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
    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projekt_elift_${new Date().toISOString().slice(0,10)}.elift`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Insertion Logic ---
  const insertTextAtCursor = (textToInsert: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = content;
    
    const newText = currentText.substring(0, start) + textToInsert + currentText.substring(end);
    onContentChange(newText);
    
    // Restore focus and move cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  const insertTemplates = {
    menuTable: `
> [!MENU]
> | Úroveň 1 | Úroveň 2 | Úroveň 3 | Popis |
> | :--- | :--- | :--- | :--- |
> | **HLAVNÉ** | | | Koreňová položka |
> | | Nastavenia | | Konfigurácia |
> | | | Čas | Nastavenie hodín |
`,
    keypadTable: `
> [!KEYPAD]
> | Príkaz | Popis | Poznámka |
> | :--- | :--- | :--- |
> | 1 0 0 ENTER | Volanie na poschodie | Zadajte číslo poschodia |
`,
    standardTable: `
| Parameter | Hodnota | Jednotka |
| :--- | :--- | :--- |
| Napätie | 230 | V |
`,
    alertInfo: `\n> [!NOTE]\n> **UPOZORNENIE:** Sem napíšte dôležitú informáciu pre technika.\n`,
    alertDanger: `\n> [!WARNING]\n> **NEBEZPEČENSTVO:** Práce pod napätím! Dodržujte BOZP.\n`,
    image: `\n> **[FOTO: Popis obrázku]**\n`
  };

  const handleImageUpload = (placeholderText: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newImageMarkdown = `\n![Obrázok](${base64String})\n*${placeholderText.replace('[FOTO:', '').replace(']', '')}*\n`;
      const updatedContent = content.replace(`> **${placeholderText}**`, newImageMarkdown);
      onContentChange(updatedContent);
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
            const currentText = content;
            const newContent = currentText.substring(0, start) + imageMarkdown + currentText.substring(end);
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
          h1: "text-5xl font-black text-gray-900 tracking-tighter mb-8 pt-4 uppercase leading-none",
          h2: "text-2xl font-bold text-gray-900 mt-12 mb-6 flex items-center gap-4 before:content-[''] before:block before:w-6 before:h-6 before:bg-[#dc2626]",
          h3: "text-lg font-bold text-[#dc2626] mt-8 mb-4 uppercase tracking-widest border-b border-gray-200 pb-1",
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
          imagePlaceholder: "bg-gray-100 border-2 border-dashed border-[#dc2626] p-6 my-6 flex flex-col items-center justify-center text-center rounded-sm transition-colors hover:bg-red-50 cursor-pointer group"
        };
      case 'industrial':
        return {
          wrapper: "font-mono bg-[#e5e5e5]",
          h1: "text-3xl font-black text-gray-900 uppercase border-b-4 border-orange-600 pb-4 mb-8 tracking-tight",
          h2: "text-2xl font-bold text-gray-900 border-l-[12px] border-orange-600 pl-4 uppercase tracking-wide mt-10 mb-6 bg-gray-200 py-2",
          h3: "text-lg font-bold text-gray-800 mt-8 mb-4 underline decoration-orange-600 decoration-4 underline-offset-4",
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
          imagePlaceholder: "bg-gray-200 border-4 border-gray-400 p-6 my-6 flex flex-col items-center justify-center text-center hover:bg-orange-100 cursor-pointer group"
        };
      case 'construction':
        return {
          wrapper: "font-sans",
          h1: "text-4xl font-black text-black border-b-[8px] border-yellow-400 pb-2 mb-8 uppercase tracking-tighter",
          h2: "text-2xl font-bold bg-black text-yellow-400 px-6 py-3 mt-12 mb-6 inline-block uppercase transform -skew-x-6 shadow-[8px_8px_0px_0px_rgba(250,204,21,1)]",
          h3: "text-lg font-bold text-black mt-8 mb-4 border-l-[10px] border-yellow-400 pl-3 uppercase",
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
          imagePlaceholder: "bg-yellow-50 border-4 border-black border-dashed p-8 my-8 flex flex-col items-center justify-center text-center font-bold text-black hover:bg-yellow-200 cursor-pointer group shadow-sm"
        };
      case 'elegant':
        return {
          wrapper: "font-serif",
          h1: "text-4xl font-normal text-emerald-900 border-b border-emerald-200 pb-4 mb-8 italic text-center",
          h2: "text-2xl font-normal text-emerald-800 mt-10 mb-6 flex items-center gap-2",
          h3: "text-xl font-medium text-emerald-700 mt-8 mb-4 italic",
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
          imagePlaceholder: "bg-emerald-50/30 border border-emerald-200 p-8 my-8 flex flex-col items-center justify-center text-center rounded-lg hover:bg-emerald-100 cursor-pointer group"
        };
      case 'modern':
      default:
        return {
          wrapper: "font-sans",
          h1: "text-3xl font-bold text-brand-900 border-b-2 border-brand-100 pb-2 mb-6",
          h2: "text-2xl font-semibold text-brand-700 mt-10 mb-6 flex items-center",
          h3: "text-lg font-semibold text-brand-600 mt-8 mb-4",
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
          imagePlaceholder: "bg-gray-50 border-2 border-dashed border-gray-300 p-8 my-6 flex flex-col items-center justify-center text-center rounded-lg hover:border-brand-400 hover:bg-white transition-all cursor-pointer group"
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Toolbar */}
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

          {/* Theme Selector */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-gray-500" />
            <select
              value={theme}
              onChange={(e) => onThemeChange(e.target.value as ManualTheme)}
              disabled={isEditing}
              className="text-sm border-gray-300 border rounded-md shadow-sm py-1.5 pl-2 pr-8 focus:ring-brand-500 focus:border-brand-500 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
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
           {/* Edit Mode Toggle */}
           <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
              isEditing 
                ? 'bg-yellow-100 text-yellow-800 border-yellow-300' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4" />
                Ukončiť úpravy
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Upraviť text
              </>
            )}
          </button>
          
          {/* Save Project Button */}
          <button
            onClick={handleSaveProject}
            disabled={isEditing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-md hover:bg-brand-100 transition-colors disabled:opacity-50"
            title="Uložiť projekt na disk pre neskoršie úpravy"
          >
            <FolderDown className="w-4 h-4" />
            Uložiť Projekt
          </button>

          <button 
            onClick={handleDownloadMarkdown}
            disabled={isEditing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Stiahnuť MD
          </button>
          <button 
            onClick={handlePrint}
            disabled={isEditing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 shadow-sm transition-colors disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            Vytvoriť PDF
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 overflow-y-auto p-8 flex justify-center ${themeClasses.wrapper}`}>
        
        {isEditing ? (
          // EDIT MODE: Textarea
          <div className="w-full max-w-[210mm] h-full flex flex-col">
            
            {/* --- EDITOR TOOLBAR --- */}
            <div className="bg-gray-50 border border-gray-300 border-b-0 rounded-t-lg p-2 flex flex-wrap gap-2 items-center text-sm shadow-sm sticky top-0 z-10">
              <span className="text-gray-500 font-bold px-2 text-xs uppercase tracking-wider">Tabuľky:</span>
              
              <button 
                onClick={() => insertTextAtCursor(insertTemplates.menuTable)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 transition-colors"
                title="Tabuľka pre Menu s tieňovaním"
              >
                <Grid className="w-4 h-4 text-purple-600" />
                Menu Dizajn
              </button>

              <button 
                onClick={() => insertTextAtCursor(insertTemplates.keypadTable)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 transition-colors"
                title="Tmavá tabuľka pre príkazy"
              >
                <Terminal className="w-4 h-4 text-gray-800" />
                Klávesnica
              </button>

              <button 
                onClick={() => insertTextAtCursor(insertTemplates.standardTable)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 transition-colors"
                title="Obyčajná Excel tabuľka"
              >
                <Table className="w-4 h-4 text-gray-500" />
                Štandard
              </button>

              <div className="h-4 w-px bg-gray-300 mx-1"></div>

              <button 
                onClick={() => insertTextAtCursor(insertTemplates.alertInfo)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-blue-500" />
                Info
              </button>

              <button 
                onClick={() => insertTextAtCursor(insertTemplates.alertDanger)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Pozor
              </button>

               <button 
                onClick={() => insertTextAtCursor(insertTemplates.image)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                Obrázok
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              onPaste={handlePaste}
              className="w-full h-full min-h-[500px] p-6 font-mono text-sm bg-white border border-gray-300 rounded-b-lg shadow-inner resize-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none leading-relaxed"
              spellCheck={false}
              placeholder="Sem píšte text alebo vložte prvky z lišty..."
            />
          </div>
        ) : (
          // PREVIEW MODE: React Markdown
          <div className="bg-white shadow-xl w-full max-w-[210mm] min-h-[297mm] p-[20mm] mx-auto print:w-full print:max-w-none print:shadow-none print:p-0 print:m-0">
            
            <article className="prose max-w-none prose-p:leading-relaxed prose-li:my-1 prose-td:align-top">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className={themeClasses.h1} {...props} />,
                  h2: ({node, ...props}) => <h2 className={themeClasses.h2} {...props} />,
                  h3: ({node, ...props}) => <h3 className={themeClasses.h3} {...props} />,
                  // NOTE: We wrap standard tables in the container here, 
                  // but if they are inside a blockquote (menu/keypad), the blockquote render handles the styles via CSS descendant selectors on the div.
                  table: ({node, ...props}) => (
                    <div className={`${themeClasses.tableContainer} manual-table-root`}>
                      <table className={themeClasses.table} {...props} />
                    </div>
                  ),
                  thead: ({node, ...props}) => <thead className={themeClasses.tableHeader} {...props} />,
                  tbody: ({node, ...props}) => <tbody className={themeClasses.tableBody} {...props} />,
                  tr: ({node, ...props}) => <tr className={`even:${themeClasses.tableRowEven}`} {...props} />,
                  th: ({node, ...props}) => <th className={themeClasses.tableTh} {...props} />,
                  td: ({node, ...props}) => {
                    const childrenStr = String(props.children);
                    
                    if (isCommandContent(childrenStr)) {
                       return (
                         <td className={themeClasses.tableTd} {...props}>
                            <CommandCell themeClasses={themeClasses}>{props.children}</CommandCell>
                         </td>
                       )
                    }

                    // Empty cells
                    if (!childrenStr.trim()) {
                         return <td className={`${themeClasses.tableTd} bg-gray-50/50`} {...props}></td>;
                    }

                    return <td className={themeClasses.tableTd} {...props} />;
                  },
                  blockquote: ({node, children, ...props}) => {
                    const contentStr = String(children);
                    
                    const childrenArray = React.Children.toArray(children);
                    const firstChild = childrenArray[0];
                    let isMenu = false;
                    let isKeypad = false;

                    if (React.isValidElement(firstChild) && firstChild.props.children) {
                        const text = String(firstChild.props.children);
                        if (text.includes('[!MENU]')) isMenu = true;
                        if (text.includes('[!KEYPAD]')) isKeypad = true;
                    }

                    if (isMenu) {
                        const contentWithoutTag = childrenArray.slice(1);
                        return (
                            <div className={`
                                my-8 overflow-x-auto rounded-lg shadow-sm border border-gray-200
                                [&_table]:w-full [&_table]:border-collapse [&_table]:table-fixed
                                [&_thead]:bg-gray-800 [&_thead]:text-white [&_th]:border-gray-600 [&_th]:p-3 [&_th]:text-xs [&_th]:uppercase
                                [&_td]:border-b [&_td]:border-gray-200 [&_td]:p-2 [&_td]:text-sm
                                [&_td:nth-child(1)]:bg-gray-100 [&_td:nth-child(1)]:font-bold [&_td:nth-child(1)]:border-r [&_td:nth-child(1)]:border-gray-300 [&_td:nth-child(1)]:w-[20%]
                                [&_td:nth-child(2)]:bg-gray-50 [&_td:nth-child(2)]:font-semibold [&_td:nth-child(2)]:w-[20%]
                                [&_td:nth-child(3)]:bg-white [&_td:nth-child(3)]:font-medium [&_td:nth-child(3)]:w-[20%]
                                [&_td:nth-child(4)]:w-[40%]
                                [&_tr:last-child_td]:border-b-0
                            `}>
                                {contentWithoutTag}
                            </div>
                        )
                    }

                    if (isKeypad) {
                        const contentWithoutTag = childrenArray.slice(1);
                        return (
                            <div className={`
                                my-8 overflow-x-auto rounded-lg shadow-lg border-2 border-gray-700 bg-[#1e1e1e] text-green-400 font-mono
                                [&_table]:w-full [&_table]:border-none
                                [&_thead]:hidden
                                [&_td]:border-b [&_td]:border-gray-800 [&_td]:p-3 [&_td]:text-sm
                                [&_tr:hover]:bg-gray-800
                            `}>
                                {contentWithoutTag}
                            </div>
                        )
                    }

                    // Image Placeholder
                    if (contentStr.includes('[FOTO:')) {
                      return (
                        <label className={`${themeClasses.imagePlaceholder} print:hidden relative`}>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleImageUpload(contentStr, e.target.files[0]);
                              }
                            }}
                          />
                          <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-gray-600 group-hover:scale-110 transition-all" />
                          <span className="font-bold text-gray-500 group-hover:text-gray-800">Kliknite pre vloženie obrázku</span>
                          <div className="text-sm text-gray-400 italic mt-1 group-hover:text-gray-600">{children}</div>
                        </label>
                      );
                    }

                    // ALERT: WARNING
                    if (contentStr.includes('[!WARNING]')) {
                         return (
                            <div className="my-6 p-4 border-l-8 border-red-500 bg-red-50 rounded-r shadow-sm flex gap-4 items-start">
                                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
                                <div className="text-red-900 font-medium">
                                    {children}
                                </div> 
                            </div>
                         )
                    }

                    // ALERT: NOTE
                    if (contentStr.includes('[!NOTE]')) {
                         return (
                            <div className="my-6 p-4 border-l-8 border-blue-500 bg-blue-50 rounded-r shadow-sm flex gap-4 items-start">
                                <HelpCircle className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                                <div className="text-blue-900 italic font-medium">{children}</div>
                            </div>
                         )
                    }

                    return <blockquote className={themeClasses.blockquote} {...props}>{children}</blockquote>;
                  },
                  img: ({node, ...props}) => (
                    <div className="my-6 flex flex-col items-center">
                      <img {...props} className="max-w-full max-h-[100mm] object-contain border border-gray-200 rounded-sm shadow-sm" />
                    </div>
                  ),
                  code: ({node, ...props}) => <code className={themeClasses.code} {...props} />,
                  strong: ({node, ...props}) => <strong className={themeClasses.strong} {...props} />,
                  a: ({node, ...props}) => <a className={themeClasses.link} {...props} />,
                  hr: ({node, ...props}) => <div className="page-break-before-always my-8 border-t-2 border-dashed border-gray-300 print:border-none" />
                }}
              >
                {content}
              </ReactMarkdown>
            </article>
            
            {/* Footer simulation */}
            <div className="mt-12 pt-6 border-t border-gray-200 flex justify-between text-xs text-gray-400 print:hidden">
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