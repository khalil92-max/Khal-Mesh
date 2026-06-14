"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

const FILTERS = [
  { key: "all", label: "الكل" },
  { key: "note", label: "ملاحظات" },
  { key: "link", label: "روابط" },
  { key: "project", label: "مشاريع" },
] as const;

export default function Toolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") ?? "all";
  const currentQ = searchParams.get("q") ?? "";
  const [q, setQ] = useState(currentQ);
  const firstRender = useRef(true);

  // مزامنة الحقل عند تغيّر الـ URL خارجياً
  useEffect(() => {
    setQ(currentQ);
  }, [currentQ]);

  function buildUrl(next: { type?: string; q?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const type = next.type ?? currentType;
    const query = next.q ?? q;

    if (type && type !== "all") params.set("type", type);
    else params.delete("type");

    if (query.trim()) params.set("q", query.trim());
    else params.delete("q");

    const s = params.toString();
    return s ? `${pathname}?${s}` : pathname;
  }

  // بحث مع debounce
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      router.replace(buildUrl({ q }));
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-1">
        {FILTERS.map((f) => {
          const active = currentType === f.key;
          return (
            <button
              key={f.key}
              onClick={() => router.replace(buildUrl({ type: f.key }))}
              className={
                "rounded-full px-3 py-1 text-sm transition-colors " +
                (active
                  ? "bg-ink text-bg"
                  : "text-muted hover:text-ink")
              }
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 border-b border-line-strong pb-1 sm:w-56">
        <Search size={15} strokeWidth={1.75} className="text-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="بحث…"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
        />
      </div>
    </div>
  );
}
