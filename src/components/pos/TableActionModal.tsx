"use client";

import React from "react";
import { PlusCircle, ArrowRightLeft, GitMerge, Receipt, CheckCircle, ArrowRight } from "lucide-react";
import { RestaurantTableDTO } from "@/types";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

interface TableActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: RestaurantTableDTO | null;
  onOpenOrder: (tableId: string) => void;
  onStartTransfer: () => void;
  onStartMerge: () => void;
  onRequestBill: (tableId: string) => void;
  onStartSettlement: () => void;
  onReleaseCleaning: (tableId: string) => void;
}

export const TableActionModal: React.FC<TableActionModalProps> = ({
  isOpen,
  onClose,
  table,
  onOpenOrder,
  onStartTransfer,
  onStartMerge,
  onRequestBill,
  onStartSettlement,
  onReleaseCleaning,
}) => {
  if (!table) return null;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Table ${table.tableNumber} Operations`}
      description={`Status: ${table.status.replace("_", " ")} • Capacity: ${table.capacity} Persons`}
    >
      <div className="space-y-3.5">
        {table.activeOrder ? (
          <div className="p-3.5 bg-[#0F1115] border border-[#262A33] rounded-xl flex items-center justify-between text-sm">
            <div>
              <span className="text-slate-400 block text-xs">Active Session</span>
              <span className="text-sm font-bold text-slate-200 tabular-nums">
                {table.activeOrder.items?.length || 0} items ordered
              </span>
            </div>
            <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
              {formatCurrency(table.activeOrder.subtotal)}
            </span>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-2 pt-1">
          {table.status === "AVAILABLE" && (
            <Button
              variant="primary"
              onClick={() => onOpenOrder(table.id)}
              className="w-full justify-between"
            >
              <div className="flex items-center">
                <PlusCircle className="w-5 h-5 mr-2" strokeWidth={1.75} />
                <span>Seat Diners & Place Order</span>
              </div>
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </Button>
          )}

          {table.status === "OCCUPIED" && (
            <>
              <Button
                variant="primary"
                onClick={() => onOpenOrder(table.id)}
                className="w-full justify-between"
              >
                <div className="flex items-center">
                  <PlusCircle className="w-5 h-5 mr-2" strokeWidth={1.75} />
                  <span>Order Items / Add-ons</span>
                </div>
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={onStartTransfer} className="text-xs">
                  <ArrowRightLeft className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
                  Transfer Table
                </Button>
                <Button variant="secondary" onClick={onStartMerge} className="text-xs">
                  <GitMerge className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
                  Merge Table
                </Button>
              </div>

              <Button
                variant="secondary"
                onClick={() => onRequestBill(table.id)}
                className="w-full justify-between"
              >
                <div className="flex items-center">
                  <Receipt className="w-5 h-5 mr-2 text-slate-400" strokeWidth={1.75} />
                  <span>Request Customer Bill</span>
                </div>
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </Button>

              <Button
                variant="primary"
                onClick={onStartSettlement}
                className="w-full justify-between"
              >
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" strokeWidth={1.75} />
                  <span>Settle Bill & Payment</span>
                </div>
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </Button>
            </>
          )}

          {table.status === "BILL_REQUESTED" && (
            <Button
              variant="primary"
              onClick={onStartSettlement}
              className="w-full justify-between"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" strokeWidth={1.75} />
                <span>Settle Payment Now</span>
              </div>
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </Button>
          )}

          {table.status === "CLEANING" && (
            <Button
              id="mark-available-btn"
              variant="primary"
              onClick={() => onReleaseCleaning(table.id)}
              className="w-full justify-center"
            >
              <CheckCircle className="w-5 h-5 mr-2" strokeWidth={1.75} />
              Mark Cleaned & Available
            </Button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};
