"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BUCKET, getServiceClient } from "@/lib/supabase";
import { getItem } from "@/lib/items";
import type { ItemType } from "@/lib/types";

const VALID_TYPES: ItemType[] = ["note", "link", "project"];

function parseType(value: FormDataEntryValue | null): ItemType {
  const t = String(value ?? "");
  if ((VALID_TYPES as string[]).includes(t)) return t as ItemType;
  throw new Error("نوع غير صالح");
}

function clean(value: FormDataEntryValue | null): string | null {
  const s = String(value ?? "").trim();
  return s.length ? s : null;
}

async function uploadFile(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const supabase = getServiceClient();
  const safeName = file.name.replace(/[^\w.\-]/g, "_");
  const path = `${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) throw new Error(`فشل رفع المرفق: ${error.message}`);
  return path;
}

async function deleteFile(filePath: string | null): Promise<void> {
  if (!filePath) return;
  const supabase = getServiceClient();
  await supabase.storage.from(BUCKET).remove([filePath]);
}

export async function createItem(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const type = parseType(formData.get("type"));
  const title = clean(formData.get("title"));
  if (!title) throw new Error("العنوان مطلوب");

  const body = type === "note" ? clean(formData.get("body")) : null;
  const url = type !== "note" ? clean(formData.get("url")) : null;

  const file = formData.get("file");
  const file_path = await uploadFile(file instanceof File ? file : null);

  const supabase = getServiceClient();
  const { error } = await supabase.from("items").insert({
    type,
    title,
    body,
    url,
    file_path,
    author: user,
  });
  if (error) {
    await deleteFile(file_path);
    throw new Error(error.message);
  }

  revalidatePath("/");
  redirect("/");
}

export async function updateItem(id: string, formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const existing = await getItem(id);
  if (!existing) throw new Error("العنصر غير موجود");

  const type = parseType(formData.get("type"));
  const title = clean(formData.get("title"));
  if (!title) throw new Error("العنوان مطلوب");

  const body = type === "note" ? clean(formData.get("body")) : null;
  const url = type !== "note" ? clean(formData.get("url")) : null;

  const removeAttachment = formData.get("remove_attachment") === "on";
  const file = formData.get("file");
  const newPath = await uploadFile(file instanceof File ? file : null);

  let file_path = existing.file_path;
  if (newPath) {
    await deleteFile(existing.file_path); // استبدال المرفق القديم
    file_path = newPath;
  } else if (removeAttachment) {
    await deleteFile(existing.file_path);
    file_path = null;
  }

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("items")
    .update({ type, title, body, url, file_path })
    .eq("id", id);
  if (error) {
    if (newPath) await deleteFile(newPath);
    throw new Error(error.message);
  }

  revalidatePath("/");
  redirect("/");
}

export async function deleteItem(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const existing = await getItem(id);
  if (existing) await deleteFile(existing.file_path);

  const supabase = getServiceClient();
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  redirect("/");
}
