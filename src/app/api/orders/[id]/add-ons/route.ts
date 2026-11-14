import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSocketIO } from "@/server/socketServer";
import { SOCKET_ROOMS, SOCKET_EVENTS } from "@/server/events";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const { items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Add-on items required" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { table: true, items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Determine current max round number
    const currentMaxRound = order.items.reduce(
      (max, i) => Math.max(max, i.roundNumber),
      1
    );
    const nextRoundNumber = currentMaxRound + 1;

    // Additional subtotal
    const addonSubtotal = items.reduce(
      (sum: number, it: { unitPrice: number; quantity: number }) =>
        sum + it.unitPrice * it.quantity,
      0
    );

    // Create addon items
    const createdItems = await Promise.all(
      items.map((it: { menuItemId: string; quantity: number; unitPrice: number; notes?: string }) =>
        db.orderItem.create({
          data: {
            orderId: order.id,
            menuItemId: it.menuItemId,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            notes: it.notes || null,
            roundNumber: nextRoundNumber,
            isAddon: true,
            status: "PENDING",
          },
          include: { menuItem: true },
        })
      )
    );

    // Update order subtotal
    await db.order.update({
      where: { id: order.id },
      data: { subtotal: order.subtotal + addonSubtotal },
    });

    // Real-time notify KDS
    const io = getSocketIO();
    if (io) {
      io.to(SOCKET_ROOMS.KDS).emit(SOCKET_EVENTS.ORDER_ADDON_ADDED, {
        orderId: order.id,
        orderNumber: order.orderNumber,
        tableId: order.tableId || "",
        tableNumber: order.table?.tableNumber || "",
        items: createdItems.map((i) => ({
          id: i.id,
          orderId: i.orderId,
          menuItemId: i.menuItemId,
          menuItemName: i.menuItem.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          notes: i.notes,
          roundNumber: nextRoundNumber,
          isAddon: true,
          status: i.status as any,
          createdAt: i.createdAt.toISOString(),
        })),
        roundNumber: nextRoundNumber,
        isAddon: true,
      });
    }

    return NextResponse.json({ success: true, items: createdItems });
  } catch (err) {
    console.error("Failed to add add-on items:", err);
    return NextResponse.json({ error: "Failed to add items" }, { status: 500 });
  }
}
