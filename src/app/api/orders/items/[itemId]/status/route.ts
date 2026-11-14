import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSocketIO } from "@/server/socketServer";
import { SOCKET_ROOMS, SOCKET_EVENTS } from "@/server/events";
import { ItemStatus } from "@/types";

export async function PATCH(
  req: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const itemId = params.itemId;
    const { status } = await req.json();

    const validStatuses: ItemStatus[] = [
      "PENDING",
      "PREPARING",
      "READY_TO_SERVE",
      "SERVED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid item status" }, { status: 400 });
    }

    const item = await db.orderItem.update({
      where: { id: itemId },
      data: { status },
      include: {
        menuItem: true,
        order: {
          include: { table: true },
        },
      },
    });

    const io = getSocketIO();
    if (io) {
      const payload = {
        orderId: item.orderId,
        itemId: item.id,
        tableNumber: item.order.table?.tableNumber || "Takeaway",
        status: status as ItemStatus,
        itemName: item.menuItem.name,
      };

      // Broadcast to both Waiters and KDS
      io.to(SOCKET_ROOMS.WAITERS).emit(SOCKET_EVENTS.ORDER_ITEM_STATUS_UPDATED, payload);
      io.to(SOCKET_ROOMS.KDS).emit(SOCKET_EVENTS.ORDER_ITEM_STATUS_UPDATED, payload);
    }

    return NextResponse.json({ item });
  } catch (err) {
    console.error("Failed to update item status:", err);
    return NextResponse.json({ error: "Failed to update item status" }, { status: 500 });
  }
}
