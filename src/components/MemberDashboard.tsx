import React, { useState } from 'react';
import {
  Sliders, User, Wallet, BarChart2, Video, Plus, Settings, Share2, Award,
  Users, Layers, ArrowUpRight, TrendingUp, CheckCircle, Clock, Trash2, Edit2, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface MemberDashboardProps {
  accentColor: string;
  tokenCount: number;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({ accentColor, tokenCount }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'affiliate'>('overview');
  const [earningsChart, setEarningsChart] = useState([
    { day: 'Mon', revenue: 120 },
    { day: 'Tue', revenue: 190 },
    { day: 'Wed', revenue: 170 },
    { day: 'Thu', revenue: 240 },
    { day: 'Fri', revenue: 310 },
    { day: 'Sat', revenue: 280 },
    { day: 'Sun', revenue: 420 },
  ]);

  const [uploadedVideos, setUploadedVideos] = useState<{ id: string; title: string; views: number; watchTime: string; status: 'Live' | 'Processing' }[]>([
    { id: '1', title: 'Deep Cyberpunk Synthesizers Node Staking Tutorial', views: 2450, watchTime: '450h', status: 'Live' },
    { id: '2', title: 'Why Web3 Video is Outdating Web2 Giants - Utube Prime Launch', views: 8430, watchTime: '1200h', status: 'Live' },
    { id: '3', title: 'Staking Node Installation and Yield Optimisation Guide', views: 400, watchTime: '20h', status: 'Processing' },
  ]);

  const [videoTitleInput, setVideoTitleInput] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Affiliate structure: 5-tier data
  const affiliateTiers = [
    { tier: 1, count: 5, earnings: 1540, commission: '10%' },
    { tier: 2, count: 12, earnings: 840, commission: '5%' },
    { tier: 3, count: 24, earnings: 420, commission: '3%' },
    { tier: 4, count: 48, earnings: 210, commission: '1%' },
    { tier: 5, count: 96, earnings: 90, commission: '0.5%' },
  ];

  const handleUploadVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitleInput.trim()) return;
    setUploadedVideos((prev) => [
      {
        id: Math.random().toString(),
        title: videoTitleInput,
        views: 0,
        watchTime: '0h',
        status: 'Processing',
      },
      ...prev,
    ]);
    setVideoTitleInput('');
    setShowUploadModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#030303] px-4 md:px-6 py-4 space-y-6">
      {/* Personalized Welcome Banner */}
      <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest bg-[#101014] px-2 py-0.5 rounded border border-zinc-900">Dashboard Control Centre</span>
          <h2 className="text-sm sm:text-base font-black text-white leading-tight uppercase tracking-wider">
            WELCOME BACK, COSMIC CREATOR
          </h2>
          <p className="text-[10px] text-zinc-500">Track nodes, upload video streams, and monitor 5-tier affiliate yields.</p>
        </div>

        {/* Tab selection */}
        <div className="flex bg-[#0a0a0c] border border-zinc-900 p-1 rounded-2xl gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart2 },
            { id: 'videos', label: 'My Videos', icon: Video },
            { id: 'affiliate', label: '5-Tier Network', icon: Award },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === tab.id ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-white'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" style={{ color: activeTab === tab.id ? accentColor : undefined }} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top row overview statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-zinc-950 border border-zinc-900/60 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[8px] font-black uppercase text-zinc-500">Staking Pool Assets</span>
                <p className="text-base font-black text-white font-mono">{tokenCount.toLocaleString()} PPL</p>
              </div>
              <Wallet className="h-8 w-8 text-amber-500 opacity-80" />
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-900/60 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[8px] font-black uppercase text-zinc-500">Total Network Revenue</span>
                <p className="text-base font-black text-emerald-400 font-mono">3,100 PPL</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500 opacity-80" />
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-900/60 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[8px] font-black uppercase text-zinc-500">Network Nodes Referred</span>
                <p className="text-base font-black text-purple-400 font-mono">185 Active</p>
              </div>
              <Users className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </div>

          {/* Earnings Chart analysis card */}
          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-900/60">
              <h3 className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">WEEKLY NODE REVENUE LOGS</h3>
              <span className="text-[8px] text-zinc-400 uppercase font-black bg-zinc-900 px-2 py-0.5 rounded">Sync active</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsChart}>
                  <defs>
                    <linearGradient id="revenueColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#52525b" fontSize={10} fontStyle="bold" />
                  <YAxis hide />
                  <Area type="monotone" dataKey="revenue" stroke={accentColor} strokeWidth={2.5} fillOpacity={1} fill="url(#revenueColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Header videos row */}
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black tracking-widest text-zinc-500 uppercase">UPLOADED CONTENT</h3>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-1.5 bg-white text-black hover:bg-zinc-200 text-[10px] font-black uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Upload Video</span>
            </button>
          </div>

          {/* Uploaded videos list */}
          <div className="space-y-2">
            {uploadedVideos.map((vid) => (
              <div key={vid.id} className="p-3.5 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-7 rounded bg-zinc-900 flex items-center justify-center border border-zinc-850">
                    <Video className="h-4 w-4 text-zinc-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate max-w-[350px]">{vid.title}</h4>
                    <p className="text-[9px] text-zinc-500 font-semibold uppercase mt-0.5">Status: {vid.status}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <span className="text-[8px] text-zinc-500 uppercase font-black">Views</span>
                    <p className="text-xs font-black text-white font-mono">{vid.views.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[8px] text-zinc-500 uppercase font-black">Watchtime</span>
                    <p className="text-xs font-black text-white font-mono">{vid.watchTime}</p>
                  </div>
                  <button
                    onClick={() => setUploadedVideos(uploadedVideos.filter((v) => v.id !== vid.id))}
                    className="p-1 hover:bg-zinc-900 text-zinc-600 hover:text-red-500 rounded"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'affiliate' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Affiliate Summary Banner */}
          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-black text-white uppercase tracking-wider">5-Tier Network Referral Tree</h3>
              <p className="text-[10px] text-zinc-500">Every referral unlocks downstream yield distribution automatically.</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center p-2.5 bg-[#0e0e11] border border-zinc-900 rounded-xl">
                <span className="text-[8px] text-zinc-500 uppercase font-bold">Tree Members</span>
                <p className="text-xs font-black text-white">185 total</p>
              </div>
              <div className="text-center p-2.5 bg-[#0e0e11] border border-zinc-900 rounded-xl">
                <span className="text-[8px] text-zinc-500 uppercase font-bold">Unclaimed Commission</span>
                <p className="text-xs font-black text-amber-500">3,100 PPL</p>
              </div>
            </div>
          </div>

          {/* Render interactive SVG/Custom visual Tree hierarchy */}
          <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
            {/* Visual connecting wires backdrop */}
            <div className="absolute inset-y-0 w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-amber-500 opacity-20 -z-10" />

            {/* Main Node (You) */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-black border-2 border-purple-500 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-purple-500/25">
                YOU
              </div>
              <span className="text-[8px] text-zinc-500 font-bold uppercase mt-1">Node Creator</span>
            </div>

            {/* Connecting visual tree elements */}
            <div className="grid grid-cols-5 gap-3.5 w-full max-w-lg">
              {affiliateTiers.map((tier) => (
                <div key={tier.tier} className="relative z-10 flex flex-col items-center bg-[#09090b] border border-zinc-900 rounded-2xl p-3 text-center space-y-1 hover:border-zinc-800 transition-all">
                  <span className="text-[8px] font-black text-purple-400 bg-purple-950/20 px-1.5 py-0.5 rounded border border-purple-900/20 uppercase">Tier {tier.tier}</span>
                  <span className="text-xs font-black text-white font-mono">{tier.count} members</span>
                  <p className="text-[8px] text-emerald-400 font-bold">+{tier.commission} cuts</p>
                  <p className="text-[9px] text-zinc-500 font-semibold">{tier.earnings} PPL earn</p>
                </div>
              ))}
            </div>

            <div className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">
              Automated smart contract payouts sync with UTC blockchain clock logs
            </div>
          </div>
        </div>
      )}

      {/* DRAG & DROP SIMULATED UPLOAD MODAL BOX */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowUploadModal(false)} />

            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative w-full max-w-sm bg-[#0d0d0f] border border-zinc-800 rounded-2xl p-5 space-y-4 z-50 text-left"
            >
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <h3 className="font-extrabold text-xs text-white uppercase tracking-widest">UPLOAD VIDEO TRACK</h3>
                <button onClick={() => setShowUploadModal(false)} className="text-zinc-500 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleUploadVideo} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-zinc-500">Video Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter cinematic video stream title..."
                    value={videoTitleInput}
                    onChange={(e) => setVideoTitleInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-800"
                  />
                </div>

                {/* Simulated file uploader drag drop field */}
                <div
                  onClick={() => alert('File explorer triggered. File parsing initiated.')}
                  className="border border-dashed border-zinc-800 rounded-2xl p-6 text-center cursor-pointer hover:border-zinc-700 transition-colors"
                >
                  <UploadCloudIcon className="h-8 w-8 text-zinc-600 mx-auto animate-bounce mb-2" />
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Drag and drop file here</p>
                  <span className="text-[8px] text-zinc-600 font-semibold">Supports MP4, MOV, or WEBM format</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-white text-black font-extrabold text-[10px] uppercase rounded-xl hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  Confirm Upload Stream
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Simple helper icon
const UploadCloudIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);
