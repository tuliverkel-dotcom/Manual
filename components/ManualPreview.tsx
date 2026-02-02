import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Printer, Download, ArrowLeft, HelpCircle, Palette } from 'lucide-react';
import { ManualTheme } from '../types';

interface ManualPreviewProps {
  content: string;
  onBack: () => void;
  theme: ManualTheme;
  onThemeChange: (theme: ManualTheme) => void;
}

const ManualPreview: React.FC<ManualPreviewProps> = ({ content, onBack, theme, onThemeChange }) => {
  
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

  // Define theme-specific classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'swiss':
        return {
          wrapper: "font-sans",
          h1: "text-5xl font-black text-gray-900 tracking-tighter mb-8 pt-4 uppercase leading-none",
          h2: "text-2xl font-bold text-gray-900 mt-10 mb-4 flex items-center gap-4 before:content-[''] before:block before:w-6 before:h-6 before:bg-[#dc2626]",
          h3: "text-lg font-bold text-[#dc2626] mt-8 mb-2 uppercase tracking-widest border-b border-gray-200 pb-1",
          tableHeader: "bg-[#dc2626] text-white font-bold text-sm uppercase tracking-wider",
          tableRowEven: "bg-gray-50",
          tableBorder: "border-2 border-gray-900",
          blockquote: "border-l-[6px] border-[#dc2626] bg-gray-50 text-gray-900 p-6 my-8 font-medium italic shadow-sm",
          code: "bg-gray-100 text-[#dc2626] px-1.5 py-0.5 rounded-sm font-mono text-sm font-bold border border-gray-200",
          strong: "text-gray-900 font-black",
          link: "text-[#dc2626] hover:text-[#b91c1c] underline decoration-2 underline-offset-2"
        };
      case 'industrial':
        return {
          wrapper: "font-mono",
          h1: "text-3xl font-black text-orange-600 uppercase border-b-4 border-black pb-2 mb-6 tracking-tight",
          h2: "text-2xl font-bold text-gray-900 border-l-8 border-orange-500 pl-3 uppercase tracking-wide mt-8 mb-4",
          h3: "text-lg font-bold text-gray-800 mt-6 mb-2 underline decoration-orange-400 decoration-2",
          tableHeader: "bg-gray-900 text-white border-black uppercase text-sm",
          tableRowEven: "bg-gray-100",
          tableBorder: "border-2 border-black",
          blockquote: "border-l-4 border-orange-500 bg-orange-50 text-gray-800 p-4 my-4 font-bold italic shadow-sm",
          code: "bg-gray-800 text-white px-2 py-0.5 rounded text-sm font-mono",
          strong: "text-orange-700 font-black",
          link: "text-orange-600 underline hover:text-orange-800"
        };
      case 'elegant':
        return {
          wrapper: "font-serif",
          h1: "text-4xl font-normal text-emerald-900 border-b border-emerald-200 pb-4 mb-8 italic text-center",
          h2: "text-2xl font-normal text-emerald-800 mt-8 mb-4 flex items-center gap-2",
          h3: "text-xl font-medium text-emerald-700 mt-6 mb-2 italic",
          tableHeader: "bg-emerald-50 text-emerald-900 border-emerald-200 font-normal border-b-2",
          tableRowEven: "bg-slate-50",
          tableBorder: "border border-gray-200",
          blockquote: "border-l-2 border-emerald-300 bg-emerald-50/50 text-emerald-800 p-6 my-6 italic text-lg relative",
          code: "bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 font-sans text-sm",
          strong: "text-emerald-900 font-semibold",
          link: "text-emerald-600 border-b border-emerald-300 hover:text-emerald-800 no-underline"
        };
      case 'modern':
      default:
        return {
          wrapper: "font-sans",
          h1: "text-3xl font-bold text-brand-900 border-b-2 border-brand-100 pb-2 mb-6",
          h2: "text-2xl font-semibold text-brand-700 mt-8 mb-4 flex items-center",
          h3: "text-lg font-semibold text-brand-600 mt-6 mb-2",
          tableHeader: "bg-brand-600 text-white",
          tableRowEven: "bg-brand-50",
          tableBorder: "border border-gray-200 overflow-hidden rounded-lg",
          blockquote: "border-l-4 border-brand-400 bg-blue-50 text-brand-900 p-4 my-4 rounded-r-lg",
          code: "bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border border-gray-200 font-mono text-sm font-bold shadow-sm",
          strong: "text-brand-800 font-bold",
          link: "text-brand-600 hover:underline"
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

          {/* Real-time Theme Selector */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-gray-500" />
            <select
              value={theme}
              onChange={(e) => onThemeChange(e.target.value as ManualTheme)}
              className="text-sm border-gray-300 border rounded-md shadow-sm py-1.5 pl-2 pr-8 focus:ring-brand-500 focus:border-brand-500 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
            >
              <option value="modern">Moderný (Modrý)</option>
              <option value="industrial">Technický (Oranžový)</option>
              <option value="elegant">Elegantný (Zelený)</option>
              <option value="swiss">Swiss (Červený)</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="hidden lg:flex items-center gap-2 mr-4 text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200" title="Informácie o formáte">
            <HelpCircle className="w-3 h-3" />
            <span>Pre grafiku použite Tlač do PDF.</span>
          </div>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Stiahnuť MD
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            Tlačiť / Uložiť ako PDF
          </button>
        </div>
      </div>

      {/* Content Area - A4 Paper Simulation */}
      <div className={`flex-1 overflow-y-auto p-8 flex justify-center bg-gray-100/50 ${themeClasses.wrapper}`}>
        <div className="bg-white shadow-xl w-full max-w-[210mm] min-h-[297mm] p-[20mm] mx-auto print:w-full print:max-w-none print:shadow-none print:p-0 print:m-0">
          
          <article className="prose max-w-none prose-p:leading-relaxed prose-li:my-1">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className={themeClasses.h1} {...props} />,
                h2: ({node, ...props}) => <h2 className={themeClasses.h2} {...props} />,
                h3: ({node, ...props}) => <h3 className={themeClasses.h3} {...props} />,
                table: ({node, ...props}) => (
                  <div className={`my-8 w-full overflow-hidden ${themeClasses.tableBorder}`}>
                    <table className="min-w-full divide-y divide-gray-300" {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => <thead className={themeClasses.tableHeader} {...props} />,
                tr: ({node, ...props}) => <tr className={`even:${themeClasses.tableRowEven}`} {...props} />,
                th: ({node, ...props}) => <th className="px-4 py-3 text-left font-semibold tracking-wider" {...props} />,
                td: ({node, ...props}) => <td className="px-4 py-2 text-sm text-gray-700 border-t border-gray-100" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className={themeClasses.blockquote} {...props} />,
                code: ({node, ...props}) => <code className={themeClasses.code} {...props} />,
                strong: ({node, ...props}) => <strong className={themeClasses.strong} {...props} />,
                a: ({node, ...props}) => <a className={themeClasses.link} {...props} />,
                // Custom HR for section breaks
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
      </div>
    </div>
  );
};

export default ManualPreview;