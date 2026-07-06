export interface VirtualFile {
  path: string;
  content: string;
}

export const DEFAULT_VIRTUAL_FILES: Record<string, string> = {
  "metadata.json": `{
  "name": "PushPlay Live",
  "theme": "dark",
  "accentColor": "#f59e0b",
  "tokenCount": 2500,
  "features": {
    "comments": true,
    "upload": true,
    "reports": true,
    "creatorEconomy": true
  }
}`,

  "src/types.ts": `export interface Video {
  id: string;
  title: string;
  duration: string;
  author: string;
  views: number;
  uploadedAt: string;
  thumbnail: string;
  category: string;
  description: string;
  likes: number;
  reports?: number;
  isReported?: boolean;
  investigationStatus?: "Submitted" | "Under Review" | "Action Taken" | "Closed";
}

export interface Comment {
  id: string;
  videoId: string;
  author: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface Creator {
  name: string;
  avatar: string;
  subscribers: string;
  isLive: boolean;
}
`,

  "src/data.ts": `import { Video, Comment, Creator } from "./types";

export const initialVideos: Video[] = [
  {
    id: "vid-1",
    title: "Chosen Ones: Don't Blame God if You Ignore this Prophetic Date 🔥",
    duration: "28:05",
    author: "A Word of Wisdom",
    views: 4125,
    uploadedAt: "2 days ago",
    thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80",
    category: "Testimonies",
    description: "An in-depth scriptural exploration of prophetic dates, celestial warnings, and ancient alignments. Join us as we examine the timeline of events that many are overlooking.",
    likes: 312,
    reports: 0
  },
  {
    id: "vid-2",
    title: "Tales From The Streets | Walking Wellington Central",
    duration: "26:57",
    author: "My Dirty Lense",
    views: 3820,
    uploadedAt: "5 days ago",
    thumbnail: "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?auto=format&fit=crop&w=600&q=80",
    category: "Mixes",
    description: "An ambient walk through Wellington Central at dusk. Experience the cinematic neon light, damp city streets, reflections in windows, and modern cityscape.",
    likes: 245,
    reports: 0
  },
  {
    id: "vid-3",
    title: "The Most Powerful Machine Guns Ever Made",
    duration: "28:43",
    author: "BE AMAZED",
    views: 282400,
    uploadedAt: "9 months ago",
    thumbnail: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=600&q=80",
    category: "Kickboxing",
    description: "A detailed visual countdown of military engineering achievements, modern high-rate fire devices, and ballistics technology history.",
    likes: 12050,
    reports: 3,
    isReported: true
  },
  {
    id: "vid-4",
    title: "God's Chosen Ones: Please Don't Scroll - God Knows You Need This...",
    duration: "1:28:46",
    author: "Chosen One Covenant",
    views: 80,
    uploadedAt: "3 days ago",
    thumbnail: "https://images.unsplash.com/photo-1501862700950-18e487c94389?auto=format&fit=crop&w=600&q=80",
    category: "Testimonies",
    description: "A calming message of comfort, grace, and finding peace in turbulent times. Lay down your burdens and listen to this restorative, multi-part guided testimony.",
    likes: 15,
    reports: 0
  }
];

export const initialComments: Comment[] = [
  {
    id: "c-1",
    videoId: "vid-1",
    author: "Caleb Vance",
    text: "This is exactly what I was searching for! The scriptural backing makes so much sense.",
    timestamp: "1 day ago",
    likes: 42
  },
  {
    id: "c-2",
    videoId: "vid-1",
    author: "Serene_Spirit",
    text: "Beautifully presented. Keeps you locked in for all 28 minutes. God bless.",
    timestamp: "12 hours ago",
    likes: 19
  },
  {
    id: "c-3",
    videoId: "vid-2",
    author: "WalksWorld",
    text: "The audio clarity is fantastic! What mic were you using for the city sounds?",
    timestamp: "4 days ago",
    likes: 8
  }
];

export const creators: Creator[] = [
  { name: "A Word of Wisdom", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", subscribers: "42K", isLive: true },
  { name: "My Dirty Lense", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", subscribers: "12K", isLive: false },
  { name: "BE AMAZED", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100", subscribers: "8.4M", isLive: false },
  { name: "Chosen One Covenant", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100", subscribers: "1.2K", isLive: true }
];
`,

  "src/components/Header.tsx": `import React, { useState } from "react";
import { Search, Plus, Bell, User } from "lucide-react";

interface HeaderProps {
  appTitle: string;
  tokenCount: number;
  onSearch: (term: string) => void;
  onOpenUpload: () => void;
  accentColor: string;
}

export default function Header({ appTitle, tokenCount, onSearch, onOpenUpload, accentColor }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <header className="flex items-center justify-between border-b border-gray-800 bg-[#0c0c0e] px-6 py-4">
      {/* Brand Logo and Badge */}
      <div className="flex items-center space-x-3">
        <div 
          className="flex h-9 w-9 items-center justify-center rounded-lg font-bold text-black"
          style={{ backgroundColor: accentColor }}
        >
          PP
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold tracking-wider text-white uppercase text-base">{appTitle}</span>
            <span 
              className="rounded px-1 text-[9px] font-extrabold uppercase text-black"
              style={{ backgroundColor: accentColor }}
            >
              STUDIO
            </span>
          </div>
          <span className="text-[10px] tracking-widest text-gray-500 uppercase">Curated Art & Cinema</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-xl mx-4">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-500" />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search celestial streams, urban views, or weapon analyses..."
          className="w-full rounded-full border border-gray-800 bg-[#141416] py-2 pl-10 pr-4 text-xs font-medium text-gray-300 placeholder-gray-500 transition-colors focus:border-gray-700 focus:outline-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4">
        {/* Create Button */}
        <button 
          onClick={onOpenUpload}
          className="flex items-center space-x-1.5 rounded-full border border-gray-800 bg-[#141416] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-800"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create</span>
        </button>

        {/* Tokens Display */}
        <div className="flex items-center space-x-1.5 rounded-full border border-amber-900/30 bg-amber-950/10 px-4 py-2 text-xs font-bold text-amber-500">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          <span>{tokenCount.toLocaleString()} PPL</span>
        </div>

        {/* User Badge */}
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 border border-gray-700 text-gray-300">
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}`,

  "src/components/Navigation.tsx": `import React from "react";
import { Home, Compass, Film, Music, TrendingUp, List, Clock, Heart, History, Wallet, Store, ShieldAlert, Award, FileSpreadsheet } from "lucide-react";

interface NavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  accentColor: string;
  features: {
    creatorEconomy: boolean;
    reports: boolean;
  };
}

export default function Navigation({ currentTab, onTabChange, accentColor, features }: NavigationProps) {
  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "shorts", label: "Shorts", icon: Film },
    { id: "music", label: "Music", icon: Music },
    { id: "trends", label: "Trends", icon: TrendingUp },
  ];

  const playlistItems = [
    { id: "playlists", label: "Playlists", icon: List },
    { id: "watch-later", label: "Watch Later", icon: Clock },
    { id: "liked", label: "Liked videos", icon: Heart },
    { id: "history", label: "Watch History", icon: History },
  ];

  const creatorItems = [
    { id: "wallet", label: "Wallet & Crypto", icon: Wallet },
    { id: "store", label: "Online Store", icon: Store },
    { id: "creator-studio", label: "Creator Studio", icon: Award },
  ];

  return (
    <aside className="w-64 border-r border-gray-800 bg-[#0c0c0e] px-4 py-6 font-sans">
      <div className="space-y-6">
        {/* Core Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-150 align-middle"
                style={{
                  backgroundColor: isActive ? "#18181b" : "transparent",
                  color: isActive ? accentColor : "#a1a1aa"
                }}
              >
                <Icon className="h-4 w-4" style={{ color: isActive ? accentColor : "#71717a" }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Playlists */}
        <div>
          <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-500">My Playlists</span>
          <nav className="mt-2 space-y-1">
            {playlistItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-150"
                  style={{
                    backgroundColor: isActive ? "#18181b" : "transparent",
                    color: isActive ? accentColor : "#a1a1aa"
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: isActive ? accentColor : "#71717a" }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Creator Economy */}
        {features.creatorEconomy && (
          <div>
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-500">Creator Economy</span>
            <nav className="mt-2 space-y-1">
              {creatorItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-150"
                    style={{
                      backgroundColor: isActive ? "#18181b" : "transparent",
                      color: isActive ? accentColor : "#a1a1aa"
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: isActive ? accentColor : "#71717a" }} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Admin Moderation Panel (if reports feature is enabled) */}
        {features.reports && (
          <div>
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-500">System Admin</span>
            <nav className="mt-2 space-y-1">
              <button
                onClick={() => onTabChange("admin")}
                className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-150"
                style={{
                  backgroundColor: currentTab === "admin" ? "#18181b" : "transparent",
                  color: currentTab === "admin" ? accentColor : "#a1a1aa"
                }}
              >
                <ShieldAlert className="h-4 w-4 text-red-500/80" />
                <span>Mod Dashboard</span>
              </button>
            </nav>
          </div>
        )}

        {/* Subscriptions Status Badge */}
        <div className="pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between rounded-lg bg-[#141416] p-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold tracking-wider text-gray-500 uppercase">Subscriptions</span>
              <span className="text-xs font-bold text-white mt-1">Live Feed</span>
            </div>
            <span className="animate-pulse rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Live</span>
          </div>
        </div>
      </div>
    </aside>
  );
}`,

  "src/components/VideoPlayer.tsx": `import React, { useState } from "react";
import { Play, Heart, Share2, Shield, MessageSquare, Flame } from "lucide-react";
import { Video, Comment } from "../types";
import CommentsSection from "./CommentsSection";

interface VideoPlayerProps {
  video: Video;
  comments: Comment[];
  onAddComment: (text: string) => void;
  onReport: (id: string) => void;
  accentColor: string;
}

export default function VideoPlayer({ video, comments, onAddComment, onReport, accentColor }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [likes, setLikes] = useState(video.likes);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = () => {
    if (hasLiked) {
      setLikes(likes - 1);
      setHasLiked(false);
    } else {
      setLikes(likes + 1);
      setHasLiked(true);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-[#0c0c0e] min-h-screen text-gray-200">
      <div className="flex-1 space-y-4">
        {/* Dynamic Interactive Player Box */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-gray-800 flex items-center justify-center group">
          {!isPlaying ? (
            <>
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              
              <button 
                onClick={() => setIsPlaying(true)}
                className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#f59e0b] text-black shadow-lg shadow-amber-500/20 transition-transform duration-300 hover:scale-110"
                style={{ backgroundColor: accentColor }}
              >
                <Play className="h-6 w-6 fill-current pl-1" />
              </button>
              
              <span className="absolute bottom-4 right-4 z-10 rounded bg-black/70 px-2 py-1 text-xs font-semibold">
                {video.duration}
              </span>
            </>
          ) : (
            <div className="relative h-full w-full bg-slate-900 flex flex-col items-center justify-center">
              <div className="absolute top-4 left-4 flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Streaming</span>
              </div>
              <div className="text-center space-y-2">
                <Flame className="h-10 w-10 text-amber-500 animate-bounce mx-auto" />
                <p className="text-sm font-semibold text-gray-400">Simulating Cinema Stream Feed...</p>
                <button 
                  onClick={() => setIsPlaying(false)}
                  className="rounded-full border border-gray-700 px-4 py-1 text-xs text-gray-400 hover:text-white"
                >
                  Stop Stream
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Video Title and Actions */}
        <div className="space-y-2">
          <h1 className="text-lg font-bold tracking-tight text-white">{video.title}</h1>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4 text-xs text-gray-400">
            <div>
              <span className="font-bold text-gray-200">{video.views.toLocaleString()} views</span>
              <span className="mx-2">•</span>
              <span>{video.uploadedAt}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLike}
                className="flex items-center space-x-1.5 hover:text-white transition-colors"
                style={{ color: hasLiked ? accentColor : undefined }}
              >
                <Heart className="h-4 w-4" fill={hasLiked ? "currentColor" : "none"} />
                <span>{likes.toLocaleString()}</span>
              </button>

              <button className="flex items-center space-x-1.5 hover:text-white transition-colors">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>

              <button 
                onClick={() => onReport(video.id)}
                className="flex items-center space-x-1.5 hover:text-red-400 transition-colors text-gray-500"
              >
                <Shield className="h-4 w-4" />
                <span>Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Author Bio Section */}
        <div className="flex items-start space-x-4 pt-2">
          <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-300">
            {video.author.slice(0, 2)}
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-bold text-white">{video.author}</h3>
            <p className="text-xs text-gray-400">{video.description}</p>
          </div>
        </div>
      </div>

      {/* Side Chat Pane/Comments */}
      <div className="w-full lg:w-96 border-l lg:border-l border-gray-800 pl-0 lg:pl-6">
        <CommentsSection 
          comments={comments} 
          onAddComment={onAddComment} 
          accentColor={accentColor} 
        />
      </div>
    </div>
  );
}`,

  "src/components/CommentsSection.tsx": `import React, { useState } from "react";
import { MessageSquare, Send, Heart } from "lucide-react";
import { Comment } from "../types";

interface CommentsSectionProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
  accentColor: string;
}

export default function CommentsSection({ comments, onAddComment, accentColor }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment("");
  };

  return (
    <div className="flex flex-col h-[500px] bg-[#101012] border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center space-x-2 border-b border-gray-800 bg-[#141416] p-4">
        <MessageSquare className="h-4 w-4" style={{ color: accentColor }} />
        <span className="text-xs font-bold tracking-wider text-white uppercase">Live Comments</span>
        <span className="text-[10px] text-gray-500 font-bold">({comments.length})</span>
      </div>

      {/* Comments scrolling zone */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start space-x-3 text-xs animate-fade-in">
            <div className="h-8 w-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-400">
              {comment.author.slice(0, 2)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-300">{comment.author}</span>
                <span className="text-[10px] text-gray-500">{comment.timestamp}</span>
              </div>
              <p className="text-gray-400 font-light">{comment.text}</p>
              
              <button className="flex items-center space-x-1 text-[10px] text-gray-500 hover:text-gray-300 mt-1">
                <Heart className="h-3 w-3" />
                <span>{comment.likes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Input Submit */}
      <form onSubmit={handleSubmit} className="border-t border-gray-800 bg-[#141416] p-3 flex items-center gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Send a live comment..."
          className="flex-1 rounded-full border border-gray-800 bg-[#0c0c0e] px-4 py-2 text-xs font-medium text-gray-300 placeholder-gray-500 focus:border-gray-700 focus:outline-none"
        />
        <button 
          type="submit" 
          className="flex h-8 w-8 items-center justify-center rounded-full text-black transition-colors"
          style={{ backgroundColor: accentColor }}
        >
          <Send className="h-3.5 w-3.5 fill-current" />
        </button>
      </form>
    </div>
  );
}`,

  "src/components/UploadModal.tsx": `import React, { useState } from "react";
import { X, Upload, Video as VideoIcon } from "lucide-react";
import { Video } from "../types";

interface UploadModalProps {
  onClose: () => void;
  onAddVideo: (video: Omit<Video, "id" | "views" | "likes" | "reports">) => void;
  accentColor: string;
}

export default function UploadModal({ onClose, onAddVideo, accentColor }: UploadModalProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [duration, setDuration] = useState("10:00");
  const [category, setCategory] = useState("Testimonies");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) return;

    onAddVideo({
      title,
      author,
      duration,
      category,
      description,
      thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=600&q=80"
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
      <div className="w-full max-w-lg rounded-xl border border-gray-800 bg-[#0c0c0e] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-800 bg-[#141416] p-4">
          <div className="flex items-center space-x-2 text-white">
            <VideoIcon className="h-4 w-4" style={{ color: accentColor }} />
            <span className="text-xs font-bold tracking-wider uppercase">Upload Studio Stream</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Draggable Dropzone */}
          <div className="border-2 border-dashed border-gray-800 hover:border-gray-700 rounded-xl p-8 text-center bg-[#101012] cursor-pointer group transition-colors">
            <Upload className="h-8 w-8 text-gray-500 group-hover:text-amber-500 mx-auto mb-2 transition-colors" style={{ color: accentColor }} />
            <p className="text-xs font-semibold text-gray-300">Drag and drop cinematic file</p>
            <p className="text-[10px] text-gray-500 mt-1">MP4, WEBM, or MOV up to 10GB</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Stream Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Name your stream..."
                className="w-full rounded-lg border border-gray-800 bg-[#141416] p-2.5 text-xs text-white focus:border-gray-700 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Creator Account</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Producer name..."
                className="w-full rounded-lg border border-gray-800 bg-[#141416] p-2.5 text-xs text-white focus:border-gray-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Category Feed</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-800 bg-[#141416] p-2.5 text-xs text-white focus:border-gray-700 focus:outline-none"
              >
                <option value="Testimonies">Testimonies</option>
                <option value="Mixes">Mixes</option>
                <option value="Music">Music</option>
                <option value="Kickboxing">Kickboxing</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Simulated Duration</label>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="28:05"
                className="w-full rounded-lg border border-gray-800 bg-[#141416] p-2.5 text-xs text-white focus:border-gray-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Curator Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed log analysis..."
              rows={3}
              className="w-full rounded-lg border border-gray-800 bg-[#141416] p-2.5 text-xs text-white focus:border-gray-700 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg py-2.5 text-xs font-bold text-black transition-transform hover:scale-[1.01]"
            style={{ backgroundColor: accentColor }}
          >
            Publish Live Stream
          </button>
        </form>
      </div>
    </div>
  );
}`,

  "src/components/AdminDashboard.tsx": `import React, { useState } from "react";
import { ShieldAlert, Trash2, CheckCircle, Clock } from "lucide-react";
import { Video } from "../types";

interface AdminDashboardProps {
  videos: Video[];
  onDismissReport: (id: string) => void;
  onRemoveVideo: (id: string) => void;
  accentColor: string;
}

export default function AdminDashboard({ videos, onDismissReport, onRemoveVideo, accentColor }: AdminDashboardProps) {
  const reportedVideos = videos.filter((v) => v.isReported || (v.reports && v.reports > 0));

  return (
    <div className="p-6 bg-[#0c0c0e] min-h-screen text-gray-200 font-sans">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-500" />
          <span>Moderation Investigation Dashboard</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Review flagged streaming nodes, system reports, and verify content standards.</p>
      </div>

      {reportedVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-gray-800 rounded-xl p-12 bg-[#101012] text-center">
          <CheckCircle className="h-10 w-10 text-emerald-500 mb-2" />
          <p className="text-sm font-semibold text-gray-300">All streams verified!</p>
          <p className="text-xs text-gray-500">There are no flagged streaming files awaiting investigation review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reportedVideos.map((video) => {
            const currentStatus = video.investigationStatus || "Submitted";
            const stages = ["Submitted", "Under Review", "Action Taken", "Closed"];
            const currentIndex = stages.indexOf(currentStatus);
            
            return (
              <div key={video.id} className="border border-gray-800 rounded-xl bg-[#101012] p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex gap-4 items-start flex-1 min-w-0">
                  <img src={video.thumbnail} alt="" className="h-16 w-24 object-cover rounded-lg border border-gray-800" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded bg-red-950/40 px-2 py-0.5 text-[9px] font-bold uppercase text-red-500 border border-red-900/30">
                        Flagged: {video.reports || 1} Reports
                      </span>
                      <span className="rounded bg-zinc-900 px-2 py-0.5 text-[9px] font-bold uppercase text-zinc-400 border border-zinc-800">
                        Stage: {currentStatus}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white leading-normal truncate">{video.title}</h3>
                    <p className="text-[10px] text-gray-500 font-medium">Producer: {video.author} • Category: {video.category}</p>
                    
                    {/* Horizontal Stepper inside Admin Code */}
                    <div className="pt-2 space-y-1 max-w-sm">
                      <div className="flex justify-between items-center text-[8px] uppercase tracking-wider text-gray-500 font-extrabold">
                        <span>Investigation Status Stepper</span>
                      </div>
                      <div className="relative flex justify-between items-center px-1 py-1">
                        <div className="absolute top-1/2 left-2 right-2 h-[1px] bg-zinc-800 -translate-y-1/2 z-0"></div>
                        <div 
                          className="absolute top-1/2 left-2 h-[1px] transition-all duration-300 -translate-y-1/2 z-0"
                          style={{ 
                            backgroundColor: accentColor,
                            width: ((currentIndex / (stages.length - 1)) * 90) + "%"
                          }}
                        ></div>
                        {stages.map((stage, idx) => {
                          const isActive = currentStatus === stage;
                          const isCompleted = idx < currentIndex;
                          return (
                            <div key={stage} className="relative z-10 flex flex-col items-center">
                              <div 
                                className={"w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold transition-all duration-200 " + (
                                  isActive 
                                    ? "bg-zinc-950 text-white shadow ring-1" 
                                    : isCompleted 
                                      ? "bg-amber-500 text-black font-extrabold" 
                                      : "bg-zinc-900 text-zinc-600 border border-zinc-800"
                                )}
                                style={{
                                  borderColor: isActive ? accentColor : undefined,
                                  backgroundColor: isCompleted ? accentColor : undefined,
                                  color: isCompleted ? "#000" : undefined,
                                }}
                              >
                                {isCompleted ? "✓" : idx + 1}
                              </div>
                              <span className={"text-[6px] font-bold uppercase mt-0.5 " + (isActive ? "text-white" : "text-gray-500")}>
                                {stage.split(" ")[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onDismissReport(video.id)}
                    className="rounded-lg border border-gray-800 bg-[#141416] px-3.5 py-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Dismiss</span>
                  </button>

                  <button
                    onClick={() => onRemoveVideo(video.id)}
                    className="rounded-lg border border-red-950/50 bg-red-950/20 px-3.5 py-1.5 text-xs font-bold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}`
};
