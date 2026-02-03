import React, { useState } from 'react';
import SettingsPanel from './components/SettingsPanel';
import FileUpload from './components/FileUpload';
import ManualPreview from './components/ManualPreview';
import { ManualConfig, GenerationState, SavedProject } from './types';
import { generateManualFromPDF } from './services/geminiService';
import { splitPdf } from './services/pdfHelpers';
import { FileText, Sparkles, Scissors, FolderOpen } from 'lucide-react';

const App: React.FC = () => {
  // Initial Configuration State
  const [config, setConfig] = useState<ManualConfig>({
    targetLanguage: 'Slovak',
    tone: 'professional',
    theme: 'modern', // Default theme
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

  const handleFileUpload = async (inputFiles: File[]) => {
    setGenerationState({ 
      status: 'analyzing', 
      message: 'Analyzujem štruktúru PDF...' 
    });

    try {
      let filesToProcess: File[] = [];

      // Logic: If user uploads 1 file, try to split it. If multiple, assume they are already split.
      if (inputFiles.length === 1) {
        setGenerationState({ 
          status: 'analyzing', 
          message: 'Automaticky delím veľký manuál na menšie časti (cca 10 strán)...' 
        });
        // Split into 10-page chunks to be safe for Output Token Limits
        filesToProcess = await splitPdf(inputFiles[0], 10);
      } else {
        // Sort files by name to ensure correct order
        filesToProcess = inputFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
      }

      setGenerationState({ 
        status: 'processing', 
        progress: 0,
        totalFiles: filesToProcess.length,
        currentFile: 1 
      });

      let finalMarkdown = "";

      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        
        // Update state
        setGenerationState(prev => ({
          ...prev,
          status: 'processing',
          currentFile: i + 1,
          progress: Math.round(((i) / filesToProcess.length) * 100),
          message: `Spracovávam časť ${i + 1} z ${filesToProcess.length}...`
        }));

        // Generate content for this chunk
        const chunkContent = await generateManualFromPDF(file, config);
        
        // Append to final content with a separator
        finalMarkdown += chunkContent + "\n\n<div style='page-break-before: always;'></div>\n\n";
      }

      setGeneratedContent(finalMarkdown);
      setGenerationState({ status: 'completed' });

    } catch (error: any) {
      console.error(error);
      setGenerationState({ 
        status: 'error', 
        message: error.message || 'Nepodarilo sa spracovať súbor.' 
      });
    }
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const projectData: SavedProject = JSON.parse(jsonString);

        if (projectData.config && projectData.content) {
          setConfig(projectData.config);
          setGeneratedContent(projectData.content);
          setGenerationState({ status: 'completed' });
        } else {
          alert('Neplatný formát projektu.');
        }
      } catch (error) {
        console.error(error);
        alert('Nepodarilo sa načítať projekt. Súbor môže byť poškodený.');
      }
    };
    reader.readAsText(file);
    // Reset value so we can load the same file again if needed
    e.target.value = '';
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
        config={config}
        onContentChange={setGeneratedContent}
        onBack={reset} 
        theme={config.theme}
        onThemeChange={(newTheme) => setConfig({ ...config, theme: newTheme })}
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
            Verzia 1.5 • Projektový manažér
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-8rem)]">
          
          {/* Left Column: Settings */}
          <div className="w-full lg:w-1/3 xl:w-1/4 h-full min-h-[500px]">
            <SettingsPanel 
              config={config} 
              setConfig={setConfig} 
              disabled={generationState.status === 'processing' || generationState.status === 'analyzing'}
            />
          </div>

          {/* Right Column: Upload / Status */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Hero / Instructions */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Generátor Profesionálnej Dokumentácie</h2>
              <p className="text-gray-600 leading-relaxed">
                Nahrajte celý PDF manuál. Aplikácia ho spracuje a umožní vám vybrať si 
                <strong> vizuálny štýl</strong>. <br/>
                Už ste na tomto manuáli pracovali? <strong>Otvorte uložený projekt.</strong>
              </p>
            </div>

            {/* Upload Area */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-center relative">
              
              <FileUpload 
                onFileUpload={handleFileUpload} 
                state={generationState} 
              />

              {/* Load Project Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-gray-400 text-sm font-medium">ALEBO</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              {/* Load Project Button */}
              <div className="flex justify-center">
                 <label className={`
                    flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all shadow-sm border border-gray-300
                    ${generationState.status === 'processing' || generationState.status === 'analyzing' 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer hover:border-gray-400'}
                 `}>
                   <FolderOpen className="w-5 h-5" />
                   Otvoriť rozpracovaný projekt (.elift)
                   <input 
                    type="file" 
                    accept=".json,.elift" 
                    className="hidden" 
                    onChange={handleLoadProject}
                    disabled={generationState.status === 'processing' || generationState.status === 'analyzing'}
                   />
                 </label>
              </div>

              {/* Tips */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="flex items-start gap-2">
                  <div className="bg-green-100 p-1 rounded text-green-600 mt-0.5">
                    <Scissors className="w-3 h-3" />
                  </div>
                  <span>Auto-Split: Rozdelí veľké PDF</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-blue-100 p-1 rounded text-blue-600 mt-0.5">
                    <FolderOpen className="w-3 h-3" />
                  </div>
                  <span>Ukladanie a načítanie projektov</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-purple-100 p-1 rounded text-purple-600 mt-0.5">
                    <FileText className="w-3 h-3" />
                  </div>
                  <span>Rebranding (Zmena názvov)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-orange-100 p-1 rounded text-orange-600 mt-0.5">
                    <FileText className="w-3 h-3" />
                  </div>
                  <span>Tlač do farebného PDF</span>
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