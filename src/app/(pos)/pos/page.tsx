"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BellRing, X } from "lucide-react";
import Link from "next/link";
import { RestaurantTableDTO, SectionDTO } from "@/types";
import { TableGrid } from "@/components/pos/TableGrid";
import { TableActionModal } from "@/components/pos/TableActionModal";
import { TableTransferModal } from "@/components/pos/TableTransferModal";
import { TableMergeModal } from "@/components/pos/TableMergeModal";
import { BillPreviewModal } from "@/components/pos/BillPreviewModal";
import { ReceiptPrintView } from "@/components/shared/ReceiptPrintView";
import { playAlertSound } from "@/components/shared/AudioAlerts";
import { useSocket } from "@/hooks/useSocket";
import { useTableOperations } from "@/hooks/useTableOperations";
import { UserNav } from "@/components/shared/UserNav";
import { SOCKET_ROOMS, SOCKET_EVENTS } from "@/server/events";

export default function WaiterPOSPage() {
  const router = useRouter();
  const socket = useSocket(SOCKET_ROOMS.WAITERS);

  const [sections, setSections] = useState<SectionDTO[]>([]);
  const [tables, setTables] = useState<RestaurantTableDTO[]>([]);
  const [selectedTable, setSelectedTable] = useState<RestaurantTableDTO | null>(null);
  const [activeModal, setActiveModal] = useState<"action" | "transfer" | "merge" | "bill" | null>(null);
  const [readyNotification, setReadyNotification] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/tables");
      const data = await res.json();
      if (data.sections && data.tables) {
        setSections(data.sections);
        setTables(data.tables);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const ops = useTableOperations(loadData);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time socket events listener for Waiter Handheld
  useEffect(() => {
    if (!socket) return;

    socket.on(SOCKET_EVENTS.TABLE_STATUS_CHANGED, () => loadData());
    socket.on(SOCKET_EVENTS.TABLE_TRANSFERRED, () => loadData());
    socket.on(SOCKET_EVENTS.TABLE_MERGED, () => loadData());
    socket.on(SOCKET_EVENTS.BILL_SETTLED, () => loadData());
    socket.on(SOCKET_EVENTS.KDS_TICKET_BUMPED, () => loadData());

    socket.on(SOCKET_EVENTS.ORDER_ITEM_STATUS_UPDATED, (data) => {
      if (data.status === "READY_TO_SERVE") {
        playAlertSound("ready_to_serve");
        setReadyNotification(`Table ${data.tableNumber}: ${data.itemName} is READY TO SERVE!`);
      }
      loadData();
    });

    return () => {
      socket.off(SOCKET_EVENTS.TABLE_STATUS_CHANGED);
      socket.off(SOCKET_EVENTS.TABLE_TRANSFERRED);
      socket.off(SOCKET_EVENTS.TABLE_MERGED);
      socket.off(SOCKET_EVENTS.BILL_SETTLED);
      socket.off(SOCKET_EVENTS.KDS_TICKET_BUMPED);
      socket.off(SOCKET_EVENTS.ORDER_ITEM_STATUS_UPDATED);
    };
  }, [socket, loadData]);

  const handleTableClick = (table: RestaurantTableDTO) => {
    setSelectedTable(table);
    setActiveModal("action");
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col">
      {/* Header */}
      <header className="px-6 py-3.5 bg-[#181B20] border-b border-[#262A33] flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <Link
            href="/"
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-[#0F1115] border border-[#262A33] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.75} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">Waiter POS Terminal</h1>
            <p className="text-xs text-slate-400">Live Floor Plan & Tables</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {readyNotification && (
            <div
              id="ready-to-serve-alert"
              className="flex items-center space-x-2 px-3.5 py-1.5 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold"
            >
              <BellRing className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.75} />
              <span>{readyNotification}</span>
              <button
                onClick={() => setReadyNotification(null)}
                className="ml-1 p-1 hover:text-white min-h-[28px] min-w-[28px] flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>
          )}
          <UserNav />
        </div>
      </header>

      {/* Main Floor Matrix */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <TableGrid sections={sections} tables={tables} onSelectTable={handleTableClick} />
      </main>

      {/* Floor Actions Modal */}
      <TableActionModal
        isOpen={activeModal === "action"}
        onClose={() => setActiveModal(null)}
        table={selectedTable}
        onOpenOrder={(tableId) => router.push(`/pos/order/${tableId}`)}
        onStartTransfer={() => setActiveModal("transfer")}
        onStartMerge={() => setActiveModal("merge")}
        onRequestBill={(tId) => {
          ops.requestBill(tId);
          setActiveModal(null);
        }}
        onStartSettlement={() => setActiveModal("bill")}
        onReleaseCleaning={(tId) => {
          ops.releaseCleaning(tId);
          setActiveModal(null);
        }}
      />

      <TableTransferModal
        isOpen={activeModal === "transfer"}
        onClose={() => setActiveModal(null)}
        sourceTable={selectedTable}
        availableTables={tables.filter((t) => t.status === "AVAILABLE")}
        onTransfer={ops.transferTable}
      />

      <TableMergeModal
        isOpen={activeModal === "merge"}
        onClose={() => setActiveModal(null)}
        primaryTable={selectedTable}
        otherTables={tables.filter((t) => t.status === "OCCUPIED")}
        onMerge={ops.mergeTable}
      />

      {selectedTable?.activeOrder && (
        <BillPreviewModal
          isOpen={activeModal === "bill"}
          onClose={() => setActiveModal(null)}
          tableNumber={selectedTable.tableNumber}
          orderId={selectedTable.activeOrder.id}
          subtotal={selectedTable.activeOrder.subtotal}
          onSettle={ops.settleBill}
        />
      )}

      <ReceiptPrintView
        isOpen={Boolean(ops.receipt)}
        onClose={() => ops.setReceipt(null)}
        receiptData={ops.receipt}
      />
    </div>
  );
}
