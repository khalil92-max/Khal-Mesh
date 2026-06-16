import { Check, FolderPlus, GraduationCap, Plus } from "lucide-react";
import AppShell from "@/components/AppShell";
import CurriculumAccordion from "@/components/CurriculumAccordion";
import ModuleDeleteButton from "@/components/ModuleDeleteButton";
import ModuleFile from "@/components/ModuleFile";
import ModuleSection from "@/components/ModuleSection";
import SectionDeleteButton from "@/components/SectionDeleteButton";
import { getAllowedUsers } from "@/lib/auth";
import { getModules, getSections, progressFor } from "@/lib/modules";
import { attachmentName } from "@/lib/storage";
import { createModule, createSection, toggleModule } from "@/app/module-actions";
import type { Module } from "@/lib/types";

export const dynamic = "force-dynamic";

const PERSON_BAR = ["bg-p1-dot", "bg-p2-dot"];

export default async function CurriculumPage() {
  const people = getAllowedUsers().map((u) => u.name);
  const [sections, modules] = await Promise.all([getSections(), getModules()]);

  const sectionList = sections.map((s) => ({ id: s.id, title: s.title }));
  const bySection = new Map<string, Module[]>();
  for (const m of modules) {
    const k = m.section_id ?? "__none__";
    (bySection.get(k) ?? bySection.set(k, []).get(k))!.push(m);
  }
  const ungrouped = bySection.get("__none__") ?? [];

  const moduleRow = (m: Module, idx: number) => {
    const fileName = m.file_path ? attachmentName(m.file_path) : null;
    const fileUrl = m.file_path ? `/api/module-file/${m.id}` : null;
    return (
      <li
        key={m.id}
        className="flex flex-wrap items-center gap-x-2 gap-y-2 border-b border-line px-3 py-2.5 last:border-0"
      >
        <span className="tnum w-5 shrink-0 text-xs text-faint">{idx + 1}</span>
        <span className="min-w-0 grow break-words text-sm text-ink">
          {m.title}
        </span>
        <div className="flex flex-wrap items-center gap-1">
          <ModuleFile id={m.id} fileUrl={fileUrl} fileName={fileName} />
          <ModuleSection
            id={m.id}
            currentSectionId={m.section_id}
            sections={sectionList}
          />
          {people.map((p, i) => {
            const done = m.completed_by?.includes(p) ?? false;
            return (
              <form key={p} action={toggleModule.bind(null, m.id, p)}>
                <button
                  type="submit"
                  title={done ? `${p}: مكتمل` : `${p}: غير مكتمل`}
                  className={
                    "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition-colors " +
                    (done
                      ? PERSON_BAR[i % PERSON_BAR.length] +
                        " border-transparent text-white"
                      : "border-line bg-bg text-muted hover:border-line-strong hover:text-ink")
                  }
                >
                  {done ? (
                    <Check size={12} strokeWidth={2.5} />
                  ) : (
                    <span className="h-3 w-3 rounded-full border border-current" />
                  )}
                  {p}
                </button>
              </form>
            );
          })}
          <ModuleDeleteButton id={m.id} />
        </div>
      </li>
    );
  };

  const addModuleForm = (sectionId: string) => (
    <form action={createModule} className="flex gap-2 px-3 py-2.5">
      <input type="hidden" name="section_id" value={sectionId} />
      <input
        name="title"
        required
        placeholder="موديول جديد…"
        className="h-9 w-full rounded-md border border-line bg-bg px-3 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      <button
        type="submit"
        title="إضافة موديول"
        className="inline-flex h-9 shrink-0 items-center rounded-md bg-btn px-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-btn-hover"
      >
        <Plus size={15} strokeWidth={2.25} />
      </button>
    </form>
  );

  const sectionsData = sections.map((s) => {
    const mods = bySection.get(s.id) ?? [];
    return {
      id: s.id,
      title: s.title,
      count: mods.length,
      deleteButton: <SectionDeleteButton id={s.id} />,
      body: (
        <>
          {mods.length > 0 && <ul>{mods.map((m, i) => moduleRow(m, i))}</ul>}
          {addModuleForm(s.id)}
        </>
      ),
    };
  });

  return (
    <AppShell nav="curriculum">
      <div className="mx-auto max-w-content px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="mb-6 flex items-center gap-2.5 text-2xl font-semibold text-ink">
          <GraduationCap size={22} strokeWidth={1.75} className="text-p1-dot" />
          المنهج
        </h1>

        {/* نسبة الإنجاز الكلية لكل شخص */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {people.map((p, i) => {
            const { done, total, pct } = progressFor(modules, p);
            return (
              <div key={p} className="rounded-card border border-line p-3.5">
                <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 font-medium text-ink">
                    <span
                      className={
                        "h-2.5 w-2.5 rounded-full " +
                        PERSON_BAR[i % PERSON_BAR.length]
                      }
                    />
                    {p}
                  </span>
                  <span className="tnum text-muted">
                    {done}/{total} ·{" "}
                    <span className="font-semibold text-ink">{pct}%</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-hover">
                  <div
                    className={
                      "h-full rounded-full transition-all " +
                      PERSON_BAR[i % PERSON_BAR.length]
                    }
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* إضافة قسم */}
        <form action={createSection} className="mb-5 flex gap-2">
          <input
            name="title"
            required
            placeholder="قسم جديد… (مثل Backend)"
            className="h-9 w-full rounded-md border border-line bg-bg px-3 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <button
            type="submit"
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-md bg-btn px-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-btn-hover"
          >
            <FolderPlus size={15} strokeWidth={2} />
            قسم
          </button>
        </form>

        {sections.length === 0 && ungrouped.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <GraduationCap size={28} strokeWidth={1.5} className="text-faint" />
            <p className="text-sm text-muted">
              ابدأ بإضافة قسم، ثم أضِف موديولاته.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sections.length > 0 && (
              <CurriculumAccordion sections={sectionsData} />
            )}

            {ungrouped.length > 0 && (
              <div className="overflow-hidden rounded-card border border-line">
                <div className="border-b border-line bg-hover px-3 py-2 text-sm font-medium text-muted">
                  بدون قسم ({ungrouped.length})
                </div>
                <ul>{ungrouped.map((m, i) => moduleRow(m, i))}</ul>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
