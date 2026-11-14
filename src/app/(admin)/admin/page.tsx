"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Receipt, ShieldAlert, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { TopSellingDishesCard } from "@/components/admin/TopSellingDishesCard";

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/sales")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-[#181B20] border border-[#262A33] rounded-2xl" />
        ))}
      </div>
    );
  }

  const summary = data?.summary || {
    totalRevenue: 0,
    totalTaxes: 0,
    totalDiscounts: 0,
    ordersCompleted: 0,
    paymentBreakdown: { CASH: 0, UPI: 0, CARD: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Real Operational KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 bg-[#181B20] border border-[#262A33] rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" strokeWidth={1.75} />
          </div>
          <span className="text-2xl font-black text-slate-100 tabular-nums">
            {formatCurrency(summary.totalRevenue)}
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-[#181B20] border border-[#262A33] rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Settled Orders</span>
            <Receipt className="w-4 h-4 text-amber-500" strokeWidth={1.75} />
          </div>
          <span className="text-2xl font-black text-slate-100 tabular-nums">
            {summary.ordersCompleted}
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-[#181B20] border border-[#262A33] rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">GST Collected</span>
            <span className="text-[10px] font-bold text-slate-400">5.0%</span>
          </div>
          <span className="text-2xl font-black text-amber-400 tabular-nums">
            {formatCurrency(summary.totalTaxes)}
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-[#181B20] border border-[#262A33] rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Payment Tenders</span>
            <CreditCard className="w-4 h-4 text-sky-400" strokeWidth={1.75} />
          </div>
          <div className="text-xs space-y-1 font-semibold text-slate-300 tabular-nums">
            <div className="flex justify-between">
              <span className="text-slate-400">Cash:</span>
              <span>{formatCurrency(summary.paymentBreakdown?.CASH || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">UPI / QR:</span>
              <span>{formatCurrency(summary.paymentBreakdown?.UPI || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Card:</span>
              <span>{formatCurrency(summary.paymentBreakdown?.CARD || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flattened Data Containers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top-Selling Dishes */}
        <TopSellingDishesCard dishes={data?.topSellingDishes} />

        {/* Recent Settled Bills */}
        <div className="p-4 sm:p-5 bg-[#181B20] border border-[#262A33] rounded-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#262A33]">
            <h3 className="text-sm font-bold text-slate-100 flex items-center">
              <Receipt className="w-4 h-4 mr-2 text-amber-500" strokeWidth={1.75} />
              Recent Settled Invoices
            </h3>
          </div>
          <div className="divide-y divide-[#262A33]">
            {data?.recentBills?.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No invoices settled yet.</p>
            ) : (
              data?.recentBills?.map((b: any, idx: number) => (
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

        {/* Void Audit Log */}
        <div className="p-4 sm:p-5 bg-[#181B20] border border-[#262A33] rounded-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#262A33]">
            <h3 className="text-sm font-bold text-slate-100 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2 text-rose-400" strokeWidth={1.75} />
              Manager Void Audit Log
            </h3>
          </div>
          <div className="divide-y divide-[#262A33]">
            {data?.recentVoids?.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No items voided today.</p>
            ) : (
              data?.recentVoids?.map((v: any) => (
                <div key={v.id} className="py-2.5 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-bold text-rose-300 block">{v.itemName}</span>
                    <span className="text-xs text-slate-400 block">
                      Auth by {v.authorizedByName} • &quot;{v.reason}&quot;
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                    {new Date(v.voidedAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
