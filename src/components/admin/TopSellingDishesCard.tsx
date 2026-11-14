"use client";

import React from "react";
import { Flame, Trophy } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TopDish {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

interface TopSellingDishesCardProps {
  dishes?: TopDish[];
}

export const TopSellingDishesCard: React.FC<TopSellingDishesCardProps> = ({ dishes = [] }) => {
  return (
    <div className="p-4 sm:p-5 bg-[#181B20] border border-[#262A33] rounded-2xl space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#262A33]">
        <h3 className="text-sm font-bold text-slate-100 flex items-center">
          <Trophy className="w-4 h-4 mr-2 text-amber-500" strokeWidth={1.75} />
          Top-Selling Dishes
        </h3>
        <span className="text-[11px] font-semibold text-slate-400 flex items-center">
          <Flame className="w-3.5 h-3.5 mr-1 text-amber-500" strokeWidth={1.75} />
          By Volume
        </span>
      </div>

      <div id="top-selling-dishes-list" className="divide-y divide-[#262A33]">
        {dishes.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No dish sales recorded today.</p>
        ) : (
          dishes.map((dish, index) => (
            <div key={dish.id || index} className="py-2.5 flex items-center justify-between text-sm">
              <div className="flex items-center space-x-3">
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs tabular-nums ${
                    index === 0
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-[#22262E] text-slate-400 border border-[#262A33]"
                  }`}
                >
                  {index + 1}
                </span>
                <div>
                  <span className="font-bold text-slate-200 block">{dish.name}</span>
                  <span className="text-xs text-slate-400 tabular-nums">{dish.quantity} orders</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-emerald-400 block tabular-nums">
                  {formatCurrency(dish.revenue)}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Gross</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
