import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get("pos_user");

    if (!userCookie?.value) {
      return NextResponse.json({ user: null });
    }

    const user = JSON.parse(userCookie.value);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
