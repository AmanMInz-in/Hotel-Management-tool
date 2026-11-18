"use client";

import React from "react";
import { CategoryDTO } from "@/types";

interface CategoryNavProps {
  categories: CategoryDTO[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto py-1 no-scrollbar">
      <button
        onClick={() => onSelectCategory("ALL")}
        className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors min-h-[44px] select-none ${
          selectedCategoryId === "ALL"
            ? "bg-amber-500 text-slate-950 font-black shadow-sm"
            : "bg-[#181B20] text-slate-400 hover:text-white border border-[#262A33]"
        }`}
      >
        All Dishes
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors min-h-[44px] select-none ${
            selectedCategoryId === cat.id
              ? "bg-amber-500 text-slate-950 font-black shadow-sm"
              : "bg-[#181B20] text-slate-400 hover:text-white border border-[#262A33]"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};
