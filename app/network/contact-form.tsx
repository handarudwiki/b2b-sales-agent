"use client";

import { useState, useTransition } from "react";
import { createContact } from "@/app/actions";
import { buttonClass, inputClass, labelClass } from "@/components/ui";
import { contactKindLabels } from "@/lib/labels";
import type { ContactKind } from "@prisma/client";

const KINDS = Object.keys(contactKindLabels) as ContactKind[];

export function ContactForm({
  prospects,
}: {
  prospects: { id: string; companyName: string }[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createContact(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div>
        <label className={labelClass}>Nama *</label>
        <input name="name" required className={inputClass} placeholder="mis. Ibu Sari" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Jenis</label>
          <select name="kind" className={inputClass} defaultValue="PERSON">
            {KINDS.map((k) => (
              <option key={k} value={k}>{contactKindLabels[k]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Organisasi</label>
          <input name="org" className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Peran</label>
        <input name="role" className={inputClass} placeholder="mis. Owner" />
      </div>
      <div>
        <label className={labelClass}>Jembatan ke Prospek (opsional)</label>
        <select name="prospectId" className={inputClass} defaultValue="">
          <option value="">— tidak terhubung ke prospek —</option>
          {prospects.map((p) => (
            <option key={p.id} value={p.id}>{p.companyName}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Sumber Data</label>
        <input name="source" className={inputClass} placeholder="mis. CRM, catatan sales" />
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="consent" />
        Bersedia dimintai bantuan perkenalan
      </label>
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <button className={`${buttonClass("primary")} w-full`} disabled={pending}>
        {pending ? "Menyimpan..." : "Tambah Kontak"}
      </button>
    </form>
  );
}
