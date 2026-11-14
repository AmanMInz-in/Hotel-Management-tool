import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSocketIO } from "@/server/socketServer";
import { SOCKET_ROOMS, SOCKET_EVENTS } from "@/server/events";

export async function POST(req: Request) {
  try {
    const { primaryTableId, secondaryTableId } = await req.json();

    if (!primaryTableId || !secondaryTableId) {
      return NextResponse.json({ error: "Both table IDs required" }, { status: 400 });
    }

    const primary = await db.restaurantTable.findUnique({
      where: { id: primaryTableId },
      include: { orders: { where: { status: "ACTIVE" } } },
    });

    const secondary = await db.restaurantTable.findUnique({
      where: { id: secondaryTableId },
      include: { orders: { where: { status: "ACTIVE" } } },
    });

    if (!primary || !secondary) {
      return NextResponse.json({ error: "Tables not found" }, { status: 404 });
    }

    const primaryOrder = primary.orders[0];
    const secondaryOrder = secondary.orders[0];

    // If secondary has items, merge them into primary order
    if (primaryOrder && secondaryOrder) {
      await db.$transaction([
        db.orderItem.updateMany({
          where: { orderId: secondaryOrder.id },
          data: { orderId: primaryOrder.id },
        }),
        db.order.update({
          where: { id: secondaryOrder.id },
          data: { status: "CANCELLED", notes: "Merged into " + primary.tableNumber },
        }),
        db.restaurantTable.update({
          where: { id: secondaryTableId },
          data: { status: "OCCUPIED", mergedIntoTableId: primaryTableId, activeOrderId: null },
        }),
      ]);
    } else {
      await db.restaurantTable.update({
        where: { id: secondaryTableId },
        data: { status: "OCCUPIED", mergedIntoTableId: primaryTableId },
      });
    }

    const io = getSocketIO();
    if (io) {
      io.to(SOCKET_ROOMS.RESTAURANT).emit(SOCKET_EVENTS.TABLE_MERGED, {
        sourceTableId: secondary.id,
        targetTableId: primary.id,
        targetTableNumber: primary.tableNumber,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Table merge error:", err);
    return NextResponse.json({ error: "Failed to merge tables" }, { status: 500 });
  }
}
