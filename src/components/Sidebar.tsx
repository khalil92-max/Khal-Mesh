import Link from "next/link";
import { Clock, GraduationCap, Layers } from "lucide-react";
import { getCurrentUser, getAllowedUsers } from "@/lib/auth";
import { formatHours, getLearningHours } from "@/lib/learning";
import { TYPE_META, type ItemType } from "@/lib/types";
import MiniCalendar from "./MiniCalendar";
import Avatar from "./Avatar";
import AddHours from "./AddHours";
import LogoutButton from "./LogoutButton";

function href(params: { type?: string; author?: string }): string {
  const sp = new URLSearchParams();
  if (params.type && params.type !== "all") sp.set("type", params.type);
  if (params.author) sp.set("author", params.author);
  const s = sp.toString();
  return s ? `/?${s}` : "/";
}

function Row({
  href: to,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={to}
      className={
        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors " +
        (active
          ? "bg-black/[0.06] font-medium text-ink"
          : "text-muted hover:bg-black/[0.04] hover:text-ink")
      }
    >
      {children}
    </Link>
  );
}

function Dot({ className }: { className: string }) {
  return (
    <span className={"h-2.5 w-2.5 shrink-0 rounded-full " + className} />
  );
}

const PERSON_DOTS = ["bg-p1-dot", "bg-p2-dot"];

export default async function Sidebar({
  activeType = "all",
  activeAuthor,
  nav,
}: {
  activeType?: string;
  activeAuthor?: string;
  nav?: string;
}) {
  const user = await getCurrentUser();
  const people = getAllowedUsers().map((u) => u.name);
  const hours = await getLearningHours();
  const types: ItemType[] = ["note", "link", "project"];

  return (
    <aside className="flex h-full w-full flex-col overflow-y-auto border-r border-line bg-sidebar">
      <div className="flex items-center gap-2 px-4 pb-3 pt-4">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-ink text-[11px] font-bold text-white">
          خ
        </span>
        <span className="text-sm font-semibold text-ink">KhalMesh</span>
      </div>

      <div className="px-2 pb-3">
        <MiniCalendar />
      </div>

      <div className="mx-2 border-t border-line" />

      <nav className="flex flex-col gap-0.5 px-2 pt-3">
        <Link
          href="/curriculum"
          className={
            "flex items-center gap-2.5 rounded-md bg-purple-bg px-2 py-1.5 text-sm font-medium text-ink transition hover:brightness-[0.97] " +
            (nav === "curriculum" ? "ring-1 ring-purple-line" : "")
          }
        >
          <GraduationCap
            size={14}
            strokeWidth={1.75}
            className="shrink-0 text-p1-dot"
          />
          المنهج
        </Link>
      </nav>

      <nav className="flex flex-col gap-0.5 px-2 pb-3 pt-2">
        <span className="px-2 pb-1 text-xs font-medium text-muted">
          التصنيفات
        </span>
        <Row
          href={href({ author: activeAuthor })}
          active={nav !== "curriculum" && activeType === "all"}
        >
          <Layers size={14} strokeWidth={1.75} className="shrink-0 text-muted" />
          الكل
        </Row>
        {types.map((t) => {
          const meta = TYPE_META[t];
          const labels: Record<ItemType, string> = {
            note: "ملاحظات",
            link: "روابط",
            project: "مشاريع",
          };
          return (
            <Row
              key={t}
              href={href({ type: t, author: activeAuthor })}
              active={nav !== "curriculum" && activeType === t}
            >
              <Dot className={meta.dot} />
              {labels[t]}
            </Row>
          );
        })}
      </nav>

      {people.length > 0 && (
        <nav className="flex flex-col gap-0.5 px-2 pb-3">
          <span className="px-2 pb-1 text-xs font-medium text-muted">
            الأشخاص
          </span>
          {people.map((name, i) => {
            const active = activeAuthor === name;
            const hrs = hours[name] ?? 0;
            const to = active
              ? href({ type: activeType })
              : href({ type: activeType, author: name });
            return (
              <div key={name} className="flex items-center gap-0.5">
                <Link
                  href={to}
                  className={
                    "flex grow items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors " +
                    (active
                      ? "bg-black/[0.06] font-medium text-ink"
                      : "text-muted hover:bg-black/[0.04] hover:text-ink")
                  }
                >
                  <Dot className={PERSON_DOTS[i % PERSON_DOTS.length]} />
                  <span className="grow">{name}</span>
                  {hrs > 0 && (
                    <span className="tnum inline-flex items-center gap-1 text-xs text-faint">
                      <Clock size={11} strokeWidth={1.75} />
                      {formatHours(hrs)}س
                    </span>
                  )}
                </Link>
                <AddHours person={name} />
              </div>
            );
          })}
        </nav>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line px-4 py-3 text-xs">
        {user ? <Avatar name={user} /> : <span className="text-faint">—</span>}
        <LogoutButton />
      </div>
    </aside>
  );
}
