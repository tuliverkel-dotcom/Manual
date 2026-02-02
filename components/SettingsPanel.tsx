import React, { useState } from 'react';
import { ManualConfig, ReplacementRule } from '../types';
import { Trash2, Plus, Settings, RefreshCw } from 'lucide-react';

interface SettingsPanelProps {
  config: ManualConfig;
  setConfig: React.Dispatch<React.SetStateAction<ManualConfig>>;
  disabled: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, setConfig, disabled }) => {
  const [newOriginal, setNewOriginal] = useState('');
  const [newReplacement, setNewReplacement] = useState('');

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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6 text-gray-800">
        <Settings className="w-5 h-5" />
        <h2 className="font-semibold text-lg">Konfigurácia</h2>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Štýl / Tón</label>
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
            placeholder="Pôvodný text (napr. intec)"
            value={newOriginal}
            onChange={(e) => setNewOriginal(e.target.value)}
            disabled={disabled}
            className="w-full text-sm border-gray-300 rounded-md p-2"
          />
          <input
            type="text"
            placeholder="Nahradiť za (napr. elift)"
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
          {config.replacements.length === 0 && (
            <p className="text-xs text-gray-400 text-center italic mt-4">Žiadne pravidlá.</p>
          )}
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
