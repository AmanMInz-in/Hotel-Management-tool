"use client";

import React from "react";
import { ChefHat, Flame, Volume2, VolumeX, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { UserNav } from "@/components/shared/UserNav";

interface KDSHeaderProps {
  activeCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const KDSHeader: React.FC<KDSHeaderProps> = ({
  activeCount,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-[#181B20] border-b border-[#262A33]">
      <div className="flex items-center space-x-3.5">
        <Link
          href="/"
          className="p-2 text-slate-400 hover:text-white rounded-xl bg-[#0F1115] border border-[#262A33] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.75} />
        </Link>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F1115] border border-[#262A33] flex items-center justify-center text-amber-500">
            <ChefHat className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight">
              Kitchen Display System
            </h1>
            <p className="text-xs text-slate-400">Live Kitchen Queue Stream</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#0F1115] border border-[#262A33] rounded-xl text-xs font-bold text-slate-200">
          <Flame className="w-4 h-4 text-amber-500" strokeWidth={1.75} />
          <span className="tabular-nums">{activeCount} Active Tickets</span>
        </div>

        <button
          onClick={onToggleSound}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors min-h-[38px] ${
            soundEnabled
              ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-400"
              : "bg-[#0F1115] border-[#262A33] text-slate-400"
          }`}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" strokeWidth={1.75} />
          ) : (
            <VolumeX className="w-4 h-4" strokeWidth={1.75} />
          )}
          <span>{soundEnabled ? "Audio ON" : "Muted"}</span>
        </button>

        <UserNav />
      </div>
    </header>
  );
};
