"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  PiCheckCircle,
  PiCircleNotch,
  PiCrosshair,
  PiEnvelope,
  PiFlask,
  PiGauge,
  PiGlobe,
  PiInfo,
  PiMagnifyingGlass,
  PiMapPin,
  PiPhone,
  PiSquaresFour,
  PiTag,
  PiTrayArrowDown,
  PiWarningCircle,
} from "react-icons/pi";
import {
  discoverProspects,
  saveDiscoveredProspects,
  type DiscoveryActionResult,
} from "@/app/actions";
import {
  Alert,
  Avatar,
  Badge,
  Card,
  EmptyState,
  Field,
  Meter,
  buttonClass,
  checkboxClass,
  cn,
  inputClass,
  selectClass,
} from "@/components/ui";
import { useTopLoaderWhile } from "@/components/top-loader";
import { scoreColor, segmentColor, segmentIcon } from "@/components/tokens";
import { segmentLabels } from "@/lib/labels";
import { scoreBand } from "@/lib/prospecting";
import type { BusinessSegment } from "@prisma/client";

export function DiscoverClient({
  segments,
}: {
  segments: [BusinessSegment, string][];
}) {
  const router = useRouter();
  const [result, setResult] = useState<DiscoveryActionResult | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [icp, setIcp] = useState({ segment: "BEAUTY_CLINIC", area: "", keywords: "", minScore: "45" });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [searching, startSearch] = useTransition();
  const [saving, startSave] = useTransition();
  useTopLoaderWhile(searching || saving);

  function handleSearch(formData: FormData) {
    setError(null);
    setMessage(null);
    setResult(null);
    setIcp({
      segment: String(formData.get("segment")),
      area: String(formData.get("area")),
      keywords: String(formData.get("keywords") ?? ""),
      minScore: String(formData.get("minScore") ?? "0"),
    });
    startSearch(async () => {
      const res = await discoverProspects(formData);
      if (res.error) {
        setError(res.error);
        return;
      }
      setResult(res);
      const preset: Record<string, boolean> = {};
      for (const c of res.candidates ?? []) {
        preset[c.dedupeKey] = c.qualified && !c.alreadyInPipeline;
      }
      setSelected(preset);
    });
  }

  function toggle(key: string) {
    setSelected((s) => ({ ...s, [key]: !s[key] }));
  }

  function handleSave() {
    const chosen = (result?.candidates ?? []).filter(
      (c) => selected[c.dedupeKey] && !c.alreadyInPipeline,
    );
    if (chosen.length === 0) {
      setError("Pilih minimal satu kandidat yang belum ada di pipeline.");
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.set("segment", icp.segment);
    fd.set("area", icp.area);
    fd.set("keywords", icp.keywords);
    fd.set("minScore", icp.minScore);
    fd.set("selected", JSON.stringify(chosen));
    startSave(async () => {
      const res = await saveDiscoveredProspects(fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setMessage(res?.success ?? "Tersimpan.");
      setResult(null);
      router.push("/prospects");
      router.refresh();
    });
  }

  const candidates = result?.candidates ?? [];
  const selectedCount = candidates.filter(
    (c) => selected[c.dedupeKey] && !c.alreadyInPipeline,
  ).length;

  return (
    <div className="space-y-5">
      <Card className="animate-fade-up">
        <form action={handleSearch} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1.2fr_0.8fr_auto] xl:items-end">
          <Field label="Segmen (ICP)" icon={PiSquaresFour}>
            <select name="segment" defaultValue={icp.segment} className={selectClass}>
              {segments.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Daerah *" icon={PiMapPin}>
            <input name="area" required defaultValue={icp.area} className={inputClass} placeholder="mis. Bandung" />
          </Field>
          <Field label="Kata kunci (koma)" icon={PiTag}>
            <input name="keywords" defaultValue={icp.keywords} className={inputClass} placeholder="skincare, anti-aging" />
          </Field>
          <Field label="Min. skor kualifikasi" icon={PiGauge}>
            <input name="minScore" type="number" min={0} max={100} defaultValue={icp.minScore} className={inputClass} />
          </Field>
          <button className={cn(buttonClass("accent", "lg"), "h-11 md:col-span-2 xl:col-span-1")} disabled={searching}>
            {searching ? <PiCircleNotch className="animate-spin" /> : <PiMagnifyingGlass />}
            {searching ? "Mencari..." : "Cari Prospek"}
          </button>
        </form>
      </Card>

      {error && <Alert tone="danger">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      {searching && !result && <ResultsSkeleton />}

      {!searching && !result && !message && (
        <EmptyState
          icon={PiCrosshair}
          title="Belum ada pencarian"
          description="Pilih segmen dan daerah target, lalu jalankan pencarian untuk melihat kandidat yang sudah dinilai."
        />
      )}

      {result && (
        <Card className="animate-fade-up overflow-hidden p-0 sm:p-0">
          <div className="flex flex-col gap-4 border-b border-line px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-ink">
                  {result.found} kandidat ditemukan
                </h3>
                {result.isSimulated && (
                  <Badge icon={PiFlask} className="bg-amber-100 text-amber-800">
                    Mode simulasi
                  </Badge>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge dot className="bg-emerald-100 text-emerald-800">{result.qualified} memenuhi ambang</Badge>
                <Badge dot className="bg-sky-100 text-sky-800">{result.newCount} baru</Badge>
                <Badge dot>{result.duplicates} sudah di pipeline</Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12.5px] text-muted">
                <span className="font-semibold text-ink">{selectedCount}</span> dipilih
              </span>
              <button
                onClick={handleSave}
                disabled={saving || selectedCount === 0}
                className={buttonClass("primary")}
              >
                {saving ? <PiCircleNotch className="animate-spin" /> : <PiTrayArrowDown />}
                {saving ? "Menyimpan..." : `Simpan ${selectedCount} ke Pipeline`}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-left text-[13px]">
              <thead>
                <tr className="border-b border-line bg-surface-2 text-[11.5px] text-muted">
                  <th className="w-12 px-5 py-3 font-medium" />
                  <th className="px-3 py-3 font-medium">Perusahaan</th>
                  <th className="px-4 py-3 font-medium">Segmen</th>
                  <th className="px-4 py-3 font-medium">Skor</th>
                  <th className="px-4 py-3 font-medium">Kualifikasi</th>
                  <th className="px-4 py-3 font-medium">Kontak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {candidates.map((c) => {
                  const band = scoreBand(c.score);
                  const checked = !!selected[c.dedupeKey];
                  return (
                    <tr
                      key={c.dedupeKey}
                      className={cn(
                        "transition-colors",
                        c.alreadyInPipeline ? "opacity-50" : "hover:bg-surface-2/70",
                        checked && !c.alreadyInPipeline && "bg-lime-soft/40",
                      )}
                    >
                      <td className="px-5 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Pilih ${c.companyName}`}
                          checked={checked}
                          disabled={c.alreadyInPipeline}
                          onChange={() => toggle(c.dedupeKey)}
                          className={checkboxClass}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={c.companyName} color={segmentColor[c.segment]} icon={segmentIcon[c.segment]} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink">{c.companyName}</p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11.5px] text-muted">
                              {c.location && (
                                <span className="inline-flex items-center gap-1">
                                  <PiMapPin className="size-3.5" />
                                  {c.location}
                                </span>
                              )}
                              {c.isIncomplete && (
                                <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                                  <PiWarningCircle className="size-3.5" />
                                  Belum lengkap
                                </span>
                              )}
                              {c.alreadyInPipeline && <span className="font-medium text-ink-2">Sudah ada</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-2">
                        <span className="inline-flex items-center gap-2 whitespace-nowrap">
                          <span className="size-2 rounded-full" style={{ backgroundColor: segmentColor[c.segment] }} />
                          {segmentLabels[c.segment]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 text-[14px] font-semibold text-ink tabular-nums">{c.score}</span>
                          <Meter value={c.score} color={scoreColor(c.score)} className="h-1.5 w-16" label={band.label} />
                          <Badge className={band.color}>{band.label}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {c.qualified ? (
                          <Badge icon={PiCheckCircle} className="bg-emerald-100 text-emerald-800">Qualified</Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-600">Di bawah ambang</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 text-[11.5px] text-ink-2">
                          {c.website && (
                            <span className="inline-flex items-center gap-1.5">
                              <PiGlobe className="size-3.5 text-muted" />
                              {c.website}
                            </span>
                          )}
                          {c.email && (
                            <span className="inline-flex items-center gap-1.5">
                              <PiEnvelope className="size-3.5 text-muted" />
                              {c.email}
                            </span>
                          )}
                          {c.phone && (
                            <span className="inline-flex items-center gap-1.5">
                              <PiPhone className="size-3.5 text-muted" />
                              {c.phone}
                            </span>
                          )}
                          {!c.website && !c.email && !c.phone && <span className="text-muted">—</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2.5 border-t border-line bg-surface-2 px-5 py-3.5 sm:px-6">
            <PiInfo className="mt-0.5 size-4 shrink-0 text-muted" />
            <p className="text-[12px] leading-relaxed text-muted">
              {result.isSimulated
                ? "Hasil mode simulasi diberi label jelas dan tidak boleh diklaim sebagai data nyata. Setiap prospek disimpan dengan sumber dan tanggal verifikasi. Hubungkan provider data resmi untuk hasil produksi."
                : "Setiap prospek disimpan dengan sumber dan tanggal verifikasi."}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <Card className="overflow-hidden p-0 sm:p-0">
      <div className="border-b border-line px-6 py-5">
        <div className="h-4 w-48 animate-pulse rounded-full bg-surface-2" />
        <div className="mt-3 h-3 w-72 animate-pulse rounded-full bg-surface-2" />
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <div className="size-5 animate-pulse rounded-md bg-surface-2" />
            <div className="size-8 animate-pulse rounded-full bg-surface-2" />
            <div className="h-3 flex-1 animate-pulse rounded-full bg-surface-2" style={{ animationDelay: `${i * 80}ms` }} />
            <div className="h-3 w-24 animate-pulse rounded-full bg-surface-2" />
            <div className="h-3 w-32 animate-pulse rounded-full bg-surface-2" />
          </div>
        ))}
      </div>
    </Card>
  );
}
