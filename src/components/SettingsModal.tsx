import React, { useEffect, useState } from 'react';
import { X, Save, RefreshCw, Bot, Database, KeyRound, Globe, CheckCircle2, XCircle } from 'lucide-react';
import { getSettings, setSettings, type Settings } from '../lib/settings';
import { listModels } from '../lib/ollama';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<Settings>(getSettings());
  const [models, setModels] = useState<string[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<'unknown' | 'ok' | 'fail'>('unknown');
  const [testing, setTesting] = useState(false);

  // Test Ollama whenever URL changes (debounced via button)
  const testOllama = async () => {
    setTesting(true);
    setOllamaStatus('unknown');
    // Persist the URL FIRST so listModels() reads the new value
    setSettings({ ...form, ollamaUrl: form.ollamaUrl });
    try {
      const list = await listModels();
      setModels(list.map((m) => m.name));
      if (list.length > 0) {
        setOllamaStatus('ok');
        if (!list.find((m) => m.name === form.ollamaModel)) {
          setForm((f) => ({ ...f, ollamaModel: list[0].name }));
        }
      } else {
        setOllamaStatus('fail');
      }
    } catch {
      setOllamaStatus('fail');
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    testOllama();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = () => {
    setSettings(form);
    // Reload so Supabase client + Ollama client both pick up new values
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-6">
        <div className="w-full max-w-2xl bg-zinc-950 border border-amber-500/20 rounded-2xl p-6 fade-up shadow-2xl my-8">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-800">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-amber-500">Settings</div>
              <div className="text-lg font-bold text-white">API & Agent Configuration</div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ============ OLLAMA ============ */}
          <Section icon={Bot} title="Ollama (local AI agent)" desc="Runs on your machine. Make sure CORS is open: OLLAMA_ORIGINS=&quot;*&quot; ollama serve">
            <Field label="Ollama URL" icon={Globe}>
              <input
                value={form.ollamaUrl}
                onChange={(e) => setForm({ ...form, ollamaUrl: e.target.value })}
                placeholder="http://localhost:11434"
                className="input-custom"
              />
              <button onClick={testOllama} disabled={testing}
                className="ml-2 px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-300 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer">
                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Test
              </button>
            </Field>

            <div className="mt-2 text-[11px] flex items-center gap-1.5">
              {ollamaStatus === 'ok' && (
                <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Connected — {models.length} model(s) available</span></>
              )}
              {ollamaStatus === 'fail' && (
                <><XCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-400">Cannot reach Ollama. Check it's running with CORS enabled.</span></>
              )}
              {ollamaStatus === 'unknown' && <span className="text-zinc-500">Click Test to verify…</span>}
            </div>

            <Field label="Default Model" icon={Bot}>
              {models.length > 0 ? (
                <select
                  value={form.ollamaModel}
                  onChange={(e) => setForm({ ...form, ollamaModel: e.target.value })}
                  className="input-custom bg-zinc-900 text-white border border-zinc-700 rounded p-2 text-xs"
                >
                  {models.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              ) : (
                <input
                  value={form.ollamaModel}
                  onChange={(e) => setForm({ ...form, ollamaModel: e.target.value })}
                  placeholder="qwen2.5-coder"
                  className="input-custom"
                />
              )}
            </Field>
          </Section>

          {/* ============ SUPABASE ============ */}
          <Section icon={Database} title="Supabase (auth + saved builds)" desc="From your Supabase project → Settings → API">
            <Field label="Project URL" icon={Globe}>
              <input
                value={form.supabaseUrl}
                onChange={(e) => setForm({ ...form, supabaseUrl: e.target.value })}
                placeholder="https://YOUR-PROJECT.supabase.co"
                className="input-custom"
              />
            </Field>
            <Field label="Anon (public) key" icon={KeyRound}>
              <input
                type="password"
                value={form.supabaseAnonKey}
                onChange={(e) => setForm({ ...form, supabaseAnonKey: e.target.value })}
                placeholder="eyJ…"
                className="input-custom"
              />
            </Field>
            <div className="mt-2 text-[11px] text-zinc-500">
              Paste both values from <code className="text-amber-500">Supabase → Settings → API</code>. They never leave your browser.
            </div>
          </Section>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between border-t border-zinc-800/80 pt-4">
            <div className="text-[10px] text-zinc-500">Saved to browser localStorage. Page reloads on save.</div>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:bg-zinc-800 cursor-pointer">Cancel</button>
              <button onClick={save}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold text-black bg-amber-500 hover:bg-amber-400 transition-colors shadow-lg cursor-pointer">
                <Save className="w-3.5 h-3.5" /> Save & Reload
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .input-custom {
          flex: 1;
          background: #18181b;
          border: 1px solid #3f3f46;
          border-radius: 6px;
          padding: 8px 12px;
          color: #e4e4e7;
          font-size: 12px;
          outline: none;
          width: 100%;
        }
        .input-custom:focus { border-color: #f59e0b; }
      `}</style>
    </div>
  );
}

function Section({ icon: Icon, title, desc, children }: { icon: any; title: string; desc: string; children: React.ReactNode; }) {
  return (
    <div className="mb-5 p-4 rounded-xl bg-zinc-900 border border-zinc-850">
      <div className="flex items-start gap-2 mb-3">
        <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 grid place-items-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <div>
          <div className="text-sm font-semibold text-zinc-100">{title}</div>
          <div className="text-[11px] text-zinc-500">{desc}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode; }) {
  return (
    <div className="mt-3">
      <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5 block flex items-center gap-1.5">
        <Icon className="w-3 h-3 text-amber-500" />
        {label}
      </label>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}
