import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Volume2, VolumeX, Heart,
  Plus, Download, Share2, ChevronUp, ChevronDown, ListMusic, Clock, Sliders,
  Music, Sparkles, Trash2, Edit2, PlayCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Song } from '../types';
import { INITIAL_SONGS } from '../mockData';

interface MusicPageProps {
  accentColor: string;
  onLikedSongChanged?: (song: Song) => void;
}

export const MusicPage: React.FC<MusicPageProps> = ({ accentColor }) => {
  const [songs, setSongs] = useState<Song[]>(INITIAL_SONGS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);

  // Synced Lyric line indicator
  const [lyricIndex, setLyricIndex] = useState(0);

  // Playback settings
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState('off'); // off, one, all
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);

  // Playlists State
  const [playlists, setPlaylists] = useState<{ id: string; name: string; songsCount: number }[]>([
    { id: 'p1', name: 'Ambient Cyber-Focus', songsCount: 3 },
    { id: 'p2', name: 'Node Staker Anthems', songsCount: 1 },
    { id: 'p3', name: 'Lofi Midnight Coding', songsCount: 5 },
  ]);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);
  const activeSong = songs[currentIndex];

  // Rotate index or trigger progress bar
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentIndex]);

  // Handle Synced scrolling lyrics simulation as progress grows
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (audioRef.current) {
        const cur = audioRef.current.currentTime;
        const dur = audioRef.current.duration || 1;
        setCurrentTime(cur);
        setProgress((cur / dur) * 100);

        // Advance simulated lyrics lines
        if (activeSong.lyrics) {
          const step = dur / activeSong.lyrics.length;
          const idx = Math.min(activeSong.lyrics.length - 1, Math.floor(cur / step));
          setLyricIndex(idx);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (isShuffle) {
      setCurrentIndex(Math.floor(Math.random() * songs.length));
    } else {
      setCurrentIndex((currentIndex + 1) % songs.length);
    }
    setProgress(0);
    setCurrentTime(0);
    setLyricIndex(0);
  };

  const handlePrev = () => {
    setCurrentIndex((currentIndex - 1 + songs.length) % songs.length);
    setProgress(0);
    setCurrentTime(0);
    setLyricIndex(0);
  };

  const handleAudioSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    if (audioRef.current) {
      const dur = audioRef.current.duration || 0;
      audioRef.current.currentTime = (val / 100) * dur;
    }
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    setPlaylists((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        name: newPlaylistName,
        songsCount: 0,
      }
    ]);
    setNewPlaylistName('');
  };

  const handleLikeSong = (songId: string) => {
    setSongs((prev) =>
      prev.map((s) => (s.id === songId ? { ...s, liked: !s.liked } : s))
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#030303] px-4 md:px-6 py-4 flex flex-col justify-between select-none pb-24 relative">
      {/* Real audio element node */}
      <audio
        ref={audioRef}
        src={activeSong.audioUrl}
        onEnded={handleNext}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playlists & Library lists */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xs font-black tracking-widest text-zinc-500 uppercase mb-3.5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              MUSIC LIBRARY & TRACKS
            </h2>
            
            {/* Tracks grid */}
            <div className="space-y-1.5">
              {songs.map((song, idx) => {
                const isActive = currentIndex === idx;
                return (
                  <div
                    key={song.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#101014] border-zinc-800 shadow-lg'
                        : 'bg-zinc-950/40 border-zinc-900/40 hover:bg-zinc-900/20'
                    }`}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsPlaying(true);
                      setProgress(0);
                      setCurrentTime(0);
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        <img src={song.albumArt} alt={song.title} className="w-10 h-10 rounded-lg object-cover" />
                        {isActive && isPlaying && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                            <span className="w-1.5 h-3 bg-white rounded-full animate-bounce mx-0.5" />
                            <span className="w-1.5 h-4.5 bg-white rounded-full animate-bounce mx-0.5 [animation-delay:0.2s]" />
                            <span className="w-1.5 h-2.5 bg-white rounded-full animate-bounce mx-0.5 [animation-delay:0.4s]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 leading-tight">
                        <h4 className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-zinc-300'}`}>{song.title}</h4>
                        <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">{song.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">{song.duration}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikeSong(song.id);
                        }}
                        className="p-1 hover:bg-zinc-900 rounded-full cursor-pointer"
                      >
                        <Heart className={`h-3.5 w-3.5 ${song.liked ? 'fill-red-600 text-red-600' : 'text-zinc-400'}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Playlist Manager */}
          <div className="space-y-4">
            <h2 className="text-xs font-black tracking-widest text-zinc-500 uppercase flex items-center gap-2">
              <ListMusic className="h-4 w-4 text-purple-400" />
              PLAYLIST MANAGER
            </h2>

            <form onSubmit={handleCreatePlaylist} className="flex gap-2.5">
              <input
                type="text"
                placeholder="Create collaborative playlist..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-1.5 text-xs focus:outline-none focus:border-zinc-800 text-white placeholder-zinc-600"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-black uppercase text-white rounded-xl transition-all cursor-pointer flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create</span>
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {playlists.map((pl) => (
                <div key={pl.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl hover:border-zinc-800 transition-all flex flex-col justify-between gap-3 relative group cursor-pointer">
                  <div>
                    <h3 className="text-xs font-bold text-white truncate">{pl.name}</h3>
                    <p className="text-[9px] text-zinc-500 font-semibold uppercase mt-1">{pl.songsCount} songs saved</p>
                  </div>
                  <button className="self-start text-[8px] font-extrabold uppercase px-2 py-0.5 bg-zinc-900 border border-zinc-850/80 rounded hover:bg-zinc-850">
                    Play playlist
                  </button>
                  <button
                    onClick={() => setPlaylists(playlists.filter((p) => p.id !== pl.id))}
                    className="absolute top-3.5 right-3.5 p-1 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Large Album Art Visual Panel takeover sidebar */}
        <div className="bg-[#0b0b0d] border border-zinc-900 p-5 rounded-2xl flex flex-col gap-5 text-center relative overflow-hidden h-fit">
          {/* Parallax blurred gradient backdrops */}
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 -z-10 scale-150 transition-all duration-700"
            style={{ backgroundImage: `url(${activeSong.albumArt})` }}
          />

          <div>
            <span className="text-[8px] font-black uppercase tracking-widest text-purple-400 bg-purple-950/20 px-2 py-0.5 rounded border border-purple-900/20">Now Streaming</span>
          </div>

          {/* 3D album tilt cover frame */}
          <motion.div
            whileHover={{ rotateY: 5, rotateX: -5 }}
            className="relative w-48 h-48 mx-auto rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex-shrink-0"
          >
            <img src={activeSong.albumArt} alt={activeSong.title} className="w-full h-full object-cover" />
            
            {/* Spinning Equalizer Bars */}
            {isPlaying && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-1 px-3 py-1.5 bg-black/60 backdrop-blur rounded-full">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, 18, 4] }}
                    transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-1 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                ))}
              </div>
            )}
          </motion.div>

          <div className="leading-tight">
            <h3 className="text-sm font-black text-white truncate">{activeSong.title}</h3>
            <p className="text-[10px] text-zinc-500 font-semibold mt-1">{activeSong.artist} — {activeSong.album}</p>
          </div>

          {/* Scrolling Synced Lyrics view */}
          <div className="h-28 bg-[#070709] border border-zinc-950 rounded-2xl p-3.5 overflow-hidden flex flex-col justify-center relative">
            <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-[#070709] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#070709] to-transparent z-10 pointer-events-none" />

            <div className="space-y-2 transition-all duration-300">
              {activeSong.lyrics ? (
                <div className="text-center font-medium leading-relaxed">
                  <p className="text-[9px] text-zinc-600 line-clamp-1">{activeSong.lyrics[lyricIndex - 1] || ''}</p>
                  <p className="text-[11px] font-black text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)] line-clamp-1" style={{ color: accentColor }}>
                    {activeSong.lyrics[lyricIndex]}
                  </p>
                  <p className="text-[9px] text-zinc-600 line-clamp-1">{activeSong.lyrics[lyricIndex + 1] || ''}</p>
                </div>
              ) : (
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Karaoke Lyrics Unavailable</p>
              )}
            </div>
          </div>

          {/* Full Player Timeline bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
              <span>{formatTime(currentTime)}</span>
              <span>{activeSong.duration}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleAudioSeek}
              className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer focus:outline-none accent-purple-500"
              style={{ accentColor }}
            />
          </div>

          {/* Controls button panel */}
          <div className="flex justify-center items-center gap-5 text-zinc-400">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-1.5 hover:text-white rounded-full cursor-pointer ${isShuffle ? 'text-purple-400' : ''}`}
            >
              <Shuffle className="h-4 w-4" style={{ color: isShuffle ? accentColor : undefined }} />
            </button>
            <button onClick={handlePrev} className="p-1.5 hover:text-white rounded-full cursor-pointer">
              <SkipBack className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={handlePlayPause}
              className="p-3 bg-white text-black hover:bg-zinc-200 rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer flex-shrink-0"
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
            </button>
            <button onClick={handleNext} className="p-1.5 hover:text-white rounded-full cursor-pointer">
              <SkipForward className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setIsRepeat(isRepeat === 'off' ? 'one' : isRepeat === 'one' ? 'all' : 'off')}
              className={`p-1.5 hover:text-white rounded-full cursor-pointer ${isRepeat !== 'off' ? 'text-purple-400' : ''}`}
            >
              <Repeat className="h-4 w-4" style={{ color: isRepeat !== 'off' ? accentColor : undefined }} />
            </button>
          </div>
        </div>
      </div>

      {/* FIXED BOTTOM MINI PLAYER FOOTER BAR (Always visible overlay when tab changes) */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-md border-t border-zinc-900/80 px-4 md:px-6 py-2.5 flex items-center justify-between z-45">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={activeSong.albumArt}
            alt={activeSong.title}
            className={`w-10 h-10 rounded-full object-cover border border-zinc-800 flex-shrink-0 ${isPlaying ? 'animate-spin [animation-duration:8s]' : ''}`}
          />
          <div className="min-w-0 leading-tight">
            <h4 className="text-[11px] font-extrabold text-white truncate uppercase tracking-tight">{activeSong.title}</h4>
            <p className="text-[9px] text-zinc-500 font-bold truncate mt-0.5">{activeSong.artist}</p>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-4 text-zinc-300">
          <button onClick={handlePrev} className="hover:text-white p-1 rounded-full hover:bg-zinc-900/50 cursor-pointer">
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={handlePlayPause}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-white shadow cursor-pointer"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
          </button>
          <button onClick={handleNext} className="hover:text-white p-1 rounded-full hover:bg-zinc-900/50 cursor-pointer">
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
