"use client";

import { useState, useTransition } from "react";
import { updateContent } from "@/app/actions";
import { Card, buttonClass, inputClass, labelClass } from "@/components/ui";

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

  function handleSubmit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await updateContent(formData);
      setSaved(true);
    });
  }

  return (
    <Card>
      <form action={handleSubmit} className="space-y-4">
        <input type="hidden" name="id" value={id} />
        <div>
          <label className={labelClass}>Judul</label>
          <input name="title" defaultValue={title} className={inputClass} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Meta Title</label>
            <input name="metaTitle" defaultValue={metaTitle} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Meta Description</label>
            <input name="metaDescription" defaultValue={metaDescription} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Isi Konten (Markdown)</label>
          <textarea
            name="body"
            defaultValue={body}
            rows={22}
            className={`${inputClass} font-mono text-xs leading-relaxed`}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className={buttonClass("primary")} disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan & Hitung Ulang GEO"}
          </button>
          {saved && <span className="text-sm text-emerald-600">✓ Tersimpan</span>}
        </div>
      </form>
    </Card>
  );
}
