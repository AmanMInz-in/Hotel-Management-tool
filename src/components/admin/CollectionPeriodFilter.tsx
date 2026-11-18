"use client";

import React from "react";
import { Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type CollectionPeriod = "day" | "week" | "month" | "all";

interface CollectionPeriodFilterProps {
  selectedPeriod: CollectionPeriod;
  onSelectPeriod: (period: CollectionPeriod) => void;
  isExporting: boolean;
  onExportCsv: () => void;
}

export const CollectionPeriodFilter: React.FC<CollectionPeriodFilterProps> = ({
  selectedPeriod,
  onSelectPeriod,
  isExporting,
  onExportCsv,
}) => {
  const periods: { id: CollectionPeriod; label: string; sub: string }[] = [
    { id: "day", label: "Today", sub: "Day" },
    { id: "week", label: "This Week", sub: "7 Days" },
    { id: "month", label: "This Month", sub: "30 Days" },
    { id: "all", label: "All Time", sub: "Historical" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-[#181B20] border border-[#262A33] rounded-2xl">
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
        <div className="hidden sm:flex items-center text-xs font-semibold text-slate-400 mr-2 pl-1">
          <Calendar className="w-4 h-4 mr-1.5 text-amber-500" strokeWidth={1.75} />
          <span>Period:</span>
        </div>
        {periods.map((p) => {
          const isActive = selectedPeriod === p.id;
          return (
            <button
              key={p.id}
              id={`period-btn-${p.id}`}
              type="button"
              onClick={() => onSelectPeriod(p.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center space-x-1.5 shrink-0 ${
                isActive
                  ? "bg-amber-500 text-[#0F1115] shadow-sm font-black"
                  : "bg-[#0F1115] text-slate-300 hover:text-white border border-[#262A33] hover:border-slate-600"
              }`}
            >
              <span>{p.label}</span>
              <span className={`text-[10px] uppercase font-semibold ${isActive ? "text-[#0F1115]/80" : "text-slate-500"}`}>
                ({p.sub})
              </span>
            </button>
          );
        })}
      </div>

      <Button
        id="download-csv-btn"
        variant="secondary"
        onClick={onExportCsv}
        disabled={isExporting}
        isLoading={isExporting}
        className="min-h-[44px] text-xs font-bold shrink-0 border-[#262A33] hover:border-amber-500/50 hover:text-amber-400"
      >
        <Download className="w-4 h-4 mr-2 text-amber-500" strokeWidth={1.75} />
        <span>Export CSV ({selectedPeriod.toUpperCase()})</span>
      </Button>
    </div>
  );
};
