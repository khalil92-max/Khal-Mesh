export type ItemType = "note" | "link" | "project";

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  body: string | null;
  url: string | null;
  file_path: string | null;
  /** بادئة تخزين المجلّد المرفق (folders/<uuid>) أو null. */
  folder_prefix: string | null;
  /** المسار النسبي لملف بداية المجلّد (عادةً index.html). */
  folder_entry: string | null;
  /** المسارات النسبية لكل ملفات المجلّد. */
  folder_files: string[] | null;
  author: string;
  created_at: string;
  updated_at: string;
}

/** item مع روابط جاهزة للمرفق/المجلّد (تُولّد server-side عند العرض). */
export interface ItemWithAttachment extends Item {
  attachmentUrl: string | null;
  attachmentName: string | null;
  /** رابط فتح المجلّد على ملف البداية، أو null. */
  folderUrl: string | null;
  /** عدد ملفات المجلّد. */
  folderCount: number;
}

/** قسم (مجلّد) يجمّع موديولات المنهج. */
export interface Section {
  id: string;
  title: string;
  position: number;
  author: string;
  created_at: string;
  updated_at: string;
}

/** موديول ضمن المنهج، مع أسماء من أكمله. */
export interface Module {
  id: string;
  title: string;
  position: number;
  completed_by: string[];
  file_path: string | null;
  section_id: string | null;
  author: string;
  created_at: string;
  updated_at: string;
}

export const ITEM_TYPES: ItemType[] = ["note", "link", "project"];

export const TYPE_LABELS: Record<ItemType, string> = {
  note: "ملاحظة",
  link: "رابط",
  project: "مشروع",
};

/**
 * بيانات عرض كل نوع بألوان Notion Calendar: إيموجي كأيقونة،
 * fill (تعبئة البطاقة الباستيلية)، dot (نقطة التصنيف المشبعة)،
 * bar (شريط اللكنة على الحافة البادئة). أصناف Tailwind مكتوبة كاملةً
 * حتى يلتقطها JIT (لا تركيب ديناميكي للأسماء).
 */
export const TYPE_META: Record<
  ItemType,
  { label: string; emoji: string; fill: string; dot: string; bar: string }
> = {
  note: {
    label: "ملاحظة",
    emoji: "📝",
    fill: "bg-note-bg",
    dot: "bg-note-dot",
    bar: "border-note-dot",
  },
  link: {
    label: "رابط",
    emoji: "🔗",
    fill: "bg-link-bg",
    dot: "bg-link-dot",
    bar: "border-link-dot",
  },
  project: {
    label: "مشروع",
    emoji: "📁",
    fill: "bg-project-bg",
    dot: "bg-project-dot",
    bar: "border-project-dot",
  },
};
