export interface ReplacementRule {
  id: string;
  original: string;
  replacement: string;
}

export interface ManualConfig {
  targetLanguage: string;
  tone: 'professional' | 'technical' | 'simplified';
  replacements: ReplacementRule[];
}

export interface GenerationState {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  message?: string;
  progress?: number;
  totalFiles?: number;
  currentFile?: number;
}

export interface GeneratedManual {
  content: string; // Markdown content
  title: string;
}