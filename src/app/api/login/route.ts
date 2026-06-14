import { NextResponse } from "next/server";
import { getAllowedUsers } from "@/lib/auth";
import { SESSION_COOKIE, signSession } from "@/lib/session";

export async function POST(req: Request) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "الخادم غير مُهيّأ (SESSION_SECRET مفقود)." },
      { status: 500 }
    );
  }

  let password = "";
  try {
    const body = await req.json();
    password = String(body?.password ?? "");
  } catch {
    return NextResponse.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const users = getAllowedUsers();
  const match = users.find((u) => u.password === password && password.length > 0);

  if (!match) {
    return NextResponse.json({ error: "الرقم السري غير صحيح." }, { status: 401 });
  }

  const token = await signSession(match.name, secret);
  const res = NextResponse.json({ ok: true, name: match.name });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 يوم
  });
  return res;
}
