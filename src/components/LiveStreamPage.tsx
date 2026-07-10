import React, { useState, useEffect } from 'react';
import {
  Radio, Users, Eye, Sliders, ShieldAlert, Heart, Activity, BarChart2,
  PlayCircle, RefreshCw, Send, Trash2, Shield, Ban, Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface LiveStreamPageProps {
  accentColor: string;
}

export const LiveStreamPage: React.FC<LiveStreamPageProps> = ({ accentColor }) => {
  const [viewersCount, setViewersCount] = useState(1542);
  const [streamHealth, setStreamHealth] = useState('Excellent');
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(24500);

  const [activeScene, setActiveScene] = useState('Camera 1 (Main)');
  const [isLive, setIsLive] = useState(true);

  // Chat stream
  const [chatLog, setChatLog] = useState<{ id: string; user: string; text: string; role?: 'moderator' | 'admin' }[]>([
    { id: '1', user: 'CryptoPro', text: 'Staking pool yields look amazing today!' },
    { id: '2', user: 'SamCode', text: 'Can we switch to the terminal scene?' },
    { id: '3', user: 'AliceWeb', text: 'Lofi background beats are so clean' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Graph logs
  const [viewerGraph, setViewerGraph] = useState([
    { time: '12:00', viewers: 1200 },
    { time: '12:05', viewers: 1350 },
    { time: '12:10', viewers: 1420 },
    { time: '12:15', viewers: 1542 },
  ]);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      // Simulate real-time viewer fluctuations
      const change = Math.floor(Math.random() * 50) - 20;
      setViewersCount((prev) => Math.max(100, prev + change));

      // Append real-time viewer coordinates
      setViewerGraph((prev) => [
        ...prev.slice(-5),
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), viewers: viewersCount }
      ]);

      // Add comments
      const randomUsers = ['MatrixBoy', 'SatoshiQueen', 'StakingPro', 'VibeSeeker', 'DevCopilot'];
      const randomTexts = [
        'How do I top up my coin package?',
        'Staking 500 PPL right now',
        'Next-gen platform! Loving this',
        'Is the affiliate dashboard down or live?',
        'Can we tip custom gifts?'
      ];
      setChatLog((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          user: randomUsers[Math.floor(Math.random() * randomUsers.length)],
          text: randomTexts[Math.floor(Math.random() * randomTexts.length)],
        }
      ].slice(-15)); // keep last 15
    }, 4000);

    return () => clearInterval(interval);
  }, [isLive, viewersCount]);

  const handlePostChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatLog((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        user: 'You (Streamer)',
        text: chatInput,
        role: 'admin',
      }
    ]);
    setChatInput('');
  };

  const handleModeration = (user: string, action: 'warn' | 'mute' | 'ban') => {
    alert(`Moderator action applied: ${action.toUpperCase()} ${user}`);
    setChatLog((prev) => prev.filter((c) => c.user !== user));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#030303] px-4 md:px-6 py-4 space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
        <div>
          <h2 className="text-xs font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
            <Radio className="h-4 w-4 text-red-500 animate-pulse" />
            LIVE STREAMER CONTROL DASHBOARD
          </h2>
          <p className="text-[10px] text-zinc-500 mt-0.5">Stream live feeds, moderate channels, and review real-time yield graphs</p>
        </div>
        <button
          onClick={() => setIsLive(!isLive)}
          className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase transition-all cursor-pointer ${
            isLive ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isLive ? '🔴 Go Offline' : '🟢 Start Live Stream'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stream video feed simulation and Scene switchers */}
        <div className="lg:col-span-2 space-y-5">
          {/* Simulated Scene Canvas */}
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-900 bg-black flex items-center justify-center">
            {isLive ? (
              <video
                src="https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-computer-hacker-screen-40019-large.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover scale-102"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-500">
                <PlayCircle className="h-12 w-12" />
                <span className="text-xs font-bold uppercase tracking-widest">Feed Offline</span>
              </div>
            )}

            {/* Live Indicator overlay overlays */}
            {isLive && (
              <div className="absolute top-4 left-4 flex gap-1.5">
                <span className="bg-red-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-white flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  LIVE
                </span>
                <span className="bg-black/40 backdrop-blur px-2 py-0.5 rounded text-[8px] font-mono text-zinc-300 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {viewersCount.toLocaleString()} VIEWERS
                </span>
              </div>
            )}

            <div className="absolute bottom-4 left-4 bg-black/65 backdrop-blur px-3 py-1 rounded-xl text-[10px] font-bold text-white border border-zinc-800">
              Active Camera: {activeScene}
            </div>
          </div>

          {/* Scenes selections list */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Stream Scene Switcher</h3>
            <div className="grid grid-cols-3 gap-3">
              {['Camera 1 (Main)', 'Coding Workspace', 'Synthesizer Overlay'].map((scene) => (
                <button
                  key={scene}
                  onClick={() => setActiveScene(scene)}
                  className={`p-3 bg-zinc-950 border rounded-xl text-[11px] font-bold text-left transition-all cursor-pointer ${
                    activeScene === scene ? 'border-zinc-700 text-white' : 'border-zinc-900/60 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {scene}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time viewer graph & moderator chat logs */}
        <div className="space-y-5">
          {/* Real-time Graph stats */}
          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-purple-400" />
                VIEWER CONCURRENT GROWTH
              </h3>
              <span className="text-[8px] font-mono bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded text-zinc-400">7d Peak</span>
            </div>

            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={viewerGraph}>
                  <defs>
                    <linearGradient id="liveColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Area type="monotone" dataKey="viewers" stroke={accentColor} strokeWidth={2} fillOpacity={1} fill="url(#liveColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 bg-black rounded-xl border border-zinc-900/40">
                <span className="text-[8px] text-zinc-500 font-bold uppercase">Node Health</span>
                <p className="text-xs font-black text-emerald-400 mt-1">{streamHealth}</p>
              </div>
              <div className="p-2.5 bg-black rounded-xl border border-zinc-900/40">
                <span className="text-[8px] text-zinc-500 font-bold uppercase">Tipped yield</span>
                <p className="text-xs font-black text-amber-500 mt-1">{totalCoinsEarned.toLocaleString()} PPL</p>
              </div>
            </div>
          </div>

          {/* Moderate comments lists */}
          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col h-[280px]">
            <h3 className="text-[10px] font-black tracking-widest text-zinc-500 uppercase pb-2 border-b border-zinc-900 flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-purple-400" />
              CHAT MODERATION CONSOLE
            </h3>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto py-2 space-y-2.5">
              {chatLog.map((chat) => (
                <div key={chat.id} className="flex justify-between items-start gap-2 text-[10px] leading-tight hover:bg-zinc-900/30 p-1 rounded transition-colors group">
                  <div className="min-w-0">
                    <span className="font-extrabold text-zinc-400 mr-1.5">{chat.user}:</span>
                    <span className="text-zinc-300">{chat.text}</span>
                  </div>
                  {chat.user !== 'You (Streamer)' && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleModeration(chat.user, 'warn')}
                        className="p-0.5 hover:bg-zinc-850 rounded text-amber-500"
                        title="Warn user"
                      >
                        <Shield className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleModeration(chat.user, 'ban')}
                        className="p-0.5 hover:bg-zinc-850 rounded text-red-500"
                        title="Ban user"
                      >
                        <Ban className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Post stream announcement */}
            <form onSubmit={handlePostChat} className="pt-2 border-t border-zinc-900 flex gap-2">
              <input
                type="text"
                placeholder="Announce to stream..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-black border border-zinc-900 rounded-full px-3 py-1.5 text-[10px] focus:outline-none focus:border-zinc-800 text-white"
              />
              <button type="submit" className="p-1.5 bg-[#101014] rounded-full border border-zinc-800 hover:text-white">
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
