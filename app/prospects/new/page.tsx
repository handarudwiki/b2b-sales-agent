import type { IconType } from "react-icons";
import { PiCopy, PiGauge, PiSealCheck, PiWarningCircle } from "react-icons/pi";
import { PageHeader, Card, CardHeader, IconBox } from "@/components/ui";
import { segmentOptions } from "@/lib/labels";
import { ProspectForm } from "./form";

const STEPS: { icon: IconType; title: string; body: string }[] = [
  { icon: PiCopy, title: "Cek duplikat", body: "Dari nama, website, email, dan telepon." },
  { icon: PiGauge, title: "Skor prioritas", body: "Skor 0–100 dengan alasan yang bisa ditinjau." },
  { icon: PiWarningCircle, title: "Data kurang ditandai", body: "Tidak dilengkapi dengan data rekaan." },
  { icon: PiSealCheck, title: "Sumber tercatat", body: "Sumber dan tanggal verifikasi disimpan." },
];

export default function NewProspectPage() {
  return (
    <div>
      <PageHeader
        back={{ href: "/prospects", label: "Prospek" }}
        title="Tambah Prospek"
        subtitle="Sistem akan menghitung skor prioritas dan menandai data yang belum lengkap."
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="animate-fade-up lg:col-span-8">
          <ProspectForm segments={segmentOptions} />
        </Card>
        <Card className="h-fit animate-fade-up lg:col-span-4" style={{ animationDelay: "80ms" }}>
          <CardHeader title="Otomatis setelah disimpan" />
          <ol className="space-y-4">
            {STEPS.map((s) => (
              <li key={s.title} className="flex gap-3">
                <IconBox icon={s.icon} size="sm" />
                <div>
                  <p className="text-[13px] font-semibold text-ink">{s.title}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
