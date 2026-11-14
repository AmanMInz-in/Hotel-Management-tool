"use client";

import { useState } from "react";
import { DiscountType, PaymentMode } from "@/types";

export function useTableOperations(onRefresh: () => void) {
  const [receipt, setReceipt] = useState<any>(null);

  const requestBill = async (tableId: string) => {
    await fetch(`/api/tables/${tableId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "BILL_REQUESTED" }),
    });
    onRefresh();
  };

  const releaseCleaning = async (tableId: string) => {
    await fetch(`/api/tables/${tableId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "AVAILABLE" }),
    });
    onRefresh();
  };

  const transferTable = async (fromId: string, toId: string) => {
    await fetch("/api/tables/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromTableId: fromId, toTableId: toId }),
    });
    onRefresh();
  };

  const mergeTable = async (primaryId: string, secondaryId: string) => {
    await fetch("/api/tables/merge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primaryTableId: primaryId, secondaryTableId: secondaryId }),
    });
    onRefresh();
  };

  const settleBill = async (data: {
    orderId: string;
    discountType: DiscountType;
    discountValue: number;
    paymentMode: PaymentMode;
    cashTendered?: number;
  }) => {
    const res = await fetch("/api/bills/settle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.receipt) {
      setReceipt(result.receipt);
    }
    onRefresh();
  };

  return {
    receipt,
    setReceipt,
    requestBill,
    releaseCleaning,
    transferTable,
    mergeTable,
    settleBill,
  };
}
