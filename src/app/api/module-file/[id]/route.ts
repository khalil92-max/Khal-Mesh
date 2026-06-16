import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getModule } from "@/lib/modules";
import { BUCKET, getServiceClient } from "@/lib/supabase";
import { attachmentName } from "@/lib/storage";
import { contentTypeFor } from "@/lib/mime";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const mod = await getModule(id);
  if (!mod?.file_path) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(mod.file_path);
  if (error || !data) {
    return NextResponse.json({ error: "File error" }, { status: 404 });
  }

  const name = attachmentName(mod.file_path);
  const isHtml = /\.html?$/i.test(name);

  const headers: Record<string, string> = {
    "Content-Type": contentTypeFor(name),
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, max-age=0, must-revalidate",
  };
  // HTML يُعرض كصفحة؛ غيره (بوربوينت/مستندات…) يُنزَّل باسمه الأصلي
  if (!isHtml) {
    headers["Content-Disposition"] =
      `attachment; filename*=UTF-8''${encodeURIComponent(name)}`;
  }

  return new NextResponse(data.stream(), { headers });
}
