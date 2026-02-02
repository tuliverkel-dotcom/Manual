import React, { useCallback } from 'react';
import { UploadCloud, FileText, Loader2, AlertCircle, Layers } from 'lucide-react';
import { GenerationState } from '../types';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  state: GenerationState;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, state }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (state.status === 'processing') return;
    
    const fileList = e.dataTransfer.files;
    if (fileList && fileList.length > 0) {
      const validFiles = Array.from(fileList).filter((f: File) => f.type === 'application/pdf');
      if (validFiles.length > 0) {
        onFileUpload(validFiles);
      } else {
        alert("Prosím vložte iba PDF súbory.");
      }
    }
  }, [onFileUpload, state.status]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files);
      onFileUpload(validFiles);
    }
  };

  return (
    <div 
      className={`
        w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-6 transition-colors
        ${state.status === 'processing' ? 'bg-gray-50 border-gray-300 cursor-not-allowed' : 'bg-white border-brand-300 hover:border-brand-500 cursor-pointer hover:bg-brand-50'}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {state.status === 'processing' ? (
        <div className="flex flex-col items-center animate-pulse">
          <Loader2 className="w-12 h-12 text-brand-600 animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Spracovávam súbory...</h3>
          <p className="text-sm text-gray-500 mt-2">
            Súbor {state.currentFile} z {state.totalFiles}
          </p>
          <div className="w-48 bg-gray-200 rounded-full h-2.5 mt-4">
            <div 
              className="bg-brand-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${state.progress}%` }}
            ></div>
          </div>
        </div>
      ) : state.status === 'error' ? (
        <div className="flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-600">Nastala chyba</h3>
            <p className="text-sm text-gray-600 mt-2 mb-4">{state.message}</p>
            <label className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md cursor-pointer hover:bg-gray-50">
            Skúsiť znova
            <input type="file" accept="application/pdf" multiple className="hidden" onChange={handleFileInput} />
          </label>
        </div>
      ) : (
        <>
          <div className="bg-brand-100 p-4 rounded-full mb-4 relative">
            <UploadCloud className="w-8 h-8 text-brand-600" />
            <Layers className="w-4 h-4 text-brand-500 absolute bottom-3 right-3 bg-white rounded-full border border-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Nahrajte PDF manuál(y)</h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Presuňte jeden alebo viacero súborov sem.
            <br />
            <span className="text-xs opacity-75">(Ideálne pre rozdelené kapitoly veľkého manuálu)</span>
          </p>
          <label className="bg-brand-600 text-white px-6 py-2 rounded-md font-medium cursor-pointer hover:bg-brand-700 transition-shadow shadow-sm">
            Vybrať súbory
            <input 
              type="file" 
              accept="application/pdf" 
              multiple
              className="hidden" 
              onChange={handleFileInput}
              disabled={state.status === 'processing'}
            />
          </label>
        </>
      )}
    </div>
  );
};

export default FileUpload;