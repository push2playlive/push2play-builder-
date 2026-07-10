import { VirtualVideo, VirtualComment, VirtualCreator } from "./App";

export const initialVideos: VirtualVideo[] = [
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

export const initialComments: VirtualComment[] = [
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

export const creators: VirtualCreator[] = [
  { name: "A Word of Wisdom", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", subscribers: "42K", isLive: true },
  { name: "My Dirty Lense", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", subscribers: "12K", isLive: false },
  { name: "BE AMAZED", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100", subscribers: "8.4M", isLive: false },
  { name: "Chosen One Covenant", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100", subscribers: "1.2K", isLive: true }
];
