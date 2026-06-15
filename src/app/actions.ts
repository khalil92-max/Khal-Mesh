"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BUCKET, getServiceClient } from "@/lib/supabase";
import { getItem } from "@/lib/items";
import type { ItemType } from "@/lib/types";

const VALID_TYPES: ItemType[] = ["note", "link", "project"];
const MAX_FOLDER_FILES = 300;
const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB لكل ملف
const MAX_TOTAL_BYTES = 40 * 1024 * 1024; // 40MB إجمالي المجلّد

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

// ---- المجلّدات ----

/** يزيل اسم المجلّد الجذر من المسار النسبي (myfolder/css/x → css/x). */
function stripTop(rel: string): string {
  const i = rel.indexOf("/");
  return i >= 0 ? rel.slice(i + 1) : rel;
}

/** يُنظّف المسار النسبي: يقسم على أي فواصل ويُسقط المقاطع النقطية فقط. */
function cleanRel(rel: string): string {
  return rel
    .split(/[\\/]+/)
    .filter((p) => p && !/^\.+$/.test(p))
    .join("/");
}

function parsePaths(value: FormDataEntryValue | null): string[] {
  try {
    const arr = JSON.parse(String(value ?? "[]"));
    return Array.isArray(arr) ? arr.map((x) => String(x)) : [];
  } catch {
    return [];
  }
}

/** يرفع كل ملفات مجلّد تحت بادئة واحدة، ويختار ملف البداية. */
async function uploadFolder(
  entries: FormDataEntryValue[],
  paths: string[]
): Promise<{ prefix: string; entry: string; files: string[] } | null> {
  const picked: { file: File; rel: string }[] = [];
  const seen = new Set<string>();
  let total = 0;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (!(e instanceof File) || e.size === 0) continue;
    if (e.size > MAX_FILE_BYTES) {
      throw new Error(`ملف أكبر من الحد المسموح (15MB): ${e.name}`);
    }
    const rel = cleanRel(stripTop(paths[i] ?? e.name));
    if (!rel || seen.has(rel)) continue; // تخطّى الفارغ والمكرّر
    seen.add(rel);
    total += e.size;
    if (picked.length + 1 > MAX_FOLDER_FILES) {
      throw new Error(`عدد ملفات المجلّد كبير جداً (الحد ${MAX_FOLDER_FILES}).`);
    }
    if (total > MAX_TOTAL_BYTES) {
      throw new Error("حجم المجلّد كبير جداً (الحد 40MB).");
    }
    picked.push({ file: e, rel });
  }
  if (picked.length === 0) return null;

  const supabase = getServiceClient();
  const prefix = `folders/${crypto.randomUUID()}`;
  const stored: string[] = [];
  try {
    for (const { file, rel } of picked) {
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(`${prefix}/${rel}`, file, {
          contentType: file.type || undefined,
          upsert: false,
        });
      if (error) throw new Error(`فشل رفع ${rel}: ${error.message}`);
      stored.push(rel);
    }
    const entry =
      stored.find((p) => /^index\.html?$/i.test(p)) ??
      stored.find((p) => /(^|\/)index\.html?$/i.test(p)) ??
      stored.find((p) => /\.html?$/i.test(p)) ??
      stored[0];
    return { prefix, entry, files: stored };
  } catch (e) {
    if (stored.length) {
      await supabase.storage
        .from(BUCKET)
        .remove(stored.map((r) => `${prefix}/${r}`));
    }
    throw e;
  }
}

async function deleteFolder(
  prefix: string | null,
  files: string[] | null
): Promise<void> {
  if (!prefix || !files?.length) return;
  const supabase = getServiceClient();
  await supabase.storage.from(BUCKET).remove(files.map((r) => `${prefix}/${r}`));
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

  let folder: { prefix: string; entry: string; files: string[] } | null = null;
  try {
    folder = await uploadFolder(
      formData.getAll("folder"),
      parsePaths(formData.get("folder_paths"))
    );
  } catch (e) {
    await deleteFile(file_path);
    throw e;
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("items").insert({
    type,
    title,
    body,
    url,
    file_path,
    folder_prefix: folder?.prefix ?? null,
    folder_entry: folder?.entry ?? null,
    folder_files: folder?.files ?? null,
    author: user,
  });
  if (error) {
    await deleteFile(file_path);
    await deleteFolder(folder?.prefix ?? null, folder?.files ?? null);
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
  const removeFolder = formData.get("remove_folder") === "on";
  const file = formData.get("file");

  // ارفع الجديد أولاً — بدون لمس القديم بعد
  const newPath = await uploadFile(file instanceof File ? file : null);
  let newFolder: { prefix: string; entry: string; files: string[] } | null =
    null;
  try {
    newFolder = await uploadFolder(
      formData.getAll("folder"),
      parsePaths(formData.get("folder_paths"))
    );
  } catch (e) {
    if (newPath) await deleteFile(newPath);
    throw e;
  }

  // احسب القيم الجديدة دون حذف أي تخزين قديم
  const file_path = newPath
    ? newPath
    : removeAttachment
      ? null
      : existing.file_path;
  const folder = newFolder
    ? {
        prefix: newFolder.prefix,
        entry: newFolder.entry,
        files: newFolder.files,
      }
    : removeFolder
      ? { prefix: null, entry: null, files: null }
      : {
          prefix: existing.folder_prefix,
          entry: existing.folder_entry,
          files: existing.folder_files,
        };

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("items")
    .update({
      type,
      title,
      body,
      url,
      file_path,
      folder_prefix: folder.prefix,
      folder_entry: folder.entry,
      folder_files: folder.files,
    })
    .eq("id", id);
  if (error) {
    // فشل الحفظ: احذف الجديد فقط — القديم يبقى سليماً
    if (newPath) await deleteFile(newPath);
    if (newFolder) await deleteFolder(newFolder.prefix, newFolder.files);
    throw new Error(error.message);
  }

  // نجح الحفظ: الآن فقط احذف القديم الذي لم يعد مرجعاً
  if (newPath || removeAttachment) await deleteFile(existing.file_path);
  if (newFolder || removeFolder) {
    await deleteFolder(existing.folder_prefix, existing.folder_files);
  }

  revalidatePath("/");
  redirect("/");
}

export async function deleteItem(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const existing = await getItem(id);
  if (existing) {
    await deleteFile(existing.file_path);
    await deleteFolder(existing.folder_prefix, existing.folder_files);
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  redirect("/");
}
