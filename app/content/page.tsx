import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import {
  segmentLabels,
  segmentOptions,
  contentStatusLabels,
  contentStatusColors,
} from "@/lib/labels";
import { generateDraft } from "@/app/actions";
import { buttonClass, inputClass, labelClass } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const items = await prisma.content.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <PageHeader
        title="AI Marketing & GEO Content"
        subtitle="Hasilkan draft konten terstruktur dengan rekomendasi SEO/GEO. Semua konten melewati review dan validasi klaim sebelum terbit."
      />

      <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {items.length === 0 ? (
            <EmptyState title="Belum ada konten" description="Buat draft pertama menggunakan generator di samping." />
          ) : (
            <Card className="p-0">
              <ul className="divide-y divide-border">
                {items.map((c) => (
                  <li key={c.id}>
                    <Link href={`/content/${c.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-foreground">{c.title}</p>
                        <p className="text-xs text-muted">
                          {segmentLabels[c.segment]} · GEO {c.geoScore ?? "—"}/100
                          {!c.claimsValidated && " · ⚠ klaim belum divalidasi"}
                        </p>
                      </div>
                      <Badge className={contentStatusColors[c.status]}>
                        {contentStatusLabels[c.status]}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <h3 className="mb-3 text-base font-semibold text-foreground">Generate Draft</h3>
            <form action={generateDraft} className="space-y-3">
              <div>
                <label className={labelClass}>Segmen Audiens</label>
                <select name="segment" className={inputClass} defaultValue="NEW_BRAND">
                  {segmentOptions.map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Tujuan Kampanye (opsional)</label>
                <input name="goal" className={inputClass} placeholder="mis. Edukasi & lead generation" />
              </div>
              <button className={`${buttonClass("primary")} w-full`}>✨ Buat Draft</button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
