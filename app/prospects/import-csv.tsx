"use client";

import { useState, useTransition } from "react";
import { importProspectsCsv } from "@/app/actions";
import { Card, buttonClass } from "@/components/ui";

export function ImportCsv() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Impor Prospek dari CSV</h3>
          <p className="text-sm text-muted">
            Kolom didukung: companyName, segment, website, email, phone, location, catatan.
            Duplikat terdeteksi otomatis.
          </p>
        </div>
        <button className={buttonClass("secondary")} onClick={() => setOpen((v) => !v)}>
          {open ? "Tutup" : "Impor CSV"}
        </button>
      </div>

      {open && (
        <form action={handleSubmit} className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            className="text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
          />
          <button type="submit" className={buttonClass("primary")} disabled={pending}>
            {pending ? "Mengimpor..." : "Mulai Impor"}
          </button>
        </form>
      )}

      {message && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
      {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </Card>
  );
}
