"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { OrderDTO, OrderItemDTO, ItemStatus } from "@/types";
import { KDSTicketCard } from "@/components/kds/KDSTicketCard";
import { VoidAuthModal } from "@/components/pos/VoidAuthModal";
import { MobileAppBar } from "@/components/shared/MobileAppBar";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { ChefHat, Volume2, VolumeX } from "lucide-react";
import { playAlertSound } from "@/components/shared/AudioAlerts";
import { useSocket } from "@/hooks/useSocket";
import { SOCKET_ROOMS, SOCKET_EVENTS } from "@/server/events";

export default function KDSPage() {
  const router = useRouter();
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
    if (!res.ok) throw new Error((await res.json()).error || "Void failed");
    loadTickets();
  };

  return (
    <div className="min-h-[100dvh] bg-[#0F1115] flex flex-col pb-20 select-none">
      <MobileAppBar
        title="Kitchen Queue"
        subtitle={`${tickets.length} Active Tickets`}
        roleBadge="KDS"
        showBack={true}
        onBack={() => router.push("/")}
        rightAction={
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-9 h-9 rounded-full bg-[#0F1115] border border-[#262A33] flex items-center justify-center text-slate-300 hover:text-amber-400 active:scale-95 transition-all"
            title={soundEnabled ? "Mute Kitchen Chime" : "Enable Kitchen Chime"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-500" strokeWidth={1.75} />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" strokeWidth={1.75} />
            )}
          </button>
        }
      />

      <main className="flex-1 p-3 sm:p-5 max-w-5xl mx-auto w-full">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-slate-500 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#181B20] border border-[#262A33] flex items-center justify-center text-slate-400">
              <ChefHat className="w-8 h-8 text-amber-500" strokeWidth={1.75} />
            </div>
            <p className="text-base font-bold text-slate-200">No active tickets in queue</p>
            <p className="text-xs text-slate-500">Orders placed by servers appear here in real time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
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

      {voidTarget && (
        <VoidAuthModal
          isOpen={Boolean(voidTarget)}
          onClose={() => setVoidTarget(null)}
          itemId={voidTarget.id}
          itemName={voidTarget.menuItemName || "Item"}
          onConfirmVoid={handleConfirmVoid}
        />
      )}

      <MobileBottomNav role="KITCHEN" />
    </div>
  );
}
