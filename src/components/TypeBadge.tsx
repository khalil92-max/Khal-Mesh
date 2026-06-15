import type { ItemType } from "@/lib/types";
import { TYPE_META } from "@/lib/types";

/** تصنيف العنصر: نقطة لون التقويم + التسمية، على بطاقة باستيل. */
export default function TypeBadge({ type }: { type: ItemType }) {
  const meta = TYPE_META[type];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-tag-fg">
      <span className={"h-2 w-2 shrink-0 rounded-full " + meta.dot} />
      {meta.label}
    </span>
  );
}
