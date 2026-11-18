"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxHeight = "max-h-[90dvh]",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-Up Bottom Sheet Card */}
      <div
        className={`relative z-10 w-full max-w-lg bg-[#181B20] border-t sm:border border-[#262A33] rounded-t-[28px] sm:rounded-[28px] ${maxHeight} flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200 overflow-hidden pb-safe`}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Drag Handle Bar for Thumb Gestures */}
        <div className="pt-2.5 pb-1 flex justify-center shrink-0 cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1.5 rounded-full bg-slate-600/70" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3 border-b border-[#262A33] flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-100 tracking-tight">{title}</h3>
            {description && (
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close sheet"
            className="w-9 h-9 rounded-full bg-[#0F1115] border border-[#262A33] flex items-center justify-center text-slate-400 hover:text-slate-200 active:scale-95 transition-all ml-3 shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Scrollable Sheet Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
