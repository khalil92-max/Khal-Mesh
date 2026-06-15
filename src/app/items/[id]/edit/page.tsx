import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";
import AppShell from "@/components/AppShell";
import ItemForm from "@/components/ItemForm";
import { updateItem } from "@/app/actions";
import { getItem } from "@/lib/items";

export const dynamic = "force-dynamic";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();

  const action = updateItem.bind(null, id);

  return (
    <AppShell>
      <div className="mx-auto max-w-content px-8 py-6">
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

        <h1 className="mb-8 flex items-center gap-2.5 text-2xl font-semibold text-ink">
          <Pencil size={20} strokeWidth={1.75} className="text-muted" aria-hidden />
          تعديل عنصر
        </h1>
        <ItemForm action={action} item={item} submitLabel="تحديث" />
      </div>
    </AppShell>
  );
}
