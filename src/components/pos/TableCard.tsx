"use client";

import React from "react";
import { Users, Clock, Receipt } from "lucide-react";
import { RestaurantTableDTO } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatElapsedTime } from "@/lib/utils";

interface TableCardProps {
  table: RestaurantTableDTO;
  onClick: (table: RestaurantTableDTO) => void;
}

export const TableCard: React.FC<TableCardProps> = ({ table, onClick }) => {
  const statusBadgeVariant = {
    AVAILABLE: "available" as const,
    OCCUPIED: "occupied" as const,
    BILL_REQUESTED: "bill" as const,
    CLEANING: "cleaning" as const,
  }[table.status];

  const statusBorderColor = {
    AVAILABLE: "hover:border-emerald-500/50 border-[#262A33]",
    OCCUPIED: "border-amber-500/40 hover:border-amber-500/70",
    BILL_REQUESTED: "border-rose-500/50 hover:border-rose-500",
    CLEANING: "border-sky-500/40 hover:border-sky-500/70",
  }[table.status];

  return (
    <div
      id={`table-card-${table.tableNumber}`}
      onClick={() => onClick(table)}
      className={`relative flex flex-col justify-between p-4 bg-[#181B20] border rounded-2xl cursor-pointer select-none transition-all active:scale-[0.98] min-h-[140px] ${statusBorderColor}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-2xl font-black text-slate-100 tracking-tight tabular-nums">
            {table.tableNumber}
          </span>
          <span className="block text-xs font-semibold text-slate-400">
            {table.sectionName || "Dining"}
          </span>
        </div>
        <Badge variant={statusBadgeVariant}>{table.status.replace("_", " ")}</Badge>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-[#262A33]">
        <div className="flex items-center space-x-1">
          <Users className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
          <span className="tabular-nums">{table.capacity} Seats</span>
        </div>

        {table.activeOrder ? (
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center space-x-1 text-slate-300 font-mono tabular-nums">
              <Clock className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.75} />
              <span>{formatElapsedTime(table.activeOrder.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1 font-bold text-emerald-400 font-mono tabular-nums">
              <Receipt className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{formatCurrency(table.activeOrder.subtotal)}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
