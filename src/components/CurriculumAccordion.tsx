"use client";

import { useState } from "react";
import { ChevronDown, Folder } from "lucide-react";

type SectionData = {
  id: string;
  title: string;
  count: number;
  deleteButton: React.ReactNode;
  body: React.ReactNode;
};

/**
 * أقسام المنهج القابلة للطيّ (accordion): قسم واحد مفتوح في كل مرّة.
 * يستقبل ترويسة القسم وجسمه (مُصيَّرَين على الخادم) ويتحكّم بإظهار الجسم.
 */
export default function CurriculumAccordion({
  sections,
}: {
  sections: SectionData[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {sections.map((s) => {
        const open = openId === s.id;
        return (
          <div
            key={s.id}
            className="overflow-hidden rounded-card border border-line"
          >
            <div className="flex items-center justify-between gap-2 bg-hover px-3 py-2">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : s.id)}
                aria-expanded={open}
                className="flex min-w-0 grow items-center gap-2 text-start text-sm font-medium text-ink"
              >
                <ChevronDown
                  size={15}
                  strokeWidth={2}
                  className={
                    "shrink-0 text-muted transition-transform " +
                    (open ? "" : "-rotate-90")
                  }
                />
                <Folder
                  size={15}
                  strokeWidth={1.75}
                  className="shrink-0 text-p1-dot"
                />
                <span className="truncate">{s.title}</span>
                <span className="text-xs font-normal text-muted">
                  ({s.count})
                </span>
              </button>
              {s.deleteButton}
            </div>
            {open && <div className="border-t border-line">{s.body}</div>}
          </div>
        );
      })}
    </div>
  );
}
