"use client";

import { useState, useTransition } from "react";
import {
  PiBriefcase,
  PiBuildings,
  PiCircleNotch,
  PiDatabase,
  PiPlus,
  PiTag,
  PiTarget,
  PiUser,
} from "react-icons/pi";
import { createContact } from "@/app/actions";
import {
  Alert,
  Field,
  buttonClass,
  checkboxClass,
  inputClass,
  selectClass,
} from "@/components/ui";
import { useTopLoaderWhile } from "@/components/top-loader";
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
  useTopLoaderWhile(pending);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createContact(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Field label="Nama *" icon={PiUser}>
        <input name="name" required className={inputClass} placeholder="mis. Ibu Sari" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Jenis" icon={PiTag}>
          <select name="kind" className={selectClass} defaultValue="PERSON">
            {KINDS.map((k) => (
              <option key={k} value={k}>{contactKindLabels[k]}</option>
            ))}
          </select>
        </Field>
        <Field label="Organisasi" icon={PiBuildings}>
          <input name="org" className={inputClass} />
        </Field>
      </div>
      <Field label="Peran" icon={PiBriefcase}>
        <input name="role" className={inputClass} placeholder="mis. Owner" />
      </Field>
      <Field label="Jembatan ke prospek (opsional)" icon={PiTarget}>
        <select name="prospectId" className={selectClass} defaultValue="">
          <option value="">— tidak terhubung ke prospek —</option>
          {prospects.map((p) => (
            <option key={p.id} value={p.id}>{p.companyName}</option>
          ))}
        </select>
      </Field>
      <Field label="Sumber data" icon={PiDatabase}>
        <input name="source" className={inputClass} placeholder="mis. CRM, catatan sales" />
      </Field>
      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3 text-[13px] text-ink transition-colors hover:border-line-strong">
        <input type="checkbox" name="consent" className={checkboxClass} />
        Bersedia dimintai bantuan perkenalan
      </label>
      {error && <Alert tone="danger">{error}</Alert>}
      <button className={`${buttonClass("primary")} w-full`} disabled={pending}>
        {pending ? <PiCircleNotch className="animate-spin" /> : <PiPlus />}
        {pending ? "Menyimpan..." : "Tambah Kontak"}
      </button>
    </form>
  );
}
