import { GraduationCap, Check, Plus } from "lucide-react";
import AppShell from "@/components/AppShell";
import ModuleDeleteButton from "@/components/ModuleDeleteButton";
import ModuleFile from "@/components/ModuleFile";
import { getAllowedUsers } from "@/lib/auth";
import { getModules, progressFor } from "@/lib/modules";
import { attachmentName } from "@/lib/storage";
import { createModule, toggleModule } from "@/app/module-actions";

export const dynamic = "force-dynamic";

const PERSON_BAR = ["bg-p1-dot", "bg-p2-dot"];

export default async function CurriculumPage() {
  const people = getAllowedUsers().map((u) => u.name);
  const modules = await getModules();

  return (
    <AppShell nav="curriculum">
      <div className="mx-auto max-w-content px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="mb-6 flex items-center gap-2.5 text-2xl font-semibold text-ink">
          <GraduationCap size={22} strokeWidth={1.75} className="text-p1-dot" />
          المنهج
        </h1>

        {/* نسبة الإنجاز لكل شخص */}
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

        {/* إضافة موديول (مع ملف اختياري) */}
        <form action={createModule} className="mb-5 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              name="title"
              required
              placeholder="موديول جديد…"
              className="h-9 w-full rounded-md border border-line bg-bg px-3 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <button
              type="submit"
              className="inline-flex h-9 shrink-0 items-center gap-1 rounded-md bg-btn px-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-btn-hover"
            >
              <Plus size={15} strokeWidth={2.25} />
              إضافة
            </button>
          </div>
          <input
            name="file"
            type="file"
            className="block w-full text-sm text-muted file:mr-0 file:ml-3 file:cursor-pointer file:rounded-md file:border file:border-line file:bg-hover file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink hover:file:border-line-strong"
          />
        </form>

        {/* قائمة الموديولات */}
        {modules.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <GraduationCap size={28} strokeWidth={1.5} className="text-faint" />
            <p className="text-sm text-muted">
              لا توجد موديولات بعد — أضِف أول واحد.
            </p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-card border border-line">
            {modules.map((m, idx) => {
              const fileName = m.file_path ? attachmentName(m.file_path) : null;
              const fileUrl = m.file_path ? `/api/module-file/${m.id}` : null;
              return (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center gap-x-2 gap-y-2 border-b border-line px-3 py-2.5 last:border-0"
                >
                  <span className="tnum w-5 shrink-0 text-xs text-faint">
                    {idx + 1}
                  </span>
                  <span className="min-w-0 grow break-words text-sm text-ink">
                    {m.title}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <ModuleFile
                      id={m.id}
                      fileUrl={fileUrl}
                      fileName={fileName}
                    />
                    {people.map((p, i) => {
                      const done = m.completed_by?.includes(p) ?? false;
                      return (
                        <form
                          key={p}
                          action={toggleModule.bind(null, m.id, p)}
                        >
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
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
