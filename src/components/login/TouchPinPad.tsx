"use client";

import React from "react";
import { Delete } from "lucide-react";

interface TouchPinPadProps {
  pin: string;
  onKey: (n: string) => void;
  onClear: () => void;
  onBackspace: () => void;
}

export const TouchPinPad: React.FC<TouchPinPadProps> = ({
  pin,
  onKey,
  onClear,
  onBackspace,
}) => {
  return (
    <div className="space-y-4">
      {/* PIN indicator dots */}
      <div className="flex justify-center items-center space-x-3 py-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full border transition-all ${
              i < pin.length
                ? "bg-amber-500 border-amber-400 scale-110"
                : "border-[#262A33] bg-[#0F1115]"
            }`}
          />
        ))}
      </div>

      {/* Numeric Keypad */}
      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
          <button
            key={n}
            onClick={() => onKey(n)}
            className="h-12 rounded-xl bg-[#0F1115] hover:bg-[#22262E] border border-[#262A33] text-lg font-bold text-slate-100 tabular-nums transition-colors min-h-[48px]"
          >
            {n}
          </button>
        ))}
        <button
          onClick={onClear}
          className="h-12 rounded-xl bg-[#0F1115] hover:bg-[#22262E] border border-[#262A33] text-xs text-slate-400 font-bold uppercase transition-colors min-h-[48px]"
        >
          Clear
        </button>
        <button
          onClick={() => onKey("0")}
          className="h-12 rounded-xl bg-[#0F1115] hover:bg-[#22262E] border border-[#262A33] text-lg font-bold text-slate-100 tabular-nums transition-colors min-h-[48px]"
        >
          0
        </button>
        <button
          onClick={onBackspace}
          className="h-12 rounded-xl bg-[#0F1115] hover:bg-[#22262E] border border-[#262A33] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors min-h-[48px]"
        >
          <Delete className="w-5 h-5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
};
