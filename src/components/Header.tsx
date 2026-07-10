import React, { useState, useEffect } from 'react';
import { Search, Plus, Bell, ArrowDownToLine, Menu, Mic, X, Sparkles, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Video } from '../types';

interface HeaderProps {
  appConfig: {
    name: string;
    accentColor: string;
    tokenCount: number;
    darkMode: boolean;
  };
  onToggleDarkMode: () => void;
  onSelectTab: (tab: string) => void;
  onSearch: (query: string) => void;
  onOpenUpload: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  videos: Video[];
  onSelectVideo: (video: Video) => void;
}

export const Header: React.FC<HeaderProps> = ({
  appConfig,
  onToggleDarkMode,
  onSelectTab,
  onSearch,
  onOpenUpload,
  onOpenNotifications,
  onOpenProfile,
  videos,
  onSelectVideo,
}) => {
  const [searchVal, setSearchVal] = useState('');
  const [showAiSuggest, setShowAiSuggest] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [pwaPromptVisible, setPwaPromptVisible] = useState(true);

  useEffect(() => {
    if (!searchVal.trim()) {
      setAiSuggestions([]);
      return;
    }
    const filtered = videos
      .filter((v) => v.title.toLowerCase().includes(searchVal.toLowerCase()))
      .map((v) => v.title)
      .slice(0, 4);

    const extraAiOptions = [
      `Stake PPL on ${searchVal}`,
      `Best 4K ${searchVal} loops`,
      `Affiliate rewards for ${searchVal}`,
      `Trending ${searchVal} live chats`,
    ];

    setAiSuggestions([...filtered, ...extraAiOptions].slice(0, 5));
  }, [searchVal, videos]);

  const handleVoiceSearch = () => {
    setIsListening(true);
    setTimeout(() => {
      setSearchVal('Lofi Study Session');
      setIsListening(false);
      onSearch('Lofi Study Session');
    }, 1500);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#030303]/90 backdrop-blur-md border-b border-zinc-900 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 md:hidden">
          <Menu className="h-5 w-5" />
        </button>

        <div
          onClick={() => {
            onSelectTab('home');
            onSearch('');
            setSearchVal('');
          }}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-black text-sm select-none shadow-lg shadow-purple-500/10"
            style={{ background: `linear-gradient(135deg, ${appConfig.accentColor}, #ffffff)` }}
          >
            U
          </motion.div>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-[14px] tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Utube<span style={{ color: appConfig.accentColor }}>Media</span>
            </span>
            <span className="text-[7px] text-zinc-500 uppercase tracking-widest font-black mt-0.5">
              Future of Cinema
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 max-w-md mx-4 hidden sm:block">
        <div className="flex items-center bg-[#0d0d0f] border border-zinc-800 rounded-full px-3 py-1 text-xs focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700 transition-all">
          <Search className="h-4 w-4 text-zinc-500 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="AI Smart Search... (e.g. Neon, Lofi, Live)"
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              onSearch(e.target.value);
            }}
            onFocus={() => setShowAiSuggest(true)}
            onBlur={() => setTimeout(() => setShowAiSuggest(false), 200)}
            className="w-full bg-transparent border-none text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-0"
          />
          {searchVal && (
            <button
              onClick={() => {
                setSearchVal('');
                onSearch('');
              }}
              className="p-0.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white mr-1"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={handleVoiceSearch}
            className={`p-1 rounded-full hover:bg-zinc-800 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-zinc-400 hover:text-white'}`}
          >
            <Mic className="h-3.5 w-3.5" />
          </button>
        </div>

        <AnimatePresence>
          {showAiSuggest && aiSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-full left-0 right-0 mt-1 bg-[#0d0d0f] border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl"
            >
              <div className="flex items-center gap-1 px-2.5 py-1 text-[8px] text-amber-400 uppercase tracking-widest font-black border-b border-zinc-900/60 pb-1 mb-1">
                <Sparkles className="h-3 w-3 animate-pulse" style={{ color: appConfig.accentColor }} />
                Gemini Copilot Recommendations
              </div>
              <div className="space-y-0.5">
                {aiSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onMouseDown={() => {
                      setSearchVal(suggestion);
                      onSearch(suggestion);
                      const found = videos.find((v) => v.title === suggestion);
                      if (found) onSelectVideo(found);
                    }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-zinc-900 rounded-lg text-[10px] text-zinc-300 hover:text-white font-medium transition-colors flex items-center justify-between"
                  >
                    <span className="truncate">{suggestion}</span>
                    <span className="text-[7px] text-zinc-600 font-mono">Quick Search</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {pwaPromptVisible && (
          <button
            onClick={() => {
              alert('Utube Media PWA Installation Initiated!\n\n1. For Mobile: Tap share and select "Add to Home Screen".\n2. For Desktop: Click the install icon in your browser address bar.');
              setPwaPromptVisible(false);
            }}
            className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-[10px] font-semibold text-zinc-200 transition-all cursor-pointer"
          >
            <ArrowDownToLine className="h-3 w-3" style={{ color: appConfig.accentColor }} />
            <span>Install PWA</span>
          </button>
        )}

        <button
          onClick={onOpenUpload}
          className="relative group p-1.5 rounded-full border border-zinc-800 bg-[#0d0d0f] hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer shadow-md"
        >
          <Plus className="h-3.5 w-3.5 text-zinc-300 group-hover:text-white" />
        </button>

        <div className="flex items-center gap-1 px-2 py-0.5 bg-[#101014] border border-zinc-800/80 rounded-full shadow-inner">
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: appConfig.accentColor }} />
          <span className="text-[9px] font-extrabold text-zinc-300 font-mono">
            {appConfig.tokenCount.toLocaleString()} <span className="text-zinc-500">PPL</span>
          </span>
        </div>

        <button
          onClick={onOpenNotifications}
          className="relative p-1.5 rounded-full border border-zinc-800 bg-[#0d0d0f] hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-md"
        >
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute top-1 right-1 h-1 w-1 rounded-full bg-red-500"></span>
        </button>

        <button
          onClick={onToggleDarkMode}
          className="p-1.5 rounded-full border border-zinc-800 bg-[#0d0d0f] hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
        >
          {appConfig.darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        <div className="h-5 w-px bg-zinc-800 hidden sm:block"></div>

        <div onClick={onOpenProfile} className="relative cursor-pointer group">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Creator avatar"
            className="w-6.5 h-6.5 rounded-full border border-transparent transition-all group-hover:scale-105 object-cover"
            style={{ borderColor: appConfig.accentColor }}
          />
          <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-green-500 border border-black"></span>
        </div>
      </div>
    </header>
  );
};
