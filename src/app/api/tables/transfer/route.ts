import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSocketIO } from "@/server/socketServer";
import { SOCKET_ROOMS, SOCKET_EVENTS } from "@/server/events";

export async function POST(req: Request) {
  try {
    const { fromTableId, toTableId } = await req.json();

    if (!fromTableId || !toTableId) {
      return NextResponse.json({ error: "Source and destination table required" }, { status: 400 });
    }

    const source = await db.restaurantTable.findUnique({
      where: { id: fromTableId },
      include: { orders: { where: { status: "ACTIVE" } } },
    });

    const target = await db.restaurantTable.findUnique({
      where: { id: toTableId },
    });

    if (!source || !target) {
      return NextResponse.json({ error: "Tables not found" }, { status: 404 });
    }

    if (target.status !== "AVAILABLE") {
      return NextResponse.json({ error: "Target table is not available" }, { status: 400 });
    }

    const activeOrder = source.orders[0];
    if (!activeOrder) {
      return NextResponse.json({ error: "No active order on source table" }, { status: 400 });
    }

    // Reassign order
    await db.$transaction([
      db.order.update({
        where: { id: activeOrder.id },
        data: { tableId: toTableId },
      }),
      db.restaurantTable.update({
        where: { id: fromTableId },
        data: { status: "CLEANING", activeOrderId: null },
      }),
      db.restaurantTable.update({
        where: { id: toTableId },
        data: { status: "OCCUPIED", activeOrderId: activeOrder.id },
      }),
    ]);

    const io = getSocketIO();
    if (io) {
      io.to(SOCKET_ROOMS.RESTAURANT).emit(SOCKET_EVENTS.TABLE_TRANSFERRED, {
        fromTableId: source.id,
        toTableId: target.id,
        fromTableNumber: source.tableNumber,
        toTableNumber: target.tableNumber,
        orderId: activeOrder.id,
      });

      io.to(SOCKET_ROOMS.RESTAURANT).emit(SOCKET_EVENTS.TABLE_STATUS_CHANGED, {
        tableId: source.id,
        tableNumber: source.tableNumber,
        status: "CLEANING",
      });

      io.to(SOCKET_ROOMS.RESTAURANT).emit(SOCKET_EVENTS.TABLE_STATUS_CHANGED, {
        tableId: target.id,
        tableNumber: target.tableNumber,
        status: "OCCUPIED",
        activeOrderId: activeOrder.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Table transfer error:", err);
    return NextResponse.json({ error: "Failed to transfer table" }, { status: 500 });
  }
}
