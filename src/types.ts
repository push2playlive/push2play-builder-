export type ViewMode = 'split' | 'code' | 'preview';

export interface Build {
  id: string;
  projectName: string;
  code: string;
  files: Array<{ name: string; content: string }>;
  created_at: string;
  is_public: boolean;
  user_id?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

export interface StudioFile {
  name: string;
  active?: boolean;
}
