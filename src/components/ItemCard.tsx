import Link from "next/link";
import {
  ExternalLink,
  FolderOpen,
  List,
  Paperclip,
  Pencil,
  Play,
} from "lucide-react";
import type { ItemWithAttachment } from "@/lib/types";
import { TYPE_META } from "@/lib/types";
import TypeBadge from "./TypeBadge";
import Avatar from "./Avatar";
import DeleteButton from "./DeleteButton";

function formatDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export default function ItemCard({ item }: { item: ItemWithAttachment }) {
  const meta = TYPE_META[item.type];

  return (
    <article
      className={
        "group relative flex flex-col gap-2.5 rounded-card border-s-4 p-4 ring-1 ring-black/5 transition-shadow duration-150 hover:ring-black/10 " +
        meta.fill +
        " " +
        meta.bar
      }
    >
      <header className="flex items-center justify-between gap-2">
        <TypeBadge type={item.type} />
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100">
          <Link
            href={`/items/${item.id}/edit`}
            className="rounded-md p-1.5 text-tag-fg transition-colors hover:bg-white/70"
            title="تعديل"
            aria-label="تعديل"
          >
            <Pencil size={15} strokeWidth={1.75} />
          </Link>
          <DeleteButton id={item.id} />
        </div>
      </header>

      <h2 className="break-words text-base font-semibold leading-snug text-ink">
        {item.type !== "note" && item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 hover:underline"
          >
            {item.title}
            <ExternalLink
              size={14}
              strokeWidth={1.75}
              className="shrink-0 opacity-50"
            />
          </a>
        ) : (
          item.title
        )}
      </h2>

      {item.type === "note" && item.body && (
        <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-tag-fg">
          {item.body}
        </p>
      )}

      {item.type !== "note" && item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer noopener"
          className="mono block truncate text-xs text-tag-fg hover:underline"
          dir="ltr"
        >
          {item.url}
        </a>
      )}

      {item.attachmentUrl &&
        (() => {
          const isHtml = /\.html?$/i.test(item.attachmentName ?? "");
          return (
            <a
              href={item.attachmentUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-md border border-line bg-white/70 px-2 py-1 text-xs font-medium text-tag-fg transition-colors hover:bg-white"
            >
              {isHtml ? (
                <Play
                  size={13}
                  strokeWidth={1.75}
                  className="shrink-0 text-link-dot"
                />
              ) : (
                <Paperclip size={13} strokeWidth={1.75} className="shrink-0" />
              )}
              <span className="truncate">
                {isHtml
                  ? `تشغيل · ${item.attachmentName}`
                  : item.attachmentName ?? "مرفق"}
              </span>
            </a>
          );
        })()}

      {item.folderUrl && (
        <div className="flex flex-wrap items-center gap-1.5">
          <a
            href={item.folderUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-line bg-white/70 px-2 py-1 text-xs font-medium text-tag-fg transition-colors hover:bg-white"
          >
            <FolderOpen
              size={13}
              strokeWidth={1.75}
              className="shrink-0 text-link-dot"
            />
            <span className="truncate">
              فتح المجلّد
              {item.folderCount ? ` · ${item.folderCount} ملف` : ""}
            </span>
          </a>
          <Link
            href={`/items/${item.id}/files`}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white/70 px-2 py-1 text-xs font-medium text-tag-fg transition-colors hover:bg-white"
          >
            <List size={13} strokeWidth={1.75} className="shrink-0" />
            تصفّح الملفات
          </Link>
        </div>
      )}

      <footer className="mt-auto flex items-center justify-between gap-2 pt-1.5 text-xs text-tag-fg">
        <Avatar name={item.author} />
        <span className="tnum mono shrink-0">{formatDate(item.created_at)}</span>
      </footer>
    </article>
  );
}
