import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge, EmptyState, LinkButton } from "@/components/ui";
import {
  segmentLabels,
  prospectStatusLabels,
  prospectStatusColors,
} from "@/lib/labels";
import { scoreBand } from "@/lib/prospecting";
import { ImportCsv } from "./import-csv";
import type { ProspectStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: (ProspectStatus | "ALL")[] = [
  "ALL",
  "NEW",
  "REVIEWED",
  "CONTACTED",
  "INTERESTED",
  "QUALIFIED",
  "MEETING_SCHEDULED",
  "NOT_A_FIT",
];

export default async function ProspectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = (status as ProspectStatus | undefined) ?? undefined;

  const prospects = await prisma.prospect.findMany({
    where: active ? { status: active } : undefined,
    orderBy: [{ priorityScore: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <PageHeader
        title="AI Lead Prospecting"
        subtitle="Temukan dan prioritaskan calon klien. Skor adalah rekomendasi prioritisasi dengan alasan yang dapat ditinjau — bukan bukti niat membeli."
        action={
          <div className="flex gap-2">
            <LinkButton href="/prospects/discover">🔍 Temukan dari ICP</LinkButton>
            <LinkButton href="/prospects/new" variant="secondary">
              + Tambah Manual
            </LinkButton>
          </div>
        }
      />

      <div className="space-y-6 p-8">
        <ImportCsv />

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => {
            const isActive = s === "ALL" ? !active : active === s;
            const href = s === "ALL" ? "/prospects" : `/prospects?status=${s}`;
            return (
              <Link
                key={s}
                href={href}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-foreground hover:bg-slate-50"
                }`}
              >
                {s === "ALL" ? "Semua" : prospectStatusLabels[s]}
              </Link>
            );
          })}
        </div>

        {prospects.length === 0 ? (
          <EmptyState
            title="Belum ada prospek"
            description="Tambahkan prospek secara manual atau impor dari CSV untuk memulai."
            action={<LinkButton href="/prospects/new">+ Tambah Prospek</LinkButton>}
          />
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-slate-50 text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 font-medium">Perusahaan</th>
                    <th className="px-4 py-3 font-medium">Segmen</th>
                    <th className="px-4 py-3 font-medium">Skor</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Verifikasi</th>
                  </tr>
                </thead>
                <tbody>
                  {prospects.map((p) => {
                    const band = scoreBand(p.priorityScore);
                    return (
                      <tr key={p.id} className="border-b border-border last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <Link href={`/prospects/${p.id}`} className="font-medium text-primary hover:underline">
                            {p.companyName}
                          </Link>
                          {p.isIncomplete && (
                            <span className="ml-2 text-xs text-amber-600">⚠ belum lengkap</span>
                          )}
                          {p.location && <p className="text-xs text-muted">{p.location}</p>}
                        </td>
                        <td className="px-4 py-3 text-foreground">{segmentLabels[p.segment]}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{p.priorityScore ?? "—"}</span>
                            <Badge className={band.color}>{band.label}</Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={prospectStatusColors[p.status]}>
                            {prospectStatusLabels[p.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted">
                          {p.lastVerifiedAt
                            ? new Date(p.lastVerifiedAt).toLocaleDateString("id-ID")
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
