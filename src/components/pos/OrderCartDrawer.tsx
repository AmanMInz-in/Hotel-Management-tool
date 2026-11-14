"use client";

import React from "react";
import { Send, ShoppingBag, AlertCircle, FileText } from "lucide-react";
import { useOrderCart } from "@/hooks/useOrderCart";
import { OrderItemRow } from "./OrderItemRow";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

interface OrderCartDrawerProps {
  tableNumber: string;
  isAddon?: boolean;
  activeRound?: number;
  onSendToKitchen: () => void;
  isLoading?: boolean;
}

export const OrderCartDrawer: React.FC<OrderCartDrawerProps> = ({
  tableNumber,
  isAddon = false,
  activeRound = 1,
  onSendToKitchen,
  isLoading = false,
}) => {
  const {
    items,
    removeItem,
    updateQuantity,
    updateItemNotes,
    orderNotes,
    setOrderNotes,
    getSubtotal,
    clearCart,
  } = useOrderCart();

  const subtotal = getSubtotal();

  return (
    <div className="flex flex-col h-full bg-[#181B20] border-l border-[#262A33] p-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#262A33]">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-100 tabular-nums">Table {tableNumber}</h2>
            {isAddon ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                Round {activeRound}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-400">
            {items.length} {items.length === 1 ? "dish" : "dishes"} in order
          </p>
        </div>

        {items.length > 0 ? (
          <button
            onClick={clearCart}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 transition-colors"
          >
            Clear All
          </button>
        ) : null}
      </div>

      {/* Cart Item List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 space-y-2">
            <ShoppingBag className="w-9 h-9 text-slate-600" strokeWidth={1.75} />
            <p className="text-sm font-semibold text-slate-400">Cart is empty</p>
            <p className="text-xs text-slate-500">Tap dishes from the floor menu</p>
          </div>
        ) : (
          items.map((item) => (
            <OrderItemRow
              key={item.menuItemId}
              item={item}
              onRemove={() => removeItem(item.menuItemId)}
              onUpdateQty={(delta) => updateQuantity(item.menuItemId, delta)}
              onUpdateNotes={(notes) => updateItemNotes(item.menuItemId, notes)}
            />
          ))
        )}
      </div>

      {/* Cart Footer */}
      <div className="pt-3 border-t border-[#262A33] space-y-3">
        {items.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <FileText className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
              <span>Ticket Kitchen Note:</span>
            </div>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. Rush order, serve starters first..."
              className="w-full px-3 py-2 bg-[#0F1115] border border-[#262A33] rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 min-h-[38px]"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-400">Order Subtotal</span>
          <span className="text-xl font-bold text-slate-100 font-mono tabular-nums">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {isAddon ? (
          <div className="flex items-center space-x-2 p-2 bg-amber-950/30 border border-amber-800/30 rounded-xl text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" strokeWidth={1.75} />
            <span>Incremental add-on items flagged for kitchen queue.</span>
          </div>
        ) : null}

        <Button
          onClick={onSendToKitchen}
          disabled={items.length === 0 || isLoading}
          isLoading={isLoading}
          variant="primary"
          className="w-full text-sm font-black shadow-sm"
        >
          <Send className="w-4 h-4 mr-2" strokeWidth={1.75} />
          {isAddon ? `Fire Add-on Round ${activeRound} to Kitchen` : "Send Order to Kitchen"}
        </Button>
      </div>
    </div>
  );
};
