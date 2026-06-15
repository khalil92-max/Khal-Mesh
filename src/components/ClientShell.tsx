"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

/**
 * غلاف متجاوب: على الكمبيوتر (md+) الشريط ثابت على اليسار كما هو؛
 * على الجوّال يصير درجاً منزلقاً يُفتح بزرّ ☰ والمحتوى يملأ العرض.
 * يستقبل الشريط (مكوّن خادم) كـ prop ليبقى مُصيَّراً على الخادم.
 */
export default function ClientShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // أغلق الدرج عند الانتقال لمسار آخر (إضافة/تعديل)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // إغلاق بمفتاح Esc أثناء فتح الدرج
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <main className="min-w-0 flex-1 overflow-y-auto">
        {/* شريط علوي للجوّال فقط */}
        <div className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-line bg-bg px-4 md:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="فتح القائمة"
            className="flex rounded-md p-1.5 text-muted transition-colors hover:bg-hover hover:text-ink"
          >
            <Menu size={18} strokeWidth={1.75} />
          </button>
          <span className="flex h-5 w-5 items-center justify-center rounded bg-ink text-[11px] font-bold text-white">
            خ
          </span>
          <span className="text-sm font-semibold text-ink">KhalMesh</span>
        </div>
        {children}
      </main>

      {/* خلفية معتمة على الجوّال عند الفتح */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* الشريط: درج منزلق على الجوّال، ثابت ضمن التدفّق على md+ */}
      <div
        onClick={(e) => {
          // أغلق الدرج عند الضغط على أي رابط داخله (تغيير الفلتر)
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
        className={
          "fixed inset-y-0 left-0 z-50 w-64 shrink-0 transition-transform duration-200 ease-out md:static md:z-auto md:translate-x-0 " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="إغلاق القائمة"
          className="absolute left-2 top-2 z-10 flex rounded-md bg-bg/70 p-1.5 text-muted backdrop-blur-sm transition-colors hover:bg-hover hover:text-ink md:hidden"
        >
          <X size={18} strokeWidth={1.75} />
        </button>
        {sidebar}
      </div>
    </div>
  );
}
