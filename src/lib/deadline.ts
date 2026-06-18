// أدوات الموعد النهائي (deadline) للمهام.
// نخزّن الوقت كـ "وقت حائط" بلا منطقة زمنية (عمود timestamp)، ونعتبره بتوقيت
// الرياض — التطبيق خاص بشخصين في السعودية. تحديد "هل انتهى؟" يقارن لحظتين
// مبنيّتين من نفس المكوّنات، فيظلّ صحيحاً مهما كانت منطقة الخادم (UTC على Vercel).

export const DEADLINE_TZ = "Asia/Riyadh";

/** يبني Date حقوله بالـ UTC تساوي المكوّنات كما هي — لمقارنة/تنسيق وقت الحائط. */
function wallDate(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  s = 0
): Date {
  return new Date(Date.UTC(y, mo - 1, d, h, mi, s));
}

/** اللحظة الحالية بتوقيت DEADLINE_TZ كـ Date (حقول UTC = وقت الحائط هناك). */
function zonedNow(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DEADLINE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const v = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return wallDate(
    v("year"),
    v("month"),
    v("day"),
    v("hour"),
    v("minute"),
    v("second")
  );
}

/** يحوّل "2026-06-20T14:30[:ss]" (أو بمسافة) إلى Date لوقت الحائط، أو null. */
function parseNaive(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const m = String(raw)
    .replace(" ", "T")
    .match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  return wallDate(+m[1], +m[2], +m[3], +m[4], +m[5]);
}

/** هل تجاوز الموعد النهائي الآن (بتوقيت الرياض)؟ */
export function isOverdue(deadline: string | null | undefined): boolean {
  const d = parseNaive(deadline);
  return d ? d.getTime() <= zonedNow().getTime() : false;
}

/** قيمة جاهزة لحقل datetime-local: "YYYY-MM-DDTHH:mm". */
export function toInputValue(deadline: string | null | undefined): string {
  if (!deadline) return "";
  return String(deadline).replace(" ", "T").slice(0, 16);
}

/** يتحقّق من صيغة الإدخال ويعيد "YYYY-MM-DDTHH:mm" أو null. */
export function normalizeDeadline(raw: unknown): string | null {
  const v = toInputValue(typeof raw === "string" ? raw : "");
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) ? v : null;
}

/** تنسيق عربي مختصر: "٢٠ يونيو، ٢:٣٠ م". */
export function formatDeadline(deadline: string | null | undefined): string {
  const d = parseNaive(deadline);
  if (!d) return "";
  return new Intl.DateTimeFormat("ar", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/** تلميح نسبي بسيط للمهام القادمة: "بعد ساعة"، "غداً"، "بعد ٣ أيام". */
export function relativeDeadline(deadline: string | null | undefined): string | null {
  const d = parseNaive(deadline);
  if (!d) return null;
  const diff = d.getTime() - zonedNow().getTime();
  if (diff <= 0) return null;
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `بعد ${mins} دقيقة`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `بعد ${hours} ساعة`;
  const days = Math.round(hours / 24);
  if (days === 1) return "غداً";
  if (days <= 14) return `بعد ${days} يوم`;
  return null;
}
