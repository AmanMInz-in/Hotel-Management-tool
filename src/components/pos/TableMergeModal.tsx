"use client";

import React, { useState } from "react";
import { GitMerge } from "lucide-react";
import { RestaurantTableDTO } from "@/types";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";

interface TableMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryTable: RestaurantTableDTO | null;
  otherTables: RestaurantTableDTO[];
  onMerge: (primaryTableId: string, secondaryTableId: string) => Promise<void>;
}

export const TableMergeModal: React.FC<TableMergeModalProps> = ({
  isOpen,
  onClose,
  primaryTable,
  otherTables,
  onMerge,
}) => {
  const [secondaryTableId, setSecondaryTableId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  if (!primaryTable) return null;

  const validTargets = otherTables.filter((t) => t.id !== primaryTable.id);

  const handleMerge = async () => {
    if (!secondaryTableId) return;
    setLoading(true);
    try {
      await onMerge(primaryTable.id, secondaryTableId);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Merge into Table ${primaryTable.tableNumber}`}
      description="Select an occupied table to combine orders."
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Select Table to Merge From
          </label>
          {validTargets.length === 0 ? (
            <p className="text-sm text-slate-400 bg-[#0F1115] p-3 rounded-xl border border-[#262A33]">
              No other occupied tables available to merge.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {validTargets.map((table) => (
                <button
                  key={table.id}
                  onClick={() => setSecondaryTableId(table.id)}
                  className={`p-3 rounded-xl text-center border font-bold transition-all min-h-[48px] active:scale-95 ${
                    secondaryTableId === table.id
                      ? "bg-amber-500 border-amber-400 text-[#0F1115] font-black"
                      : "bg-[#0F1115] border-[#262A33] text-slate-300 hover:border-slate-600"
                  }`}
                >
                  Table {table.tableNumber}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 pt-3 border-t border-[#262A33]">
          <Button variant="outline" onClick={onClose} disabled={loading} className="w-1/3 min-h-[48px]">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleMerge}
            disabled={!secondaryTableId || loading}
            isLoading={loading}
            className="w-2/3 min-h-[48px] font-bold"
          >
            <GitMerge className="w-4 h-4 mr-2" strokeWidth={1.75} />
            Confirm Merge
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
