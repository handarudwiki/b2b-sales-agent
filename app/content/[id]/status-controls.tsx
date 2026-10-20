"use client";

import { useState, useTransition } from "react";
import {
  setContentStatus,
  validateContentClaims,
} from "@/app/actions";
import { buttonClass, inputClass } from "@/components/ui";
import type { ContentStatus } from "@prisma/client";

const FLOW: { status: ContentStatus; label: string; variant: "primary" | "secondary" | "danger" }[] = [
  { status: "IN_REVIEW", label: "Kirim ke Review", variant: "secondary" },
  { status: "APPROVED", label: "Setujui", variant: "secondary" },
  { status: "PUBLISHED", label: "Terbitkan", variant: "primary" },
  { status: "REJECTED", label: "Tolak", variant: "danger" },
  { status: "DRAFT", label: "Kembali ke Draft", variant: "secondary" },
];

export function StatusControls({
  id,
  status,
  claimsValidated,
}: {
  id: string;
  status: ContentStatus;
  claimsValidated: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function changeStatus(next: ContentStatus) {
    setError(null);
    const fd = new FormData();
    fd.set("id", id);
    fd.set("status", next);
    startTransition(async () => {
      const res = await setContentStatus(fd);
      if (res?.error) setError(res.error);
    });
  }

  function validate(formData: FormData) {
    startTransition(async () => {
      await validateContentClaims(formData);
    });
  }

  return (
    <div className="space-y-3">
      {!claimsValidated && (
        <form action={validate} className="space-y-2 rounded-lg bg-amber-50 p-3">
          <p className="text-xs text-amber-700">
            Validasi klaim diperlukan sebelum terbit.
          </p>
          <input type="hidden" name="id" value={id} />
          <input
            name="note"
            className={inputClass}
            placeholder="Catatan validasi (opsional)"
          />
          <button className={buttonClass("secondary")} disabled={pending}>
            ✅ Tandai Klaim Tervalidasi
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {FLOW.filter((f) => f.status !== status).map((f) => (
          <button
            key={f.status}
            onClick={() => changeStatus(f.status)}
            disabled={pending}
            className={buttonClass(f.variant)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </div>
  );
}
