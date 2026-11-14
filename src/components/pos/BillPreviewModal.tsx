"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { computeBillTotals } from "@/lib/calculations";
import { DiscountType, PaymentMode } from "@/types";
import { BillBreakdownSummary } from "./BillBreakdownSummary";
import { BillSplitControls } from "./BillSplitControls";
import { BillPaymentControls } from "./BillPaymentControls";

interface BillPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
  orderId: string;
  subtotal: number;
  onSettle: (data: {
    orderId: string;
    discountType: DiscountType;
    discountValue: number;
    paymentMode: PaymentMode;
    cashTendered?: number;
    referenceNumber?: string;
  }) => Promise<void>;
}

export const BillPreviewModal: React.FC<BillPreviewModalProps> = ({
  isOpen,
  onClose,
  tableNumber,
  orderId,
  subtotal,
  onSettle,
}) => {
  const [discountType, setDiscountType] = useState<DiscountType>("NONE");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("CASH");
  const [cashTendered, setCashTendered] = useState<string>("");
  const [splitCount, setSplitCount] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const billTotals = computeBillTotals({
    subtotal,
    discountType,
    discountValue,
    taxRatePercent: 5.0,
  });

  const tenderedNum = parseFloat(cashTendered) || 0;

  const handleSettle = async () => {
    setLoading(true);
    try {
      await onSettle({
        orderId,
        discountType,
        discountValue,
        paymentMode,
        cashTendered: paymentMode === "CASH" ? tenderedNum : undefined,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Billing & Checkout: Table ${tableNumber}`}
      description="Review 5% GST taxes, apply discounts, split shares, and record payment."
      maxWidth="lg"
    >
      <div className="space-y-4">
        <BillBreakdownSummary
          totals={billTotals}
          discountType={discountType}
          discountValue={discountValue}
        />

        {/* Discount Selection */}
        <div className="p-3 bg-[#0F1115] rounded-xl border border-[#262A33] flex items-center justify-between gap-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Admin Discount
          </label>
          <div className="flex items-center space-x-2">
            <select
              id="discount-type-select"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as DiscountType)}
              className="bg-[#181B20] border border-[#262A33] text-xs text-slate-200 rounded-lg px-3 py-2 min-h-[40px] focus:outline-none focus:border-amber-500"
            >
              <option value="NONE">No Discount</option>
              <option value="FLAT">Flat ₹ Discount</option>
              <option value="PERCENTAGE">% Percentage</option>
            </select>
            {discountType !== "NONE" && (
              <input
                id="discount-value-input"
                type="number"
                value={discountValue || ""}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                placeholder="Value"
                className="w-24 bg-[#181B20] border border-[#262A33] text-xs text-slate-100 px-3 py-2 rounded-lg min-h-[40px] font-mono tabular-nums focus:outline-none focus:border-amber-500"
              />
            )}
          </div>
        </div>

        {/* Split Controls */}
        <BillSplitControls
          grandTotal={billTotals.grandTotal}
          splitCount={splitCount}
          onSplitCountChange={setSplitCount}
        />

        {/* Payment Controls */}
        <BillPaymentControls
          paymentMode={paymentMode}
          onPaymentModeChange={setPaymentMode}
          cashTendered={cashTendered}
          onCashTenderedChange={setCashTendered}
          grandTotal={billTotals.grandTotal}
        />

        <div className="pt-2">
          <Button
            id="settle-and-reset-btn"
            variant="primary"
            onClick={handleSettle}
            disabled={loading}
            isLoading={loading}
            className="w-full text-base font-bold"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" strokeWidth={1.75} />
            Settle {formatCurrency(billTotals.grandTotal)} & Reset Table
          </Button>
        </div>
      </div>
    </Modal>
  );
};
