import React, { useState, useEffect, useRef } from 'react';
import {
  Heart, MessageSquare, Share2, Music, Flame, Users, Sparkles, Gift, Play, Pause,
  ChevronUp, ChevronDown, CheckCircle2, Award, Volume2, VolumeX, X, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift as GiftType } from '../types';
import { INITIAL_GIFTS } from '../mockData';

interface ShortsPageProps {
  accentColor: string;
  tokenCount: number;
  onGiftSent: (gift: GiftType, count: number) => void;
}

const SHORTS_DATA = [
  {
    id: 's1',
    creator: 'Retro Future',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    description: 'Cruising through the cyber neon database grid. Infinite scaling! #neon #cyberpunk #aesthetic #lofi',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-neon-retro-futuristic-scifi-landscape-34241-large.mp4',
    likes: 85200,
    commentsCount: 3420,
    audioTrack: 'Neon Grid Symphony - Original Mix',
  },
  {
    id: 's2',
    creator: 'Aether Zen',
    avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
    description: 'Listen to the forest whisper. Deep breathing, clearing mind clutter. #zen #relax #ambient #meditation',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    likes: 124300,
    commentsCount: 9400,
    audioTrack: 'Quiet Whispers of Nature',
  },
  {
    id: 's3',
    creator: 'Hacker Cyber',
    avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
    description: 'Cracking security modules in real-time. Do not copy this at home! #hacker #terminal #matrix #coding',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-computer-hacker-screen-40019-large.mp4',
    likes: 49500,
    commentsCount: 1280,
    audioTrack: 'Coded Matrix Overdrive',
  }
];

export const ShortsPage: React.FC<ShortsPageProps> = ({ accentColor, tokenCount, onGiftSent }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('trending'); // explore, following, trending
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [showCommentDrawer, setShowCommentDrawer] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);

  const [comments, setComments] = useState<{ id: string; author: string; text: string; likes: number }[]>([
    { id: '1', author: 'CyberSnoop', text: 'This visual speed is perfect for double-speed focus!', likes: 450 },
    { id: '2', author: 'LofiCater', text: 'Where can I find the full 4K audio compilation?', likes: 120 },
    { id: '3', author: 'PPL_Staker', text: 'Already staked 1000 tokens on this node. Loving the yields!', likes: 98 },
  ]);
  const [commentInput, setCommentInput] = useState('');
  const [likedShorts, setLikedShorts] = useState<Record<string, boolean>>({});
  const [heartsExplosion, setHeartsExplosion] = useState<{ id: string; x: number; y: number }[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);

  const activeShort = SHORTS_DATA[activeIndex];

  // Sync video speed/play state
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
      videoRef.current.playbackRate = isSlowMo ? 0.5 : 1;
    }
  }, [isPlaying, activeIndex, isSlowMo]);

  // Handle arrow key scroll snaps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showCommentDrawer || showGiftModal) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, isPlaying, showCommentDrawer, showGiftModal]);

  const handleNext = () => {
    if (activeIndex < SHORTS_DATA.length - 1) {
      setActiveIndex(activeIndex + 1);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
      setIsPlaying(true);
    }
  };

  // Double tap heart explosion effect
  const handleVideoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.detail === 2) {
      // Like short
      setLikedShorts((prev) => ({ ...prev, [activeShort.id]: true }));
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const heartId = Math.random().toString();
      setHeartsExplosion((prev) => [...prev, { id: heartId, x: clickX, y: clickY }]);
      setTimeout(() => {
        setHeartsExplosion((prev) => prev.filter((h) => h.id !== heartId));
      }, 1000);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSendGift = (gift: GiftType) => {
    if (tokenCount < gift.cost) {
      alert('Insufficient PPL coin balance! Please ear More in the Store.');
      return;
    }
    onGiftSent(gift, 1);
    setShowGiftModal(false);
    alert(`Successfully sent ${gift.icon} gift to ${activeShort.creator}!`);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setComments((prev) => [
      {
        id: Math.random().toString(),
        author: 'You',
        text: commentInput,
        likes: 0,
      },
      ...prev,
    ]);
    setCommentInput('');
  };

  return (
    <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden select-none">
      {/* Horizontal Category Navigation Tab */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-zinc-900/60">
        {[
          { id: 'explore', label: 'Explore', icon: Sparkles },
          { id: 'following', label: 'Following', icon: Users },
          { id: 'trending', label: 'Trending', icon: Flame },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" style={{ color: activeTab === tab.id ? accentColor : undefined }} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Vertical Navigation Indicator click buttons */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-40">
        <button
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className="p-1.5 bg-[#0f0f11]/80 hover:bg-zinc-900 border border-zinc-850 rounded-full text-zinc-400 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          onClick={handleNext}
          disabled={activeIndex === SHORTS_DATA.length - 1}
          className="p-1.5 bg-[#0f0f11]/80 hover:bg-zinc-900 border border-zinc-850 rounded-full text-zinc-400 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Main vertical phone simulator aspect frame container */}
      <div className="relative w-full max-w-[340px] h-[92vh] max-h-[640px] rounded-3xl overflow-hidden border border-zinc-900 bg-black shadow-2xl flex flex-col justify-end">
        {/* HTML5 video element */}
        <div
          onClick={handleVideoClick}
          onMouseDown={() => setIsSlowMo(true)}
          onMouseUp={() => setIsSlowMo(false)}
          className="absolute inset-0 bg-black cursor-pointer overflow-hidden"
        >
          <video
            ref={videoRef}
            src={activeShort.videoUrl}
            autoPlay
            loop
            muted={isMuted}
            className="w-full h-full object-cover"
            playsInline
          />

          {/* Tap Play/Pause Indicator overlay overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 z-10">
              <Play className="h-10 w-10 text-white opacity-80" />
            </div>
          )}

          {/* Slow Motion Hold feedback indicator overlay */}
          {isSlowMo && (
            <div className="absolute top-16 left-4 bg-purple-500/80 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider animate-pulse">
              Slow Motion Active (0.5x)
            </div>
          )}

          {/* Double tap heart explosions */}
          <AnimatePresence>
            {heartsExplosion.map((h) => (
              <motion.div
                key={h.id}
                initial={{ scale: 0.1, opacity: 1, rotate: Math.random() * 30 - 15 }}
                animate={{ scale: [1, 1.4, 0], opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute text-pink-500 text-6xl pointer-events-none filter drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]"
                style={{ left: h.x - 30, top: h.y - 30 }}
              >
                ❤️
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Top micro progress line bar indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-900 z-30">
          <motion.div
            key={activeIndex}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="h-full"
            style={{ backgroundColor: accentColor }}
          />
        </div>

        {/* Sound button overlay top right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted(!isMuted);
          }}
          className="absolute top-4 right-4 z-40 p-2 bg-black/40 backdrop-blur-sm rounded-full text-white cursor-pointer hover:bg-black/60 transition-colors"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        {/* Right Action floating rail bar */}
        <div className="absolute right-3.5 bottom-16 flex flex-col items-center gap-4 z-35">
          {/* Channel Follow avatar */}
          <div className="relative group cursor-pointer">
            <img
              src={activeShort.avatar}
              alt="creator"
              className="w-10 h-10 rounded-full border-2 border-zinc-900 object-cover"
              style={{ borderColor: accentColor }}
            />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-white font-black text-[9px] px-1 rounded-full">+</span>
          </div>

          {/* Likes */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLikedShorts((prev) => ({ ...prev, [activeShort.id]: !likedShorts[activeShort.id] }));
            }}
            className="flex flex-col items-center gap-1 cursor-pointer group"
          >
            <div className="p-2.5 bg-black/45 backdrop-blur-sm rounded-full text-zinc-300 group-hover:text-white transition-all">
              <Heart
                className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${
                  likedShorts[activeShort.id] ? 'fill-red-600 text-red-600' : 'text-white'
                }`}
              />
            </div>
            <span className="text-[9px] font-black font-mono text-zinc-300">
              {likedShorts[activeShort.id]
                ? (activeShort.likes + 1).toLocaleString()
                : activeShort.likes.toLocaleString()}
            </span>
          </button>

          {/* Comment */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCommentDrawer(true);
            }}
            className="flex flex-col items-center gap-1 cursor-pointer group"
          >
            <div className="p-2.5 bg-black/45 backdrop-blur-sm rounded-full text-white group-hover:text-zinc-200 transition-all">
              <MessageSquare className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[9px] font-black font-mono text-zinc-300">
              {activeShort.commentsCount.toLocaleString()}
            </span>
          </button>

          {/* Gift */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowGiftModal(true);
            }}
            className="flex flex-col items-center gap-1 cursor-pointer group animate-pulse"
          >
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-full text-white">
              <Gift className="h-4.5 w-4.5" />
            </div>
            <span className="text-[8px] font-black text-amber-500 uppercase">Tip</span>
          </button>

          {/* Share */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(window.location.origin);
              alert('Short URL link copied to clipboard!');
            }}
            className="flex flex-col items-center gap-1 cursor-pointer"
          >
            <div className="p-2.5 bg-black/45 backdrop-blur-sm rounded-full text-white hover:text-zinc-200">
              <Share2 className="h-4.5 w-4.5" />
            </div>
            <span className="text-[9px] font-bold text-zinc-400">Share</span>
          </button>

          {/* Spinning Remix Music Audio Track Disc */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center shadow-lg cursor-pointer flex-shrink-0 overflow-hidden"
          >
            <img src={activeShort.avatar} alt="spinning disc" className="w-full h-full object-cover rounded-full" />
          </motion.div>
        </div>

        {/* Bottom Metadata descriptions overlay overlay */}
        <div className="absolute left-3 bottom-4 right-14 z-30 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent space-y-2 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black text-white hover:underline cursor-pointer">
              @{activeShort.creator}
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400/5" />
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur px-2.5 py-0.5 rounded-full text-[9px] font-extrabold text-white uppercase ml-1">
              Follow
            </button>
          </div>

          <p className="text-[10px] text-zinc-200 line-clamp-2 leading-relaxed font-medium">
            {activeShort.description}
          </p>

          <div className="flex items-center gap-1.5 text-zinc-400">
            <Music className="h-3 w-3 text-zinc-500 animate-bounce" />
            <span className="text-[9px] font-semibold truncate max-w-[130px]">{activeShort.audioTrack}</span>
          </div>
        </div>
      </div>

      {/* SHORTS COMMENT DRAWER FROM BOTTOM */}
      <AnimatePresence>
        {showCommentDrawer && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowCommentDrawer(false)} />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="relative w-full max-w-[340px] mx-auto h-[60%] bg-[#0d0d0f] rounded-t-2xl border-t border-zinc-800 flex flex-col"
            >
              {/* Drawer header */}
              <div className="p-3 border-b border-zinc-900 flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-white uppercase">Short Comments ({comments.length})</span>
                <button
                  onClick={() => setShowCommentDrawer(false)}
                  className="p-1 rounded-full text-zinc-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Thread list */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
                {comments.map((cm) => (
                  <div key={cm.id} className="flex gap-2.5 items-start text-[10px]">
                    <div className="w-6.5 h-6.5 rounded-full bg-zinc-800 flex-shrink-0 flex items-center justify-center font-bold text-zinc-400">
                      {cm.author[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white">{cm.author}</span>
                        <span className="text-zinc-600 font-bold">Just now</span>
                      </div>
                      <p className="text-zinc-300 mt-0.5 leading-normal">{cm.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input inline comment form */}
              <form onSubmit={handleAddComment} className="p-2 border-t border-zinc-900 flex gap-2">
                <input
                  type="text"
                  placeholder="Add comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 bg-black border border-zinc-800 rounded-full px-3.5 py-1.5 text-[10px] focus:outline-none focus:border-zinc-700 text-white"
                />
                <button type="submit" className="p-1.5 bg-zinc-900 rounded-full border border-zinc-850 text-zinc-300 hover:text-white">
                  <Send className="h-3 w-3" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUPPORT TIP GIFT MODAL IN SHORTS */}
      <AnimatePresence>
        {showGiftModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowGiftModal(false)} />
            
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative w-full max-w-[300px] bg-[#0d0d0f] border border-zinc-800 rounded-2xl p-4 space-y-3.5 z-50 text-center"
            >
              <button onClick={() => setShowGiftModal(false)} className="absolute top-2.5 right-2.5 p-1 text-zinc-500 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>

              <div className="text-zinc-100 font-extrabold text-xs uppercase tracking-wider">
                Support @{activeShort.creator}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {INITIAL_GIFTS.slice(0, 4).map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleSendGift(g)}
                    className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-all"
                  >
                    <span className="text-xl">{g.icon}</span>
                    <span className="text-[9px] font-bold text-white">{g.name}</span>
                    <span className="text-[8px] font-mono text-amber-500 font-bold">{g.cost} PPL</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
