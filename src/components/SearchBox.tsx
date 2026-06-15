"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

export default function SearchBox() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") ?? "";
  const [q, setQ] = useState(currentQ);
  const firstRender = useRef(true);

  useEffect(() => {
    setQ(currentQ);
  }, [currentQ]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q.trim()) params.set("q", q.trim());
      else params.delete("q");
      const s = params.toString();
      router.replace(s ? `${pathname}?${s}` : pathname);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="flex h-9 w-full items-center gap-2 rounded-md border border-line bg-bg px-2.5 shadow-sm transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
      <Search size={15} strokeWidth={1.75} className="shrink-0 text-faint" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="بحث…"
        className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
      />
    </div>
  );
}
