import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const bills = await db.bill.findMany({
      where: { paymentStatus: "PAID" },
      include: {
        table: true,
        payments: true,
        order: {
          include: {
            items: { include: { menuItem: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const voidLogs = await db.voidLog.findMany({
      take: 20,
      orderBy: { voidedAt: "desc" },
      include: {
        authorizedBy: true,
        orderItem: { include: { menuItem: true } },
      },
    });

    const totalRevenue = bills.reduce((sum, b) => sum + b.grandTotal, 0);
    const totalTaxes = bills.reduce((sum, b) => sum + b.cgstAmount + b.sgstAmount, 0);
    const totalDiscounts = bills.reduce((sum, b) => sum + b.discountAmount, 0);

    const paymentBreakdown: Record<string, number> = {
      CASH: 0,
      UPI: 0,
      CARD: 0,
    };

    bills.forEach((b) => {
      b.payments.forEach((p) => {
        paymentBreakdown[p.paymentMode] =
          (paymentBreakdown[p.paymentMode] || 0) + p.amount;
      });
    });

    const dishSalesMap: Record<string, { id: string; name: string; quantity: number; revenue: number }> = {};
    bills.forEach((b) => {
      b.order?.items?.forEach((it) => {
        if (it.status !== "VOIDED") {
          const dishId = it.menuItemId;
          if (!dishSalesMap[dishId]) {
            dishSalesMap[dishId] = {
              id: dishId,
              name: it.menuItem.name,
              quantity: 0,
              revenue: 0,
            };
          }
          dishSalesMap[dishId].quantity += it.quantity;
          dishSalesMap[dishId].revenue += it.quantity * it.unitPrice;
        }
      });
    });

    const topSellingDishes = Object.values(dishSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalTaxes,
        totalDiscounts,
        ordersCompleted: bills.length,
        paymentBreakdown,
      },
      topSellingDishes,
      recentBills: bills.slice(0, 10).map((b) => ({
        billNumber: b.billNumber,
        tableNumber: b.table?.tableNumber || "Direct",
        grandTotal: b.grandTotal,
        paymentMode: b.payments[0]?.paymentMode || "CASH",
        createdAt: b.createdAt.toISOString(),
      })),
      recentVoids: voidLogs.map((v) => ({
        id: v.id,
        itemName: v.orderItem.menuItem.name,
        authorizedByName: v.authorizedBy.name,
        reason: v.reason,
        voidedAt: v.voidedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("Sales report error:", err);
    return NextResponse.json({ error: "Failed to generate sales report" }, { status: 500 });
  }
}
