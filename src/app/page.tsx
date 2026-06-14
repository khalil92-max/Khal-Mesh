import { Suspense } from "react";
import Header from "@/components/Header";
import Toolbar from "@/components/Toolbar";
import ItemCard from "@/components/ItemCard";
import { getItems } from "@/lib/items";
import type { ItemType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const params = await searchParams;
  const type = (params.type as ItemType | "all") ?? "all";
  const q = params.q ?? "";

  const items = await getItems({ type, q });

  return (
    <>
      <Header />
      <main className="mx-auto max-w-content px-6 py-8">
        <Suspense fallback={<div className="h-16" />}>
          <Toolbar />
        </Suspense>

        {items.length === 0 ? (
          <p className="py-20 text-center text-sm text-faint">
            {q || type !== "all"
              ? "لا توجد نتائج مطابقة."
              : "لا يوجد شيء بعد — ابدأ بإضافة عنصر."}
          </p>
        ) : (
          <div className="divide-y divide-line">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
