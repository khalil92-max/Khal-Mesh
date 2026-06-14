import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const secret = process.env.SESSION_SECRET ?? "";
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  const user = secret && token ? await verifySession(token, secret) : null;

  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // يحمي كل شيء ماعدا /login و /api/login والأصول الثابتة (أي مسار فيه نقطة).
  matcher: ["/((?!login|api/login|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
