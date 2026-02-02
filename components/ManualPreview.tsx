import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Printer, Download, ArrowLeft } from 'lucide-react';

interface ManualPreviewProps {
  content: string;
  onBack: () => void;
}

const ManualPreview: React.FC<ManualPreviewProps> = ({ content, onBack }) => {
  
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manual_elift.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          <h2 className="text-lg font-bold text-gray-800 border-l pl-4 border-gray-300">
            Náhľad Manuálu
          </h2>
        </div>
        <div className="flex gap-2">
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
            Tlačiť / PDF
          </button>
        </div>
      </div>

      {/* Content Area - A4 Paper Simulation */}
      <div className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div className="bg-white shadow-lg w-full max-w-[210mm] min-h-[297mm] p-[20mm] mx-auto print:w-full print:max-w-none print:shadow-none print:p-0 print:m-0">
          <article className="prose prose-slate prose-headings:font-bold prose-h1:text-3xl prose-h1:text-brand-900 prose-h2:text-xl prose-h2:text-brand-700 prose-a:text-brand-600 max-w-none">
            <ReactMarkdown>
              {content}
            </ReactMarkdown>
          </article>
          
          {/* Footer simulation */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400 print:hidden">
            Generované pomocou Elift AI • {new Date().toLocaleDateString('sk-SK')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualPreview;
