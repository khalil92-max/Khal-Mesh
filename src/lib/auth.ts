import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "./session";

/** يقرأ الكوكي من الطلب ويُرجع اسم المستخدم الحالي أو null. */
export async function getCurrentUser(): Promise<string | null> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;

  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  return verifySession(token, secret);
}

/** قائمة المستخدمين المسموح لهم (من env vars). تُستخدم server-side فقط. */
export function getAllowedUsers(): { name: string; password: string }[] {
  const users: { name: string; password: string }[] = [];
  if (process.env.USER1_NAME && process.env.USER1_PASSWORD) {
    users.push({ name: process.env.USER1_NAME, password: process.env.USER1_PASSWORD });
  }
  if (process.env.USER2_NAME && process.env.USER2_PASSWORD) {
    users.push({ name: process.env.USER2_NAME, password: process.env.USER2_PASSWORD });
  }
  return users;
}
