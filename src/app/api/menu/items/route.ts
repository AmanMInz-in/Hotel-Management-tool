import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const items = await db.menuItem.findMany({
      orderBy: { name: "asc" },
      include: { category: true },
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error("Failed to fetch menu items:", err);
    return NextResponse.json({ error: "Failed to load menu items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, description, price, categoryId, isVeg, taxRate } = await req.json();

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: "Name, price and category are required" }, { status: 400 });
    }

    const item = await db.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        isVeg: isVeg ?? true,
        taxRate: taxRate ? parseFloat(taxRate) : 5.0,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    console.error("Failed to create menu item:", err);
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 });
  }
}
