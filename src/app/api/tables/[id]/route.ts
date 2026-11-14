import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSocketIO } from "@/server/socketServer";
import { SOCKET_ROOMS, SOCKET_EVENTS } from "@/server/events";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tableId = params.id;

    // Check if table has active order
    const table = await db.restaurantTable.findUnique({
      where: { id: tableId },
      include: { orders: { where: { status: "ACTIVE" } } },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    if (table.orders.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete table with active order. Settle bill first." },
        { status: 400 }
      );
    }

    // Delete table
    await db.restaurantTable.delete({
      where: { id: tableId },
    });

    const io = getSocketIO();
    if (io) {
      io.to(SOCKET_ROOMS.RESTAURANT).emit(SOCKET_EVENTS.TABLE_STATUS_CHANGED, {
        tableId: table.id,
        tableNumber: table.tableNumber,
        status: "CLEANING", // triggers refresh on terminals
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete table error:", err);
    return NextResponse.json({ error: "Failed to delete table" }, { status: 500 });
  }
}
