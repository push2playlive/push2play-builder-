import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface StakingRewardsCardProps {
  accentColor: string;
  stakedAmount: number;
  stakingRewards: number;
  stakingTarget: number;
  onClaimRewards: () => void;
}

export const StakingRewardsCard: React.FC<StakingRewardsCardProps> = ({
  accentColor,
  stakedAmount,
  stakingRewards,
  stakingTarget,
  onClaimRewards,
}) => {
  const yieldSpeed = stakedAmount > 0 ? (stakedAmount / 500) * 0.5 : 0;
  const progressPercent = Math.min(100, Math.round((stakingRewards / stakingTarget) * 100));

  return (
    <div className="bg-[#111113] p-3 rounded-lg border border-gray-800 space-y-2.5">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" style={{ color: accentColor }} />
            CURRENT STAKING REWARDS
          </h3>
          <p className="text-[8px] text-zinc-500 leading-none">Real-time yields generated from active nodes</p>
        </div>
        <span className="text-zinc-400 font-mono text-[8px] bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800/80">
          Yield Speed:{" "}
          <span className="text-amber-500 font-bold" style={{ color: accentColor }}>
            {stakedAmount > 0 ? `+${yieldSpeed.toFixed(2)} PPL/s` : "0.00 PPL/s"}
          </span>
        </span>
      </div>

      <div className="space-y-1 bg-zinc-900/40 p-2.5 rounded border border-gray-800/40">
        <div className="flex justify-between items-end text-[8px]">
          <span className="text-zinc-400 uppercase">UNCLAIMED BALANCE:</span>
          <span className="font-extrabold text-white text-[10px] flex items-center gap-1">
            <span className="text-amber-500 font-black text-xs" style={{ color: accentColor }}>
              {stakingRewards.toFixed(2)}
            </span>
            <span className="text-zinc-500 text-[8px]">/ {stakingTarget} PPL</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-2 bg-zinc-800 rounded-full overflow-hidden mt-1.5 border border-zinc-800/20">
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            style={{
              backgroundColor: accentColor,
              backgroundImage: `linear-gradient(to right, ${accentColor}bb, ${accentColor})`,
            }}
          />
        </div>

        <div className="flex justify-between text-[7px] text-zinc-500 mt-1">
          <span>0 PPL</span>
          <span>{progressPercent}% toward milestone</span>
          <span>{stakingTarget} PPL</span>
        </div>
      </div>

      <button
        onClick={onClaimRewards}
        disabled={stakingRewards < 1.0}
        className="w-full bg-emerald-500 text-black py-1.5 rounded font-bold uppercase text-[8px] transition-all hover:scale-[1.01] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1 cursor-pointer"
      >
        {stakingRewards < 1.0 ? "Minimum 1.0 PPL to claim" : `Claim ${Math.floor(stakingRewards)} PPL Rewards`}
      </button>
    </div>
  );
};
