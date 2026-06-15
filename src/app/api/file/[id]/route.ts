import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getItem } from "@/lib/items";
import { BUCKET, getServiceClient } from "@/lib/supabase";

const CONTENT_TYPES: Record<string, string> = {
  html: "text/html; charset=utf-8",
  htm: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  json: "application/json; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
};

function contentTypeFor(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const item = await getItem(id);
  if (!item?.file_path) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(item.file_path);
  if (error || !data) {
    return NextResponse.json({ error: "File error" }, { status: 500 });
  }

  return new NextResponse(data.stream(), {
    headers: {
      "Content-Type": contentTypeFor(item.file_path),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
