import React, { useState } from 'react';
import SettingsPanel from './components/SettingsPanel';
import FileUpload from './components/FileUpload';
import ManualPreview from './components/ManualPreview';
import { ManualConfig, GenerationState } from './types';
import { generateManualFromPDF } from './services/geminiService';
import { FileText, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  // Initial Configuration State
  const [config, setConfig] = useState<ManualConfig>({
    targetLanguage: 'Slovak',
    tone: 'professional',
    replacements: [
      { id: '1', original: 'intec', replacement: 'elift' },
      { id: '2', original: 'mlc800', replacement: 'eliftecV2' },
      { id: '3', original: 'Intec Corp', replacement: 'Elift Solutions' },
    ],
  });

  const [generationState, setGenerationState] = useState<GenerationState>({
    status: 'idle',
  });

  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setGenerationState({ status: 'processing', progress: 0 });

    try {
      const markdown = await generateManualFromPDF(file, config);
      setGeneratedContent(markdown);
      setGenerationState({ status: 'completed' });
    } catch (error: any) {
      setGenerationState({ 
        status: 'error', 
        message: error.message || 'Nepodarilo sa spracovať súbor.' 
      });
    }
  };

  const reset = () => {
    setGeneratedContent(null);
    setGenerationState({ status: 'idle' });
  };

  // If content is generated, show the preview view (takes full screen)
  if (generatedContent && generationState.status === 'completed') {
    return (
      <ManualPreview 
        content={generatedContent} 
        onBack={reset} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 text-white p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Elift <span className="text-brand-600">ManualGen</span>
            </h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
            Verzia 1.0 • Powered by Gemini AI
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-8rem)]">
          
          {/* Left Column: Settings */}
          <div className="w-full lg:w-1/3 xl:w-1/4 min-h-[400px]">
            <SettingsPanel 
              config={config} 
              setConfig={setConfig} 
              disabled={generationState.status === 'processing'}
            />
          </div>

          {/* Right Column: Upload / Status */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Hero / Instructions */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Generátor Profesionálnej Dokumentácie</h2>
              <p className="text-gray-600 leading-relaxed">
                Tento nástroj automaticky preloží, preformátuje a upraví vaše technické PDF manuály.
                Využíva umelú inteligenciu na reštrukturalizáciu obsahu a aplikáciu firemných štandardov 
                (napr. zmena <em>intec</em> na <em>elift</em>).
              </p>
            </div>

            {/* Upload Area */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-center">
              <FileUpload 
                onFileUpload={handleFileUpload} 
                state={generationState} 
              />

              {/* Tips */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="flex items-start gap-2">
                  <div className="bg-green-100 p-1 rounded text-green-600 mt-0.5">
                    <FileText className="w-3 h-3" />
                  </div>
                  <span>Automatický preklad do Slovenčiny</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-blue-100 p-1 rounded text-blue-600 mt-0.5">
                    <FileText className="w-3 h-3" />
                  </div>
                  <span>Inteligentné preskupenie sekcií</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-purple-100 p-1 rounded text-purple-600 mt-0.5">
                    <FileText className="w-3 h-3" />
                  </div>
                  <span>Výmena kľúčových slov (Rebranding)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-orange-100 p-1 rounded text-orange-600 mt-0.5">
                    <FileText className="w-3 h-3" />
                  </div>
                  <span>Formát pripravený na tlač</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
