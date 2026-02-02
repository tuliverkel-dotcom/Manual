import React, { useState, useEffect } from 'react';
import { ManualConfig, ReplacementRule, ManualTheme } from '../types';
import { Trash2, Plus, Settings, RefreshCw, Key, CheckCircle, AlertCircle, Palette } from 'lucide-react';

interface SettingsPanelProps {
  config: ManualConfig;
  setConfig: React.Dispatch<React.SetStateAction<ManualConfig>>;
  disabled: boolean;
}

// Miniatúry pre témy
const ThemeThumbnail = ({ theme, isActive }: { theme: ManualTheme; isActive: boolean }) => {
  if (theme === 'modern') {
    return (
      <div className={`w-12 h-16 bg-white border rounded shadow-sm overflow-hidden flex flex-col transition-all ${isActive ? 'ring-2 ring-brand-400 border-brand-500' : 'border-gray-200'}`}>
        <div className="h-2.5 w-full bg-brand-600"></div>
        <div className="p-1.5 space-y-1">
          <div className="h-1.5 w-3/4 bg-gray-800 rounded-sm mb-1"></div>
          <div className="h-1 w-full bg-gray-200 rounded-sm"></div>
          <div className="h-1 w-full bg-gray-200 rounded-sm"></div>
          <div className="h-1 w-2/3 bg-gray-200 rounded-sm"></div>
          <div className="mt-2 h-4 w-full bg-brand-50 rounded-sm border border-brand-100"></div>
        </div>
      </div>
    );
  }
  if (theme === 'industrial') {
    return (
      <div className={`w-12 h-16 bg-white border-2 rounded-none overflow-hidden flex flex-col transition-all ${isActive ? 'ring-2 ring-orange-400 border-orange-600' : 'border-gray-800'}`}>
        <div className="h-2 w-full bg-orange-500 border-b border-black"></div>
        <div className="p-1.5 space-y-1 font-mono">
           <div className="h-1.5 w-full bg-black mb-1.5"></div>
           <div className="h-0.5 w-full bg-gray-400"></div>
           <div className="h-0.5 w-full bg-gray-400"></div>
           <div className="mt-2 border border-black h-3 w-full flex">
             <div className="w-1/3 bg-gray-300 border-r border-black"></div>
             <div className="w-2/3"></div>
           </div>
        </div>
      </div>
    );
  }
  if (theme === 'elegant') {
    return (
      <div className={`w-12 h-16 bg-[#fcfdfc] border rounded-sm overflow-hidden flex flex-col items-center pt-2 transition-all ${isActive ? 'ring-2 ring-emerald-400 border-emerald-500' : 'border-emerald-100'}`}>
        <div className="h-0.5 w-1/2 bg-emerald-800 mb-2"></div>
         <div className="space-y-1 w-full px-2 flex flex-col items-center">
          <div className="h-0.5 w-full bg-emerald-900/40"></div>
          <div className="h-0.5 w-full bg-emerald-900/40"></div>
          <div className="h-0.5 w-4/5 bg-emerald-900/40"></div>
          <div className="mt-2 w-full border-l-2 border-emerald-400 bg-emerald-50 h-3"></div>
        </div>
      </div>
    );
  }
  if (theme === 'swiss') {
    return (
      <div className={`w-12 h-16 bg-white border rounded-sm overflow-hidden flex flex-col transition-all ${isActive ? 'ring-2 ring-red-400 border-red-600' : 'border-gray-200'}`}>
        <div className="p-1.5 pt-2 space-y-1">
           <div className="h-2 w-1/3 bg-red-600 mb-1"></div>
           <div className="h-1.5 w-full bg-black mb-2"></div>
           <div className="h-0.5 w-full bg-gray-300"></div>
           <div className="h-0.5 w-full bg-gray-300"></div>
           <div className="mt-1 h-3 w-full border-t-2 border-red-600"></div>
        </div>
      </div>
    );
  }
  return null;
};

const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, setConfig, disabled }) => {
  const [newOriginal, setNewOriginal] = useState('');
  const [newReplacement, setNewReplacement] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Load API key from local storage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('elift_api_key');
    if (savedKey) {
      setConfig(prev => ({ ...prev, apiKey: savedKey }));
    }
  }, [setConfig]);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setConfig(prev => ({ ...prev, apiKey: newKey }));
    localStorage.setItem('elift_api_key', newKey);
  };

  const addRule = () => {
    if (newOriginal && newReplacement) {
      const newRule: ReplacementRule = {
        id: Date.now().toString(),
        original: newOriginal,
        replacement: newReplacement,
      };
      setConfig(prev => ({
        ...prev,
        replacements: [...prev.replacements, newRule]
      }));
      setNewOriginal('');
      setNewReplacement('');
    }
  };

  const removeRule = (id: string) => {
    setConfig(prev => ({
      ...prev,
      replacements: prev.replacements.filter(r => r.id !== id)
    }));
  };

  const hasKey = !!(config.apiKey || process.env.API_KEY);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col overflow-y-auto">
      <div className="flex items-center gap-2 mb-6 text-gray-800">
        <Settings className="w-5 h-5" />
        <h2 className="font-semibold text-lg">Konfigurácia</h2>
      </div>

      {/* API Key Section */}
      <div className={`mb-6 p-4 rounded-lg border transition-all ${hasKey ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
            <Key className="w-4 h-4" />
            Gemini API Kľúč
          </label>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm transition-all ${
            hasKey 
              ? 'bg-green-500 text-white shadow-green-200' 
              : 'bg-red-500 text-white shadow-red-200'
          }`}>
            {hasKey ? (
              <>
                <CheckCircle className="w-3 h-3" />
                AKTÍVNY
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3" />
                CHÝBA
              </>
            )}
          </div>
        </div>
        
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={config.apiKey || ''}
            onChange={handleApiKeyChange}
            disabled={disabled}
            placeholder={process.env.API_KEY ? "Kľúč je načítaný zo systému" : "Vložte váš Google AI Studio kľúč"}
            className={`w-full border rounded-md shadow-sm p-2 text-sm focus:ring-2 focus:ring-offset-1 pr-16 transition-colors ${
              hasKey 
                ? 'border-green-300 focus:border-green-500 focus:ring-green-500' 
                : 'border-red-300 focus:border-red-500 focus:ring-red-500'
            }`}
          />
          <button 
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-2 text-xs font-medium text-gray-500 hover:text-gray-700 px-2 py-0.5 rounded hover:bg-gray-100 transition-colors"
          >
            {showKey ? "Skryť" : "Ukázať"}
          </button>
        </div>
      </div>

      {/* Visual Theme Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Vizuálny Štýl (Téma)
        </label>
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: 'modern', name: 'Moderný', desc: 'Čistý modrý dizajn' },
            { id: 'industrial', name: 'Technický', desc: 'Výrazný oranžový kontrast' },
            { id: 'elegant', name: 'Elegantný', desc: 'Jemný pätkový štýl' },
            { id: 'swiss', name: 'Swiss (Červený)', desc: 'Minimalistický, výrazný' }
          ].map((theme) => {
            const isActive = config.theme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => setConfig({ ...config, theme: theme.id as ManualTheme })}
                disabled={disabled}
                className={`flex items-center gap-3 p-2 rounded-lg border text-left transition-all group ${
                  isActive 
                    ? 'border-brand-500 bg-brand-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="shrink-0">
                  <ThemeThumbnail theme={theme.id as ManualTheme} isActive={isActive} />
                </div>
                <div>
                  <div className={`font-semibold text-sm ${isActive ? 'text-brand-900' : 'text-gray-900'}`}>{theme.name}</div>
                  <div className="text-xs text-gray-500">{theme.desc}</div>
                </div>
                {isActive && <CheckCircle className="w-4 h-4 text-brand-500 ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Language & Tone */}
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jazyk výstupu</label>
          <select
            disabled={disabled}
            value={config.targetLanguage}
            onChange={(e) => setConfig({ ...config, targetLanguage: e.target.value })}
            className="w-full border-gray-300 border rounded-md shadow-sm p-2 text-sm focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="Slovak">Slovenčina</option>
            <option value="English">English</option>
            <option value="Czech">Čeština</option>
            <option value="German">Deutsch</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Štýl textu</label>
          <select
            disabled={disabled}
            value={config.tone}
            onChange={(e) => setConfig({ ...config, tone: e.target.value as any })}
            className="w-full border-gray-300 border rounded-md shadow-sm p-2 text-sm focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="professional">Profesionálny</option>
            <option value="technical">Technický (Strohý)</option>
            <option value="simplified">Zjednodušený (Pre laikov)</option>
          </select>
        </div>
      </div>

      {/* Replacement Rules */}
      <div className="flex-1 flex flex-col min-h-0">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Pravidlá nahrádzania
        </label>
        
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4 space-y-2">
          <input
            type="text"
            placeholder="Pôvodný text"
            value={newOriginal}
            onChange={(e) => setNewOriginal(e.target.value)}
            disabled={disabled}
            className="w-full text-sm border-gray-300 rounded-md p-2"
          />
          <input
            type="text"
            placeholder="Nahradiť za"
            value={newReplacement}
            onChange={(e) => setNewReplacement(e.target.value)}
            disabled={disabled}
            className="w-full text-sm border-gray-300 rounded-md p-2"
          />
          <button
            onClick={addRule}
            disabled={disabled || !newOriginal || !newReplacement}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white p-2 rounded-md text-sm hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Pridať pravidlo
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-2 space-y-2">
          {config.replacements.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200 shadow-sm text-sm">
              <div className="truncate flex-1 mr-2">
                <span className="text-red-500 line-through mr-2">{rule.original}</span>
                <span className="text-gray-400 mx-1">→</span>
                <span className="text-green-600 font-medium">{rule.replacement}</span>
              </div>
              <button
                onClick={() => removeRule(rule.id)}
                disabled={disabled}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;