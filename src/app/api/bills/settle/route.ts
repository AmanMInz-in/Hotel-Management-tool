import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSocketIO } from "@/server/socketServer";
import { SOCKET_ROOMS, SOCKET_EVENTS } from "@/server/events";
import { computeBillTotals } from "@/lib/calculations";
import { DiscountType, PaymentMode } from "@/types";

export async function POST(req: Request) {
  try {
    const { orderId, discountType, discountValue, paymentMode, cashTendered, referenceNumber } =
      await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        table: true,
        items: {
          where: { status: { not: "VOIDED" } },
          include: { menuItem: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const calculations = computeBillTotals({
      subtotal: order.subtotal,
      discountType: (discountType as DiscountType) || "NONE",
      discountValue: discountValue || 0,
      taxRatePercent: 5.0,
    });

    const billNumber = `INV-${Date.now().toString().slice(-6)}`;
    const cashier =
      (await db.user.findFirst({ where: { role: "ADMIN" } })) ||
      (await db.user.findFirst())!;

    // Create Bill, Payment, mark Order COMPLETED, reset table to CLEANING
    const [bill] = await db.$transaction([
      db.bill.create({
        data: {
          billNumber,
          orderId: order.id,
          tableId: order.tableId,
          cashierId: cashier.id,
          subtotal: calculations.subtotal,
          discountType: (discountType as DiscountType) || "NONE",
          discountValue: discountValue || 0,
          discountAmount: calculations.discountAmount,
          cgstAmount: calculations.cgstAmount,
          sgstAmount: calculations.sgstAmount,
          roundOff: calculations.roundOff,
          grandTotal: calculations.grandTotal,
          paymentStatus: "PAID",
          payments: {
            create: {
              paymentMode: (paymentMode as PaymentMode) || "CASH",
              amount: calculations.grandTotal,
              referenceNumber: referenceNumber || null,
              cashTendered: cashTendered || null,
              changeAmount: cashTendered ? Math.max(0, cashTendered - calculations.grandTotal) : null,
            },
          },
        },
      }),
      db.order.update({
        where: { id: order.id },
        data: {
          status: "COMPLETED",
          grandTotal: calculations.grandTotal,
          taxTotal: calculations.cgstAmount + calculations.sgstAmount,
          discountTotal: calculations.discountAmount,
        },
      }),
      ...(order.tableId
        ? [
            db.restaurantTable.update({
              where: { id: order.tableId },
              data: { status: "CLEANING", activeOrderId: null },
            }),
          ]
        : []),
    ]);

    const io = getSocketIO();
    if (io) {
      io.to(SOCKET_ROOMS.RESTAURANT).emit(SOCKET_EVENTS.BILL_SETTLED, {
        billId: bill.id,
        tableId: order.tableId || "",
        tableNumber: order.table?.tableNumber || "",
        grandTotal: calculations.grandTotal,
        paymentMode: paymentMode || "CASH",
      });

      if (order.tableId && order.table) {
        io.to(SOCKET_ROOMS.RESTAURANT).emit(SOCKET_EVENTS.TABLE_STATUS_CHANGED, {
          tableId: order.tableId,
          tableNumber: order.table.tableNumber,
          status: "CLEANING",
        });
      }
    }

    const receipt = {
      billNumber: bill.billNumber,
      orderNumber: order.orderNumber,
      tableNumber: order.table?.tableNumber || "Direct",
      items: order.items.map((i) => ({
        name: i.menuItem.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      subtotal: calculations.subtotal,
      discountAmount: calculations.discountAmount,
      cgstAmount: calculations.cgstAmount,
      sgstAmount: calculations.sgstAmount,
      grandTotal: calculations.grandTotal,
      paymentMode: paymentMode || "CASH",
      settledAt: bill.createdAt.toISOString(),
    };

    return NextResponse.json({ success: true, bill, receipt });
  } catch (err) {
    console.error("Bill settlement error:", err);
    return NextResponse.json({ error: "Failed to settle bill" }, { status: 500 });
  }
}
