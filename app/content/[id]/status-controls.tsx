"use client";

import { useState, useTransition } from "react";
import type { IconType } from "react-icons";
import {
  PiArrowCounterClockwise,
  PiCheckBold,
  PiPaperPlaneTilt,
  PiProhibit,
  PiRocketLaunch,
  PiSealCheck,
} from "react-icons/pi";
import {
  setContentStatus,
  validateContentClaims,
} from "@/app/actions";
import { Alert, buttonClass, cn, inputClass, type ButtonVariant } from "@/components/ui";
import { useTopLoaderWhile } from "@/components/top-loader";
import { contentStatusLabels } from "@/lib/labels";
import type { ContentStatus } from "@prisma/client";

const FLOW: { status: ContentStatus; label: string; variant: ButtonVariant; icon: IconType }[] = [
  { status: "IN_REVIEW", label: "Kirim ke Review", variant: "secondary", icon: PiPaperPlaneTilt },
  { status: "APPROVED", label: "Setujui", variant: "secondary", icon: PiSealCheck },
  { status: "PUBLISHED", label: "Terbitkan", variant: "primary", icon: PiRocketLaunch },
  { status: "REJECTED", label: "Tolak", variant: "danger-soft", icon: PiProhibit },
  { status: "DRAFT", label: "Kembali ke Draft", variant: "ghost", icon: PiArrowCounterClockwise },
];

const STAGES: ContentStatus[] = ["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED"];

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
  useTopLoaderWhile(pending);

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

  const current = STAGES.indexOf(status);

  return (
    <div className="space-y-4">
      <ol className="grid grid-cols-4 gap-1.5">
        {STAGES.map((s, i) => {
          const done = current >= 0 && i < current;
          const active = i === current;
          return (
            <li key={s} className="min-w-0">
              <div
                className={cn(
                  "h-1.5 rounded-full",
                  done ? "bg-ink" : active ? "bg-lime ring-1 ring-ink/20" : "bg-line",
                )}
              />
              <p
                className={cn(
                  "mt-2 flex items-center gap-1 truncate text-[11px]",
                  active ? "font-semibold text-ink" : done ? "text-ink-2" : "text-muted",
                )}
              >
                {done && <PiCheckBold className="size-3 shrink-0" />}
                {contentStatusLabels[s]}
              </p>
            </li>
          );
        })}
      </ol>

      {status === "REJECTED" && <Alert tone="danger">Konten ditolak. Kembalikan ke draft untuk revisi.</Alert>}

      {!claimsValidated && (
        <form action={validate} className="space-y-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
          <p className="text-[12px] font-medium text-amber-800">Validasi klaim diperlukan sebelum terbit.</p>
          <input type="hidden" name="id" value={id} />
          <input name="note" className={inputClass} placeholder="Catatan validasi (opsional)" />
          <button className={cn(buttonClass("secondary"), "w-full")} disabled={pending}>
            <PiSealCheck />
            Tandai Klaim Tervalidasi
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 gap-2">
        {FLOW.filter((f) => f.status !== status).map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.status}
              onClick={() => changeStatus(f.status)}
              disabled={pending}
              className={cn(buttonClass(f.variant), "w-full", f.variant === "primary" && "col-span-2")}
            >
              <Icon />
              {f.label}
            </button>
          );
        })}
      </div>

      {error && <Alert tone="danger">{error}</Alert>}
    </div>
  );
}
