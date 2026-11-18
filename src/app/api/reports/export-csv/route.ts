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

function escapeCsvField(val: string | number | undefined | null): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
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

    const headers = [
      "Bill Number",
      "Date",
      "Time",
      "Table",
      "Items Summary",
      "Subtotal (INR)",
      "Discount (INR)",
      "CGST (2.5%)",
      "SGST (2.5%)",
      "Grand Total (INR)",
      "Payment Mode",
      "Payment Status",
    ];

    let totalSubtotal = 0;
    let totalDiscount = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalGrand = 0;

    const rows = bills.map((b) => {
      totalSubtotal += b.subtotal;
      totalDiscount += b.discountAmount;
      totalCgst += b.cgstAmount;
      totalSgst += b.sgstAmount;
      totalGrand += b.grandTotal;

      const dateStr = b.createdAt.toISOString().split("T")[0];
      const timeStr = b.createdAt.toTimeString().split(" ")[0];
      const tableStr = b.table?.tableNumber ? `Table ${b.table.tableNumber}` : "Direct";
      
      const itemSummaries = b.order?.items
        ?.filter((it) => it.status !== "VOIDED")
        ?.map((it) => `${it.quantity}x ${it.menuItem.name}`)
        ?.join("; ") || "N/A";

      const paymentModes = b.payments.map((p) => p.paymentMode).join("/") || "CASH";

      return [
        escapeCsvField(b.billNumber),
        escapeCsvField(dateStr),
        escapeCsvField(timeStr),
        escapeCsvField(tableStr),
        escapeCsvField(itemSummaries),
        escapeCsvField(b.subtotal.toFixed(2)),
        escapeCsvField(b.discountAmount.toFixed(2)),
        escapeCsvField(b.cgstAmount.toFixed(2)),
        escapeCsvField(b.sgstAmount.toFixed(2)),
        escapeCsvField(b.grandTotal.toFixed(2)),
        escapeCsvField(paymentModes),
        escapeCsvField(b.paymentStatus),
      ].join(",");
    });

    // Summary totals row
    const totalsRow = [
      escapeCsvField("SUMMARY TOTALS"),
      escapeCsvField(`Period: ${period.toUpperCase()}`),
      escapeCsvField(""),
      escapeCsvField(`${bills.length} Orders`),
      escapeCsvField(""),
      escapeCsvField(totalSubtotal.toFixed(2)),
      escapeCsvField(totalDiscount.toFixed(2)),
      escapeCsvField(totalCgst.toFixed(2)),
      escapeCsvField(totalSgst.toFixed(2)),
      escapeCsvField(totalGrand.toFixed(2)),
      escapeCsvField(""),
      escapeCsvField(""),
    ].join(",");

    const csvContent = [headers.join(","), ...rows, totalsRow].join("\r\n");

    const filename = `grand-bistro-collection-${period}-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("CSV export error:", err);
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 });
  }
}
