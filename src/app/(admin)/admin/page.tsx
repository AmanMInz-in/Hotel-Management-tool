"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, Receipt, CreditCard, CalendarCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { TopSellingDishesCard } from "@/components/admin/TopSellingDishesCard";
import { RecentSettledBillsCard } from "@/components/admin/RecentSettledBillsCard";
import { VoidAuditLogCard } from "@/components/admin/VoidAuditLogCard";
import { CollectionPeriodFilter, CollectionPeriod } from "@/components/admin/CollectionPeriodFilter";

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<CollectionPeriod>("day");
  const [isExporting, setIsExporting] = useState(false);

  const loadData = useCallback(async (selectedPeriod: CollectionPeriod) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/sales?period=${selectedPeriod}`);
      const d = await res.json();
      setData(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(period);
  }, [period, loadData]);

  const handleExportCsv = () => {
    setIsExporting(true);
    window.location.href = `/api/reports/export-csv?period=${period}`;
    setTimeout(() => setIsExporting(false), 2000);
  };

  const periodLabelMap: Record<CollectionPeriod, string> = {
    day: "Today's Collection",
    week: "This Week's Collection",
    month: "This Month's Collection",
    all: "All-Time Historical Collection",
  };

  const summary = data?.summary || {
    totalRevenue: 0,
    totalTaxes: 0,
    totalDiscounts: 0,
    ordersCompleted: 0,
    paymentBreakdown: { CASH: 0, UPI: 0, CARD: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Period Selector & CSV Export Action Bar */}
      <CollectionPeriodFilter
        selectedPeriod={period}
        onSelectPeriod={setPeriod}
        isExporting={isExporting}
        onExportCsv={handleExportCsv}
      />

      {/* Real Operational KPI Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#181B20] border border-[#262A33] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 bg-[#181B20] border border-[#262A33] rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{periodLabelMap[period]}</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" strokeWidth={1.75} />
            </div>
            <span className="text-2xl font-black text-slate-100 tabular-nums font-mono">
              {formatCurrency(summary.totalRevenue)}
            </span>
          </div>

          <div className="p-4 sm:p-5 bg-[#181B20] border border-[#262A33] rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Settled Orders</span>
              <Receipt className="w-4 h-4 text-amber-500" strokeWidth={1.75} />
            </div>
            <span className="text-2xl font-black text-slate-100 tabular-nums font-mono">
              {summary.ordersCompleted}
            </span>
          </div>

          <div className="p-4 sm:p-5 bg-[#181B20] border border-[#262A33] rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">GST Collected</span>
              <span className="text-[10px] font-bold text-slate-400">5.0%</span>
            </div>
            <span className="text-2xl font-black text-amber-400 tabular-nums font-mono">
              {formatCurrency(summary.totalTaxes)}
            </span>
          </div>

          <div className="p-4 sm:p-5 bg-[#181B20] border border-[#262A33] rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Payment Tenders</span>
              <CreditCard className="w-4 h-4 text-sky-400" strokeWidth={1.75} />
            </div>
            <div className="text-xs space-y-1 font-semibold text-slate-300 tabular-nums font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Cash:</span>
                <span>{formatCurrency(summary.paymentBreakdown?.CASH || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">UPI:</span>
                <span>{formatCurrency(summary.paymentBreakdown?.UPI || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Card:</span>
                <span>{formatCurrency(summary.paymentBreakdown?.CARD || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operational Breakdown Data Containers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopSellingDishesCard dishes={data?.topSellingDishes} />
        <RecentSettledBillsCard bills={data?.recentBills} />
        <VoidAuditLogCard voids={data?.recentVoids} />
      </div>
    </div>
  );
}
