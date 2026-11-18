"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, QrCode } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

interface UpiQrPaymentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
  orderId: string;
  billNumber?: string;
  amount: number;
  onConfirmPayment: () => Promise<void>;
}

export const UpiQrPaymentSheet: React.FC<UpiQrPaymentSheetProps> = ({
  isOpen,
  onClose,
  tableNumber,
  billNumber = "BILL-001",
  amount,
  onConfirmPayment,
}) => {
  const [loading, setLoading] = useState(false);

  // Standard India UPI Universal Intent URI
  const upiPayload = `upi://pay?pa=grandbistro@okicici&pn=The+Grand+Bistro&am=${amount.toFixed(2)}&cu=INR&tn=Bill+Table+${tableNumber}`;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirmPayment();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Scan to Pay via UPI"
      description={`Table ${tableNumber} • Customer Instant QR Payment`}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* High-Contrast Clean White Card for Effortless Camera Scanning */}
        <div className="p-4 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center border-4 border-slate-200">
          <QRCodeSVG
            value={upiPayload}
            size={180}
            level="H"
            includeMargin={true}
          />
          <div className="flex items-center space-x-1.5 mt-2 text-[11px] font-bold text-slate-800">
            <QrCode className="w-3.5 h-3.5 text-slate-700" strokeWidth={2} />
            <span>Google Pay • PhonePe • Paytm • UPI</span>
          </div>
        </div>

        {/* Amount Display */}
        <div className="text-center space-y-0.5">
          <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
            Total Payable Amount
          </span>
          <div className="text-3xl font-black text-amber-400 font-mono tabular-nums">
            {formatCurrency(amount)}
          </div>
          <p className="text-[11px] text-slate-500">
            Scan from any UPI app on phone screen or paper terminal
          </p>
        </div>

        {/* Sticky Primary CTA */}
        <div className="w-full pt-2">
          <Button
            id="confirm-upi-payment-btn"
            variant="primary"
            onClick={handleConfirm}
            isLoading={loading}
            className="w-full min-h-[52px] text-sm font-bold shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" strokeWidth={2} />
            Confirm Payment Received ({formatCurrency(amount)})
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
