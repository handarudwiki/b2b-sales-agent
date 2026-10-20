"use client";

import { useState, useTransition } from "react";
import {
  PiCircleNotch,
  PiDownloadSimple,
  PiFileCsv,
  PiUploadSimple,
  PiX,
} from "react-icons/pi";
import { importProspectsCsv } from "@/app/actions";
import { Alert, Card, IconBox, buttonClass } from "@/components/ui";
import { useTopLoaderWhile } from "@/components/top-loader";

export function ImportCsv() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  useTopLoaderWhile(pending);

  function handleSubmit(formData: FormData) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await importProspectsCsv(formData);
      if (res?.error) setError(res.error);
      if (res?.success) setMessage(res.success);
    });
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <IconBox icon={PiFileCsv} tone="lime" />
          <div>
            <h3 className="text-[14px] font-semibold text-ink">Impor prospek dari CSV</h3>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">
              Kolom didukung: companyName, segment, website, email, phone, location, catatan.
              Duplikat terdeteksi otomatis.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a href="/sample-prospects.csv" download className={buttonClass("ghost", "sm")}>
            <PiDownloadSimple />
            Contoh CSV
          </a>
          <button type="button" className={buttonClass("secondary")} onClick={() => setOpen((v) => !v)}>
            {open ? <PiX /> : <PiUploadSimple />}
            {open ? "Tutup" : "Impor CSV"}
          </button>
        </div>
      </div>

      {open && (
        <form
          action={handleSubmit}
          className="mt-4 flex animate-fade-in flex-col gap-3 rounded-2xl border border-dashed border-line-strong bg-surface-2 p-3 sm:flex-row sm:items-center"
        >
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            className="min-w-0 flex-1 cursor-pointer text-[13px] text-ink-2 file:mr-3 file:h-9 file:cursor-pointer file:rounded-full file:border-0 file:bg-ink file:px-4 file:text-[12.5px] file:font-medium file:text-white hover:file:bg-[#262a27]"
          />
          <button type="submit" className={buttonClass("accent")} disabled={pending}>
            {pending ? <PiCircleNotch className="animate-spin" /> : <PiUploadSimple />}
            {pending ? "Mengimpor..." : "Mulai Impor"}
          </button>
        </form>
      )}

      {message && (
        <Alert tone="success" className="mt-3">
          {message}
        </Alert>
      )}
      {error && (
        <Alert tone="danger" className="mt-3">
          {error}
        </Alert>
      )}
    </Card>
  );
}
