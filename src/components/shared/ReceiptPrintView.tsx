"use client";

import React from "react";
import { Printer, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

interface ReceiptPrintViewProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: {
    billNumber: string;
    tableNumber: string;
    orderNumber: string;
    items: Array<{ name: string; quantity: number; unitPrice: number }>;
    subtotal: number;
    discountAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    grandTotal: number;
    paymentMode: string;
    settledAt: string;
  } | null;
}

export const ReceiptPrintView: React.FC<ReceiptPrintViewProps> = ({
  isOpen,
  onClose,
  receiptData,
}) => {
  if (!receiptData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settlement Receipt"
      description="Print thermal receipt or export digital voucher."
      maxWidth="sm"
    >
      <div className="space-y-4">
        {/* Thermal Slip Styled Container */}
        <div className="bg-white text-black p-5 rounded-lg shadow-inner font-mono text-xs space-y-3 leading-relaxed">
          <div className="text-center border-b border-dashed border-gray-400 pb-3">
            <h4 className="text-base font-black tracking-tight uppercase">
              The Grand Bistro
            </h4>
            <p className="text-[10px] text-gray-600">Hotel & Dining Restaurant</p>
            <p className="text-[10px] text-gray-500">GSTIN: 07AAAAA0000A1Z5</p>
          </div>

          <div className="flex justify-between text-[11px]">
            <span>Bill: {receiptData.billNumber}</span>
            <span>Table: {receiptData.tableNumber}</span>
          </div>
          <div className="text-[10px] text-gray-600">
            {new Date(receiptData.settledAt).toLocaleString()}
          </div>

          <div className="border-t border-b border-dashed border-gray-400 py-2 space-y-1">
            <div className="flex justify-between font-bold text-[11px]">
              <span>ITEM</span>
              <span>QTY x RATE</span>
              <span>AMT</span>
            </div>
            {receiptData.items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <span className="truncate max-w-[140px]">{it.name}</span>
                <span>{it.quantity} x {it.unitPrice}</span>
                <span>{formatCurrency(it.quantity * it.unitPrice)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(receiptData.subtotal)}</span>
            </div>
            {receiptData.discountAmount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount:</span>
                <span>-{formatCurrency(receiptData.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>CGST (2.5%):</span>
              <span>{formatCurrency(receiptData.cgstAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>SGST (2.5%):</span>
              <span>{formatCurrency(receiptData.sgstAmount)}</span>
            </div>
            <div className="flex justify-between font-black text-sm pt-1 border-t border-dashed border-gray-400">
              <span>GRAND TOTAL:</span>
              <span>{formatCurrency(receiptData.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-600 pt-1">
              <span>Paid via:</span>
              <span className="font-bold">{receiptData.paymentMode}</span>
            </div>
          </div>

          <div className="text-center text-[10px] border-t border-dashed border-gray-400 pt-3 text-gray-600">
            Thank you for dining with us!
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Button id="close-receipt-btn" variant="outline" onClick={onClose} className="w-1/2">
            <Check className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
            Done
          </Button>
          <Button id="print-receipt-btn" variant="primary" onClick={handlePrint} className="w-1/2">
            <Printer className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
            Print Receipt
          </Button>
        </div>
      </div>
    </Modal>
  );
};
