"use client";

import React, { useState } from "react";
import { RestaurantTableDTO, SectionDTO } from "@/types";
import { TableCard } from "./TableCard";

interface TableGridProps {
  sections: SectionDTO[];
  tables: RestaurantTableDTO[];
  onSelectTable: (table: RestaurantTableDTO) => void;
}

export const TableGrid: React.FC<TableGridProps> = ({
  sections,
  tables,
  onSelectTable,
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>("ALL");

  const filteredTables =
    selectedSectionId === "ALL"
      ? tables
      : tables.filter((t) => t.sectionId === selectedSectionId);

  const stats = {
    available: tables.filter((t) => t.status === "AVAILABLE").length,
    occupied: tables.filter((t) => t.status === "OCCUPIED").length,
    billRequested: tables.filter((t) => t.status === "BILL_REQUESTED").length,
    cleaning: tables.filter((t) => t.status === "CLEANING").length,
  };

  return (
    <div className="space-y-4">
      {/* Hospitality Floor KPI Bar */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        <div className="p-3 bg-[#181B20] border border-[#262A33] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between">
          <span className="text-xs font-semibold text-emerald-400">Available</span>
          <span className="text-xl font-bold text-slate-100 tabular-nums">{stats.available}</span>
        </div>
        <div className="p-3 bg-[#181B20] border border-[#262A33] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between">
          <span className="text-xs font-semibold text-amber-400">Occupied</span>
          <span className="text-xl font-bold text-slate-100 tabular-nums">{stats.occupied}</span>
        </div>
        <div className="p-3 bg-[#181B20] border border-[#262A33] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between">
          <span className="text-xs font-semibold text-rose-400">Bill Req.</span>
          <span className="text-xl font-bold text-slate-100 tabular-nums">{stats.billRequested}</span>
        </div>
        <div className="p-3 bg-[#181B20] border border-[#262A33] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between">
          <span className="text-xs font-semibold text-sky-400">Cleaning</span>
          <span className="text-xl font-bold text-slate-100 tabular-nums">{stats.cleaning}</span>
        </div>
      </div>

      {/* Section Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedSectionId("ALL")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors min-h-[44px] ${
            selectedSectionId === "ALL"
              ? "bg-amber-500 text-slate-950 font-black"
              : "bg-[#181B20] border border-[#262A33] text-slate-400 hover:text-white"
          }`}
        >
          All Floor ({tables.length})
        </button>
        {sections.map((section) => {
          const count = tables.filter((t) => t.sectionId === section.id).length;
          return (
            <button
              key={section.id}
              onClick={() => setSelectedSectionId(section.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors min-h-[44px] ${
                selectedSectionId === section.id
                  ? "bg-amber-500 text-slate-950 font-black"
                  : "bg-[#181B20] border border-[#262A33] text-slate-400 hover:text-white"
              }`}
            >
              {section.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Table Grid Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {filteredTables.map((table) => (
          <TableCard key={table.id} table={table} onClick={onSelectTable} />
        ))}
      </div>
    </div>
  );
};
