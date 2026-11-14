"use client";

import React from "react";
import { Banknote, QrCode, CreditCard } from "lucide-react";
import { PaymentMode } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface BillPaymentControlsProps {
  paymentMode: PaymentMode;
  onPaymentModeChange: (mode: PaymentMode) => void;
  cashTendered: string;
  onCashTenderedChange: (val: string) => void;
  grandTotal: number;
}

export const BillPaymentControls: React.FC<BillPaymentControlsProps> = ({
  paymentMode,
  onPaymentModeChange,
  cashTendered,
  onCashTenderedChange,
  grandTotal,
}) => {
  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedNum - grandTotal);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Payment Mode
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "CASH", label: "Cash", icon: Banknote },
            { id: "UPI", label: "UPI / QR", icon: QrCode },
            { id: "CARD", label: "Card EDC", icon: CreditCard },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`payment-mode-${id.toLowerCase()}`}
              type="button"
              onClick={() => onPaymentModeChange(id as PaymentMode)}
              className={`flex items-center justify-center space-x-2 p-3 rounded-xl border font-bold text-sm transition-all min-h-[48px] ${
                paymentMode === id
                  ? "bg-amber-500 border-amber-400 text-[#0F1115] shadow-sm font-black"
                  : "bg-[#181B20] border-[#262A33] text-slate-300 hover:border-slate-600"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.75} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {paymentMode === "CASH" ? (
        <div className="grid grid-cols-2 gap-3 bg-[#0F1115] p-3.5 rounded-xl border border-[#262A33]">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Cash Tendered
            </label>
            <input
              id="cash-tendered-input"
              type="number"
              value={cashTendered}
              onChange={(e) => onCashTenderedChange(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#181B20] border border-[#262A33] text-slate-100 px-3 py-2.5 rounded-lg text-sm font-mono tabular-nums focus:outline-none focus:border-amber-500 min-h-[44px]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Change Due
            </label>
            <span id="change-return-val" className="block text-base font-mono font-bold text-emerald-400 pt-2 tabular-nums">
              {formatCurrency(changeDue)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
