"use client";

import React from "react";
import { LogOut, UserCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const UserNav: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const roleBadgeColor = {
    ADMIN: "bg-amber-950/60 text-amber-400 border-amber-500/30",
    WAITER: "bg-[#22262E] text-slate-300 border-[#313642]",
    KITCHEN: "bg-sky-950/60 text-sky-400 border-sky-500/30",
  }[user.role];

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#181B20] border border-[#262A33] rounded-xl text-xs">
        <UserCheck className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
        <span className="font-bold text-slate-200">{user.name}</span>
        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${roleBadgeColor}`}>
          {user.role}
        </span>
      </div>

      <button
        onClick={logout}
        title="Sign Out"
        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-[#181B20] rounded-xl border border-transparent hover:border-[#262A33] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
      >
        <LogOut className="w-4 h-4" strokeWidth={1.75} />
      </button>
    </div>
  );
};
