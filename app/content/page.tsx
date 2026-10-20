import Link from "next/link";
import {
  PiArrowRight,
  PiChartLineUp,
  PiFileText,
  PiMagicWand,
  PiRocketLaunch,
  PiSealCheck,
  PiTarget,
  PiWarningCircle,
} from "react-icons/pi";
import { prisma } from "@/lib/prisma";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  Field,
  Meter,
  PageHeader,
  Stat,
  inputClass,
} from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { segmentColor, segmentIcon, segmentOrder, tint } from "@/components/tokens";
import {
  segmentLabels,
  contentStatusLabels,
  contentStatusColors,
} from "@/lib/labels";
import { generateDraft } from "@/app/actions";

export const dynamic = "force-dynamic";

function geoColor(score: number | null) {
  if (score == null) return "#a3a69e";
  if (score >= 70) return "#12a150";
  if (score >= 45) return "#f0a20b";
  return "#e5484d";
}

export default async function ContentPage() {
  const items = await prisma.content.findMany({ orderBy: { updatedAt: "desc" } });

  const published = items.filter((c) => c.status === "PUBLISHED").length;
  const scored = items.filter((c) => c.geoScore != null);
  const avgGeo = scored.length
    ? Math.round(scored.reduce((sum, c) => sum + (c.geoScore ?? 0), 0) / scored.length)
    : null;

  return (
    <div>
      <PageHeader
        title="AI Marketing & GEO Content"
        subtitle="Hasilkan draft konten terstruktur dengan rekomendasi SEO/GEO. Semua konten melewati review dan validasi klaim sebelum terbit."
      />

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Stat label="Total konten" value={items.length} icon={PiFileText} />
          <Stat label="Terbit" value={published} icon={PiRocketLaunch} tone="green" />
          <Stat label="Rata-rata skor GEO" value={avgGeo ?? "—"} icon={PiChartLineUp} tone="lime" hint="Skala 0–100" />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {items.length === 0 ? (
              <EmptyState
                icon={PiFileText}
                title="Belum ada konten"
                description="Buat draft pertama menggunakan generator di samping."
              />
            ) : (
              <ul className="space-y-3">
                {items.map((c) => {
                  const Icon = segmentIcon[c.segment];
                  return (
                    <li key={c.id}>
                      <Link
                        href={`/content/${c.id}`}
                        className="group flex animate-fade-up flex-col gap-4 rounded-[24px] border border-line/80 bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:border-line-strong sm:flex-row sm:items-center"
                      >
                        <span className="grid size-12 shrink-0 place-items-center rounded-2xl" style={tint(segmentColor[c.segment], 16)}>
                          <Icon className="size-[22px]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge dot className={contentStatusColors[c.status]}>
                              {contentStatusLabels[c.status]}
                            </Badge>
                            {c.claimsValidated ? (
                              <Badge icon={PiSealCheck} className="bg-emerald-50 text-emerald-700">
                                Klaim tervalidasi
                              </Badge>
                            ) : (
                              <Badge icon={PiWarningCircle} className="bg-amber-100 text-amber-800">
                                Klaim belum divalidasi
                              </Badge>
                            )}
                          </div>
                          <p className="mt-2 text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink group-hover:underline group-hover:underline-offset-4">
                            {c.title}
                          </p>
                          <p className="mt-1 text-[12px] text-muted">
                            {segmentLabels[c.segment]} · diperbarui{" "}
                            {new Date(c.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 sm:w-44 sm:flex-col sm:items-stretch sm:gap-2">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-[11.5px] font-medium text-muted">Skor GEO</span>
                            <span className="text-[18px] font-semibold tracking-[-0.02em] text-ink tabular-nums">
                              {c.geoScore ?? "—"}
                              <span className="text-[11px] font-medium text-muted">/100</span>
                            </span>
                          </div>
                          <Meter value={c.geoScore ?? 0} color={geoColor(c.geoScore)} className="h-1.5" label="Skor GEO" />
                        </div>
                        <PiArrowRight className="hidden size-5 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink sm:block" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="lg:col-span-4">
            <Card className="lg:sticky lg:top-24">
              <CardHeader icon={PiMagicWand} title="Generate draft" description="Draft terstruktur per segmen audiens." />
              <form action={generateDraft} className="space-y-4">
                <fieldset>
                  <legend className="mb-2 flex items-center gap-1.5 text-[12.5px] font-medium text-ink-2">
                    <PiTarget className="size-3.5 text-muted" />
                    Segmen audiens
                  </legend>
                  <div className="grid grid-cols-1 gap-1.5">
                    {segmentOrder.map((v) => {
                      const Icon = segmentIcon[v];
                      return (
                        <label key={v} className="cursor-pointer">
                          <input type="radio" name="segment" value={v} defaultChecked={v === "NEW_BRAND"} className="peer sr-only" />
                          <span className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface px-3 py-2.5 text-[13px] text-ink-2 transition-colors hover:border-line-strong peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-lime/60">
                            <span className="grid size-7 place-items-center rounded-lg" style={tint(segmentColor[v], 18)}>
                              <Icon className="size-4" />
                            </span>
                            {segmentLabels[v]}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <Field label="Tujuan kampanye (opsional)" icon={PiTarget}>
                  <input name="goal" className={inputClass} placeholder="mis. Edukasi & lead generation" />
                </Field>
                <SubmitButton icon={<PiMagicWand />} size="lg" variant="accent" className="w-full" pendingText="Membuat draft...">
                  Buat Draft
                </SubmitButton>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
