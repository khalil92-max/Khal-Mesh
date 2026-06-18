import "server-only";
import { getServiceClient } from "./supabase";

/**
 * إجمالي ساعات التعلّم لكل شخص (مجموع learning_log).
 * متسامحة: تُرجع {} لو الجدول مفقود — حتى لا ينهار الشريط الجانبي
 * (الظاهر في كل الصفحات) قبل تشغيل الهجرة.
 */
export async function getLearningHours(): Promise<Record<string, number>> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("learning_log")
      .select("person, hours");
    if (error || !data) return {};

    const totals: Record<string, number> = {};
    for (const r of data as { person: string; hours: number }[]) {
      totals[r.person] = (totals[r.person] ?? 0) + Number(r.hours);
    }
    return totals;
  } catch {
    return {};
  }
}

/** تنسيق مختصر: عدد صحيح أو خانة عشرية واحدة. */
export function formatHours(h: number): string {
  return Number.isInteger(h) ? String(h) : h.toFixed(1);
}
