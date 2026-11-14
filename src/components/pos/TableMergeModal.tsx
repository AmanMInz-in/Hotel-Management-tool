"use client";

import React, { useState } from "react";
import { GitMerge } from "lucide-react";
import { RestaurantTableDTO } from "@/types";
import { Modal } from "@/components/ui/Modal";
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Merge into Table ${primaryTable.tableNumber}`}
      description="Combine another occupied table's order into this table."
      maxWidth="md"
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
                  className={`p-3 rounded-xl text-center border font-bold transition-all min-h-[48px] ${
                    secondaryTableId === table.id
                      ? "bg-amber-500 border-amber-400 text-slate-950"
                      : "bg-[#0F1115] border-[#262A33] text-slate-300 hover:border-slate-600"
                  }`}
                >
                  Table {table.tableNumber}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#262A33]">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleMerge}
            disabled={!secondaryTableId || loading}
            isLoading={loading}
          >
            <GitMerge className="w-4 h-4 mr-2" strokeWidth={1.75} />
            Confirm Merge
          </Button>
        </div>
      </div>
    </Modal>
  );
};
