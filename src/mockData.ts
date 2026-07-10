import { Video, Song, Gift, StoreItem } from './types';

export const INITIAL_CREATORS = [
  {
    id: 'c1',
    name: 'NeoSynth Visuals',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    subscribers: 124000,
    isVerified: true,
    isLive: true,
    stakedPPL: 25000,
  },
  {
    id: 'c2',
    name: 'Aether Beats',
    avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
    subscribers: 890000,
    isVerified: true,
    isLive: false,
    stakedPPL: 120000,
  },
  {
    id: 'c3',
    name: 'Hacker Core',
    avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
    subscribers: 45000,
    isVerified: false,
    isLive: true,
    stakedPPL: 1500,
  },
  {
    id: 'c4',
    name: 'Nature Horizon',
    avatar: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=150&auto=format&fit=crop&q=80',
    subscribers: 310000,
    isVerified: true,
    isLive: false,
    stakedPPL: 42000,
  }
];

export const INITIAL_VIDEOS: Video[] = [
  {
    id: 'v1',
    title: 'Neon Retro Sci-Fi Visuals Loop [4K UHD] (No Copyright)',
    description: 'A gorgeous, mesmerizing cyberpunk neon grid landscape animation loop. Perfect for lo-fi beats, synthwave music backgrounds, stream overlays, or home projection mapping. Staked on the Utube Media network for maximum yield distribution.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-neon-retro-futuristic-scifi-landscape-34241-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    duration: '04:20',
    views: 452900,
    likes: 24800,
    dislikes: 120,
    uploadedAt: '2 hours ago',
    category: 'Music',
    isLive: false,
    creator: INITIAL_CREATORS[0],
    chapters: [
      { time: 0, title: 'Intro Grid' },
      { time: 60, title: 'Synth Ascent' },
      { time: 150, title: 'Cosmic Horizons' },
      { time: 240, title: 'Outro' }
    ],
    comments: [
      {
        id: 'cm1',
        author: 'SynthWaveFanatic',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        text: 'This loop is absolutely incredible! Listening to this while coding is the ultimate flow state.',
        likes: 342,
        likedByMe: false,
        createdAt: '1 hour ago',
        creatorHearted: true,
        replies: [
          {
            id: 'cm1_r1',
            author: 'NeoSynth Visuals',
            avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
            text: 'Thank you! Glad it helps with the focus. New compilation dropping next week!',
            likes: 48,
            createdAt: '45 mins ago'
          }
        ]
      },
      {
        id: 'cm2',
        author: 'LoFi_Learner',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        text: 'Could you make a dark mode version of this without the bright purple flares?',
        likes: 18,
        likedByMe: false,
        createdAt: '30 mins ago'
      }
    ]
  },
  {
    id: 'v2',
    title: 'Ambient Deep Forest Stream - Relaxing Nature Sounds',
    description: 'Immerse yourself in a lush, green forest with sunlight filtering through tree canopies as a crystal clear stream flows gently over rocks. Perfect for meditation, studying, sleeping, or reducing anxiety.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&auto=format&fit=crop&q=80',
    duration: '10:00',
    views: 120530,
    likes: 8500,
    dislikes: 42,
    uploadedAt: 'Yesterday',
    category: 'Relax',
    isLive: false,
    creator: INITIAL_CREATORS[3],
    comments: [
      {
        id: 'cm3',
        author: 'ZenCoder',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
        text: 'Instantly puts me in a calm state. Absolute masterpiece of high-fidelity capture!',
        likes: 95,
        likedByMe: false,
        createdAt: '12 hours ago'
      }
    ]
  },
  {
    id: 'v3',
    title: '🔴 LIVE: Coding a YouTube Killer from Scratch (Gemini AI Driven)',
    description: 'Real-time high performance stream. We are live-coding Utube Media, a revolutionary decentralized video ecosystem featuring 5-tier affiliate reward networks, real-time staking nodes, and full visual customization.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-computer-hacker-screen-40019-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&auto=format&fit=crop&q=80',
    duration: 'LIVE',
    views: 1240,
    likes: 4320,
    dislikes: 10,
    uploadedAt: 'LIVE NOW',
    category: 'Tech',
    isLive: true,
    viewerCount: 1543,
    creator: INITIAL_CREATORS[2],
    comments: [
      {
        id: 'cm4',
        author: 'AI_Builder_99',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
        text: 'This layout and speed is insane. Literally runs laps around standard video players!',
        likes: 154,
        likedByMe: false,
        createdAt: '2 mins ago'
      },
      {
        id: 'cm5',
        author: 'DecentralizedGuy',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        text: 'Just tipped 500 PPL coins! Keep up the brilliant live demonstration!',
        likes: 88,
        likedByMe: false,
        createdAt: 'Just now'
      }
    ]
  },
  {
    id: 'v4',
    title: 'Mesmerizing Cosmic Space & Deep Galaxy Travel Visuals',
    description: 'Embark on a relaxing interstellar flight through glowing supernovas, distant galaxies, and shimmering cosmic dust clouds. Excellent backdrop for stargazing, lo-fi ambiance, and dream sequences.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=600&auto=format&fit=crop&q=80',
    duration: '08:15',
    views: 89040,
    likes: 5400,
    dislikes: 22,
    uploadedAt: '3 days ago',
    category: 'Sci-Fi',
    isLive: false,
    creator: INITIAL_CREATORS[0],
    comments: []
  },
  {
    id: 'v5',
    title: 'Abstract Liquid Color Fluidics - Beautiful Motion Backdrop',
    description: 'Slow-motion close-up capture of shifting, vibrant fluid colors blending in a mesmerizing dance of gradients. Highly therapeutic visual textures.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fluid-colors-background-loop-21516-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80',
    duration: '05:30',
    views: 31050,
    likes: 1980,
    dislikes: 8,
    uploadedAt: '1 week ago',
    category: 'Art',
    isLive: false,
    creator: INITIAL_CREATORS[1],
    comments: []
  },
  {
    id: 'v6',
    title: 'Aether Beats - Lofi Hip Hop Study Session (LIVE STREAM)',
    description: 'Welcome to Aether Beats live 24/7 lofi hip hop stream. Study, work, relax, or chat with community members from around the globe.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-crashing-on-rocks-from-above-4886-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    duration: 'LIVE',
    views: 1549000,
    likes: 87500,
    dislikes: 350,
    uploadedAt: 'LIVE NOW',
    category: 'Music',
    isLive: true,
    viewerCount: 8430,
    creator: INITIAL_CREATORS[1],
    comments: [
      {
        id: 'cm_lofi_1',
        author: 'CoffeeBean',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        text: 'The absolute best channel on Utube Media. Hands down.',
        likes: 1204,
        createdAt: '1 day ago'
      }
    ]
  }
];

export const INITIAL_SONGS: Song[] = [
  {
    id: 's1',
    title: 'Neon Horizon',
    artist: 'NeoSynth Visuals',
    album: 'Retro Sci-Fi compilation',
    albumArt: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: '06:12',
    lyrics: [
      '⚡ [Instrumental Synth Intro]',
      'Cruising down the gridline, purple stars above',
      'Cybernetic dreamscapes, neon digital love',
      'The speed of light in my eyes, processors awake',
      'Every clock cycle is a promise we cannot break',
      '🎹 [Melodic Keyboards Solo]',
      'Across the retro future, our database is sound',
      'Staking all our loyalty, never touching the ground'
    ]
  },
  {
    id: 's2',
    title: 'Deep Ether Flow',
    artist: 'Aether Beats',
    album: 'Cloud Sanctuary',
    albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: '07:05',
    lyrics: [
      '🌊 [Lofi Ambient Stream Flow]',
      'Mindful state of mind, breathing slow and light',
      'Relax your shoulder blades, we will be alright',
      'Sinking deep in gravity, let the rhythms glide',
      'Feel the custom equalizer rise and subside',
      '🌿 [Soothing Rainfall Interlude]',
      'Unclaimed coins accumlating, staking in the deep',
      'Quiet algorithms working while the creators sleep'
    ]
  },
  {
    id: 's3',
    title: 'Binary Overdrive',
    artist: 'Hacker Core',
    album: 'Terminal Void',
    albumArt: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: '05:44',
    lyrics: [
      '💻 [Aggressive Synthesizer Kick]',
      'Root exploit loaded, terminal green',
      'The most secure system that you have ever seen',
      'Stack smash, buffer overflow, pipeline flush',
      'Don\'t click that banner ad, avoid the digital rush',
      '🔥 [Screaming Guitar Synthesis]',
      'Affiliate branches branching out in trees',
      'Multiplying hashes across the digital breeze'
    ]
  }
];

export const INITIAL_GIFTS: Gift[] = [
  { id: 'g1', name: 'Cheering Clap', icon: '👏', cost: 10, animationType: 'float', color: '#10b981' },
  { id: 'g2', name: 'Golden Coin', icon: '🪙', cost: 50, animationType: 'float', color: '#f59e0b' },
  { id: 'g3', name: 'Rocket Tip', icon: '🚀', cost: 100, animationType: 'burst', color: '#06b6d4' },
  { id: 'g4', name: 'Golden Crown', icon: '👑', cost: 500, animationType: 'takeover', color: '#a855f7' },
  { id: 'g5', name: 'Cosmic Star', icon: '⭐', cost: 1000, animationType: 'crown', color: '#ec4899' }
];

export const INITIAL_STORE_ITEMS: StoreItem[] = [
  { id: 'st1', name: 'Neon Verified Badge', price: 200, type: 'badge', image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&auto=format&fit=crop&q=80', description: 'Showcase a premium custom-styled verified badge next to your username in all stream chats.' },
  { id: 'st2', name: 'Golden Crown Chat Emote', price: 150, type: 'emote', image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=200&auto=format&fit=crop&q=80', description: 'Unlock the exclusive royal crown chat reaction emoji for streams and comment threads.' },
  { id: 'st3', name: 'Exclusive Access: Hacker Course', price: 1000, type: 'pass', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&auto=format&fit=crop&q=80', description: 'Get lifetime private access to live lectures, repositories, and private Discord rooms.' },
  { id: 'st4', name: 'Utube Media Premium Velvet Hoodie', price: 2500, type: 'merch', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&auto=format&fit=crop&q=80', description: 'High quality double-stitched 100% heavy cotton premium streetwear hoodie with a reflective cyber logo.' },
  { id: 'st5', name: 'Starter Pack: 500 PPL Coins', price: 499, type: 'coins', image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=200&auto=format&fit=crop&q=80', description: 'Instant bundle of 500 PPL coins to send gifts to your favorite creators or purchase store items.' }
];
