import React from 'react';
import { Home, Compass, Film, Radio, Music, Award, Store, Users, Layers, Clock, Heart, Sliders, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { INITIAL_CREATORS } from '../mockData';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  accentColor: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, accentColor }) => {
  const mainNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'shorts', label: 'Shorts', icon: Film, isPulse: true },
    { id: 'live', label: 'Live Stream', icon: Radio, liveDot: true },
    { id: 'music', label: 'Utube Music', icon: Music },
  ];

  const businessNavItems = [
    { id: 'dashboard', label: 'Creator Hub', icon: Sliders },
    { id: 'affiliate', label: 'Affiliate Network', icon: Award },
    { id: 'store', label: 'Utube Store', icon: Store },
  ];

  const libraryItems = [
    { id: 'history', label: 'History', icon: Clock },
    { id: 'playlists', label: 'My Playlists', icon: Layers },
  ];

  return (
    <aside className="w-16 md:w-56 bg-black flex-shrink-0 border-r border-zinc-900 flex flex-col justify-between py-4 select-none">
      <div className="space-y-4">
        {/* Main Navigation */}
        <div className="px-2 md:px-3 space-y-1">
          <span className="hidden md:block text-[8px] font-black uppercase text-zinc-500 tracking-wider mb-2 pl-3">Navigation</span>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex flex-col md:flex-row items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <div className="relative">
                  <Icon className="h-4.5 w-4.5" style={{ color: isActive ? accentColor : undefined }} />
                  {item.liveDot && (
                    <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  )}
                  {item.isPulse && !isActive && (
                    <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  )}
                </div>
                <span className="text-[9px] md:text-xs tracking-tight md:tracking-normal">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Business & Affiliate Hub */}
        <div className="px-2 md:px-3 space-y-1 border-t border-zinc-950 pt-4">
          <span className="hidden md:block text-[8px] font-black uppercase text-zinc-500 tracking-wider mb-2 pl-3">Ecosystem</span>
          {businessNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex flex-col md:flex-row items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <Icon className="h-4.5 w-4.5" style={{ color: isActive ? accentColor : undefined }} />
                <span className="text-[9px] md:text-xs tracking-tight md:tracking-normal">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Library Navigation */}
        <div className="px-2 md:px-3 space-y-1 border-t border-zinc-950 pt-4 hidden md:block">
          <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider mb-2 pl-3">Library</span>
          {libraryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <Icon className="h-4.5 w-4.5" style={{ color: isActive ? accentColor : undefined }} />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Subscriptions */}
        <div className="px-3 border-t border-zinc-950 pt-4 hidden md:block">
          <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider mb-2.5 pl-3">Subscriptions</span>
          <div className="space-y-2">
            {INITIAL_CREATORS.map((creator) => (
              <div
                key={creator.id}
                className="flex items-center justify-between px-3 py-1 hover:bg-zinc-900/40 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-5.5 h-5.5 rounded-full object-cover"
                    />
                    {creator.isLive && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-red-500 border border-black animate-pulse"></span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-zinc-400 group-hover:text-white truncate max-w-[100px]">
                    {creator.name}
                  </span>
                </div>
                {creator.isLive && (
                  <span className="text-[7px] font-bold text-red-500 tracking-wider uppercase border border-red-500/20 px-1 rounded animate-pulse">Live</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Network Status indicator / PWA compliance */}
      <div className="px-4 py-2 text-[8px] text-zinc-600 font-mono hidden md:flex flex-col gap-0.5 border-t border-zinc-950">
        <div className="flex items-center gap-1">
          <span className="h-1 w-1 bg-emerald-500 rounded-full animate-ping"></span>
          <span>STAKING NODE ACTIVE</span>
        </div>
        <div>UTUBE PROTOCOL v2.5</div>
      </div>
    </aside>
  );
};
