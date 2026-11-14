"use client";

import React, { useState, useEffect } from "react";
import { Plus, Users, LayoutGrid, Trash2 } from "lucide-react";
import { SectionDTO, RestaurantTableDTO } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export default function AdminTablesPage() {
  const [sections, setSections] = useState<SectionDTO[]>([]);
  const [tables, setTables] = useState<RestaurantTableDTO[]>([]);
  const [tableNumber, setTableNumber] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [capacity, setCapacity] = useState("4");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch("/api/tables");
      const data = await res.json();
      if (data.sections && data.tables) {
        setSections(data.sections);
        setTables(data.tables);
        if (data.sections.length > 0 && !sectionId) {
          setSectionId(data.sections[0].id);
        }
      }
    } catch {
      setError("Failed to load tables");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber || !sectionId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: tableNumber.trim().toUpperCase(),
          sectionId,
          capacity: parseInt(capacity) || 4,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to create table");
      }
      setTableNumber("");
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating table");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (table: RestaurantTableDTO) => {
    if (!confirm(`Delete Table ${table.tableNumber}?`)) return;
    setError("");
    try {
      const res = await fetch(`/api/tables/${table.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Cannot delete table");
      }
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error deleting table");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Create Table Container */}
      <div className="p-5 bg-[#181B20] border border-[#262A33] rounded-2xl h-fit space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center">
          <Plus className="w-4 h-4 mr-2 text-amber-500" strokeWidth={1.75} />
          Add Floor Table
        </h3>

        {error && (
          <p className="text-xs text-rose-400 font-bold bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/40">
            {error}
          </p>
        )}

        <form onSubmit={handleCreateTable} className="space-y-3">
          <Input
            label="Table Number"
            placeholder="e.g. T7, R3"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Section
            </label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full px-4 py-3 bg-[#0F1115] border border-[#262A33] rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500/60 min-h-[48px]"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Capacity
            </label>
            <select
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full px-4 py-3 bg-[#0F1115] border border-[#262A33] rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500/60 min-h-[48px]"
            >
              <option value="2">2 Seater</option>
              <option value="4">4 Seater</option>
              <option value="6">6 Seater</option>
              <option value="8">8 Seater</option>
            </select>
          </div>

          <Button type="submit" variant="primary" isLoading={loading} className="w-full">
            Add Table
          </Button>
        </form>
      </div>

      {/* Existing Tables Matrix */}
      <div className="lg:col-span-2 p-5 bg-[#181B20] border border-[#262A33] rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#262A33]">
          <h3 className="text-sm font-bold text-slate-100 flex items-center">
            <LayoutGrid className="w-4 h-4 mr-2 text-amber-500" strokeWidth={1.75} />
            Configured Tables ({tables.length})
          </h3>
          <span className="text-xs text-slate-400">Active floor capacity</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {tables.map((table) => (
            <div
              key={table.id}
              className="p-3.5 bg-[#0F1115] border border-[#262A33] rounded-xl flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-base text-slate-100 block tabular-nums">
                    Table {table.tableNumber}
                  </span>
                  <span className="text-xs text-slate-400">{table.sectionName}</span>
                </div>
                <button
                  onClick={() => handleDeleteTable(table)}
                  title="Delete Table"
                  className="p-1 text-slate-500 hover:text-rose-400 rounded-lg transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#181B20] text-xs">
                <div className="flex items-center space-x-1 text-slate-400 tabular-nums">
                  <Users className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>{table.capacity}p</span>
                </div>
                <Badge variant={table.status === "AVAILABLE" ? "available" : "occupied"} size="sm">
                  {table.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
