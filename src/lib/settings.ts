export interface Settings {
  ollamaUrl: string;
  ollamaModel: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function getSettings(): Settings {
  return {
    ollamaUrl: localStorage.getItem('ollama_url') || 'http://localhost:11434',
    ollamaModel: localStorage.getItem('ollama_model') || 'qwen2.5-coder',
    supabaseUrl: localStorage.getItem('supabase_url') || (import.meta as any).env?.VITE_SUPABASE_URL || '',
    supabaseAnonKey: localStorage.getItem('supabase_anon_key') || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
  };
}

export function setSettings(form: Settings): void {
  localStorage.setItem('ollama_url', form.ollamaUrl);
  localStorage.setItem('ollama_model', form.ollamaModel);
  localStorage.setItem('supabase_url', form.supabaseUrl);
  localStorage.setItem('supabase_anon_key', form.supabaseAnonKey);
}

export function getOllamaUrl(): string {
  return getSettings().ollamaUrl;
}

export function getOllamaModel(): string {
  return getSettings().ollamaModel;
}

export function setOllamaUrl(url: string): void {
  localStorage.setItem('ollama_url', url);
}

export function setOllamaModel(model: string): void {
  localStorage.setItem('ollama_model', model);
}

