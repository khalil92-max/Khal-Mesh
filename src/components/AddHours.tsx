"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { addLearningHours } from "@/app/learning-actions";

/** زر "+" صغير يكشف حقل أرقام لإضافة ساعات تعلّم لشخص. */
export default function AddHours({ person }: { person: string }) {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <form
        action={addLearningHours.bind(null, person)}
        onSubmit={() => setOpen(false)}
        className="flex shrink-0 items-center gap-0.5"
      >
        <input
          name="hours"
          type="number"
          step="0.5"
          min="0"
          autoFocus
          placeholder="ساعات"
          onBlur={(e) => {
            if (!e.currentTarget.value) setOpen(false);
          }}
          className="w-14 rounded-md border border-line bg-bg px-1.5 py-1 text-xs text-ink outline-none focus:border-accent"
        />
        <button
          type="submit"
          title="إضافة"
          className="flex rounded-md p-1 text-muted transition-colors hover:bg-hover hover:text-ink"
        >
          <Plus size={13} strokeWidth={2.25} />
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      title="إضافة ساعات تعلّم"
      aria-label="إضافة ساعات تعلّم"
      className="flex shrink-0 rounded-md p-1 text-faint transition-colors hover:bg-hover hover:text-ink"
    >
      <Plus size={13} strokeWidth={2.25} />
    </button>
  );
}
