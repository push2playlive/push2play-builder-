import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useStore } from '../store/useStore';
import { generateCode, listModels, type OllamaTag } from '../lib/ollama';
import { Bot, Sparkles, Square, Send, User as UserIcon, Trash2 } from 'lucide-react';

export default function ChatPanel() {
  const { messages, appendMessage, updateLastAssistant, clearMessages, setCode } = useStore();
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>('qwen2.5-coder');
  const [models, setModels] = useState<OllamaTag[]>([]);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await listModels();
        setModels(list);
        if (list.length && !list.find((m) => m.name === model)) setModel(list[0].name);
      } catch (e) {
        console.error(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const onSend = async (e?: FormEvent) => {
    e?.preventDefault();
    const q = input.trim();
    if (!q || busy) return;
    setInput('');
    appendMessage({ id: crypto.randomUUID(), role: 'user', content: q, ts: Date.now() });
    appendMessage({ id: crypto.randomUUID(), role: 'assistant', content: '', ts: Date.now() });

    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let streamed = '';
    try {
      const final = await generateCode({
        prompt: q,
        model,
        signal: ctrl.signal,
        onToken: (t) => {
          streamed += t;
          updateLastAssistant(streamed);
        },
      });
      setCode(final);
      updateLastAssistant(`✅ Generated and loaded into the editor. Live preview is updating.\n\n\`\`\`jsx\n${final.slice(0, 240)}${final.length > 240 ? '…' : ''}\n\`\`\``);
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('Failed to fetch')) {
        updateLastAssistant('⚠️ Could not reach Ollama at http://localhost:11434.\n\nStart it with:\n```\nOLLAMA_ORIGINS="*" ollama serve\n```');
      } else if (!msg.includes('AbortError')) {
        updateLastAssistant(`⚠️ ${msg}`);
      } else {
        updateLastAssistant(streamed + '\n\n_(stopped)_');
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  const onStop = () => abortRef.current?.abort();

  return (
    <aside className="w-[340px] shrink-0 border-r border-zinc-900/80 bg-[#101012] flex flex-col font-sans">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-zinc-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500 to-amber-600 grid place-items-center">
            <Bot className="w-3.5 h-3.5 text-black" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-200">AI Agent</div>
            <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-extrabold">Ollama · local</div>
          </div>
        </div>
        <button onClick={clearMessages} title="Clear chat" className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 cursor-pointer">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m) => (
          <Message key={m.id} role={m.role} content={m.content} />
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>generating…</span>
          </div>
        )}
      </div>

      {/* Input pinned at bottom */}
      <form onSubmit={onSend} className="border-t border-zinc-900/80 p-2.5 bg-black/40">
        <div className="mb-1.5 flex items-center gap-2">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="flex-1 text-[10px] bg-zinc-900/60 border border-zinc-800 rounded px-1.5 py-1 text-zinc-400 outline-none"
          >
            {models.length === 0 && <option value={model}>{model}</option>}
            {models.map((mo) => <option key={mo.name} value={mo.name}>{mo.name}</option>)}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
            }}
            rows={2}
            placeholder="Ask me to build something…"
            className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-md px-2.5 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-amber-500/50 resize-none"
          />
          {busy ? (
            <button type="button" onClick={onStop}
              className="h-9 w-9 grid place-items-center rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 cursor-pointer">
              <Square className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button type="submit" disabled={!input.trim()}
              className="h-9 w-9 grid place-items-center rounded-md bg-amber-500 text-black disabled:opacity-40 shadow-[0_0_10px_rgba(245,158,11,0.2)] cursor-pointer">
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="mt-1 text-[9px] text-zinc-600 font-medium">Enter to send • Shift+Enter for newline</div>
      </form>
    </aside>
  );
}

function Message({ role, content }: { role: 'user' | 'assistant'; content: string; key?: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-6 h-6 rounded-md grid place-items-center shrink-0 ${
        isUser ? 'bg-zinc-800 border border-zinc-700' : 'bg-amber-500'
      }`}>
        {isUser ? <UserIcon className="w-3 h-3 text-zinc-300" /> : <Sparkles className="w-3 h-3 text-black" />}
      </div>
      <div className={`text-xs leading-relaxed rounded-lg px-2.5 py-2 max-w-[260px] whitespace-pre-wrap break-words ${
        isUser
          ? 'bg-amber-500/15 text-amber-100 border border-amber-500/20'
          : 'bg-zinc-900/70 text-zinc-200 border border-zinc-800'
      }`}>
        {content || <span className="text-zinc-600">…</span>}
      </div>
    </div>
  );
}
