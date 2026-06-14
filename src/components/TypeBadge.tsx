import type { ItemType } from "@/lib/types";

const STYLES: Record<ItemType, { label: string; color: string }> = {
  note: { label: "NOTE", color: "var(--note)" },
  link: { label: "LINK", color: "var(--link)" },
  project: { label: "PROJECT", color: "var(--project)" },
};

export default function TypeBadge({ type }: { type: ItemType }) {
  const s = STYLES[type];
  return (
    <span className="mono inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: s.color }}
      />
      <span style={{ color: s.color }}>{s.label}</span>
    </span>
  );
}
