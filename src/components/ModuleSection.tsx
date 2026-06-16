"use client";

import { useRef } from "react";
import { moveModule } from "@/app/module-actions";

export default function ModuleSection({
  id,
  currentSectionId,
  sections,
}: {
  id: string;
  currentSectionId: string | null;
  sections: { id: string; title: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={moveModule.bind(null, id)}>
      <select
        name="section_id"
        defaultValue={currentSectionId ?? ""}
        onChange={() => formRef.current?.requestSubmit()}
        title="نقل إلى قسم"
        className="max-w-[8rem] rounded-md border border-line bg-bg px-2 py-1 text-xs text-muted outline-none transition-colors focus:border-accent"
      >
        <option value="">بدون قسم</option>
        {sections.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
        ))}
      </select>
    </form>
  );
}
