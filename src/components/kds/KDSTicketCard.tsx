"use client";

import React, { useEffect, useState } from "react";
import { Clock, CheckCheck, UserCheck } from "lucide-react";
import { OrderDTO, OrderItemDTO, ItemStatus } from "@/types";
import { KDSItemRow } from "./KDSItemRow";
import { formatElapsedTime, getTimerColorClass } from "@/lib/utils";

interface KDSTicketCardProps {
  order: OrderDTO;
  onItemStatusChange: (itemId: string, newStatus: ItemStatus) => void;
  onRequestVoid: (item: OrderItemDTO) => void;
  onBumpTicket: (orderId: string) => void;
}

export const KDSTicketCard: React.FC<KDSTicketCardProps> = ({
  order,
  onItemStatusChange,
  onRequestVoid,
  onBumpTicket,
}) => {
  const [, setTick] = useState(0);

  // Re-render elapsed timer every second
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const diffMs = Date.now() - new Date(order.createdAt).getTime();
  const elapsedMinutes = Math.floor(diffMs / 60000);
  const timerColor = getTimerColorClass(elapsedMinutes);

  const hasAddon = order.items.some((i) => i.isAddon);
  const allReadyOrDone = order.items.every(
    (i) => i.status === "READY_TO_SERVE" || i.status === "SERVED" || i.status === "VOIDED"
  );

  return (
    <div
      id={`kds-ticket-${order.tableNumber}`}
      className="flex flex-col justify-between bg-[#181B20] border border-[#262A33] rounded-2xl overflow-hidden min-h-[320px] transition-all"
    >
      {/* Ticket Header */}
      <div className="p-3.5 bg-[#0F1115] border-b border-[#262A33] flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-slate-100 tabular-nums">
              {order.tableNumber ? `Table ${order.tableNumber}` : "Takeaway"}
            </span>
            {hasAddon ? (
              <span
                id={`kds-addon-badge-${order.tableNumber}`}
                className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40"
              >
                ADD-ON
              </span>
            ) : null}
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
            <span className="font-mono tabular-nums">#{order.orderNumber.slice(-6)}</span>
            <span>•</span>
            <span className="flex items-center">
              <UserCheck className="w-3 h-3 mr-1 text-slate-500" strokeWidth={1.75} />
              {order.waiterName || "Staff"}
            </span>
          </div>
        </div>

        {/* Live Elapsed Timer Badge */}
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold font-mono tabular-nums ${timerColor}`}>
          <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>{formatElapsedTime(order.createdAt)}</span>
        </div>
      </div>

      {/* Ticket Items */}
      <div className="p-3 flex-1 space-y-2 overflow-y-auto max-h-[380px]">
        {order.items.map((item) => (
          <KDSItemRow
            key={item.id}
            item={item}
            onStatusChange={onItemStatusChange}
            onRequestVoid={onRequestVoid}
          />
        ))}
      </div>

      {/* Ticket Footer / Bump Action */}
      <div className="p-3 bg-[#0F1115] border-t border-[#262A33]">
        <button
          id={`kds-bump-btn-${order.tableNumber}`}
          onClick={() => onBumpTicket(order.id)}
          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-colors min-h-[48px] ${
            allReadyOrDone
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-[#22262E] hover:bg-[#2c323d] text-slate-200 border border-[#313642]"
          }`}
        >
          <CheckCheck className="w-4 h-4" strokeWidth={1.75} />
          <span>{allReadyOrDone ? "Bump & Complete Ticket" : "Mark All Ready"}</span>
        </button>
      </div>
    </div>
  );
};
