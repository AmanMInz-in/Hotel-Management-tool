"use client";

import React from "react";
import { ShieldX, Flame } from "lucide-react";
import { OrderItemDTO } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface ActiveOrderItemsListProps {
  items: OrderItemDTO[];
  subtotal: number;
  onVoidItem: (item: OrderItemDTO) => void;
}

export const ActiveOrderItemsList: React.FC<ActiveOrderItemsListProps> = ({
  items,
  subtotal,
  onVoidItem,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PREPARING":
        return "bg-amber-950/60 text-amber-400 border-amber-500/30";
      case "READY_TO_SERVE":
        return "bg-emerald-950/60 text-emerald-400 border-emerald-500/30";
      case "SERVED":
        return "bg-[#0F1115] text-slate-400 border-[#262A33]";
      case "VOIDED":
        return "bg-rose-950/60 text-rose-400 line-through border-rose-800/40";
      default:
        return "bg-[#22262E] text-slate-300 border-[#313642]";
    }
  };

  return (
    <div className="bg-[#181B20] border-b border-[#262A33] px-4 py-2.5 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-amber-500" strokeWidth={1.75} />
          <span className="font-bold text-slate-200">Active Dishes in Kitchen</span>
          <span className="text-[10px] text-slate-400 bg-[#0F1115] px-2 py-0.5 rounded-full border border-[#262A33] tabular-nums">
            {items.filter((i) => i.status !== "VOIDED").length} active
          </span>
        </div>
        <span className="font-bold text-emerald-400 text-xs font-mono tabular-nums">
          Current Total: {formatCurrency(subtotal)}
        </span>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {items.map((it) => (
          <div
            key={it.id}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all ${
              it.status === "VOIDED"
                ? "opacity-50 bg-[#0F1115] border-[#262A33]"
                : "bg-[#0F1115] border-[#262A33]"
            }`}
          >
            <span className="font-bold text-slate-100 tabular-nums">{it.quantity}x</span>
            <span className={it.status === "VOIDED" ? "line-through text-slate-500" : "text-slate-200"}>
              {it.menuItemName}
            </span>

            {it.isAddon && (
              <span className="text-[9px] font-bold uppercase px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 tabular-nums">
                R{it.roundNumber}
              </span>
            )}

            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${getStatusBadge(it.status)}`}>
              {it.status.replace("_", " ")}
            </span>

            {it.status !== "VOIDED" && (
              <button
                type="button"
                onClick={() => onVoidItem(it)}
                title={it.status === "PREPARING" ? "Requires Admin PIN" : "Cancel item"}
                className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
              >
                <ShieldX className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
