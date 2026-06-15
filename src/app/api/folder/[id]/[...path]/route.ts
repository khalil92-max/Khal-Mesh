import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getItem } from "@/lib/items";
import { BUCKET, getServiceClient } from "@/lib/supabase";
import { contentTypeFor } from "@/lib/mime";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; path: string[] }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, path } = await params;
  const item = await getItem(id);
  if (!item?.folder_prefix) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // تحقّق صارم من كل مقطع: فكّ الترميز ثم ارفض أي فاصل أو نقاط فقط
  const segments: string[] = [];
  for (const raw of path) {
    let seg: string;
    try {
      seg = decodeURIComponent(raw);
    } catch {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (
      !seg ||
      seg === "." ||
      seg === ".." ||
      seg.includes("/") ||
      seg.includes("\\")
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    segments.push(seg);
  }
  const rel = segments.join("/");

  // قائمة سماح إلزامية: اخدم فقط ملفاً مُسجَّلاً فعلاً ضمن هذا المجلّد
  if (!rel || !item.folder_files?.includes(rel)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(`${item.folder_prefix}/${rel}`);
  if (error || !data) {
    return NextResponse.json({ error: "File error" }, { status: 404 });
  }

  return new NextResponse(data.stream(), {
    headers: {
      "Content-Type": contentTypeFor(rel),
      // ملاحظة أمنية: المحتوى المرفوع يعمل على أصل التطبيق (نفس المنشأ) حتى
      // تُحمَّل ملفاته الفرعية بالكوكي. لا نستخدم sandbox لأنه يمنع ذلك.
      // ⇒ ارفع فقط مجلّدات تثق بها (تعمل ككود).
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
