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
        className="flex items-center gap-1 text-muted transition-colors hover:text-accent"
        title="حذف"
      >
        <Trash2 size={14} strokeWidth={1.75} />
      </button>
    </form>
  );
}
