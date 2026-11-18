"use client";

import React from "react";
import { Plus } from "lucide-react";
import { MenuItemDTO } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface MenuItemCardProps {
  item: MenuItemDTO;
  onAdd: (item: MenuItemDTO) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAdd }) => {
  return (
    <div
      onClick={() => item.isAvailable && onAdd(item)}
      className={`relative flex flex-col justify-between p-3.5 bg-[#181B20] border border-[#262A33] rounded-2xl transition-all duration-100 select-none min-h-[120px] ${
        item.isAvailable
          ? "cursor-pointer hover:border-slate-600 active:scale-[0.98]"
          : "opacity-40 cursor-not-allowed border-rose-900/30"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          {/* Veg / Non-veg symbol */}
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded border ${
                item.isVeg ? "border-emerald-500" : "border-rose-500"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  item.isVeg ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
            </span>
            <span className="font-bold text-slate-100 text-sm leading-snug line-clamp-1">
              {item.name}
            </span>
          </div>

          {!item.isAvailable ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/40">
              86&apos;d
            </span>
          ) : null}
        </div>

        {item.description ? (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#262A33]">
        <span className="text-sm font-bold text-slate-100 font-mono tabular-nums">
          {formatCurrency(item.price)}
        </span>

        {item.isAvailable ? (
          <button
            id={`add-item-btn-${item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
            type="button"
            className="flex items-center justify-center w-9 h-9 min-h-[36px] min-w-[36px] rounded-xl bg-[#22262E] hover:bg-amber-500 hover:text-slate-950 text-amber-400 active:scale-90 border border-[#313642] transition-all"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
          </button>
        ) : null}
      </div>
    </div>
  );
};
