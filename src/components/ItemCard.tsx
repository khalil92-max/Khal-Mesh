import Link from "next/link";
import { ExternalLink, Paperclip, Pencil, Play } from "lucide-react";
import type { ItemWithAttachment } from "@/lib/types";
import TypeBadge from "./TypeBadge";
import DeleteButton from "./DeleteButton";

function formatDate(iso: string): string {
  // YYYY-MM-DD بأرقام لاتينية
  return new Date(iso).toISOString().slice(0, 10);
}

export default function ItemCard({ item }: { item: ItemWithAttachment }) {
  return (
    <article className="group py-6">
      <div className="mb-2 flex items-center justify-between gap-3">
        <TypeBadge type={item.type} />
        <div className="flex items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <Link
            href={`/items/${item.id}/edit`}
            className="flex items-center gap-1 text-muted transition-colors hover:text-ink"
            title="تعديل"
          >
            <Pencil size={14} strokeWidth={1.75} />
          </Link>
          <DeleteButton id={item.id} />
        </div>
      </div>

      <h2 className="text-lg font-semibold leading-snug text-ink">
        {item.type !== "note" && item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-accent"
          >
            {item.title}
            <ExternalLink size={15} strokeWidth={1.75} className="text-faint" />
          </a>
        ) : (
          item.title
        )}
      </h2>

      {item.type === "note" && item.body && (
        <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-muted">
          {item.body}
        </p>
      )}

      {item.type !== "note" && item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer noopener"
          className="mono mt-2 block truncate text-xs text-link hover:underline"
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
              className={
                "mt-3 inline-flex items-center gap-1.5 text-xs transition-colors " +
                (isHtml
                  ? "font-medium text-link hover:text-accent"
                  : "text-muted hover:text-accent")
              }
            >
              {isHtml ? (
                <Play size={13} strokeWidth={1.75} />
              ) : (
                <Paperclip size={13} strokeWidth={1.75} />
              )}
              {isHtml ? `تشغيل · ${item.attachmentName}` : item.attachmentName ?? "مرفق"}
            </a>
          );
        })()}

      <div className="mono mt-3 flex items-center gap-3 text-[11px] text-faint">
        <span>{item.author}</span>
        <span className="text-line-strong">·</span>
        <span className="tnum">{formatDate(item.created_at)}</span>
      </div>
    </article>
  );
}
