import "server-only";
import { BUCKET, getServiceClient } from "./supabase";
import type { Item, ItemType, ItemWithAttachment } from "./types";

/** يستخرج الاسم الأصلي للملف من المسار المخزَّن (uuid-اسم الملف). */
function originalName(filePath: string): string {
  const base = filePath.split("/").pop() ?? filePath;
  const dash = base.indexOf("-");
  return dash >= 0 ? base.slice(dash + 1) : base;
}

async function withAttachments(items: Item[]): Promise<ItemWithAttachment[]> {
  const supabase = getServiceClient();
  return Promise.all(
    items.map(async (item) => {
      if (!item.file_path) {
        return { ...item, attachmentUrl: null, attachmentName: null };
      }
      const { data } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(item.file_path, 60 * 60); // ساعة واحدة
      return {
        ...item,
        attachmentUrl: data?.signedUrl ?? null,
        attachmentName: originalName(item.file_path),
      };
    })
  );
}

export async function getItems(opts: {
  type?: ItemType | "all";
  q?: string;
}): Promise<ItemWithAttachment[]> {
  const supabase = getServiceClient();

  let query = supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (opts.type && opts.type !== "all") {
    query = query.eq("type", opts.type);
  }

  const q = opts.q?.trim();
  if (q) {
    // بحث بسيط في العنوان والمحتوى (غير حساس لحالة الأحرف)
    const safe = q.replace(/[%,()]/g, " ");
    query = query.or(`title.ilike.%${safe}%,body.ilike.%${safe}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return withAttachments((data as Item[]) ?? []);
}

export async function getItem(id: string): Promise<Item | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Item) ?? null;
}
