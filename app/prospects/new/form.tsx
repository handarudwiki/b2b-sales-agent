"use client";

import { useState, useTransition } from "react";
import { createProspect } from "@/app/actions";
import { buttonClass, inputClass, labelClass } from "@/components/ui";
import type { BusinessSegment } from "@prisma/client";

export function ProspectForm({ segments }: { segments: [BusinessSegment, string][] }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createProspect(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Nama Perusahaan / Brand *</label>
        <input name="companyName" required className={inputClass} placeholder="mis. Glow Aesthetic Clinic" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Segmen</label>
          <select name="segment" className={inputClass} defaultValue="">
            <option value="">Deteksi otomatis</option>
            {segments.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Lokasi</label>
          <input name="location" className={inputClass} placeholder="mis. Jakarta" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Website / Profil</label>
          <input name="website" className={inputClass} placeholder="mis. glowclinic.co.id" />
        </div>
        <div>
          <label className={labelClass}>Narahubung</label>
          <input name="contactPerson" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Email</label>
          <input name="email" type="email" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Telepon / WhatsApp</label>
          <input name="phone" className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Indikasi Kecocokan (opsional)</label>
        <textarea name="fitIndication" rows={2} className={inputClass} placeholder="mis. Ingin mengembangkan lini skincare sendiri" />
      </div>

      <div>
        <label className={labelClass}>Sumber Data</label>
        <input name="dataSource" className={inputClass} placeholder="mis. Instagram, referral, pameran" />
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" className={buttonClass("primary")} disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan Prospek"}
        </button>
      </div>
    </form>
  );
}
