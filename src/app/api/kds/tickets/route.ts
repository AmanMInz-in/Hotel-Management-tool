import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSocketIO } from "@/server/socketServer";
import { SOCKET_ROOMS, SOCKET_EVENTS } from "@/server/events";

export async function GET() {
  try {
    const orders = await db.order.findMany({
      where: {
        status: "ACTIVE",
        items: {
          some: {
            status: { in: ["PENDING", "PREPARING", "READY_TO_SERVE"] },
          },
        },
      },
      orderBy: { createdAt: "asc" }, // FIFO Chronological Queue
      include: {
        table: true,
        waiter: true,
        items: {
          include: { menuItem: true },
        },
      },
    });

    const tickets = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      tableId: order.tableId,
      tableNumber: order.table?.tableNumber || "Takeaway",
      waiterName: order.waiter.name,
      status: order.status,
      orderType: order.orderType,
      subtotal: order.subtotal,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((i) => ({
        id: i.id,
        orderId: i.orderId,
        menuItemId: i.menuItemId,
        menuItemName: i.menuItem.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        notes: i.notes,
        roundNumber: i.roundNumber,
        isAddon: i.isAddon,
        status: i.status,
        voidReason: i.voidReason,
        createdAt: i.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json({ tickets });
  } catch (err) {
    console.error("Failed to fetch KDS tickets:", err);
    return NextResponse.json({ error: "Failed to load KDS tickets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // If items are still PENDING or PREPARING, mark them READY_TO_SERVE.
    // If all are already READY_TO_SERVE, bump them to SERVED.
    const pendingCount = await db.orderItem.count({
      where: {
        orderId,
        status: { in: ["PENDING", "PREPARING"] },
      },
    });

    if (pendingCount > 0) {
      await db.orderItem.updateMany({
        where: {
          orderId,
          status: { in: ["PENDING", "PREPARING"] },
        },
        data: { status: "READY_TO_SERVE" },
      });
    } else {
      await db.orderItem.updateMany({
        where: {
          orderId,
          status: "READY_TO_SERVE",
        },
        data: { status: "SERVED" },
      });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { table: true },
    });

    const io = getSocketIO();
    if (io) {
      const payload = {
        orderId,
        tableNumber: order?.table?.tableNumber || "",
        completedAt: new Date().toISOString(),
      };
      io.to(SOCKET_ROOMS.WAITERS).emit(SOCKET_EVENTS.KDS_TICKET_BUMPED, payload);
      io.to(SOCKET_ROOMS.KDS).emit(SOCKET_EVENTS.KDS_TICKET_BUMPED, payload);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Bump ticket error:", err);
    return NextResponse.json({ error: "Failed to bump ticket" }, { status: 500 });
  }
}
