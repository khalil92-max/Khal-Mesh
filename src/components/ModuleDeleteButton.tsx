"use client";

import { Trash2 } from "lucide-react";
import { deleteModule } from "@/app/module-actions";

export default function ModuleDeleteButton({ id }: { id: string }) {
  const action = deleteModule.bind(null, id);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("حذف هذا الموديول؟")) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="flex rounded-md p-1.5 text-muted transition-colors hover:bg-hover hover:text-danger"
        title="حذف"
        aria-label="حذف"
      >
        <Trash2 size={15} strokeWidth={1.75} />
      </button>
    </form>
  );
}
