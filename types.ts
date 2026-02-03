
export interface ReplacementRule {
  id: string;
  original: string;
  replacement: string;
}

export type ManualTheme = 'modern' | 'industrial' | 'elegant' | 'swiss' | 'construction';

export interface ManualConfig {
  apiKey?: string;
  targetLanguage: string;
  tone: 'professional' | 'technical' | 'simplified';
  theme: ManualTheme;
  replacements: ReplacementRule[];
}

export interface GenerationState {
  status: 'idle' | 'analyzing' | 'uploading' | 'processing' | 'completed' | 'error';
  message?: string;
  progress?: number;
  totalFiles?: number;
  currentFile?: number;
}

export interface GeneratedManual {
  content: string; // Markdown content
  title: string;
}

export interface SavedProject {
  version: string;
  timestamp: number;
  config: ManualConfig;
  content: string;
}
