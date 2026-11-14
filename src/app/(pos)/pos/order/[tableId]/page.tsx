"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { CategoryDTO, MenuItemDTO, RestaurantTableDTO, OrderItemDTO } from "@/types";
import { CategoryNav } from "@/components/pos/CategoryNav";
import { MenuItemCard } from "@/components/pos/MenuItemCard";
import { OrderCartDrawer } from "@/components/pos/OrderCartDrawer";
import { ActiveOrderItemsList } from "@/components/pos/ActiveOrderItemsList";
import { VoidAuthModal } from "@/components/pos/VoidAuthModal";
import { useOrderCart } from "@/hooks/useOrderCart";

export default function OrderEntryPage() {
  const router = useRouter();
  const params = useParams();
  const tableId = params.tableId as string;

  const [table, setTable] = useState<RestaurantTableDTO | null>(null);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [voidTarget, setVoidTarget] = useState<OrderItemDTO | null>(null);

  const { items: cartItems, addItem, clearCart, orderNotes } = useOrderCart();

  const loadData = useCallback(async () => {
    try {
      const [tableRes, menuRes] = await Promise.all([
        fetch("/api/tables"),
        fetch("/api/menu/categories"),
      ]);
      const tableData = await tableRes.json();
      const menuData = await menuRes.json();

      const foundTable = tableData.tables?.find((t: RestaurantTableDTO) => t.id === tableId);
      if (foundTable) setTable(foundTable);
      if (menuData.categories) setCategories(menuData.categories);
    } catch (e) {
      console.error(e);
    }
  }, [tableId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const allMenuItems = useMemo(() => {
    return categories.flatMap((cat) => cat.items || []);
  }, [categories]);

  const filteredItems = useMemo(() => {
    let items = allMenuItems;
    if (selectedCategoryId !== "ALL") {
      items = items.filter((it) => it.categoryId === selectedCategoryId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((it) => it.name.toLowerCase().includes(q));
    }
    return items;
  }, [allMenuItems, selectedCategoryId, searchQuery]);

  const isAddon = Boolean(table?.activeOrder);
  const activeRound = isAddon
    ? (table?.activeOrder?.items?.reduce((max, i) => Math.max(max, i.roundNumber), 1) || 1) + 1
    : 1;

  const handleSendToKitchen = async () => {
    if (cartItems.length === 0) return;
    setSubmitting(true);
    try {
      if (isAddon && table?.activeOrder) {
        await fetch(`/api/orders/${table.activeOrder.id}/add-ons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: cartItems }),
        });
      } else {
        await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tableId, items: cartItems, orderNotes }),
        });
      }
      clearCart();
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
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Void authorization failed");
    }
    loadData();
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col lg:flex-row h-screen overflow-hidden">
      {/* Left Menu Section */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="p-3.5 bg-[#181B20] border-b border-[#262A33] flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/pos"
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-[#0F1115] border border-[#262A33] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.75} />
            </Link>
            <div>
              <h1 className="text-base font-bold text-slate-100 tabular-nums">
                {table ? `Table ${table.tableNumber}` : "Order Terminal"}
              </h1>
              <p className="text-xs text-slate-400">
                {isAddon ? `Add-on Round ${activeRound}` : "New Order"}
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" strokeWidth={1.75} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-9 pr-3 py-2 bg-[#0F1115] border border-[#262A33] rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 min-h-[44px]"
            />
          </div>
        </header>

        {/* Existing Placed Items for Add-on Round */}
        {isAddon && table?.activeOrder && (
          <ActiveOrderItemsList
            items={table.activeOrder.items || []}
            subtotal={table.activeOrder.subtotal}
            onVoidItem={setVoidTarget}
          />
        )}

        {/* Category Navbar */}
        <div className="px-4 py-2 border-b border-[#262A33] bg-[#181B20]/60">
          <CategoryNav
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} onAdd={addItem} />
          ))}
        </div>
      </div>

      {/* Right Cart Drawer */}
      <div className="w-full lg:w-96 h-1/2 lg:h-full shrink-0 border-t lg:border-t-0 border-[#262A33]">
        <OrderCartDrawer
          tableNumber={table?.tableNumber || ""}
          isAddon={isAddon}
          activeRound={activeRound}
          onSendToKitchen={handleSendToKitchen}
          isLoading={submitting}
        />
      </div>

      {/* Admin Void PIN Modal */}
      {voidTarget && (
        <VoidAuthModal
          isOpen={Boolean(voidTarget)}
          onClose={() => setVoidTarget(null)}
          itemId={voidTarget.id}
          itemName={voidTarget.menuItemName || "Item"}
          onConfirmVoid={handleConfirmVoid}
        />
      )}
    </div>
  );
}
