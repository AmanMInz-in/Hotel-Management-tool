import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, pin, quickRole } = body;

    let user = null;

    if (quickRole) {
      // One-click demo sign-in by role
      user = await db.user.findFirst({
        where: { role: quickRole, isActive: true },
      });
    } else if (email && password) {
      user = await db.user.findFirst({
        where: { email: email.trim().toLowerCase(), passwordHash: password, isActive: true },
      });
    } else if (pin) {
      user = await db.user.findFirst({
        where: { pin: pin.trim(), isActive: true },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials or PIN" }, { status: 401 });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Determine target redirect by RBAC
    const redirectUrl = {
      ADMIN: "/admin",
      WAITER: "/pos",
      KITCHEN: "/kds",
    }[user.role] || "/pos";

    const response = NextResponse.json({
      success: true,
      user: userData,
      redirectUrl,
    });

    // Set auth cookie
    response.cookies.set("pos_user", JSON.stringify(userData), {
      httpOnly: false, // Accessible to client hooks
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
