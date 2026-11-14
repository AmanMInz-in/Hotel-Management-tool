import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSocketIO } from "@/server/socketServer";
import { SOCKET_ROOMS, SOCKET_EVENTS } from "@/server/events";

export async function GET() {
  try {
    const orders = await db.order.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
      include: {
        table: true,
        waiter: true,
        items: {
          include: { menuItem: true },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Failed to fetch orders:", err);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { tableId, items, orderNotes } = await req.json();

    if (!tableId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Table and items are required" }, { status: 400 });
    }

    const table = await db.restaurantTable.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Default to the first waiter user
    const waiter = await db.user.findFirst({
      where: { role: "WAITER" },
    }) || await db.user.findFirst();

    if (!waiter) {
      return NextResponse.json({ error: "No staff user configured" }, { status: 500 });
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const subtotal = items.reduce(
      (sum: number, it: { unitPrice: number; quantity: number }) =>
        sum + it.unitPrice * it.quantity,
      0
    );

    // Create Order and Items in transaction
    const order = await db.order.create({
      data: {
        orderNumber,
        tableId,
        waiterId: waiter.id,
        status: "ACTIVE",
        subtotal,
        notes: orderNotes,
        items: {
          create: items.map((it: { menuItemId: string; quantity: number; unitPrice: number; notes?: string }) => ({
            menuItemId: it.menuItemId,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            notes: it.notes || null,
            roundNumber: 1,
            isAddon: false,
            status: "PENDING",
          })),
        },
      },
      include: {
        table: true,
        waiter: true,
        items: {
          include: { menuItem: true },
        },
      },
    });

    // Update table status to OCCUPIED
    await db.restaurantTable.update({
      where: { id: tableId },
      data: { status: "OCCUPIED", activeOrderId: order.id },
    });

    // Real-time broadcast
    const io = getSocketIO();
    if (io) {
      io.to(SOCKET_ROOMS.KDS).emit(SOCKET_EVENTS.ORDER_CREATED, {
        orderId: order.id,
        orderNumber: order.orderNumber,
        tableId: table.id,
        tableNumber: table.tableNumber,
        items: order.items.map((i) => ({
          id: i.id,
          orderId: i.orderId,
          menuItemId: i.menuItemId,
          menuItemName: i.menuItem.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          notes: i.notes,
          roundNumber: 1,
          isAddon: false,
          status: i.status as any,
          createdAt: i.createdAt.toISOString(),
        })),
        roundNumber: 1,
        createdAt: order.createdAt.toISOString(),
      });

      io.to(SOCKET_ROOMS.RESTAURANT).emit(SOCKET_EVENTS.TABLE_STATUS_CHANGED, {
        tableId: table.id,
        tableNumber: table.tableNumber,
        status: "OCCUPIED",
        activeOrderId: order.id,
      });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    console.error("Failed to create order:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
