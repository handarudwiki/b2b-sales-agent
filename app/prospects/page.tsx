import Link from "next/link";
import {
  PiArrowRight,
  PiMagnifyingGlass,
  PiMapPin,
  PiPlus,
  PiSealCheck,
  PiTarget,
  PiWarningCircle,
} from "react-icons/pi";
import { prisma } from "@/lib/prisma";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  LinkButton,
  Meter,
  PageHeader,
  cn,
} from "@/components/ui";
import {
  segmentLabels,
  prospectStatusLabels,
  prospectStatusColors,
} from "@/lib/labels";
import { scoreBand } from "@/lib/prospecting";
import { scoreColor, segmentColor, segmentIcon } from "@/components/tokens";
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
          <>
            <LinkButton href="/prospects/new" variant="secondary" icon={PiPlus}>
              Tambah Manual
            </LinkButton>
            <LinkButton href="/prospects/discover" icon={PiMagnifyingGlass}>
              Temukan dari ICP
            </LinkButton>
          </>
        }
      />

      <div className="space-y-5">
        <ImportCsv />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <nav aria-label="Filter status" className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
            {STATUS_FILTERS.map((s) => {
              const isActive = s === "ALL" ? !active : active === s;
              const href = s === "ALL" ? "/prospects" : `/prospects?status=${s}`;
              return (
                <Link
                  key={s}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex h-9 shrink-0 items-center rounded-full px-4 text-[13px] font-medium outline-none transition-colors focus-visible:ring-4 focus-visible:ring-lime/70",
                    isActive
                      ? "bg-lime font-semibold text-ink shadow-[inset_0_-1px_0_rgb(0_0_0/0.08)]"
                      : "border border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink",
                  )}
                >
                  {s === "ALL" ? "Semua" : prospectStatusLabels[s]}
                </Link>
              );
            })}
          </nav>
          <p className="shrink-0 text-[12.5px] text-muted">
            <span className="font-semibold text-ink">{prospects.length}</span> prospek · urut skor tertinggi
          </p>
        </div>

        {prospects.length === 0 ? (
          <EmptyState
            icon={PiTarget}
            title="Belum ada prospek"
            description="Tambahkan prospek secara manual atau impor dari CSV untuk memulai."
            action={
              <LinkButton href="/prospects/new" icon={PiPlus}>
                Tambah Prospek
              </LinkButton>
            }
          />
        ) : (
          <Card className="overflow-hidden p-0 sm:p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-215 text-left text-[13px]">
                <thead>
                  <tr className="border-b border-line bg-surface-2 text-[11.5px] text-muted">
                    <th className="px-5 py-3.5 font-medium">Perusahaan</th>
                    <th className="px-4 py-3.5 font-medium">Segmen</th>
                    <th className="px-4 py-3.5 font-medium">Skor prioritas</th>
                    <th className="px-4 py-3.5 font-medium">Status</th>
                    <th className="px-4 py-3.5 font-medium">Verifikasi</th>
                    <th className="w-14 px-4 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {prospects.map((p) => {
                    const band = scoreBand(p.priorityScore);
                    return (
                      <tr key={p.id} className="group transition-colors hover:bg-surface-2/70">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={p.companyName} color={segmentColor[p.segment]} icon={segmentIcon[p.segment]} />
                            <div className="min-w-0">
                              <Link
                                href={`/prospects/${p.id}`}
                                className="block truncate text-[13.5px] font-semibold text-ink hover:underline hover:underline-offset-4"
                              >
                                {p.companyName}
                              </Link>
                              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted">
                                {p.location && (
                                  <span className="inline-flex items-center gap-1">
                                    <PiMapPin className="size-3.5" />
                                    {p.location}
                                  </span>
                                )}
                                {p.isIncomplete && (
                                  <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                                    <PiWarningCircle className="size-3.5" />
                                    Belum lengkap
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-ink-2">
                          <span className="inline-flex items-center gap-2 whitespace-nowrap">
                            <span className="size-2 rounded-full" style={{ backgroundColor: segmentColor[p.segment] }} />
                            {segmentLabels[p.segment]}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="w-7 text-[15px] font-semibold text-ink tabular-nums">{p.priorityScore ?? "—"}</span>
                            <Meter value={p.priorityScore ?? 0} color={scoreColor(p.priorityScore)} className="h-1.5 w-20" label={band.label} />
                            <Badge className={band.color}>{band.label}</Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge dot className={prospectStatusColors[p.status]}>
                            {prospectStatusLabels[p.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-[12px] text-muted">
                          {p.lastVerifiedAt ? (
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                              <PiSealCheck className="size-4 text-emerald-600" />
                              {new Date(p.lastVerifiedAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <Link
                            href={`/prospects/${p.id}`}
                            aria-label={`Buka ${p.companyName}`}
                            className="grid size-8 place-items-center rounded-full border border-line bg-surface text-ink-2 transition group-hover:border-ink group-hover:bg-ink group-hover:text-lime"
                          >
                            <PiArrowRight className="size-4" />
                          </Link>
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
