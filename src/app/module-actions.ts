"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAllowedUsers, getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { deleteAttachment, uploadAttachment } from "@/lib/storage";

export async function createModule(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return; // تجاهل الإدخال الفارغ

  const section_id = (formData.get("section_id") as string) || null;
  const file = formData.get("file");
  const file_path = await uploadAttachment(file instanceof File ? file : null);

  const supabase = getServiceClient();
  // ضع الموديول الجديد في آخر الترتيب
  const { data: last } = await supabase
    .from("modules")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (last?.position ?? 0) + 1;

  const { error } = await supabase
    .from("modules")
    .insert({ title, position, author: user, completed_by: [], file_path, section_id });
  if (error) {
    await deleteAttachment(file_path);
    throw new Error(error.message);
  }

  revalidatePath("/curriculum");
}

/** يرفع/يستبدل ملف موديول. */
export async function setModuleFile(
  id: string,
  formData: FormData
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const file = formData.get("file");
  const newPath = await uploadAttachment(file instanceof File ? file : null);
  if (!newPath) return; // لم يُختر ملف

  const supabase = getServiceClient();
  const { data: mod } = await supabase
    .from("modules")
    .select("file_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("modules")
    .update({ file_path: newPath })
    .eq("id", id);
  if (error) {
    await deleteAttachment(newPath);
    throw new Error(error.message);
  }
  // نجح الحفظ: احذف القديم
  if (mod?.file_path) await deleteAttachment(mod.file_path);

  revalidatePath("/curriculum");
}

/** يبدّل حالة إكمال شخصٍ لموديول (يضيف/يزيل اسمه من completed_by). */
export async function toggleModule(id: string, person: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const allowed = getAllowedUsers().map((u) => u.name);
  if (!allowed.includes(person)) throw new Error("مستخدم غير صالح");

  const supabase = getServiceClient();
  const { data: mod, error: e1 } = await supabase
    .from("modules")
    .select("completed_by")
    .eq("id", id)
    .maybeSingle();
  if (e1) throw new Error(e1.message);
  if (!mod) return;

  const set = new Set<string>(mod.completed_by ?? []);
  if (set.has(person)) set.delete(person);
  else set.add(person);

  const { error } = await supabase
    .from("modules")
    .update({ completed_by: Array.from(set) })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/curriculum");
}

export async function createSection(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const supabase = getServiceClient();
  const { data: last } = await supabase
    .from("sections")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (last?.position ?? 0) + 1;

  const { error } = await supabase
    .from("sections")
    .insert({ title, position, author: user });
  if (error) throw new Error(error.message);

  revalidatePath("/curriculum");
}

/** حذف قسم — موديولاته تُرجَع "بدون قسم" تلقائياً (FK on delete set null). */
export async function deleteSection(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = getServiceClient();
  const { error } = await supabase.from("sections").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/curriculum");
}

/** نقل موديول إلى قسم آخر (أو "بدون قسم" عند قيمة فارغة). */
export async function moveModule(id: string, formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const section_id = (formData.get("section_id") as string) || null;
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("modules")
    .update({ section_id })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/curriculum");
}

export async function deleteModule(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = getServiceClient();
  const { data: mod } = await supabase
    .from("modules")
    .select("file_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("modules").delete().eq("id", id);
  if (error) throw new Error(error.message);
  if (mod?.file_path) await deleteAttachment(mod.file_path);

  revalidatePath("/curriculum");
}
