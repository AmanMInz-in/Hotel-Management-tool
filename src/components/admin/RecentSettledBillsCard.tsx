"use client";

import React from "react";
import { Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RecentSettledBillsCardProps {
  bills?: Array<{
    billNumber: string;
    tableNumber: string;
    grandTotal: number;
    paymentMode: string;
    createdAt: string;
  }>;
}

export const RecentSettledBillsCard: React.FC<RecentSettledBillsCardProps> = ({ bills }) => {
  return (
    <div className="p-4 sm:p-5 bg-[#181B20] border border-[#262A33] rounded-2xl space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#262A33]">
        <h3 className="text-sm font-bold text-slate-100 flex items-center">
          <Receipt className="w-4 h-4 mr-2 text-amber-500" strokeWidth={1.75} />
          Settled Invoices ({bills?.length || 0})
        </h3>
      </div>
      <div className="divide-y divide-[#262A33] max-h-80 overflow-y-auto">
        {!bills || bills.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No invoices in this period.</p>
        ) : (
          bills.map((b, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
              <div>
                <span className="font-bold text-slate-200 block tabular-nums">#{b.billNumber}</span>
                <span className="text-xs text-slate-400">
                  Table {b.tableNumber} • {new Date(b.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-400 block tabular-nums">
                  {formatCurrency(b.grandTotal)}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                  {b.paymentMode}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
