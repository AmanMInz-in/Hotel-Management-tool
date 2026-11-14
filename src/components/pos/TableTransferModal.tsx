"use client";

import React, { useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { RestaurantTableDTO } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface TableTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceTable: RestaurantTableDTO | null;
  availableTables: RestaurantTableDTO[];
  onTransfer: (sourceTableId: string, targetTableId: string) => Promise<void>;
}

export const TableTransferModal: React.FC<TableTransferModalProps> = ({
  isOpen,
  onClose,
  sourceTable,
  availableTables,
  onTransfer,
}) => {
  const [targetTableId, setTargetTableId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  if (!sourceTable) return null;

  const handleTransfer = async () => {
    if (!targetTableId) return;
    setLoading(true);
    try {
      await onTransfer(sourceTable.id, targetTableId);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Transfer Table ${sourceTable.tableNumber}`}
      description="Select an available table to transfer the active session."
      maxWidth="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Target Destination Table
          </label>
          {availableTables.length === 0 ? (
            <p className="text-sm text-amber-400 bg-amber-950/40 p-3 rounded-xl border border-amber-800/40">
              No available tables found on the floor.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => setTargetTableId(table.id)}
                  className={`p-3 rounded-xl text-center border font-bold transition-all min-h-[48px] ${
                    targetTableId === table.id
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
            onClick={handleTransfer}
            disabled={!targetTableId || loading}
            isLoading={loading}
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" strokeWidth={1.75} />
            Confirm Transfer
          </Button>
        </div>
      </div>
    </Modal>
  );
};
