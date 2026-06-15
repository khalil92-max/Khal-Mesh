/** فقاعة شخص: دائرة بيضاء بأول حرف — تظهر جيداً على الأبيض والباستيل. */
export default function Avatar({ name }: { name: string }) {
  const initial = (name?.trim()?.[0] ?? "؟").toUpperCase();
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-tag-fg ring-1 ring-inset ring-line">
        {initial}
      </span>
      <span className="truncate text-muted">{name}</span>
    </span>
  );
}
