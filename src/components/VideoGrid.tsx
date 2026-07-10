import React, { useState } from 'react';
import { Eye, Clock, CheckCircle2, MoreVertical, Bookmark, Share2, EyeOff, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Video } from '../types';

interface VideoGridProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
  accentColor: string;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onSaveToWatchLater?: (video: Video) => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  onSelectVideo,
  accentColor,
  selectedCategory,
  onSelectCategory,
  onSaveToWatchLater,
}) => {
  const categories = ['All', 'Music', 'Live', 'Tech', 'Sci-Fi', 'Relax', 'Art'];
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredVideos = videos.filter((video) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Live') return video.isLive;
    return video.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#030303] px-4 md:px-6 py-4 space-y-5">
      {/* Scrollable category pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid List */}
      {filteredVideos.length === 0 ? (
        <div className="h-[40vh] flex flex-col items-center justify-center text-zinc-500 space-y-2">
          <EyeOff className="h-10 w-10 text-zinc-600 animate-pulse" />
          <p className="text-sm font-semibold">No streams matching this segment</p>
          <span className="text-[10px] text-zinc-700">Select another filter or type search term above</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {filteredVideos.map((video) => {
            const isHovered = hoveredVideoId === video.id;
            const isMenuOpen = activeMenuId === video.id;

            return (
              <motion.div
                key={video.id}
                layoutId={`video-card-${video.id}`}
                className="group flex flex-col bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-900 hover:border-zinc-800 shadow-xl relative transition-all"
                onMouseEnter={() => setHoveredVideoId(video.id)}
                onMouseLeave={() => {
                  setHoveredVideoId(null);
                  setActiveMenuId(null);
                }}
              >
                {/* Thumbnail / Video Preview Player */}
                <div
                  onClick={() => onSelectVideo(video)}
                  className="relative aspect-video w-full overflow-hidden bg-black cursor-pointer"
                >
                  {isHovered ? (
                    <video
                      src={video.videoUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover scale-102 transition-transform duration-500"
                    />
                  ) : (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* Badges Overlays */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {video.isLive ? (
                      <span className="bg-red-600 text-white font-extrabold text-[8px] uppercase px-1.5 py-0.5 rounded flex items-center gap-1 shadow-md animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        LIVE
                      </span>
                    ) : null}
                  </div>

                  <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded font-mono text-[9px] font-bold text-white shadow">
                    {video.duration}
                  </span>
                </div>

                {/* Card Info Area */}
                <div className="p-3.5 flex gap-3 items-start relative">
                  {/* Overlap Avatar */}
                  <img
                    src={video.creator.avatar}
                    alt={video.creator.name}
                    className="w-8 h-8 rounded-full border border-zinc-800 object-cover flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  {/* Metadata */}
                  <div className="flex-1 min-w-0 pr-4">
                    <h3
                      onClick={() => onSelectVideo(video)}
                      className="text-xs font-bold text-white line-clamp-2 leading-tight cursor-pointer hover:text-zinc-300"
                    >
                      {video.title}
                    </h3>

                    <div className="mt-1.5 flex flex-col gap-0.5">
                      <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                        {video.creator.name}
                        {video.creator.isVerified && (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400 fill-emerald-400/10" />
                        )}
                      </span>

                      <div className="flex items-center text-[9px] text-zinc-500 font-medium">
                        <span>
                          {video.isLive
                            ? `${(video.viewerCount || 1000).toLocaleString()} watching`
                            : `${video.views >= 1000000 ? (video.views / 1000000).toFixed(1) + 'M' : video.views.toLocaleString()} views`}
                        </span>
                        <span className="mx-1">•</span>
                        <span>{video.uploadedAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Three dot action menu */}
                  <div className="absolute right-1.5 top-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : video.id);
                      }}
                      className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>

                    {/* Dropdown item */}
                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 mt-1 w-36 bg-[#0d0d0f] border border-zinc-800 rounded-xl shadow-2xl p-1 z-20"
                        >
                          <button
                            onClick={() => {
                              onSaveToWatchLater?.(video);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-[10px] text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg cursor-pointer"
                          >
                            <Bookmark className="h-3 w-3" />
                            <span>Save Watch Later</span>
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`https://utube-media.app/watch?v=${video.id}`);
                              alert('Video link copied to clipboard!');
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-[10px] text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg cursor-pointer"
                          >
                            <Share2 className="h-3 w-3" />
                            <span>Share Stream</span>
                          </button>
                          <button
                            onClick={() => {
                              alert('We will customize recommendations to show fewer videos like this.');
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-[10px] text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg cursor-pointer"
                          >
                            <EyeOff className="h-3 w-3" />
                            <span>Not Interested</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Watch Progress simulated bar (if partially watched) */}
                {video.id === 'v1' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                    <div className="h-full bg-red-600 w-1/3" style={{ backgroundColor: accentColor }}></div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
