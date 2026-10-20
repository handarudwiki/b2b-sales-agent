"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { PiCheckCircle, PiCircleNotch, PiFloppyDisk, PiTextAa } from "react-icons/pi";
import { updateContent } from "@/app/actions";
import { Card, buttonClass, cn, inputClass, labelClass } from "@/components/ui";
import { useTopLoaderWhile } from "@/components/top-loader";

const MarkdownEditor = dynamic(() => import("@/components/markdown-editor"), {
  ssr: false,
  loading: () => <div className="h-[560px] animate-pulse rounded-[18px] bg-surface-2 ring-1 ring-line" />,
});

function Counter({ length, min, max }: { length: number; min: number; max: number }) {
  const ok = length >= min && length <= max;
  return (
    <span className={cn("text-[11px] font-medium tabular-nums", ok ? "text-emerald-700" : "text-muted")}>
      {length} · ideal {min}–{max}
    </span>
  );
}

export function ContentEditor({
  id,
  title,
  body,
  metaTitle,
  metaDescription,
}: {
  id: string;
  title: string;
  body: string;
  metaTitle: string;
  metaDescription: string;
}) {
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [markdown, setMarkdown] = useState(body);
  const [metaTitleLength, setMetaTitleLength] = useState(metaTitle.length);
  const [metaDescriptionLength, setMetaDescriptionLength] = useState(metaDescription.length);
  useTopLoaderWhile(pending);

  const words = markdown.trim().split(/\s+/).filter(Boolean).length;

  function handleSubmit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await updateContent(formData);
      setSaved(true);
    });
  }

  return (
    <Card className="animate-fade-up">
      <form action={handleSubmit} className="space-y-5">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="body" value={markdown} />
        <div>
          <label htmlFor="title" className={labelClass}>Judul</label>
          <input id="title" name="title" defaultValue={title} className={cn(inputClass, "h-12 text-[15px] font-semibold")} />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="metaTitle" className={cn(labelClass, "flex items-center justify-between")}>
              Meta title
              <Counter length={metaTitleLength} min={15} max={60} />
            </label>
            <input
              id="metaTitle"
              name="metaTitle"
              defaultValue={metaTitle}
              onChange={(e) => setMetaTitleLength(e.target.value.length)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="metaDescription" className={cn(labelClass, "flex items-center justify-between")}>
              Meta description
              <Counter length={metaDescriptionLength} min={70} max={160} />
            </label>
            <input
              id="metaDescription"
              name="metaDescription"
              defaultValue={metaDescription}
              onChange={(e) => setMetaDescriptionLength(e.target.value.length)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className={cn(labelClass, "mb-0 flex items-center gap-1.5")}>
              <PiTextAa className="size-3.5 text-muted" />
              Isi konten
            </span>
            <span className="text-[11px] font-medium text-muted tabular-nums">{words} kata</span>
          </div>
          <MarkdownEditor markdown={body} onChange={setMarkdown} />
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <button className={buttonClass("primary", "lg")} disabled={pending}>
            {pending ? <PiCircleNotch className="animate-spin" /> : <PiFloppyDisk />}
            {pending ? "Menyimpan..." : "Simpan & Hitung Ulang GEO"}
          </button>
          {saved && (
            <span className="inline-flex animate-fade-in items-center gap-1.5 text-[13px] font-medium text-emerald-700">
              <PiCheckCircle className="size-4" />
              Tersimpan
            </span>
          )}
        </div>
      </form>
    </Card>
  );
}
