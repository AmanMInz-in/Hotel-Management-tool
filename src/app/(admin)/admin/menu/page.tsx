"use client";

import React, { useState, useEffect } from "react";
import { Plus, Utensils, Trash2 } from "lucide-react";
import { MenuItemDTO, CategoryDTO } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItemDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [itemsRes, catRes] = await Promise.all([
        fetch("/api/menu/items"),
        fetch("/api/menu/categories"),
      ]);
      const itemsData = await itemsRes.json();
      const catData = await catRes.json();

      if (itemsData.items) setItems(itemsData.items);
      if (catData.categories) {
        setCategories(catData.categories);
        if (catData.categories.length > 0 && !categoryId) {
          setCategoryId(catData.categories[0].id);
        }
      }
    } catch {
      setError("Failed to load menu data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/menu/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price: parseFloat(price), categoryId, isVeg }),
      });
      if (!res.ok) throw new Error("Failed to create menu item");
      setName("");
      setPrice("");
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating item");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle86 = async (itemId: string, currentStatus: boolean) => {
    await fetch(`/api/menu/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !currentStatus }),
    });
    loadData();
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Delete ${itemName}?`)) return;
    await fetch(`/api/menu/items/${itemId}`, { method: "DELETE" });
    loadData();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Create Item Form */}
      <div className="p-5 bg-[#181B20] border border-[#262A33] rounded-2xl h-fit space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center">
          <Plus className="w-4 h-4 mr-2 text-amber-500" strokeWidth={1.75} />
          Add Menu Item
        </h3>

        {error && (
          <p className="text-xs text-rose-400 font-bold bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/40">
            {error}
          </p>
        )}

        <form onSubmit={handleCreateItem} className="space-y-3">
          <Input
            label="Dish Name"
            placeholder="e.g. Garlic Naan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Price (₹ INR)"
            type="number"
            placeholder="e.g. 250"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 bg-[#0F1115] border border-[#262A33] rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500/60 min-h-[48px]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isVeg"
              checked={isVeg}
              onChange={(e) => setIsVeg(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <label htmlFor="isVeg" className="text-sm font-semibold text-slate-300">
              Vegetarian Item
            </label>
          </div>

          <Button type="submit" variant="primary" isLoading={loading} className="w-full">
            Save Item
          </Button>
        </form>
      </div>

      {/* Menu Item 86'd Controls */}
      <div className="lg:col-span-2 p-5 bg-[#181B20] border border-[#262A33] rounded-2xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#262A33]">
          <h3 className="text-sm font-bold text-slate-100 flex items-center">
            <Utensils className="w-4 h-4 mr-2 text-amber-500" strokeWidth={1.75} />
            Item Inventory & 86&apos;d Controls ({items.length})
          </h3>
          <span className="text-xs text-slate-400">Instant POS toggle</span>
        </div>

        <div className="divide-y divide-[#262A33] max-h-[600px] overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.isVeg ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                  <span className="font-bold text-slate-200">{item.name}</span>
                </div>
                <span className="text-xs text-slate-400 block mt-0.5 font-mono tabular-nums">
                  {formatCurrency(item.price)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleToggle86(item.id, item.isAvailable)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors min-h-[38px] ${
                    item.isAvailable
                      ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950"
                      : "bg-rose-950/60 border-rose-500/30 text-rose-400 hover:bg-rose-950"
                  }`}
                >
                  {item.isAvailable ? "In Stock" : "86'd (Out of Stock)"}
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id, item.name)}
                  title="Delete Item"
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
