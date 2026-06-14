// وحدة "نقية" آمنة للعمل في Edge runtime (middleware) و Node معاً.
// لا تستورد أي شيء من next/headers أو server-only هنا.

export const SESSION_COOKIE = "km_session";

const encoder = new TextEncoder();

function toBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(sig);
}

/** ينشئ قيمة الكوكي الموقّعة: "<name-base64url>.<hmac>" */
export async function signSession(name: string, secret: string): Promise<string> {
  const namePart = toBase64Url(encoder.encode(name).buffer);
  const sig = await sign(namePart, secret);
  return `${namePart}.${sig}`;
}

/** يتحقق من التوقيع ويُرجع اسم المستخدم أو null. */
export async function verifySession(
  value: string,
  secret: string
): Promise<string | null> {
  const dot = value.indexOf(".");
  if (dot <= 0) return null;
  const namePart = value.slice(0, dot);
  const sigPart = value.slice(dot + 1);
  if (!namePart || !sigPart) return null;

  const expected = await sign(namePart, secret);
  if (!safeEqual(expected, sigPart)) return null;

  try {
    const b64 = namePart.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}
