import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSocketIO } from "@/server/socketServer";
import { SOCKET_ROOMS, SOCKET_EVENTS } from "@/server/events";

export async function GET() {
  try {
    const sections = await db.section.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        tables: {
          orderBy: { tableNumber: "asc" },
          include: {
            orders: {
              where: { status: "ACTIVE" },
              include: {
                items: {
                  include: { menuItem: true },
                },
                waiter: true,
              },
            },
          },
        },
      },
    });

    const tables = sections.flatMap((s) =>
      s.tables.map((t) => {
        const activeOrder = t.orders[0] || null;
        return {
          id: t.id,
          tableNumber: t.tableNumber,
          sectionId: t.sectionId,
          sectionName: s.name,
          capacity: t.capacity,
          status: t.status,
          activeOrderId: activeOrder?.id || null,
          posX: t.posX,
          posY: t.posY,
          activeOrder: activeOrder
            ? {
                id: activeOrder.id,
                orderNumber: activeOrder.orderNumber,
                subtotal: activeOrder.subtotal,
                status: activeOrder.status,
                createdAt: activeOrder.createdAt.toISOString(),
                waiterName: activeOrder.waiter.name,
                items: activeOrder.items.map((i) => ({
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
                  createdAt: i.createdAt.toISOString(),
                })),
              }
            : null,
        };
      })
    );

    return NextResponse.json({ sections, tables });
  } catch (err) {
    console.error("Failed to fetch tables:", err);
    return NextResponse.json({ error: "Failed to load tables" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tableNumber, sectionId, capacity } = body;

    if (!tableNumber || !sectionId) {
      return NextResponse.json({ error: "Table number and section required" }, { status: 400 });
    }

    const table = await db.restaurantTable.create({
      data: {
        tableNumber,
        sectionId,
        capacity: capacity || 4,
        status: "AVAILABLE",
      },
    });

    const io = getSocketIO();
    if (io) {
      io.to(SOCKET_ROOMS.RESTAURANT).emit(SOCKET_EVENTS.TABLE_STATUS_CHANGED, {
        tableId: table.id,
        tableNumber: table.tableNumber,
        status: "AVAILABLE",
      });
    }

    return NextResponse.json({ table }, { status: 201 });
  } catch (err) {
    console.error("Failed to create table:", err);
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
  }
}
