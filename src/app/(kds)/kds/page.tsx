"use client";

import React, { useState, useEffect, useCallback } from "react";
import { OrderDTO, OrderItemDTO, ItemStatus } from "@/types";
import { KDSHeader } from "@/components/kds/KDSHeader";
import { KDSTicketCard } from "@/components/kds/KDSTicketCard";
import { VoidAuthModal } from "@/components/pos/VoidAuthModal";
import { ChefHat } from "lucide-react";
import { playAlertSound } from "@/components/shared/AudioAlerts";
import { useSocket } from "@/hooks/useSocket";
import { SOCKET_ROOMS, SOCKET_EVENTS } from "@/server/events";

export default function KDSPage() {
  const socket = useSocket(SOCKET_ROOMS.KDS);

  const [tickets, setTickets] = useState<OrderDTO[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voidTarget, setVoidTarget] = useState<OrderItemDTO | null>(null);

  const loadTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/kds/tickets");
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Real-time socket events for KDS
  useEffect(() => {
    if (!socket) return;

    socket.on(SOCKET_EVENTS.ORDER_CREATED, () => {
      if (soundEnabled) playAlertSound("new_order");
      loadTickets();
    });

    socket.on(SOCKET_EVENTS.ORDER_ADDON_ADDED, () => {
      if (soundEnabled) playAlertSound("addon");
      loadTickets();
    });

    socket.on(SOCKET_EVENTS.ORDER_ITEM_STATUS_UPDATED, () => loadTickets());
    socket.on(SOCKET_EVENTS.ORDER_ITEM_VOIDED, () => loadTickets());
    socket.on(SOCKET_EVENTS.KDS_TICKET_BUMPED, () => loadTickets());

    return () => {
      socket.off(SOCKET_EVENTS.ORDER_CREATED);
      socket.off(SOCKET_EVENTS.ORDER_ADDON_ADDED);
      socket.off(SOCKET_EVENTS.ORDER_ITEM_STATUS_UPDATED);
      socket.off(SOCKET_EVENTS.ORDER_ITEM_VOIDED);
      socket.off(SOCKET_EVENTS.KDS_TICKET_BUMPED);
    };
  }, [socket, soundEnabled, loadTickets]);

  const handleItemStatusChange = async (itemId: string, newStatus: ItemStatus) => {
    await fetch(`/api/orders/items/${itemId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    loadTickets();
  };

  const handleBumpTicket = async (orderId: string) => {
    await fetch("/api/kds/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    loadTickets();
  };

  const handleConfirmVoid = async (itemId: string, pin: string, reason: string) => {
    const res = await fetch(`/api/orders/items/${itemId}/void`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, reason }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Void failed");
    }
    loadTickets();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <KDSHeader
        activeCount={tickets.length}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      <main className="flex-1 p-6 overflow-x-auto">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-slate-500 space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#181B20] border border-[#262A33] flex items-center justify-center text-slate-400">
              <ChefHat className="w-8 h-8 text-amber-500/80" strokeWidth={1.75} />
            </div>
            <p className="text-lg font-semibold text-slate-200">No active orders in queue</p>
            <p className="text-xs text-slate-500">All kitchen tickets have been fulfilled and bumped.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tickets.map((ticket) => (
              <KDSTicketCard
                key={ticket.id}
                order={ticket}
                onItemStatusChange={handleItemStatusChange}
                onRequestVoid={setVoidTarget}
                onBumpTicket={handleBumpTicket}
              />
            ))}
          </div>
        )}
      </main>

      {voidTarget ? (
        <VoidAuthModal
          isOpen={Boolean(voidTarget)}
          onClose={() => setVoidTarget(null)}
          itemId={voidTarget.id}
          itemName={voidTarget.menuItemName || "Item"}
          onConfirmVoid={handleConfirmVoid}
        />
      ) : null}
    </div>
  );
}
