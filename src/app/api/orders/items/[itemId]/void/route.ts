import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSocketIO } from "@/server/socketServer";
import { SOCKET_ROOMS, SOCKET_EVENTS } from "@/server/events";

export async function POST(
  req: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const itemId = params.itemId;
    const { pin, reason } = await req.json();

    const item = await db.orderItem.findUnique({
      where: { id: itemId },
      include: {
        menuItem: true,
        order: { include: { table: true } },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.status === "VOIDED") {
      return NextResponse.json({ error: "Item is already voided" }, { status: 400 });
    }

    let authorizingAdmin = null;

    // Items in PREPARING or READY_TO_SERVE require valid Admin PIN
    if (item.status === "PREPARING" || item.status === "READY_TO_SERVE") {
      if (!pin) {
        return NextResponse.json(
          { error: "Admin PIN required for items already in kitchen prep" },
          { status: 401 }
        );
      }

      // Check pin against Admin user or configured env pin
      authorizingAdmin = await db.user.findFirst({
        where: {
          role: "ADMIN",
          pin: pin,
          isActive: true,
        },
      });

      const masterPin = process.env.ADMIN_VOID_PIN || "1234";
      if (!authorizingAdmin && pin !== masterPin) {
        return NextResponse.json({ error: "Invalid Admin Void PIN" }, { status: 403 });
      }

      if (!authorizingAdmin) {
        authorizingAdmin = await db.user.findFirst({ where: { role: "ADMIN" } });
      }
    } else {
      authorizingAdmin = await db.user.findFirst({ where: { role: "ADMIN" } });
    }

    // Deduct voided item amount from order subtotal
    const voidAmount = item.unitPrice * item.quantity;
    const newSubtotal = Math.max(0, item.order.subtotal - voidAmount);

    // Update item and create audit VoidLog
    await db.$transaction([
      db.orderItem.update({
        where: { id: item.id },
        data: {
          status: "VOIDED",
          voidReason: reason || "Voided by manager",
          voidedById: authorizingAdmin?.id,
          voidedAt: new Date(),
        },
      }),
      db.order.update({
        where: { id: item.orderId },
        data: { subtotal: newSubtotal },
      }),
      db.voidLog.create({
        data: {
          orderItemId: item.id,
          authorizedById: authorizingAdmin?.id || item.order.waiterId,
          reason: reason || "Manager Void",
        },
      }),
    ]);

    const io = getSocketIO();
    if (io) {
      io.to(SOCKET_ROOMS.RESTAURANT).emit(SOCKET_EVENTS.ORDER_ITEM_VOIDED, {
        orderId: item.orderId,
        itemId: item.id,
        tableNumber: item.order.table?.tableNumber || "",
        reason: reason || "Item Voided",
        authorizedBy: authorizingAdmin?.name || "Admin",
      });
    }

    return NextResponse.json({ success: true, message: "Item voided successfully" });
  } catch (err) {
    console.error("Void item error:", err);
    return NextResponse.json({ error: "Failed to void item" }, { status: 500 });
  }
}
