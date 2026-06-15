"use client";

import { Trash2 } from "lucide-react";
import { deleteItem } from "@/app/actions";

export default function DeleteButton({ id }: { id: string }) {
  const action = deleteItem.bind(null, id);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("حذف هذا العنصر نهائياً؟")) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="flex rounded-md p-1.5 text-tag-fg transition-colors hover:bg-white/70 hover:text-danger"
        title="حذف"
        aria-label="حذف"
      >
        <Trash2 size={15} strokeWidth={1.75} />
      </button>
    </form>
  );
}
