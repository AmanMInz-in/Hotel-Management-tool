"use client";

import React from "react";
import { Check, Clock, AlertTriangle, ShieldX } from "lucide-react";
import { OrderItemDTO, ItemStatus } from "@/types";

interface KDSItemRowProps {
  item: OrderItemDTO;
  onStatusChange: (itemId: string, newStatus: ItemStatus) => void;
  onRequestVoid: (item: OrderItemDTO) => void;
}

export const KDSItemRow: React.FC<KDSItemRowProps> = ({
  item,
  onStatusChange,
  onRequestVoid,
}) => {
  const getNextStatus = (current: ItemStatus): ItemStatus | null => {
    if (current === "PENDING") return "PREPARING";
    if (current === "PREPARING") return "READY_TO_SERVE";
    return null;
  };

  const nextStatus = getNextStatus(item.status);

  const statusConfig = {
    PENDING: { label: "Pending", bg: "bg-[#0F1115] text-slate-400 border-[#262A33]" },
    PREPARING: { label: "Cooking", bg: "bg-amber-950/70 text-amber-300 border-amber-600/40" },
    READY_TO_SERVE: { label: "Ready to Serve", bg: "bg-emerald-950/70 text-emerald-300 border-emerald-500/50" },
    SERVED: { label: "Served", bg: "bg-[#0F1115] text-slate-500 border-[#262A33] line-through" },
    VOIDED: { label: "Voided", bg: "bg-rose-950/50 text-rose-400 border-rose-900/40 line-through" },
  }[item.status];

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        item.status === "VOIDED"
          ? "bg-[#0F1115]/50 border-rose-900/30 opacity-60"
          : "bg-[#0F1115] border-[#262A33] hover:border-slate-600"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <span className="w-8 h-8 rounded-md bg-[#181B20] border border-[#262A33] flex items-center justify-center font-mono font-bold text-amber-400 text-sm tabular-nums">
            {item.quantity}x
          </span>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-100 text-sm">{item.menuItemName}</span>
              {item.isAddon ? (
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-[#0F1115]">
                  Round {item.roundNumber}
                </span>
              ) : null}
            </div>
            {item.notes ? (
              <p className="text-xs text-amber-300/90 flex items-center mt-1">
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400 shrink-0" strokeWidth={1.75} />
                <span>{item.notes}</span>
              </p>
            ) : null}
          </div>
        </div>

        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${statusConfig.bg}`}>
          {statusConfig.label}
        </span>
      </div>

      {item.status !== "SERVED" && item.status !== "VOIDED" ? (
        <div className="flex items-center justify-end space-x-2 mt-2.5 pt-2 border-t border-[#262A33]">
          <button
            onClick={() => onRequestVoid(item)}
            className="flex items-center space-x-1 min-h-[38px] px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg border border-rose-900/40 transition-colors"
          >
            <ShieldX className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Void</span>
          </button>

          {nextStatus ? (
            <button
              id={`kds-status-btn-${(item.menuItemName || item.id).toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              onClick={() => onStatusChange(item.id, nextStatus)}
              className={`flex items-center space-x-1.5 min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                nextStatus === "PREPARING"
                  ? "bg-amber-500 hover:bg-amber-400 text-[#0F1115]"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {nextStatus === "PREPARING" ? (
                <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
              ) : (
                <Check className="w-3.5 h-3.5" strokeWidth={1.75} />
              )}
              <span>Mark {nextStatus === "PREPARING" ? "Cooking" : "Ready"}</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
