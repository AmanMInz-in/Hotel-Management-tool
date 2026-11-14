import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSocketIO } from "@/server/socketServer";
import { SOCKET_ROOMS, SOCKET_EVENTS } from "@/server/events";
import { TableStatus } from "@/types";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();
    const tableId = params.id;

    const validStatuses: TableStatus[] = [
      "AVAILABLE",
      "OCCUPIED",
      "BILL_REQUESTED",
      "CLEANING",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const table = await db.restaurantTable.update({
      where: { id: tableId },
      data: { status },
    });

    const io = getSocketIO();
    if (io) {
      io.to(SOCKET_ROOMS.RESTAURANT).emit(SOCKET_EVENTS.TABLE_STATUS_CHANGED, {
        tableId: table.id,
        tableNumber: table.tableNumber,
        status: status as TableStatus,
      });

      if (status === "BILL_REQUESTED") {
        io.to(SOCKET_ROOMS.WAITERS).emit(SOCKET_EVENTS.BILL_REQUESTED, {
          tableId: table.id,
          tableNumber: table.tableNumber,
          orderId: table.activeOrderId || "",
          subtotal: 0,
        });
      }
    }

    return NextResponse.json({ table });
  } catch (err) {
    console.error("Failed to update table status:", err);
    return NextResponse.json({ error: "Failed to update table status" }, { status: 500 });
  }
}
