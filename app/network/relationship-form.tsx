"use client";

import { useState, useTransition } from "react";
import {
  PiArrowDown,
  PiChatText,
  PiCircleNotch,
  PiDatabase,
  PiLinkSimple,
  PiTag,
  PiUser,
} from "react-icons/pi";
import { createRelationship } from "@/app/actions";
import {
  Alert,
  Field,
  buttonClass,
  inputClass,
  labelClass,
  selectClass,
} from "@/components/ui";
import { useTopLoaderWhile } from "@/components/top-loader";
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
  const [strength, setStrength] = useState(60);
  const [pending, startTransition] = useTransition();
  useTopLoaderWhile(pending);

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
      <p className="text-[13px] text-muted">
        Tambahkan minimal 2 kontak terlebih dahulu untuk membuat relasi.
      </p>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="rounded-2xl border border-line bg-surface-2 p-3">
        <Field label="Dari" icon={PiUser}>
          <select name="fromId" required className={selectClass} defaultValue="">
            <option value="" disabled>Pilih kontak</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <div className="my-2 flex justify-center text-muted">
          <PiArrowDown className="size-4" />
        </div>
        <Field label="Ke" icon={PiUser}>
          <select name="toId" required className={selectClass} defaultValue="">
            <option value="" disabled>Pilih kontak</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Tipe" icon={PiTag}>
        <select name="type" className={selectClass} defaultValue="BUSINESS">
          {TYPES.map((t) => (
            <option key={t} value={t}>{relationshipTypeLabels[t]}</option>
          ))}
        </select>
      </Field>
      <div>
        <label htmlFor="strength" className={`${labelClass} flex items-center justify-between`}>
          <span className="flex items-center gap-1.5">
            <PiLinkSimple className="size-3.5 text-muted" />
            Kekuatan (1-100)
          </span>
          <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold text-lime tabular-nums">{strength}</span>
        </label>
        <input
          id="strength"
          name="strength"
          type="range"
          min={1}
          max={100}
          value={strength}
          onChange={(e) => setStrength(Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-ink"
        />
      </div>
      <Field label="Alasan (dapat ditinjau)" icon={PiChatText}>
        <input name="reason" className={inputClass} placeholder="mis. pernah proyek bersama 2023" />
      </Field>
      <Field label="Sumber" icon={PiDatabase}>
        <input name="source" className={inputClass} />
      </Field>
      {error && <Alert tone="danger">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}
      <button className={`${buttonClass("primary")} w-full`} disabled={pending}>
        {pending ? <PiCircleNotch className="animate-spin" /> : <PiLinkSimple />}
        {pending ? "Menyimpan..." : "Tambah Relasi"}
      </button>
    </form>
  );
}
