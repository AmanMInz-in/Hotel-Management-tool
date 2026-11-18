import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function getStartDateForPeriod(period: string): Date | null {
  const now = new Date();
  if (period === "day") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  if (period === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  if (period === "month") {
    const start = new Date(now);
    start.setDate(now.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const period = req.nextUrl.searchParams.get("period") || "day";
    const startDate = getStartDateForPeriod(period);

    const whereClause: any = {
      paymentStatus: "PAID",
    };
    if (startDate) {
      whereClause.createdAt = { gte: startDate };
    }

    const bills = await db.bill.findMany({
      where: whereClause,
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
      where: startDate ? { voidedAt: { gte: startDate } } : undefined,
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
      period,
      summary: {
        totalRevenue,
        totalTaxes,
        totalDiscounts,
        ordersCompleted: bills.length,
        paymentBreakdown,
      },
      topSellingDishes,
      recentBills: bills.map((b) => ({
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
