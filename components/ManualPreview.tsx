import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Printer, Download, ArrowLeft, HelpCircle, Palette, Image as ImageIcon, Edit3, Save, Upload } from 'lucide-react';
import { ManualTheme } from '../types';

interface ManualPreviewProps {
  content: string;
  onContentChange: (newContent: string) => void;
  onBack: () => void;
  theme: ManualTheme;
  onThemeChange: (theme: ManualTheme) => void;
}

const ManualPreview: React.FC<ManualPreviewProps> = ({ content, onContentChange, onBack, theme, onThemeChange }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
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

  // Function to replace a specific placeholder with an uploaded image
  const handleImageUpload = (placeholderText: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Construct the Markdown Image syntax
      // We assume the placeholder is inside a blockquote like > **[FOTO: ...]**
      // We will replace the entire line containing the placeholder text
      
      const newImageMarkdown = `\n![Obrázok](${base64String})\n*${placeholderText.replace('[FOTO:', '').replace(']', '')}*\n`;
      
      // We need to find the specific blockquote in the content. 
      // This is a simple string replacement. Ideally we'd be more precise, but this works for 99% cases.
      const updatedContent = content.replace(`> **${placeholderText}**`, newImageMarkdown);
      
      onContentChange(updatedContent);
    };
    reader.readAsDataURL(file);
  };

  // Define theme-specific classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'swiss':
        return {
          wrapper: "font-sans",
          h1: "text-5xl font-black text-gray-900 tracking-tighter mb-8 pt-4 uppercase leading-none",
          h2: "text-2xl font-bold text-gray-900 mt-10 mb-4 flex items-center gap-4 before:content-[''] before:block before:w-6 before:h-6 before:bg-[#dc2626]",
          h3: "text-lg font-bold text-[#dc2626] mt-8 mb-2 uppercase tracking-widest border-b border-gray-200 pb-1",
          tableContainer: "my-8 w-full border-t-2 border-gray-900",
          table: "min-w-full divide-y divide-gray-900",
          tableHeader: "bg-[#dc2626] text-white font-bold text-sm uppercase tracking-wider",
          tableTh: "px-3 py-3 text-left border-r border-red-500 last:border-r-0",
          tableBody: "bg-white divide-y divide-gray-200",
          tableRowEven: "bg-gray-50",
          tableTd: "px-3 py-2 text-sm text-gray-900 font-medium border-r border-gray-200 last:border-r-0",
          blockquote: "border-l-[6px] border-[#dc2626] bg-gray-50 text-gray-900 p-6 my-8 font-medium italic shadow-sm",
          code: "bg-gray-100 text-[#dc2626] px-1.5 py-0.5 rounded-sm font-mono text-sm font-bold border border-gray-200",
          strong: "text-gray-900 font-black",
          link: "text-[#dc2626] hover:text-[#b91c1c] underline decoration-2 underline-offset-2",
          imagePlaceholder: "bg-gray-100 border-2 border-dashed border-[#dc2626] p-6 my-6 flex flex-col items-center justify-center text-center rounded-sm transition-colors hover:bg-red-50 cursor-pointer group"
        };
      case 'industrial':
        return {
          wrapper: "font-mono",
          h1: "text-3xl font-black text-orange-600 uppercase border-b-4 border-black pb-2 mb-6 tracking-tight",
          h2: "text-2xl font-bold text-gray-900 border-l-8 border-orange-500 pl-3 uppercase tracking-wide mt-8 mb-4",
          h3: "text-lg font-bold text-gray-800 mt-6 mb-2 underline decoration-orange-400 decoration-2",
          tableContainer: "my-6 w-full border-2 border-black",
          table: "min-w-full divide-y-2 divide-black",
          tableHeader: "bg-gray-900 text-white uppercase text-xs tracking-widest",
          tableTh: "px-4 py-2 text-left border-r border-gray-700 last:border-r-0",
          tableBody: "bg-white divide-y divide-black",
          tableRowEven: "bg-orange-50",
          tableTd: "px-4 py-2 text-sm text-gray-800 border-r border-black last:border-r-0 font-mono",
          blockquote: "border-l-4 border-orange-500 bg-orange-50 text-gray-800 p-4 my-4 font-bold italic shadow-sm",
          code: "bg-gray-800 text-white px-2 py-0.5 rounded text-sm font-mono",
          strong: "text-orange-700 font-black",
          link: "text-orange-600 underline hover:text-orange-800",
          imagePlaceholder: "bg-gray-200 border-2 border-black p-6 my-6 flex flex-col items-center justify-center text-center hover:bg-orange-100 cursor-pointer group"
        };
      case 'construction': // Yellow / Black
        return {
          wrapper: "font-sans",
          h1: "text-4xl font-black text-black border-b-[6px] border-yellow-400 pb-2 mb-8 uppercase tracking-tighter",
          h2: "text-2xl font-bold bg-black text-yellow-400 px-4 py-2 mt-10 mb-4 inline-block uppercase transform -skew-x-6",
          h3: "text-lg font-bold text-black mt-8 mb-2 border-l-8 border-yellow-400 pl-3 uppercase",
          tableContainer: "my-8 w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          table: "min-w-full divide-y-2 divide-black",
          tableHeader: "bg-yellow-400 text-black font-black uppercase text-sm border-b-2 border-black",
          tableTh: "px-4 py-3 text-left border-r border-black last:border-r-0",
          tableBody: "bg-white divide-y divide-black",
          tableRowEven: "bg-yellow-50",
          tableTd: "px-4 py-3 text-sm text-black font-medium border-r border-black last:border-r-0",
          blockquote: "bg-yellow-50 border-2 border-black p-6 my-6 font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          code: "bg-black text-yellow-400 px-2 py-0.5 font-mono text-sm font-bold",
          strong: "bg-yellow-200 px-1 text-black font-black box-decoration-clone",
          link: "text-black underline decoration-yellow-400 decoration-4 hover:bg-yellow-400 transition-colors",
          imagePlaceholder: "bg-yellow-100 border-4 border-black border-dashed p-8 my-8 flex flex-col items-center justify-center text-center font-bold text-black hover:bg-yellow-200 cursor-pointer group shadow-sm"
        };
      case 'elegant':
        return {
          wrapper: "font-serif",
          h1: "text-4xl font-normal text-emerald-900 border-b border-emerald-200 pb-4 mb-8 italic text-center",
          h2: "text-2xl font-normal text-emerald-800 mt-8 mb-4 flex items-center gap-2",
          h3: "text-xl font-medium text-emerald-700 mt-6 mb-2 italic",
          tableContainer: "my-8 w-full border border-emerald-100 rounded-lg overflow-hidden shadow-sm",
          table: "min-w-full divide-y divide-emerald-100",
          tableHeader: "bg-emerald-50 text-emerald-900 font-normal",
          tableTh: "px-6 py-3 text-left",
          tableBody: "bg-white divide-y divide-emerald-50",
          tableRowEven: "bg-[#fafcfb]",
          tableTd: "px-6 py-3 text-sm text-emerald-800",
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
          h2: "text-2xl font-semibold text-brand-700 mt-8 mb-4 flex items-center",
          h3: "text-lg font-semibold text-brand-600 mt-6 mb-2",
          tableContainer: "my-6 w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm",
          table: "min-w-full divide-y divide-gray-200",
          tableHeader: "bg-brand-600 text-white",
          tableTh: "px-4 py-3 text-left font-semibold",
          tableBody: "bg-white divide-y divide-gray-200",
          tableRowEven: "bg-brand-50/30",
          tableTd: "px-4 py-3 text-sm text-gray-700",
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
              <option value="industrial">Industrial (Oranž)</option>
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

          <button 
            onClick={handleDownload}
            disabled={isEditing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Stiahnuť
          </button>
          <button 
            onClick={handlePrint}
            disabled={isEditing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 shadow-sm transition-colors disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            Tlačiť PDF
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 overflow-y-auto p-8 flex justify-center bg-gray-100/50 ${themeClasses.wrapper}`}>
        
        {isEditing ? (
          // EDIT MODE: Textarea
          <div className="w-full max-w-[210mm] h-full flex flex-col">
            <div className="bg-yellow-50 border border-yellow-200 p-4 mb-4 rounded-md text-sm text-yellow-800 flex items-start gap-2">
              <Edit3 className="w-4 h-4 mt-0.5" />
              <div>
                <strong>Režim úprav:</strong> Tu môžete voľne prepisovať text, mazať placeholdery alebo opravovať preklad. 
                Zmeny sa prejavia okamžite po prepnutí späť.
              </div>
            </div>
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className="w-full h-full min-h-[500px] p-6 font-mono text-sm bg-white border border-gray-300 rounded-lg shadow-inner resize-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              spellCheck={false}
            />
          </div>
        ) : (
          // PREVIEW MODE: React Markdown
          <div className="bg-white shadow-xl w-full max-w-[210mm] min-h-[297mm] p-[20mm] mx-auto print:w-full print:max-w-none print:shadow-none print:p-0 print:m-0">
            
            <article className="prose max-w-none prose-p:leading-relaxed prose-li:my-1">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className={themeClasses.h1} {...props} />,
                  h2: ({node, ...props}) => <h2 className={themeClasses.h2} {...props} />,
                  h3: ({node, ...props}) => <h3 className={themeClasses.h3} {...props} />,
                  table: ({node, ...props}) => (
                    <div className={themeClasses.tableContainer}>
                      <table className={themeClasses.table} {...props} />
                    </div>
                  ),
                  thead: ({node, ...props}) => <thead className={themeClasses.tableHeader} {...props} />,
                  tbody: ({node, ...props}) => <tbody className={themeClasses.tableBody} {...props} />,
                  tr: ({node, ...props}) => <tr className={`even:${themeClasses.tableRowEven}`} {...props} />,
                  th: ({node, ...props}) => <th className={themeClasses.tableTh} {...props} />,
                  td: ({node, ...props}) => <td className={themeClasses.tableTd} {...props} />,
                  
                  // Custom Blockquote and Interactive Image Placeholder
                  blockquote: ({node, children, ...props}) => {
                    const contentStr = String(children);
                    const isImagePlaceholder = contentStr.includes('[FOTO:');
                    
                    if (isImagePlaceholder) {
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
                          <div className="absolute top-2 right-2 bg-white/80 rounded px-2 py-0.5 text-xs text-gray-500 border border-gray-200">
                             Nahradiť
                          </div>
                        </label>
                      );
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