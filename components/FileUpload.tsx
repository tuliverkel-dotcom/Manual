import React, { useCallback } from 'react';
import { UploadCloud, FileText, Loader2, AlertCircle } from 'lucide-react';
import { GenerationState } from '../types';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  state: GenerationState;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, state }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (state.status === 'processing') return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0 && files[0].type === 'application/pdf') {
      onFileUpload(files[0]);
    } else {
        alert("Prosím vložte PDF súbor.");
    }
  }, [onFileUpload, state.status]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
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
          <h3 className="text-lg font-semibold text-gray-700">Analyzujem a generujem manuál...</h3>
          <p className="text-sm text-gray-500 mt-2">Toto môže trvať až minútu v závislosti od veľkosti PDF.</p>
        </div>
      ) : state.status === 'error' ? (
        <div className="flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-600">Nastala chyba</h3>
            <p className="text-sm text-gray-600 mt-2 mb-4">{state.message}</p>
            <label className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md cursor-pointer hover:bg-gray-50">
            Skúsiť znova
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileInput} />
          </label>
        </div>
      ) : (
        <>
          <div className="bg-brand-100 p-4 rounded-full mb-4">
            <UploadCloud className="w-8 h-8 text-brand-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Nahrajte PDF manuál</h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">Presuňte súbor sem alebo kliknite pre výber</p>
          <label className="bg-brand-600 text-white px-6 py-2 rounded-md font-medium cursor-pointer hover:bg-brand-700 transition-shadow shadow-sm">
            Vybrať súbor
            <input 
              type="file" 
              accept="application/pdf" 
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
