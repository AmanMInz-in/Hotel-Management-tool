"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { BillComputationOutput } from "@/lib/calculations";
import { DiscountType } from "@/types";

interface BillBreakdownSummaryProps {
  totals: BillComputationOutput;
  discountType: DiscountType;
  discountValue: number;
}

export const BillBreakdownSummary: React.FC<BillBreakdownSummaryProps> = ({
  totals,
  discountType,
  discountValue,
}) => {
  return (
    <div className="bg-[#0F1115] p-4 rounded-xl border border-[#262A33] space-y-2 text-sm">
      <div className="flex justify-between text-slate-300">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Item Subtotal</span>
        <span className="font-mono tabular-nums text-slate-200">{formatCurrency(totals.subtotal)}</span>
      </div>

      {totals.discountAmount > 0 ? (
        <div className="flex justify-between text-emerald-400 font-medium">
          <span className="text-xs uppercase tracking-wider">Discount ({discountType === "PERCENTAGE" ? `${discountValue}%` : "Flat"})</span>
          <span className="font-mono tabular-nums">-{formatCurrency(totals.discountAmount)}</span>
        </div>
      ) : null}

      <div className="flex justify-between text-slate-400 text-xs">
        <span>CGST (2.5%)</span>
        <span className="font-mono tabular-nums text-slate-300">{formatCurrency(totals.cgstAmount)}</span>
      </div>
      <div className="flex justify-between text-slate-400 text-xs">
        <span>SGST (2.5%)</span>
        <span className="font-mono tabular-nums text-slate-300">{formatCurrency(totals.sgstAmount)}</span>
      </div>

      {totals.roundOff !== 0 ? (
        <div className="flex justify-between text-slate-400 text-xs">
          <span>Round-off</span>
          <span className="font-mono tabular-nums text-slate-400">{formatCurrency(totals.roundOff)}</span>
        </div>
      ) : null}

      <div className="flex justify-between items-center text-base font-bold text-slate-100 pt-3 border-t border-[#262A33]">
        <span className="uppercase tracking-wide text-xs text-slate-300">Grand Total</span>
        <span className="text-xl font-mono tabular-nums text-amber-400 font-black">
          {formatCurrency(totals.grandTotal)}
        </span>
      </div>
    </div>
  );
};
