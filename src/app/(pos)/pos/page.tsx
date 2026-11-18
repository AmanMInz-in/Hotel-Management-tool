"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BellRing, X } from "lucide-react";
import { RestaurantTableDTO, SectionDTO } from "@/types";
import { TableGrid } from "@/components/pos/TableGrid";
import { TableActionModal } from "@/components/pos/TableActionModal";
import { TableTransferModal } from "@/components/pos/TableTransferModal";
import { TableMergeModal } from "@/components/pos/TableMergeModal";
import { BillPreviewModal } from "@/components/pos/BillPreviewModal";
import { ReceiptPrintView } from "@/components/shared/ReceiptPrintView";
import { MobileAppBar } from "@/components/shared/MobileAppBar";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { playAlertSound } from "@/components/shared/AudioAlerts";
import { useSocket } from "@/hooks/useSocket";
import { useTableOperations } from "@/hooks/useTableOperations";
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
        setReadyNotification(`Table ${data.tableNumber}: ${data.itemName} READY`);
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
    <div className="min-h-[100dvh] bg-[#0F1115] flex flex-col pb-20 select-none">
      {/* Native Compact Top App Bar */}
      <MobileAppBar
        title="Floor Tables"
        subtitle="Handheld Server POS"
        roleBadge="Server"
        showBack={true}
        onBack={() => router.push("/")}
      />

      {/* Real-time Order Ready Banner */}
      {readyNotification && (
        <div
          id="ready-to-serve-alert"
          className="mx-3 mt-2.5 flex items-center justify-between px-3.5 py-2.5 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold shadow-lg animate-bounce"
        >
          <div className="flex items-center space-x-2">
            <BellRing className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2} />
            <span>{readyNotification}</span>
          </div>
          <button
            onClick={() => setReadyNotification(null)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Main Floor Matrix */}
      <main className="flex-1 p-3 sm:p-5 max-w-4xl mx-auto w-full">
        <TableGrid sections={sections} tables={tables} onSelectTable={handleTableClick} />
      </main>

      {/* Native Bottom Sheets */}
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

      {/* Fixed Native Bottom Navigation */}
      <MobileBottomNav role="WAITER" readyCount={readyNotification ? 1 : 0} />
    </div>
  );
}
