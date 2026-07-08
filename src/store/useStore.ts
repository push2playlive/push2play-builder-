import { create } from 'zustand';
import { TEMPLATES } from '../lib/templates';
import type { ViewMode, Build, ChatMessage, StudioFile } from '../types';
import { supabase, supabaseEnabled } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export interface StudioState {
  // Editor
  code: string;
  setCode: (v: string) => void;
  projectName: string;
  setProjectName: (v: string) => void;
  activeTemplate: string;
  loadTemplate: (key: string) => void;

  // Files
  files: StudioFile[];
  addFile: (name: string) => void;
  removeFile: (name: string) => void;
  setActiveFile: (name: string) => void;

  // Chat
  messages: ChatMessage[];
  appendMessage: (m: ChatMessage) => void;
  updateLastAssistant: (content: string) => void;
  clearMessages: () => void;

  // View & UI State
  view: ViewMode;
  setView: (v: ViewMode) => void;
  exploreOpen: boolean;
  toggleExplore: () => void;
  activePreviewTab: 'preview' | 'code';
  setActivePreviewTab: (v: 'preview' | 'code') => void;
  previewDevice: 'desktop' | 'mobile';
  setPreviewDevice: (v: 'desktop' | 'mobile') => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  isCompiling: boolean;
  setIsCompiling: (v: boolean) => void;
  actionHistory: string[];
  setActionHistory: (v: string[] | ((prev: string[]) => string[])) => void;
  latestStatus: string;
  setLatestStatus: (v: string) => void;

  // Auth
  user: User | null;
  session: Session | null;
  setSession: (session: Session | null) => void;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;

  // Builds
  builds: Build[];
  publicBuilds: Build[];
  loading: boolean;
  saveBuild: (isPublic: boolean) => Promise<void>;
  loadBuilds: () => Promise<void>;
  loadPublicBuilds: () => Promise<void>;
  openBuild: (b: Build) => void;
}

export const useStore = create<StudioState>((set, get) => ({
  // Editor state
  code: TEMPLATES['pushplay-live'].code,
  setCode: (code) => set({ code }),
  projectName: 'My Studio App',
  setProjectName: (projectName) => set({ projectName }),
  activeTemplate: 'pushplay-live',
  loadTemplate: (key) => {
    const t = TEMPLATES[key];
    if (t) {
      set({
        activeTemplate: key,
        code: t.code,
        files: t.files.map(f => ({ name: f.name, active: f.name === 'src/data.ts' }))
      });
    }
  },

  // Files state
  files: [
    { name: 'metadata.json' },
    { name: 'src/data.ts', active: true },
    { name: 'src/components/Navigation.tsx' }
  ],
  addFile: (name) => set((state) => ({ files: [...state.files, { name }] })),
  removeFile: (name) => set((state) => ({ files: state.files.filter(f => f.name !== name) })),
  setActiveFile: (name) => set((state) => ({
    files: state.files.map(f => ({ ...f, active: f.name === name }))
  })),

  // Chat state
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your local Ollama coding assistant. Ask me to generate some code for PushPlay Live!',
      ts: Date.now(),
    },
  ],
  appendMessage: (m) => set((state) => ({ messages: [...state.messages, m] })),
  updateLastAssistant: (content) => set((state) => {
    const copy = [...state.messages];
    if (copy.length === 0) return { messages: copy };
    const lastIdx = copy.length - 1;
    if (copy[lastIdx].role === 'assistant') {
      copy[lastIdx] = { ...copy[lastIdx], content };
    }
    return { messages: copy };
  }),
  clearMessages: () => set({ messages: [] }),

  // View & UI State
  view: 'split',
  setView: (view) => set({ view }),
  exploreOpen: false,
  toggleExplore: () => set((state) => ({ exploreOpen: !state.exploreOpen })),
  activePreviewTab: 'preview',
  setActivePreviewTab: (activePreviewTab) => set({ activePreviewTab }),
  previewDevice: 'desktop',
  setPreviewDevice: (previewDevice) => set({ previewDevice }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  isCompiling: false,
  setIsCompiling: (isCompiling) => set({ isCompiling }),
  actionHistory: ['Initialized PushPlay Studio workspace', 'Compiled successfully'],
  setActionHistory: (val) => set((state) => ({
    actionHistory: typeof val === 'function' ? val(state.actionHistory) : val
  })),
  latestStatus: 'Build Successful. Ready for preview.',
  setLatestStatus: (latestStatus) => set({ latestStatus }),

  // Auth State
  user: null,
  session: null,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  signInWithGitHub: async () => {
    if (!supabaseEnabled) {
      alert('Supabase is not configured yet. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.');
      return;
    }
    await supabase.auth.signInWithOAuth({ provider: 'github' });
  },
  signOut: async () => {
    if (supabaseEnabled) {
      await supabase.auth.signOut();
    }
    set({ session: null, user: null });
  },

  // Builds state
  builds: [],
  publicBuilds: [],
  loading: false,
  saveBuild: async (isPublic) => {
    const { projectName, code, user } = get();
    const newBuild: Build = {
      id: crypto.randomUUID(),
      projectName,
      code,
      files: [],
      created_at: new Date().toISOString(),
      is_public: isPublic,
      user_id: user?.id
    };

    if (supabaseEnabled && user) {
      set({ loading: true });
      try {
        const { error } = await supabase.from('builds').insert(newBuild);
        if (error) throw error;
        set((state) => ({ builds: [newBuild, ...state.builds] }));
      } catch (err) {
        console.error('Failed to save build to cloud', err);
        alert('Failed to save build to cloud. Saving locally instead.');
        const local = JSON.parse(localStorage.getItem('pp_studio_builds') || '[]');
        localStorage.setItem('pp_studio_builds', JSON.stringify([newBuild, ...local]));
      } finally {
        set({ loading: false });
      }
    } else {
      const local = JSON.parse(localStorage.getItem('pp_studio_builds') || '[]');
      localStorage.setItem('pp_studio_builds', JSON.stringify([newBuild, ...local]));
      set((state) => ({ builds: [newBuild, ...state.builds] }));
    }
  },
  loadBuilds: async () => {
    const { user } = get();
    if (supabaseEnabled && user) {
      set({ loading: true });
      try {
        const { data, error } = await supabase
          .from('builds')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        set({ builds: data || [] });
      } catch (err) {
        console.error('Failed to load builds from cloud', err);
      } finally {
        set({ loading: false });
      }
    } else {
      const local = JSON.parse(localStorage.getItem('pp_studio_builds') || '[]');
      set({ builds: local });
    }
  },
  loadPublicBuilds: async () => {
    if (supabaseEnabled) {
      set({ loading: true });
      try {
        const { data, error } = await supabase
          .from('builds')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        set({ publicBuilds: data || [] });
      } catch (err) {
        console.error('Failed to load public builds', err);
      } finally {
        set({ loading: false });
      }
    }
  },
  openBuild: (b) => {
    set({
      projectName: b.projectName,
      code: b.code
    });
  }
}));
