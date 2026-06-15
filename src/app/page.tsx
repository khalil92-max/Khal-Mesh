import Link from "next/link";
import { Suspense } from "react";
import { Inbox, LayoutGrid, Plus, SearchX } from "lucide-react";
import AppShell from "@/components/AppShell";
import SearchBox from "@/components/SearchBox";
import ItemCard from "@/components/ItemCard";
import { getItems } from "@/lib/items";
import type { ItemType } from "@/lib/types";

export const dynamic = "force-dynamic";

const HEADINGS: Record<string, string> = {
  all: "الكل",
  note: "الملاحظات",
  link: "الروابط",
  project: "المشاريع",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string; author?: string }>;
}) {
  const params = await searchParams;
  const type = (params.type as ItemType | "all") ?? "all";
  const q = params.q ?? "";
  const author = params.author || undefined;

  const items = await getItems({ type, q, author });

  const plain = type === "all" && !author && !q;
  const heading = plain ? "KhalMesh" : (HEADINGS[type] ?? "الكل");
  const meta = [
    `${items.length} عنصر`,
    author ? `· ${author}` : "",
    q ? `· "${q}"` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AppShell activeType={type} activeAuthor={author}>
      <div className="mx-auto max-w-7xl px-8 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LayoutGrid
              size={22}
              strokeWidth={1.75}
              className="shrink-0 text-muted"
              aria-hidden
            />
            <div>
              <h1 className="text-xl font-semibold text-ink">{heading}</h1>
              <p className="text-xs text-muted">{meta}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Suspense
              fallback={<div className="h-9 w-full rounded-md bg-hover sm:w-64" />}
            >
              <SearchBox />
            </Suspense>
            <Link
              href="/new"
              className="inline-flex h-9 shrink-0 items-center gap-1 rounded-md bg-btn px-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-btn-hover"
            >
              <Plus size={15} strokeWidth={2.25} />
              جديد
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            {q || type !== "all" || author ? (
              <SearchX size={30} strokeWidth={1.5} className="text-faint" aria-hidden />
            ) : (
              <Inbox size={30} strokeWidth={1.5} className="text-faint" aria-hidden />
            )}
            <p className="text-sm text-muted">
              {q || type !== "all" || author
                ? "لا توجد نتائج مطابقة."
                : "لا يوجد شيء بعد — ابدأ بإضافة عنصر."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
