import { DiscountType } from "@/types";

export interface BillComputationInput {
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  taxRatePercent?: number; // e.g. 5 for 5% GST (2.5% CGST + 2.5% SGST)
  serviceChargePercent?: number; // e.g. 0% or 5%
}

export interface BillComputationOutput {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  serviceCharge: number;
  roundOff: number;
  grandTotal: number;
}

export function computeBillTotals(input: BillComputationInput): BillComputationOutput {
  const subtotal = Math.max(0, Math.round(input.subtotal * 100) / 100);
  let discountAmount = 0;

  if (input.discountType === "FLAT") {
    discountAmount = Math.min(subtotal, Math.max(0, input.discountValue));
  } else if (input.discountType === "PERCENTAGE") {
    const pct = Math.min(100, Math.max(0, input.discountValue));
    discountAmount = Math.round((subtotal * (pct / 100)) * 100) / 100;
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxRate = input.taxRatePercent ?? 5.0; // Standard 5% GST
  const halfTaxRate = taxRate / 2.0; // 2.5% CGST + 2.5% SGST

  const cgstAmount = Math.round((taxableAmount * (halfTaxRate / 100)) * 100) / 100;
  const sgstAmount = Math.round((taxableAmount * (halfTaxRate / 100)) * 100) / 100;

  const serviceChargeRate = input.serviceChargePercent ?? 0.0;
  const serviceCharge = Math.round((taxableAmount * (serviceChargeRate / 100)) * 100) / 100;

  const rawTotal = taxableAmount + cgstAmount + sgstAmount + serviceCharge;
  const roundedTotal = Math.round(rawTotal);
  const roundOff = Math.round((roundedTotal - rawTotal) * 100) / 100;

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    cgstAmount,
    sgstAmount,
    serviceCharge,
    roundOff,
    grandTotal: roundedTotal,
  };
}

export function splitBillEqual(grandTotal: number, splitCount: number): number[] {
  if (splitCount <= 1) return [grandTotal];
  const base = Math.floor((grandTotal / splitCount) * 100) / 100;
  const splits = Array(splitCount).fill(base);
  const diff = Math.round((grandTotal - base * splitCount) * 100) / 100;
  splits[0] = Math.round((splits[0] + diff) * 100) / 100;
  return splits;
}
