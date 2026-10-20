"use client";

import { useState, useTransition } from "react";
import {
  PiBuildings,
  PiChatText,
  PiCircleNotch,
  PiDatabase,
  PiEnvelope,
  PiFloppyDisk,
  PiGlobe,
  PiMapPin,
  PiPhone,
  PiSquaresFour,
  PiUser,
} from "react-icons/pi";
import { createProspect } from "@/app/actions";
import {
  Alert,
  Field,
  buttonClass,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/ui";
import { useTopLoaderWhile } from "@/components/top-loader";
import type { BusinessSegment } from "@prisma/client";

export function ProspectForm({ segments }: { segments: [BusinessSegment, string][] }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  useTopLoaderWhile(pending);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createProspect(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <Field label="Nama Perusahaan / Brand *" icon={PiBuildings}>
        <input name="companyName" required className={inputClass} placeholder="mis. Glow Aesthetic Clinic" />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Segmen" icon={PiSquaresFour}>
          <select name="segment" className={selectClass} defaultValue="">
            <option value="">Deteksi otomatis</option>
            {segments.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
        <Field label="Lokasi" icon={PiMapPin}>
          <input name="location" className={inputClass} placeholder="mis. Jakarta" />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Website / Profil" icon={PiGlobe}>
          <input name="website" className={inputClass} placeholder="mis. glowclinic.co.id" />
        </Field>
        <Field label="Narahubung" icon={PiUser}>
          <input name="contactPerson" className={inputClass} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Email" icon={PiEnvelope}>
          <input name="email" type="email" className={inputClass} />
        </Field>
        <Field label="Telepon / WhatsApp" icon={PiPhone}>
          <input name="phone" className={inputClass} />
        </Field>
      </div>

      <Field label="Indikasi Kecocokan (opsional)" icon={PiChatText}>
        <textarea
          name="fitIndication"
          rows={3}
          className={textareaClass}
          placeholder="mis. Ingin mengembangkan lini skincare sendiri"
        />
      </Field>

      <Field label="Sumber Data" icon={PiDatabase}>
        <input name="dataSource" className={inputClass} placeholder="mis. Instagram, referral, pameran" />
      </Field>

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="border-t border-line pt-5">
        <button type="submit" className={buttonClass("primary", "lg")} disabled={pending}>
          {pending ? <PiCircleNotch className="animate-spin" /> : <PiFloppyDisk />}
          {pending ? "Menyimpan..." : "Simpan Prospek"}
        </button>
      </div>
    </form>
  );
}
