import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, FileText, FolderOpen, Play } from "lucide-react";
import AppShell from "@/components/AppShell";
import { getItem } from "@/lib/items";

export const dynamic = "force-dynamic";

function fileUrl(id: string, rel: string): string {
  return `/api/folder/${id}/${rel
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export default async function FolderFilesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();

  return (
    <AppShell>
      <div className="mx-auto max-w-content px-4 py-6 sm:px-6 lg:px-8">
        <nav className="mb-5 flex min-w-0 items-center gap-1 text-xs text-muted">
          <Link
            href="/"
            className="shrink-0 rounded px-1.5 py-0.5 transition-colors hover:bg-hover hover:text-ink"
          >
            KhalMesh
          </Link>
          <ChevronLeft
            size={14}
            strokeWidth={1.75}
            className="shrink-0 text-faint"
          />
          <span className="min-w-0 truncate text-ink">{item.title}</span>
        </nav>

        {!item.folder_prefix || !item.folder_files?.length ? (
          <p className="text-sm text-muted">لا يوجد مجلّد مرفق بهذا العنصر.</p>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-ink">
                <FolderOpen
                  size={20}
                  strokeWidth={1.75}
                  className="text-muted"
                />
                ملفات المجلّد
                <span className="text-sm font-normal text-muted">
                  ({item.folder_files.length})
                </span>
              </h1>
              {item.folder_entry && (
                <a
                  href={fileUrl(id, item.folder_entry)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-btn px-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-btn-hover"
                >
                  <Play size={15} strokeWidth={2} />
                  تشغيل الموقع
                </a>
              )}
            </div>

            <ul className="overflow-hidden rounded-card border border-line">
              {[...item.folder_files]
                .sort((a, b) => a.localeCompare(b))
                .map((rel) => {
                  const isEntry = rel === item.folder_entry;
                  return (
                    <li key={rel} className="border-b border-line last:border-0">
                      <a
                        href={fileUrl(id, rel)}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-hover"
                      >
                        <FileText
                          size={15}
                          strokeWidth={1.75}
                          className="shrink-0 text-faint"
                        />
                        <span
                          dir="ltr"
                          className="min-w-0 grow truncate text-right text-ink"
                        >
                          {rel}
                        </span>
                        {isEntry && (
                          <span className="shrink-0 rounded bg-note-bg px-1.5 py-0.5 text-[11px] text-tag-fg">
                            البداية
                          </span>
                        )}
                      </a>
                    </li>
                  );
                })}
            </ul>
          </>
        )}
      </div>
    </AppShell>
  );
}
