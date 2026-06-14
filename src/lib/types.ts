export type ItemType = "note" | "link" | "project";

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  body: string | null;
  url: string | null;
  file_path: string | null;
  author: string;
  created_at: string;
  updated_at: string;
}

/** item مع رابط مؤقت موقّع للمرفق (يُولّد server-side عند العرض). */
export interface ItemWithAttachment extends Item {
  attachmentUrl: string | null;
  attachmentName: string | null;
}

export const ITEM_TYPES: ItemType[] = ["note", "link", "project"];

export const TYPE_LABELS: Record<ItemType, string> = {
  note: "ملاحظة",
  link: "رابط",
  project: "مشروع",
};
