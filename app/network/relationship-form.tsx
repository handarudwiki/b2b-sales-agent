"use client";

import { useState, useTransition } from "react";
import { createRelationship } from "@/app/actions";
import { buttonClass, inputClass, labelClass } from "@/components/ui";
import { relationshipTypeLabels } from "@/lib/graph";
import type { RelationshipType } from "@prisma/client";

const TYPES = Object.keys(relationshipTypeLabels) as RelationshipType[];

export function RelationshipForm({
  contacts,
}: {
  contacts: { id: string; name: string }[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await createRelationship(formData);
      if (res?.error) setError(res.error);
      if (res?.success) setMessage(res.success);
    });
  }

  if (contacts.length < 2) {
    return (
      <p className="text-sm text-muted">
        Tambahkan minimal 2 kontak terlebih dahulu untuk membuat relasi.
      </p>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div>
        <label className={labelClass}>Dari</label>
        <select name="fromId" required className={inputClass} defaultValue="">
          <option value="" disabled>Pilih kontak</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Ke</label>
        <select name="toId" required className={inputClass} defaultValue="">
          <option value="" disabled>Pilih kontak</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Tipe</label>
          <select name="type" className={inputClass} defaultValue="BUSINESS">
            {TYPES.map((t) => (
              <option key={t} value={t}>{relationshipTypeLabels[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Kekuatan (1-100)</label>
          <input name="strength" type="number" min={1} max={100} defaultValue={60} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Alasan (dapat ditinjau)</label>
        <input name="reason" className={inputClass} placeholder="mis. pernah proyek bersama 2023" />
      </div>
      <div>
        <label className={labelClass}>Sumber</label>
        <input name="source" className={inputClass} />
      </div>
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
      <button className={`${buttonClass("primary")} w-full`} disabled={pending}>
        {pending ? "Menyimpan..." : "Tambah Relasi"}
      </button>
    </form>
  );
}
