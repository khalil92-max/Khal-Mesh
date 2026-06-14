"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ITEM_TYPES, TYPE_LABELS, type Item, type ItemType } from "@/lib/types";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
    >
      {pending ? "جارٍ الحفظ…" : label}
    </button>
  );
}

const fieldClass =
  "w-full border-b border-line-strong bg-transparent py-2 text-ink outline-none transition-colors focus:border-accent placeholder:text-faint";
const labelClass = "mono mb-1 block text-xs uppercase text-faint";

export default function ItemForm({
  action,
  item,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  item?: Item;
  submitLabel: string;
}) {
  const [type, setType] = useState<ItemType>(item?.type ?? "note");

  return (
    <form action={action} className="flex flex-col gap-6">
      <div>
        <span className={labelClass}>النوع</span>
        <input type="hidden" name="type" value={type} />
        <div className="flex flex-wrap gap-1">
          {ITEM_TYPES.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setType(t)}
              className={
                "rounded-full px-3 py-1 text-sm transition-colors " +
                (type === t ? "bg-ink text-bg" : "text-muted hover:text-ink")
              }
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="title" className={labelClass}>
          العنوان
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={item?.title ?? ""}
          className={fieldClass}
          placeholder="عنوان مختصر"
        />
      </div>

      {type === "note" ? (
        <div>
          <label htmlFor="body" className={labelClass}>
            المحتوى
          </label>
          <textarea
            id="body"
            name="body"
            rows={6}
            defaultValue={item?.body ?? ""}
            className={fieldClass + " resize-y leading-relaxed"}
            placeholder="اكتب الملاحظة…"
          />
        </div>
      ) : (
        <div>
          <label htmlFor="url" className={labelClass}>
            الرابط
          </label>
          <input
            id="url"
            name="url"
            type="url"
            dir="ltr"
            defaultValue={item?.url ?? ""}
            className={fieldClass + " text-left"}
            placeholder="https://"
          />
        </div>
      )}

      <div>
        <span className={labelClass}>مرفق (اختياري)</span>
        <input
          name="file"
          type="file"
          className="block w-full text-sm text-muted file:mr-0 file:ml-3 file:cursor-pointer file:rounded-full file:border file:border-line-strong file:bg-surface file:px-3 file:py-1 file:text-xs file:text-ink hover:file:border-accent"
        />
        {item?.file_path && (
          <label className="mt-2 flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" name="remove_attachment" />
            إزالة المرفق الحالي
          </label>
        )}
      </div>

      <div className="flex items-center gap-4 pt-2">
        <SubmitButton label={submitLabel} />
        <Link href="/" className="text-sm text-muted transition-colors hover:text-ink">
          إلغاء
        </Link>
      </div>
    </form>
  );
}
