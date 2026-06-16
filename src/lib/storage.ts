import "server-only";
import { BUCKET, getServiceClient } from "./supabase";

/** يرفع ملفاً مفرداً إلى bucket المرفقات ويُرجع مساره، أو null إن لم يوجد. */
export async function uploadAttachment(file: File | null): Promise<string | null> {
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

export async function deleteAttachment(filePath: string | null): Promise<void> {
  if (!filePath) return;
  const supabase = getServiceClient();
  await supabase.storage.from(BUCKET).remove([filePath]);
}

/** الاسم الأصلي للملف من المسار المخزَّن (uuid-name). */
export function attachmentName(filePath: string): string {
  const base = filePath.split("/").pop() ?? filePath;
  const dash = base.indexOf("-");
  return dash >= 0 ? base.slice(dash + 1) : base;
}
