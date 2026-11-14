"use client";

import React, { useState } from "react";
import { Split, Users, ListFilter } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BillSplitControlsProps {
  grandTotal: number;
  splitCount: number;
  onSplitCountChange: (count: number) => void;
}

export const BillSplitControls: React.FC<BillSplitControlsProps> = ({
  grandTotal,
  splitCount,
  onSplitCountChange,
}) => {
  const [splitMode, setSplitMode] = useState<"equal" | "item_wise">("equal");

  const perPerson = Math.ceil(grandTotal / Math.max(1, splitCount));

  return (
    <div className="bg-[#0F1115] p-3.5 rounded-xl border border-[#262A33] space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
          <Split className="w-3.5 h-3.5 mr-1.5 text-amber-500" strokeWidth={1.75} />
          Bill Splitting
        </label>
        <div className="flex bg-[#181B20] p-0.5 rounded-lg border border-[#262A33] text-xs">
          <button
            type="button"
            onClick={() => setSplitMode("equal")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              splitMode === "equal"
                ? "bg-[#262A33] text-amber-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-3 h-3 inline mr-1" strokeWidth={1.75} />
            Equal
          </button>
          <button
            type="button"
            onClick={() => setSplitMode("item_wise")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              splitMode === "item_wise"
                ? "bg-[#262A33] text-amber-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ListFilter className="w-3 h-3 inline mr-1" strokeWidth={1.75} />
            Item-wise
          </button>
        </div>
      </div>

      {splitMode === "equal" ? (
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-1.5">
            {[1, 2, 3, 4, 5, 6].map((count) => (
              <button
                key={count}
                id={`split-btn-${count}`}
                type="button"
                onClick={() => onSplitCountChange(count)}
                className={`w-10 h-10 rounded-lg font-mono font-bold text-xs transition-all tabular-nums ${
                  splitCount === count
                    ? "bg-amber-500 text-[#0F1115] shadow-sm font-black"
                    : "bg-[#181B20] text-slate-300 hover:text-white border border-[#262A33]"
                }`}
              >
                {count}P
              </button>
            ))}
          </div>
          <div className="text-right shrink-0">
            <span id="split-summary-diners" className="text-xs font-semibold text-slate-400 block">
              {splitCount} {splitCount === 1 ? "Diner" : "Diners"}
            </span>
            <span id="split-summary-amount" className="text-sm font-mono font-bold text-amber-400 tabular-nums">
              {formatCurrency(perPerson)} /ea
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-[#181B20] rounded-lg border border-[#262A33] text-xs text-slate-300">
          <p className="font-semibold text-slate-200">Item-wise Split Mode Active</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Diners settle item-by-item at terminal or scan table QR to pay individual shares.
          </p>
        </div>
      )}
    </div>
  );
};
