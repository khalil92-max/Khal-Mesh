"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { FileDown, Loader2, Paperclip, Play } from "lucide-react";
import { setModuleFile } from "@/app/module-actions";

function UploadControl({ hasFile, inputId }: { hasFile: boolean; inputId: string }) {
  const { pending } = useFormStatus();
  return (
    <label
      htmlFor={inputId}
      title={hasFile ? "استبدال الملف" : "إرفاق ملف"}
      className="flex cursor-pointer rounded-md p-1.5 text-muted transition-colors hover:bg-hover hover:text-ink"
    >
      {pending ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Paperclip size={15} strokeWidth={1.75} />
      )}
    </label>
  );
}

export default function ModuleFile({
  id,
  fileUrl,
  fileName,
}: {
  id: string;
  fileUrl: string | null;
  fileName: string | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const isHtml = /\.html?$/i.test(fileName ?? "");
  const inputId = `mf-${id}`;

  return (
    <div className="flex items-center gap-1">
      {fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex max-w-[9rem] items-center gap-1 rounded-md border border-line bg-bg px-2 py-1 text-xs font-medium text-ink transition-colors hover:bg-hover"
        >
          {isHtml ? (
            <Play size={12} strokeWidth={2} className="shrink-0 text-link-dot" />
          ) : (
            <FileDown size={12} strokeWidth={2} className="shrink-0 text-link-dot" />
          )}
          <span className="truncate">{isHtml ? "تشغيل" : (fileName ?? "ملف")}</span>
        </a>
      )}
      <form ref={formRef} action={setModuleFile.bind(null, id)}>
        <input
          id={inputId}
          name="file"
          type="file"
          className="hidden"
          onChange={() => formRef.current?.requestSubmit()}
        />
        <UploadControl hasFile={!!fileUrl} inputId={inputId} />
      </form>
    </div>
  );
}
