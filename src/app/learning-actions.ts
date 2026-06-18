"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAllowedUsers, getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

/** يضيف ساعات تعلّم لشخص (قيمة موجبة تتراكم؛ يقبل الكسور مثل 0.5). */
export async function addLearningHours(
  person: string,
  formData: FormData
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const allowed = getAllowedUsers().map((u) => u.name);
  if (!allowed.includes(person)) throw new Error("مستخدم غير صالح");

  const hours = Number(formData.get("hours"));
  if (!Number.isFinite(hours) || hours <= 0) return; // تجاهل الفارغ/غير الصالح

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("learning_log")
    .insert({ person, hours, author: user });
  if (error) throw new Error(error.message);

  // الشريط الجانبي يظهر في كل الصفحات — حدّثه في كل المسارات
  revalidatePath("/", "layout");
}
