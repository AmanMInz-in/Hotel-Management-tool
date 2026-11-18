"use client";

import React from "react";
import { ArrowLeft, Wifi, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface MobileAppBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  roleBadge?: string;
  rightAction?: React.ReactNode;
}

export const MobileAppBar: React.FC<MobileAppBarProps> = ({
  title,
  subtitle,
  onBack,
  showBack = false,
  roleBadge,
  rightAction,
}) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-40 h-14 bg-[#181B20]/95 backdrop-blur-md border-b border-[#262A33] px-3.5 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center space-x-2.5 overflow-hidden">
        {showBack && (
          <button
            onClick={onBack || (() => router.back())}
            aria-label="Go back"
            className="w-10 h-10 rounded-full bg-[#0F1115] border border-[#262A33] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all shrink-0"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.75} />
          </button>
        )}
        <div className="overflow-hidden">
          <h1 className="text-sm font-bold text-slate-100 truncate tracking-tight flex items-center">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-slate-400 font-medium truncate leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {/* Live POS Sync Dot */}
        <div className="flex items-center space-x-1.5 px-2 py-1 rounded-full bg-[#0F1115] border border-[#262A33] text-[10px] font-bold text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden xs:inline">Online</span>
        </div>

        {/* Role Tag */}
        {roleBadge && (
          <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
            {roleBadge}
          </span>
        )}

        {/* Custom Action or Quick Logout */}
        {rightAction ? (
          rightAction
        ) : (
          <button
            onClick={handleLogout}
            title="Sign out of terminal"
            className="w-9 h-9 rounded-full bg-[#0F1115] border border-[#262A33] flex items-center justify-center text-slate-400 hover:text-rose-400 active:scale-95 transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
          </button>
        )}
      </div>
    </header>
  );
};
