"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Search } from "lucide-react";
import { CategoryDTO, MenuItemDTO, RestaurantTableDTO, OrderItemDTO } from "@/types";
import { CategoryNav } from "@/components/pos/CategoryNav";
import { MenuItemCard } from "@/components/pos/MenuItemCard";
import { OrderCartDrawer } from "@/components/pos/OrderCartDrawer";
import { ActiveOrderItemsList } from "@/components/pos/ActiveOrderItemsList";
import { VoidAuthModal } from "@/components/pos/VoidAuthModal";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { MobileAppBar } from "@/components/shared/MobileAppBar";
import { useOrderCart } from "@/hooks/useOrderCart";
import { formatCurrency } from "@/lib/utils";

export default function OrderEntryPage() {
  const router = useRouter();
  const { tableId } = useParams() as { tableId: string };

  const [table, setTable] = useState<RestaurantTableDTO | null>(null);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [voidTarget, setVoidTarget] = useState<OrderItemDTO | null>(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const { items: cartItems, addItem, clearCart, orderNotes, getSubtotal } = useOrderCart();

  const loadData = useCallback(async () => {
    try {
      const [tRes, mRes] = await Promise.all([fetch("/api/tables"), fetch("/api/menu/categories")]);
      const [tData, mData] = await Promise.all([tRes.json(), mRes.json()]);
      const found = tData.tables?.find((t: RestaurantTableDTO) => t.id === tableId);
      if (found) setTable(found);
      if (mData.categories) setCategories(mData.categories);
    } catch (e) {
      console.error(e);
    }
  }, [tableId]);

  useEffect(() => { loadData(); }, [loadData]);

  const allItems = useMemo(() => categories.flatMap((c) => c.items || []), [categories]);
  const filteredItems = useMemo(() => {
    let list = selectedCategoryId === "ALL" ? allItems : allItems.filter((i) => i.categoryId === selectedCategoryId);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    return list;
  }, [allItems, selectedCategoryId, searchQuery]);

  const isAddon = Boolean(table?.activeOrder);
  const activeRound = isAddon ? (table?.activeOrder?.items?.reduce((m, i) => Math.max(m, i.roundNumber), 1) || 1) + 1 : 1;

  const handleSendToKitchen = async () => {
    if (cartItems.length === 0) return;
    setSubmitting(true);
    try {
      const url = isAddon && table?.activeOrder ? `/api/orders/${table.activeOrder.id}/add-ons` : "/api/orders";
      const body = isAddon && table?.activeOrder ? { items: cartItems } : { tableId, items: cartItems, orderNotes };
      await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      clearCart();
      setMobileCartOpen(false);
      router.push("/pos");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmVoid = async (itemId: string, pin: string, reason: string) => {
    const res = await fetch(`/api/orders/items/${itemId}/void`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, reason }),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Void failed");
    loadData();
  };

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-[100dvh] bg-[#0F1115] flex flex-col lg:flex-row h-screen overflow-hidden">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <MobileAppBar
          title={table ? `Table ${table.tableNumber}` : "Order Terminal"}
          subtitle={isAddon ? `Add-on Round ${activeRound}` : "New Order"}
          showBack={true}
          onBack={() => router.push("/pos")}
          roleBadge={isAddon ? `R${activeRound}` : "New"}
        />

        <div className="p-3 bg-[#181B20] border-b border-[#262A33] space-y-2 shrink-0">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" strokeWidth={1.75} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-9 pr-3 py-2 bg-[#0F1115] border border-[#262A33] rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 min-h-[40px]"
            />
          </div>
          <CategoryNav categories={categories} selectedCategoryId={selectedCategoryId} onSelectCategory={setSelectedCategoryId} />
        </div>

        {isAddon && table?.activeOrder && (
          <ActiveOrderItemsList items={table.activeOrder.items || []} subtotal={table.activeOrder.subtotal} onVoidItem={setVoidTarget} />
        )}

        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 pb-24 lg:pb-3">
          {filteredItems.map((item) => <MenuItemCard key={item.id} item={item} onAdd={addItem} />)}
        </div>

        {cartCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-[#181B20]/95 backdrop-blur-md border-t border-[#262A33] lg:hidden pb-safe">
            <button
              id="open-mobile-cart-btn"
              onClick={() => setMobileCartOpen(true)}
              className="w-full min-h-[52px] px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-between shadow-xl active:scale-[0.99] transition-all"
            >
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-lg bg-slate-950 text-amber-400 font-black text-xs flex items-center justify-center font-mono">
                  {cartCount}
                </span>
                <span className="text-sm font-black">Review Order</span>
              </div>
              <span className="font-mono tabular-nums text-sm font-black">{formatCurrency(getSubtotal())} →</span>
            </button>
          </div>
        )}
      </div>

      <div className="hidden lg:block w-96 h-full shrink-0 border-l border-[#262A33]">
        <OrderCartDrawer tableNumber={table?.tableNumber || ""} isAddon={isAddon} activeRound={activeRound} onSendToKitchen={handleSendToKitchen} isLoading={submitting} />
      </div>

      <BottomSheet isOpen={mobileCartOpen} onClose={() => setMobileCartOpen(false)} title={`Table ${table?.tableNumber || ""} Cart`} description={isAddon ? `Add-on Round ${activeRound}` : "Ready to fire"} maxHeight="max-h-[85dvh]">
        <OrderCartDrawer tableNumber={table?.tableNumber || ""} isAddon={isAddon} activeRound={activeRound} onSendToKitchen={handleSendToKitchen} isLoading={submitting} />
      </BottomSheet>

      {voidTarget && (
        <VoidAuthModal isOpen={Boolean(voidTarget)} onClose={() => setVoidTarget(null)} itemId={voidTarget.id} itemName={voidTarget.menuItemName || "Item"} onConfirmVoid={handleConfirmVoid} />
      )}
    </div>
  );
}
