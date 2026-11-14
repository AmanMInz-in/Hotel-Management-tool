"use client";

import React, { useState } from "react";
import { Plus, Minus, MessageSquare, Trash2 } from "lucide-react";
import { CartItem } from "@/hooks/useOrderCart";
import { formatCurrency } from "@/lib/utils";

interface OrderItemRowProps {
  item: CartItem;
  onUpdateQty: (delta: number) => void;
  onUpdateNotes: (notes: string) => void;
  onRemove: () => void;
}

export const OrderItemRow: React.FC<OrderItemRowProps> = ({
  item,
  onUpdateQty,
  onUpdateNotes,
  onRemove,
}) => {
  const [showNoteInput, setShowNoteInput] = useState(Boolean(item.notes));

  return (
    <div className="p-3 bg-[#0F1115] border border-[#262A33] rounded-xl space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                item.isVeg ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <span className="font-bold text-sm text-slate-100">{item.name}</span>
          </div>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            {formatCurrency(item.unitPrice)} each
          </span>
        </div>

        <span className="font-bold text-sm text-slate-200 font-mono tabular-nums">
          {formatCurrency(item.unitPrice * item.quantity)}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setShowNoteInput(!showNoteInput)}
          className={`flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors min-h-[36px] ${
            item.notes
              ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
              : "border-[#262A33] text-slate-400 hover:text-slate-200"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>{item.notes ? "Edit Note" : "+ Kitchen Note"}</span>
        </button>

        <div className="flex items-center space-x-1.5">
          {item.quantity === 1 ? (
            <button
              onClick={onRemove}
              className="w-10 h-10 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-400 flex items-center justify-center hover:bg-rose-950 transition-colors"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.75} />
            </button>
          ) : (
            <button
              onClick={() => onUpdateQty(-1)}
              className="w-10 h-10 rounded-lg bg-[#181B20] border border-[#262A33] text-slate-200 flex items-center justify-center hover:bg-[#22262E] transition-colors"
            >
              <Minus className="w-4 h-4" strokeWidth={1.75} />
            </button>
          )}

          <span className="w-7 text-center font-bold text-sm text-slate-100 tabular-nums">
            {item.quantity}
          </span>

          <button
            onClick={() => onUpdateQty(1)}
            className="w-10 h-10 rounded-lg bg-[#22262E] border border-[#313642] text-slate-100 flex items-center justify-center hover:bg-amber-500 hover:text-slate-950 transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {showNoteInput ? (
        <input
          type="text"
          value={item.notes}
          onChange={(e) => onUpdateNotes(e.target.value)}
          placeholder="e.g. Less spicy, extra sauce..."
          className="w-full px-3 py-2 bg-[#181B20] border border-[#262A33] rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 min-h-[38px]"
        />
      ) : null}
    </div>
  );
};
