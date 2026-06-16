"use client";

import { Trash2 } from "lucide-react";
import { deleteSection } from "@/app/module-actions";

export default function SectionDeleteButton({ id }: { id: string }) {
  const action = deleteSection.bind(null, id);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("حذف هذا القسم؟ موديولاته تبقى لكن بدون قسم.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="flex rounded-md p-1.5 text-muted transition-colors hover:bg-hover hover:text-danger"
        title="حذف القسم"
        aria-label="حذف القسم"
      >
        <Trash2 size={15} strokeWidth={1.75} />
      </button>
    </form>
  );
}
