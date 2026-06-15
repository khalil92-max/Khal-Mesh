"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ITEM_TYPES,
  TYPE_META,
  type Item,
  type ItemType,
} from "@/lib/types";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-btn px-4 py-2 text-sm font-medium text-white shadow-soft transition-colors hover:bg-btn-hover disabled:opacity-50"
    >
      {pending ? "جارٍ الحفظ…" : label}
    </button>
  );
}

const fieldClass =
  "w-full rounded-md border border-line bg-bg px-3 py-2 text-ink shadow-sm outline-none transition-colors placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/20";
const labelClass = "mb-1.5 block text-xs font-medium text-muted";

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
        <div className="flex flex-wrap gap-1.5">
          {ITEM_TYPES.map((t) => {
            const meta = TYPE_META[t];
            const active = type === t;
            return (
              <button
                type="button"
                key={t}
                onClick={() => setType(t)}
                className={
                  "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors " +
                  (active
                    ? "border-line-strong bg-hover font-medium text-ink"
                    : "border-line text-muted hover:bg-hover hover:text-ink")
                }
              >
                <span
                  className={"h-2 w-2 rounded-full " + meta.dot}
                  aria-hidden
                />
                {meta.label}
              </button>
            );
          })}
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
          className="block w-full text-sm text-muted file:mr-0 file:ml-3 file:cursor-pointer file:rounded-md file:border file:border-line file:bg-hover file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink hover:file:border-line-strong"
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
        <Link
          href="/"
          className="text-sm text-muted transition-colors hover:text-ink"
        >
          إلغاء
        </Link>
      </div>
    </form>
  );
}
