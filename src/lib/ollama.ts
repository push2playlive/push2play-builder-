import { getOllamaUrl, getOllamaModel } from './settings';

export interface OllamaTag { name: string; size?: number; }

export async function listModels(): Promise<OllamaTag[]> {
  try {
    const res = await fetch(`${getOllamaUrl()}/api/tags`);
    if (!res.ok) throw new Error(`Ollama: ${res.status}`);
    const data = await res.json();
    return (data.models || []) as OllamaTag[];
  } catch (err) {
    console.error('listModels failed', err);
    return [];
  }
}

const SYSTEM_PROMPT = `You are an expert React developer.
The user describes a small web app or component.
You must respond with ONE JavaScript code block defining a function component called \`App\`.
Rules:
- Use plain function App() { ... } syntax (no imports, no exports).
- Use React.useState / React.useEffect (React is a global).
- Use inline styles only; no Tailwind, no className, no external CSS.
- Theme: dark background #0a0a0a, white text, accents in orange (#ff6b00 / #ff9d00).
- Return ONLY the code. No prose, no markdown fences, no explanations.
- The component must be self-contained and render something visible.`;

export interface GenerateOpts {
  prompt: string;
  model?: string;
  signal?: AbortSignal;
  onToken?: (chunk: string) => void;
}

export async function generateCode({ prompt, model, signal, onToken }: GenerateOpts): Promise<string> {
  const usedModel = model || getOllamaModel();
  const body = {
    model: usedModel,
    system: SYSTEM_PROMPT,
    prompt,
    stream: true,
    options: { temperature: 0.3 },
  };

  const res = await fetch(`${getOllamaUrl()}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Ollama ${res.status}: ${await res.text()}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      try {
        const json = JSON.parse(line);
        if (json.response) {
          full += json.response;
          onToken?.(json.response);
        }
      } catch { /* ignore */ }
    }
  }
  return stripMarkdownFences(full);
}

function stripMarkdownFences(s: string): string {
  const fenced = s.match(/```(?:jsx|js|javascript|tsx|ts)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  return s.trim();
}
