import Link from "next/link";
import { ChevronLeft, FilePlus2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import ItemForm from "@/components/ItemForm";
import { createItem } from "@/app/actions";

export const dynamic = "force-dynamic";

export default function NewItemPage() {
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
          <span className="text-ink">إضافة عنصر</span>
        </nav>

        <h1 className="mb-8 flex items-center gap-2.5 text-2xl font-semibold text-ink">
          <FilePlus2 size={20} strokeWidth={1.75} className="text-muted" aria-hidden />
          إضافة عنصر
        </h1>
        <ItemForm action={createItem} submitLabel="حفظ" />
      </div>
    </AppShell>
  );
}
