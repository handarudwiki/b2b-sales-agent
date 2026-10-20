"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  discoverProspects,
  saveDiscoveredProspects,
  type DiscoveryActionResult,
} from "@/app/actions";
import { Card, Badge, buttonClass, inputClass, labelClass } from "@/components/ui";
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
      // Preselect qualified + not-already-in-pipeline candidates.
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
    <div className="space-y-6">
      {/* ICP form */}
      <Card>
        <form action={handleSearch} className="grid grid-cols-1 gap-4 md:grid-cols-5 md:items-end">
          <div>
            <label className={labelClass}>Segmen (ICP)</label>
            <select name="segment" defaultValue={icp.segment} className={inputClass}>
              {segments.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Daerah *</label>
            <input name="area" required defaultValue={icp.area} className={inputClass} placeholder="mis. Bandung" />
          </div>
          <div>
            <label className={labelClass}>Kata kunci (koma)</label>
            <input name="keywords" defaultValue={icp.keywords} className={inputClass} placeholder="skincare, anti-aging" />
          </div>
          <div>
            <label className={labelClass}>Min. skor kualifikasi</label>
            <input name="minScore" type="number" min={0} max={100} defaultValue={icp.minScore} className={inputClass} />
          </div>
          <button className={buttonClass("primary")} disabled={searching}>
            {searching ? "Mencari..." : "🔍 Cari Prospek"}
          </button>
        </form>
      </Card>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

      {/* Results */}
      {result && (
        <Card className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-foreground">
                {result.found} kandidat · {result.qualified} memenuhi ambang
              </h3>
              {result.isSimulated && (
                <Badge className="bg-amber-100 text-amber-700">MODE SIMULASI</Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">{selectedCount} dipilih</span>
              <button
                onClick={handleSave}
                disabled={saving || selectedCount === 0}
                className={buttonClass("primary")}
              >
                {saving ? "Menyimpan..." : `Simpan ${selectedCount} ke Pipeline`}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50 text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium"></th>
                  <th className="px-4 py-3 font-medium">Perusahaan</th>
                  <th className="px-4 py-3 font-medium">Segmen</th>
                  <th className="px-4 py-3 font-medium">Skor</th>
                  <th className="px-4 py-3 font-medium">Kualifikasi</th>
                  <th className="px-4 py-3 font-medium">Kontak</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => {
                  const band = scoreBand(c.score);
                  return (
                    <tr
                      key={c.dedupeKey}
                      className={`border-b border-border last:border-0 ${
                        c.alreadyInPipeline ? "opacity-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={!!selected[c.dedupeKey]}
                          disabled={c.alreadyInPipeline}
                          onChange={() => toggle(c.dedupeKey)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{c.companyName}</p>
                        <p className="text-xs text-muted">{c.location}</p>
                        {c.isIncomplete && (
                          <span className="text-xs text-amber-600">⚠ data belum lengkap</span>
                        )}
                        {c.alreadyInPipeline && (
                          <span className="ml-1 text-xs text-slate-500">· sudah ada</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground">{segmentLabels[c.segment]}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{c.score}</span>
                          <Badge className={band.color}>{band.label}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {c.qualified ? (
                          <Badge className="bg-emerald-100 text-emerald-700">Qualified</Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-600">Di bawah ambang</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {[c.website, c.email, c.phone].filter(Boolean).join(" · ") || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border bg-slate-50 px-5 py-3">
            <p className="text-xs text-muted">
              {result.isSimulated
                ? "Hasil mode simulasi diberi label jelas dan tidak boleh diklaim sebagai data nyata. Setiap prospek disimpan dengan sumber dan tanggal verifikasi (BR#2). Hubungkan provider data resmi untuk hasil produksi."
                : "Setiap prospek disimpan dengan sumber dan tanggal verifikasi."}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
