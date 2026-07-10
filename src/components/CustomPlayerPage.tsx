import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, Settings, Subtitles,
  Smartphone, Monitor, ThumbsUp, ThumbsDown, Share2, Download, Bookmark,
  ChevronDown, ChevronUp, Bell, Heart, Gift as GiftIcon, Send, Sparkles, Smile,
  Crown, RefreshCw, X, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Comment, Gift } from '../types';
import { INITIAL_GIFTS } from '../mockData';
import { getRelativeTime } from '../lib/time';
import { CommentsSection } from './CommentsSection';

interface CustomPlayerPageProps {
  video: Video;
  accentColor: string;
  onSelectVideo: (video: Video) => void;
  allVideos: Video[];
  onGiftSent: (gift: Gift, count: number) => void;
  tokenCount: number;
}

interface FloatingGiftAnimation {
  id: string;
  icon: string;
  color: string;
  x: number;
  y: number;
  size: number;
  type: 'float' | 'burst' | 'takeover' | 'crown';
}

export const CustomPlayerPage: React.FC<CustomPlayerPageProps> = ({
  video,
  accentColor,
  onSelectVideo,
  allVideos,
  onGiftSent,
  tokenCount,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('1080p');
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isTheatreMode, setIsTheatreMode] = useState(false);

  const [descExpanded, setDescExpanded] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes);
  const [dislikeCount, setDislikeCount] = useState(video.dislikes);
  const [myReaction, setMyReaction] = useState<'like' | 'dislike' | null>(null);

  const [showGiftModal, setShowGiftModal] = useState(false);
  const [floatingGifts, setFloatingGifts] = useState<FloatingGiftAnimation[]>([]);
  const [giftTakeover, setGiftTakeover] = useState<{ icon: string; name: string } | null>(null);

  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<Comment[]>(video.comments);
  const [liveChat, setLiveChat] = useState<{ id: string; author: string; text: string; gift?: string }[]>([]);

  // Auto-hide controls
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      return;
    }
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [isPlaying, showControls]);

  // Sync state with HTML5 Video element
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(cur);
    setDuration(dur);
    setProgress(dur > 0 ? (cur / dur) * 100 : 0);
  };

  const handleProgressSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekPercentage = parseFloat(e.target.value);
    const newTime = (seekPercentage / 100) * duration;
    videoRef.current.currentTime = newTime;
    setProgress(seekPercentage);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    const newState = !isMuted;
    setIsMuted(newState);
    videoRef.current.muted = newState;
    if (!newState && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const handleFullscreenToggle = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.key === 'm') {
        e.preventDefault();
        handleMuteToggle();
      } else if (e.key === 'f') {
        e.preventDefault();
        handleFullscreenToggle();
      } else if (e.key === 'ArrowRight') {
        if (videoRef.current) videoRef.current.currentTime += 5;
      } else if (e.key === 'ArrowLeft') {
        if (videoRef.current) videoRef.current.currentTime -= 5;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, volume]);

  // Double tap to seek (Simulated click overlay)
  const handleVideoTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.detail === 2) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      if (videoRef.current) {
        if (clickX > width / 2) {
          videoRef.current.currentTime += 10;
          triggerFloatingAnimation('⏩ +10s', '#ffffff', clickX, rect.height / 2, 'float');
        } else {
          videoRef.current.currentTime -= 10;
          triggerFloatingAnimation('⏪ -10s', '#ffffff', clickX, rect.height / 2, 'float');
        }
      }
    } else {
      handlePlayPause();
    }
  };

  // Helper to trigger interactive overlay visual gifts
  const triggerFloatingAnimation = (
    icon: string,
    color: string,
    x: number,
    y: number,
    type: 'float' | 'burst' | 'takeover' | 'crown'
  ) => {
    const id = Math.random().toString();
    const newAnim: FloatingGiftAnimation = {
      id,
      icon,
      color,
      x,
      y,
      size: type === 'crown' ? 64 : type === 'burst' ? 48 : 32,
      type,
    };
    setFloatingGifts((prev) => [...prev, newAnim]);
    setTimeout(() => {
      setFloatingGifts((prev) => prev.filter((g) => g.id !== id));
    }, 2500);
  };

  // Send Gift Handler
  const handleSendGift = (gift: Gift) => {
    if (tokenCount < gift.cost) {
      alert('Insufficient PPL coin balance! Please earn or buy more in the Store.');
      return;
    }
    onGiftSent(gift, 1);

    // Dynamic floating animations
    const x = Math.random() * 60 + 20; // range 20% to 80%
    const y = Math.random() * 50 + 20;

    if (gift.animationType === 'takeover' || gift.animationType === 'crown') {
      setGiftTakeover({ icon: gift.icon, name: gift.name });
      setTimeout(() => setGiftTakeover(null), 3000);
    }

    triggerFloatingAnimation(gift.icon, gift.color, x, y, gift.animationType);
    setShowGiftModal(false);

    // Append to live chat
    const newChatMsg = {
      id: Math.random().toString(),
      author: 'You',
      text: `Sent a ${gift.name} ${gift.icon}!`,
      gift: gift.icon,
    };
    setLiveChat((prev) => [newChatMsg, ...prev].slice(0, 50));
  };

  // Live stream chat generator
  useEffect(() => {
    if (!video.isLive) return;
    const authors = ['CryptoKing', 'VibeSeeker', 'DevMaster', 'Alice_N', 'Satoshi_Dev', 'Cyber_Sam'];
    const texts = [
      'This stream is fire!',
      'Unbelievable visual aesthetics!',
      'Where can I check the staking APR?',
      'Let’s go guys, top up node wallets!',
      'Just subscribed! Love the quality.',
      'Absolutely loving the fluid transitions'
    ];

    const interval = setInterval(() => {
      const isGift = Math.random() > 0.75;
      const randomGift = INITIAL_GIFTS[Math.floor(Math.random() * INITIAL_GIFTS.length)];
      const author = authors[Math.floor(Math.random() * authors.length)];

      const newMsg = {
        id: Math.random().toString(),
        author,
        text: isGift ? `Sent ${randomGift.name} ${randomGift.icon}` : texts[Math.floor(Math.random() * texts.length)],
        gift: isGift ? randomGift.icon : undefined,
      };

      if (isGift) {
        // Trigger background viewers floating gift overlay
        triggerFloatingAnimation(randomGift.icon, randomGift.color, Math.random() * 60 + 20, Math.random() * 50 + 20, randomGift.animationType);
      }

      setLiveChat((prev) => [newMsg, ...prev].slice(0, 50));
    }, 2800);

    return () => clearInterval(interval);
  }, [video.isLive]);

  // Likes/dislikes toggle
  const handleReaction = (type: 'like' | 'dislike') => {
    if (myReaction === type) {
      setMyReaction(null);
      if (type === 'like') setLikeCount((prev) => prev - 1);
      else setDislikeCount((prev) => prev - 1);
    } else {
      if (myReaction === 'like') setLikeCount((prev) => prev - 1);
      if (myReaction === 'dislike') setDislikeCount((prev) => prev - 1);

      setMyReaction(type);
      if (type === 'like') setLikeCount((prev) => prev + 1);
      else setDislikeCount((prev) => prev + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#030303] text-gray-200">
      <div className={`mx-auto max-w-7xl p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 ${isTheatreMode ? 'lg:flex lg:flex-col' : ''}`}>
        {/* Left main area (Player + details) */}
        <div className={`lg:col-span-2 space-y-4 ${isTheatreMode ? 'w-full' : ''}`}>
          {/* Custom Player Wrapper */}
          <div
            ref={playerContainerRef}
            onMouseMove={() => setShowControls(true)}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            className={`relative bg-black rounded-2xl overflow-hidden border border-zinc-900 group shadow-2xl transition-all duration-300 ${
              isTheatreMode ? 'aspect-[21/9] max-h-[500px]' : 'aspect-video'
            }`}
          >
            {/* Real HTML5 video tag */}
            <video
              ref={videoRef}
              src={video.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onClick={handleVideoTap}
              className="w-full h-full object-cover cursor-pointer"
              playsInline
              loop
            />

            {/* Tap double seek click visual overlay animations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <AnimatePresence>
                {floatingGifts.map((anim) => (
                  <motion.div
                    key={anim.id}
                    initial={
                      anim.type === 'burst'
                        ? { scale: 0.1, opacity: 0, x: `${anim.x}%`, y: `${anim.y}%` }
                        : { y: '80%', opacity: 0, scale: 0.5, x: `${anim.x}%` }
                    }
                    animate={
                      anim.type === 'burst'
                        ? { scale: [1, 1.5, 0], opacity: [1, 1, 0] }
                        : { y: '20%', opacity: [0, 1, 1, 0], scale: [0.8, 1.2, 1] }
                    }
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                    className="absolute font-bold text-3xl select-none"
                    style={{
                      left: anim.type === 'burst' ? '0' : undefined,
                      top: anim.type === 'burst' ? '0' : undefined,
                      textShadow: `0 0 10px ${anim.color}`,
                    }}
                  >
                    {anim.icon}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Big Gifting Screen Takeover overlay */}
              <AnimatePresence>
                {giftTakeover && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: [1, 1.1, 1], opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-30 pointer-events-auto"
                  >
                    <Crown className="h-16 w-16 text-purple-400 animate-bounce mb-2" style={{ color: accentColor }} />
                    <span className="text-4xl filter drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] mb-2">
                      {giftTakeover.icon}
                    </span>
                    <h2 className="text-lg font-black tracking-widest uppercase text-white">
                      CREATOR SHARED A {giftTakeover.name.toUpperCase()}!
                    </h2>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mt-1">
                      Floating reward triggers network expansion
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls Bar Overlay */}
            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 flex flex-col gap-2 z-20 pointer-events-auto select-none"
                >
                  {/* Progress Line Bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-zinc-300">{formatTime(currentTime)}</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleProgressSeek}
                      className="flex-1 h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer focus:outline-none accent-purple-500"
                      style={{ accentColor }}
                    />
                    <span className="text-[10px] font-mono text-zinc-400">{formatTime(duration)}</span>
                  </div>

                  {/* Buttons line */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-zinc-200">
                      <button onClick={handlePlayPause} className="hover:text-white p-1 rounded-full hover:bg-zinc-900 transition-colors cursor-pointer">
                        {isPlaying ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5 fill-current" />}
                      </button>

                      {/* Volume */}
                      <div className="flex items-center gap-2 group/volume">
                        <button onClick={handleMuteToggle} className="hover:text-white p-1 rounded-full hover:bg-zinc-900 transition-colors cursor-pointer">
                          {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-0 group-hover/volume:w-16 h-1 bg-zinc-700 rounded-full appearance-none transition-all duration-300 cursor-pointer accent-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-zinc-300">
                      {/* Subtitles Toggle */}
                      <button className="p-1 hover:text-white hover:bg-zinc-900 rounded-full transition-colors">
                        <Subtitles className="h-4.5 w-4.5 text-zinc-400" />
                      </button>

                      {/* Speed selector */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            setShowSpeedMenu(!showSpeedMenu);
                            setShowQualityMenu(false);
                          }}
                          className="text-[10px] font-bold tracking-widest px-2 py-0.5 border border-zinc-800 rounded bg-[#0f0f11]/60 hover:text-white cursor-pointer"
                        >
                          {playbackSpeed}x
                        </button>
                        {showSpeedMenu && (
                          <div className="absolute bottom-full right-0 mb-2 w-20 bg-zinc-950 border border-zinc-800 rounded-lg p-1 text-[10px] font-mono shadow-2xl">
                            {[0.5, 1, 1.25, 1.5, 2].map((s) => (
                              <button
                                key={s}
                                onClick={() => handleSpeedChange(s)}
                                className="w-full text-left px-2 py-1 rounded hover:bg-zinc-900 text-zinc-300 hover:text-white"
                              >
                                {s}x
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quality selector */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            setShowQualityMenu(!showQualityMenu);
                            setShowSpeedMenu(false);
                          }}
                          className="text-[10px] font-bold tracking-widest px-2 py-0.5 border border-zinc-800 rounded bg-[#0f0f11]/60 hover:text-white cursor-pointer"
                        >
                          {quality}
                        </button>
                        {showQualityMenu && (
                          <div className="absolute bottom-full right-0 mb-2 w-20 bg-zinc-950 border border-zinc-800 rounded-lg p-1 text-[10px] font-mono shadow-2xl">
                            {['4K', '1080p', '720p', 'Auto'].map((q) => (
                              <button
                                key={q}
                                onClick={() => {
                                  setQuality(q);
                                  setShowQualityMenu(false);
                                }}
                                className="w-full text-left px-2 py-1 rounded hover:bg-zinc-900 text-zinc-300 hover:text-white"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Layout frames */}
                      <button
                        onClick={() => setIsTheatreMode(!isTheatreMode)}
                        className={`p-1 rounded-full hover:bg-zinc-900 transition-colors cursor-pointer ${isTheatreMode ? 'text-amber-500' : 'text-zinc-400'}`}
                        title="Theatre Mode"
                      >
                        <Monitor className="h-4.5 w-4.5" />
                      </button>

                      <button onClick={handleFullscreenToggle} className="p-1 hover:text-white hover:bg-zinc-900 rounded-full transition-colors cursor-pointer">
                        {isFullscreen ? <Minimize2 className="h-4.5 w-4.5" /> : <Maximize2 className="h-4.5 w-4.5" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Under Player Details Section */}
          <div className="space-y-3.5">
            <h1 className="text-base sm:text-lg font-black text-white leading-tight">
              {video.title}
            </h1>

            {/* Interaction Row buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-zinc-900/60 border border-zinc-800/80 rounded-full p-0.5">
                  <button
                    onClick={() => handleReaction('like')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                      myReaction === 'like' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" style={{ color: myReaction === 'like' ? accentColor : undefined }} />
                    <span>{likeCount.toLocaleString()}</span>
                  </button>
                  <div className="h-4 w-px bg-zinc-800"></div>
                  <button
                    onClick={() => handleReaction('dislike')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                      myReaction === 'dislike' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    <span>{dislikeCount.toLocaleString()}</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Share link copied to clipboard!');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 rounded-full text-xs font-bold text-zinc-300 hover:text-white cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share</span>
                </button>

                <button
                  onClick={() => alert('Offline video download caching initialized. Adding to local PWA cache.')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 rounded-full text-xs font-bold text-zinc-300 hover:text-white cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
              </div>

              {/* Glowing Send Gift Trigger Button */}
              <button
                onClick={() => setShowGiftModal(true)}
                className="relative group flex items-center gap-1.5 px-4.5 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs font-black text-white hover:brightness-110 shadow-lg shadow-purple-500/15 cursor-pointer"
              >
                <GiftIcon className="h-4 w-4 animate-bounce" />
                <span>SUPPORT CREATOR</span>
                <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 blur group-hover:opacity-40 transition -z-10"></span>
              </button>
            </div>

            {/* Creator Info Bar */}
            <div className="flex items-center justify-between gap-4 p-3 bg-zinc-950/40 border border-zinc-900 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="relative cursor-pointer">
                  <img
                    src={video.creator.avatar}
                    alt={video.creator.name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                    referrerPolicy="no-referrer"
                  />
                  {video.creator.isLive && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-600 border border-black animate-pulse"></span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1 hover:text-zinc-300 cursor-pointer">
                    {video.creator.name}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    {video.creator.subscribers.toLocaleString()} subscribers • Node Staked: {video.creator.stakedPPL.toLocaleString()} PPL
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase transition-all cursor-pointer ${
                    isSubscribed
                      ? 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
                
                <button
                  onClick={() => alert(`Joined ${video.creator.name} creator tier membership!`)}
                  className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 text-xs font-bold rounded-full text-zinc-300 hover:text-white cursor-pointer"
                >
                  Join
                </button>
              </div>
            </div>

            {/* Expandable Description */}
            <div className="p-3.5 bg-zinc-950 border border-zinc-900/60 rounded-2xl text-[11px] leading-relaxed relative">
              <div className="flex gap-2 text-zinc-400 font-bold mb-1.5">
                <span>{video.views.toLocaleString()} views</span>
                <span>•</span>
                <span>{video.uploadedAt}</span>
              </div>
              <p className={descExpanded ? 'whitespace-pre-line text-zinc-300' : 'line-clamp-2 text-zinc-400'}>
                {video.description}
              </p>
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="mt-1 flex items-center gap-1 text-[10px] font-black text-white hover:underline uppercase tracking-wider"
              >
                <span>{descExpanded ? 'Show less' : 'Read more'}</span>
                {descExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {/* Comments Feed Area */}
          <div className="pt-4 border-t border-zinc-900">
            <CommentsSection
              initialComments={comments}
              onAddComment={(newComment) => {
                setComments((prev) => [newComment, ...prev]);
              }}
              onDeleteComment={(commentId) => {
                setComments((prev) => prev.filter((c) => c.id !== commentId));
              }}
            />
          </div>
        </div>

        {/* Right Sidebar List (Live Chat or suggestions) */}
        <div className="space-y-4">
          {video.isLive ? (
            /* Immersive Real-time Live Chat box */
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col h-[400px] md:h-[450px]">
              <div className="p-3 border-b border-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                  <span className="text-xs font-black tracking-widest text-white uppercase">Live Chat stream</span>
                </div>
                <span className="text-[9px] text-zinc-500 font-mono">Synced</span>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 flex flex-col-reverse">
                {liveChat.map((chat) => (
                  <div key={chat.id} className="text-[11px] leading-relaxed">
                    <span className="font-extrabold text-zinc-400 hover:text-zinc-200 cursor-pointer mr-2">
                      {chat.author}:
                    </span>
                    <span className={`${chat.gift ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                      {chat.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick sending comments inside stream */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!commentInput.trim()) return;
                  const newMsg = {
                    id: Math.random().toString(),
                    author: 'You',
                    text: commentInput,
                  };
                  setLiveChat((prev) => [newMsg, ...prev]);
                  setCommentInput('');
                }}
                className="p-2 border-t border-zinc-900 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Chat here..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 bg-[#09090b] border border-zinc-800 rounded-full px-3 py-1.5 text-[11px] placeholder-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-0 text-white"
                />
                <button type="submit" className="p-1.5 bg-[#101014] rounded-full border border-zinc-800 hover:text-white">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          ) : (
            /* Recommendations List */
            <div className="space-y-3">
              <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase">
                Up next
              </h3>
              {allVideos
                .filter((v) => v.id !== video.id)
                .map((v) => (
                  <div
                    key={v.id}
                    onClick={() => onSelectVideo(v)}
                    className="flex gap-2.5 cursor-pointer hover:bg-zinc-900/40 p-1.5 rounded-xl transition-all group"
                  >
                    <div className="relative w-28 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-black border border-zinc-900">
                      <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform" />
                      <span className="absolute bottom-1 right-1 bg-black/85 px-1 rounded text-[8px] font-bold font-mono">
                        {v.duration}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-[11px] font-bold text-white line-clamp-2 leading-tight group-hover:text-zinc-300">
                          {v.title}
                        </h4>
                        <p className="text-[9px] text-zinc-500 mt-1">{v.creator.name}</p>
                      </div>
                      <span className="text-[8px] text-zinc-600 font-medium">
                        {v.views >= 1000000 ? (v.views / 1000000).toFixed(1) + 'M' : v.views.toLocaleString()} views
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* SUPPORT CREATOR GIFT MODAL BOX */}
      <AnimatePresence>
        {showGiftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowGiftModal(false)}></div>

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#0d0d0f] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4"
            >
              <button
                onClick={() => setShowGiftModal(false)}
                className="absolute top-3.5 right-3.5 p-1 rounded-full text-zinc-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div>
                <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5 uppercase tracking-widest">
                  <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                  SEND GIFT TO CREATOR
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Supports the channel node & distributes rewards</p>
              </div>

              {/* Coin Balance bar */}
              <div className="flex items-center justify-between p-2.5 bg-[#141416] border border-zinc-800 rounded-xl">
                <span className="text-[10px] font-extrabold text-zinc-400">YOUR WALLET BALANCE:</span>
                <span className="text-xs font-black text-amber-500 font-mono">{tokenCount.toLocaleString()} PPL</span>
              </div>

              {/* Gifts Grid selection */}
              <div className="grid grid-cols-2 gap-2.5">
                {INITIAL_GIFTS.map((gift) => (
                  <button
                    key={gift.id}
                    onClick={() => handleSendGift(gift)}
                    className="flex flex-col items-center p-3.5 bg-zinc-900 border border-zinc-800/80 rounded-xl hover:bg-zinc-800/60 hover:border-zinc-700 hover:scale-[1.01] transition-all cursor-pointer group text-center"
                  >
                    <span className="text-2.5xl group-hover:scale-110 transition-transform duration-200">
                      {gift.icon}
                    </span>
                    <span className="text-[11px] font-bold text-white mt-1.5">{gift.name}</span>
                    <span className="text-[9px] font-mono text-amber-500 mt-0.5 font-bold">{gift.cost} PPL</span>
                  </button>
                ))}
              </div>

              <p className="text-[9px] text-zinc-600 text-center uppercase tracking-wider font-semibold">
                Stripe & Crypto Coin top-up packages available in the Store
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
