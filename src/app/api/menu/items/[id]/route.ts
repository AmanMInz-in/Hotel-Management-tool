import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const itemId = params.id;

    const item = await db.menuItem.update({
      where: { id: itemId },
      data: {
        ...(body.isAvailable !== undefined && { isAvailable: Boolean(body.isAvailable) }),
        ...(body.name && { name: body.name }),
        ...(body.price !== undefined && { price: parseFloat(body.price) }),
        ...(body.description !== undefined && { description: body.description }),
      },
    });

    return NextResponse.json({ item });
  } catch (err) {
    console.error("Failed to update menu item:", err);
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;
    await db.menuItem.delete({
      where: { id: itemId },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete menu item:", err);
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 });
  }
}
