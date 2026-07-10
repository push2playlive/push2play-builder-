export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  views: number;
  likes: number;
  dislikes: number;
  uploadedAt: string;
  category: string;
  isLive?: boolean;
  viewerCount?: number;
  creator: Creator;
  comments: Comment[];
  chapters?: { time: number; title: string }[];
}

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  subscribers: number;
  isVerified?: boolean;
  isLive?: boolean;
  stakedPPL: number;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  uniqueAvatarUrl?: string;
  text: string;
  likes: number;
  likedByMe?: boolean;
  dislikes?: number;
  dislikedByMe?: boolean;
  createdAt: string;
  isPinned?: boolean;
  creatorHearted?: boolean;
  replies?: Comment[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  audioUrl: string;
  duration: string;
  lyrics?: string[];
  liked?: boolean;
}

export interface Gift {
  id: string;
  name: string;
  icon: string;
  cost: number;
  animationType: 'float' | 'burst' | 'takeover' | 'crown';
  color: string;
}

export interface StoreItem {
  id: string;
  name: string;
  price: number;
  type: 'badge' | 'emote' | 'pass' | 'merch' | 'coins';
  image: string;
  description: string;
  stock?: number;
}

export interface AdCampaign {
  id: string;
  title: string;
  budget: number;
  spent: number;
  views: number;
  targetAudience: string;
  status: 'active' | 'paused';
}

export type ViewMode = 'split' | 'code' | 'preview' | 'chat' | 'dashboard';

export interface StudioFile {
  name: string;
  active?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

export interface Build {
  id: string;
  projectName: string;
  code: string;
  files: any[];
  created_at: string;
  is_public: boolean;
  user_id?: string;
}
