import Link from "next/link";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  PiCalendarCheck,
  PiChartBar,
  PiChatsCircle,
  PiCheckCircle,
  PiCursorClick,
  PiEye,
  PiFileText,
  PiFunnel,
  PiLightning,
  PiMagnifyingGlass,
  PiMegaphone,
  PiShieldCheck,
  PiTarget,
  PiTrendUp,
  PiUsersThree,
  PiWarning,
  PiWhatsappLogo,
} from "react-icons/pi";
import { prisma } from "@/lib/prisma";
import {
  Alert,
  ArrowLink,
  Avatar,
  Badge,
  Card,
  CardHeader,
  EmptyState,
  IconBox,
  LinkButton,
  Meter,
  PageHeader,
  cn,
} from "@/components/ui";
import { FunnelChart, HBarList, SegmentBarcode } from "@/components/charts";
import {
  qualifiedLeadRate,
  meetingAttendanceRate,
  leadToMeetingRate,
  contentToLeadRate,
  median,
  formatMs,
} from "@/lib/metrics";
import {
  segmentLabels,
  leadStatusLabels,
  leadStatusColors,
  prospectStatusLabels,
  prospectStatusColors,
} from "@/lib/labels";
import { scoreBand } from "@/lib/prospecting";
import { scoreColor, segmentColor, segmentIcon, segmentOrder } from "@/components/tokens";
import type { LeadStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    prospectTotal,
    prospectVerified,
    prospectsBySegment,
    contactedCount,
    interestedCount,
    qualifiedProspects,
    conversations,
    leadStatusGroups,
    meetingsScheduled,
    meetingsCompleted,
    contentStats,
    publishedContent,
    responseTimes,
    topProspects,
  ] = await Promise.all([
    prisma.prospect.count(),
    prisma.prospect.count({ where: { isIncomplete: false } }),
    prisma.prospect.groupBy({ by: ["segment"], _count: true }),
    prisma.prospect.count({ where: { status: { in: ["CONTACTED", "INTERESTED", "QUALIFIED", "MEETING_SCHEDULED"] } } }),
    prisma.prospect.count({ where: { status: { in: ["INTERESTED", "QUALIFIED", "MEETING_SCHEDULED"] } } }),
    prisma.prospect.count({ where: { status: "QUALIFIED" } }),
    prisma.conversation.count(),
    prisma.conversation.groupBy({ by: ["leadStatus"], _count: true }),
    prisma.meeting.count({ where: { status: "SCHEDULED" } }),
    prisma.meeting.count({ where: { status: "COMPLETED" } }),
    prisma.content.aggregate({ _sum: { impressions: true, visits: true, attributedLeads: true } }),
    prisma.content.count({ where: { status: "PUBLISHED" } }),
    prisma.conversation.findMany({ where: { firstResponseMs: { not: null } }, select: { firstResponseMs: true } }),
    prisma.prospect.findMany({
      orderBy: [{ priorityScore: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        id: true,
        companyName: true,
        segment: true,
        location: true,
        priorityScore: true,
        status: true,
        isIncomplete: true,
      },
    }),
  ]);

  const totalLeads = conversations;
  const qualifiedLeads = leadStatusGroups
    .filter((g) => ["QUALIFIED", "MEETING_SCHEDULED", "MEETING_COMPLETED", "CONVERTED"].includes(g.leadStatus))
    .reduce((a, g) => a + g._count, 0);
  const totalMeetings = meetingsScheduled + meetingsCompleted;

  const medianMs = median(responseTimes.map((r) => r.firstResponseMs!).filter(Boolean));

  const visits = contentStats._sum.visits ?? 0;
  const attributedLeads = contentStats._sum.attributedLeads ?? 0;
  const impressions = contentStats._sum.impressions ?? 0;

  const segmentItems = segmentOrder.map((seg) => ({
    key: seg,
    label: segmentLabels[seg],
    value: prospectsBySegment.find((s) => s.segment === seg)?._count ?? 0,
    color: segmentColor[seg],
  }));

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <PageHeader
        title="Ringkasan Growth & Sales"
        subtitle="Ringkasan funnel akuisisi dari data yang benar-benar tercatat. Metrik yang belum memiliki sumber data tidak ditampilkan."
        action={
          <>
            <span className="hidden h-10 items-center rounded-full border border-line bg-surface px-4 text-[12.5px] font-medium capitalize text-ink-2 md:inline-flex">
              {today}
            </span>
            <LinkButton href="/assistant" variant="secondary" icon={PiWhatsappLogo}>
              Simulasi WhatsApp
            </LinkButton>
            <LinkButton href="/prospects/discover" variant="primary" icon={PiMagnifyingGlass}>
              Temukan Prospek
            </LinkButton>
          </>
        }
      />

      <div className="space-y-5">
        <Card className="animate-fade-up overflow-hidden p-0 sm:p-0" style={{ animationDelay: "60ms" }}>
          <div className="grid grid-cols-2 lg:grid-cols-4">
            <Kpi
              icon={PiTarget}
              label="Total prospek"
              value={prospectTotal}
              pill={`${prospectVerified} data lengkap`}
              pillClass="bg-lime-soft text-lime-ink"
              className="border-b border-r lg:border-b-0"
            />
            <Kpi
              icon={PiChatsCircle}
              label="Lead WhatsApp"
              value={totalLeads}
              pill={`${qualifiedLeads} berkualitas`}
              pillClass="bg-emerald-100 text-emerald-800"
              className="border-b lg:border-b-0 lg:border-r"
            />
            <Kpi
              icon={PiCalendarCheck}
              label="Meeting konsultasi"
              value={totalMeetings}
              pill={`${meetingsCompleted} terlaksana`}
              pillClass="bg-sky-100 text-sky-800"
              className="border-r"
            />
            <Kpi
              icon={PiMegaphone}
              label="Konten terbit"
              value={publishedContent}
              pill={`${impressions.toLocaleString("id-ID")} impresi`}
              pillClass="bg-violet-100 text-violet-800"
            />
          </div>

          <div className="border-t border-line px-5 pb-8 pt-6 sm:px-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Distribusi prospek per segmen</h2>
                <p className="mt-0.5 text-[12.5px] text-muted">Proporsi {prospectTotal} prospek berdasarkan segmen bisnis.</p>
              </div>
              <ArrowLink href="/prospects" label="Lihat semua prospek" />
            </div>
            {prospectTotal === 0 ? (
              <EmptyState
                icon={PiTarget}
                title="Belum ada data prospek"
                description="Temukan prospek dari ICP atau impor CSV untuk melihat distribusi segmen."
                className="py-10"
              />
            ) : (
              <SegmentBarcode items={segmentItems} total={prospectTotal} />
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Card className="flex animate-fade-up flex-col lg:col-span-7" style={{ animationDelay: "120ms" }}>
            <CardHeader
              icon={PiFunnel}
              title="Funnel prospek & lead"
              description="Perpindahan prospek di setiap tahap pipeline."
              action={<ArrowLink href="/prospects" label="Kelola pipeline" />}
            />
            <div className="mb-8">
              {prospectTotal === 0 ? (
                <p className="text-[13px] text-muted">Belum ada data prospek.</p>
              ) : (
                <FunnelChart
                  stages={[
                    { label: "Total prospek", value: prospectTotal, hint: `${prospectVerified} data lengkap` },
                    { label: "Dihubungi", value: contactedCount },
                    { label: "Menunjukkan minat", value: interestedCount },
                    { label: "Prospek berkualitas", value: qualifiedProspects },
                  ]}
                />
              )}
            </div>
            <dl className="mt-auto grid grid-cols-3 gap-3 border-t border-line pt-5">
              <SummaryCell
                label="Kelengkapan data"
                value={`${percent(prospectVerified, prospectTotal)}%`}
                hint={`${prospectVerified} dari ${prospectTotal} prospek`}
              />
              <SummaryCell
                label="Konversi berkualitas"
                value={`${percent(qualifiedProspects, prospectTotal)}%`}
                hint="dari total prospek"
              />
              <SummaryCell
                label="Belum dihubungi"
                value={Math.max(0, prospectTotal - contactedCount)}
                hint="siap ditindaklanjuti"
              />
            </dl>
          </Card>

          <Card className="animate-fade-up lg:col-span-5" style={{ animationDelay: "160ms" }}>
            <CardHeader
              icon={PiChartBar}
              title="Kualifikasi & meeting"
              description="Rasio dihitung deterministik dari data tercatat."
              action={<ArrowLink href="/meetings" label="Buka meeting" />}
            />
            <div className="space-y-5">
              <RateRow
                label="Qualified lead rate"
                value={qualifiedLeadRate(qualifiedLeads, totalLeads)}
                detail={`${qualifiedLeads} dari ${totalLeads} percakapan`}
              />
              <RateRow
                label="Lead → meeting"
                value={leadToMeetingRate(totalMeetings, totalLeads)}
                detail={`${totalMeetings} meeting dari ${totalLeads} lead`}
              />
              <RateRow
                label="Meeting attendance"
                value={meetingAttendanceRate(meetingsCompleted, totalMeetings)}
                detail={`${meetingsCompleted} terlaksana / ${totalMeetings} total`}
              />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-2 p-4 ring-1 ring-line">
              <div className="flex items-center gap-3">
                <IconBox icon={PiLightning} tone="ink" />
                <div>
                  <p className="text-[12px] font-medium text-ink-2">Median respons AI</p>
                  <p className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-ink">{formatMs(medianMs)}</p>
                </div>
              </div>
              {medianMs == null ? (
                <Badge>Target &lt; 10 dtk</Badge>
              ) : medianMs < 10000 ? (
                <Badge icon={PiCheckCircle} className="bg-emerald-100 text-emerald-800">
                  Sesuai target &lt; 10 dtk
                </Badge>
              ) : (
                <Badge icon={PiWarning} className="bg-amber-100 text-amber-800">
                  Di atas target 10 dtk
                </Badge>
              )}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Card className="animate-fade-up p-0 sm:p-0 lg:col-span-7" style={{ animationDelay: "200ms" }}>
            <div className="px-5 pt-5 sm:px-6 sm:pt-6">
              <CardHeader
                icon={PiTrendUp}
                title="Prospek prioritas"
                description="Skor adalah rekomendasi prioritisasi, bukan bukti niat membeli."
                action={<ArrowLink href="/prospects" label="Semua prospek" />}
                className="mb-4"
              />
            </div>
            {topProspects.length === 0 ? (
              <div className="px-5 pb-6 sm:px-6">
                <p className="text-[13px] text-muted">Belum ada prospek.</p>
              </div>
            ) : (
              <div className="mx-3 mb-3 overflow-x-auto rounded-[20px] border border-line">
                <table className="w-full min-w-140 text-left text-[13px]">
                  <thead className="bg-surface-2 text-[11.5px] text-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">Perusahaan</th>
                      <th className="px-4 py-3 font-medium">Segmen</th>
                      <th className="px-4 py-3 font-medium">Skor</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {topProspects.map((p) => {
                      const band = scoreBand(p.priorityScore);
                      return (
                        <tr key={p.id} className="transition-colors hover:bg-surface-2/70">
                          <td className="px-4 py-3">
                            <Link href={`/prospects/${p.id}`} className="group flex items-center gap-3">
                              <Avatar name={p.companyName} color={segmentColor[p.segment]} icon={segmentIcon[p.segment]} size="sm" />
                              <span className="min-w-0">
                                <span className="block truncate font-medium text-ink group-hover:underline group-hover:underline-offset-4">
                                  {p.companyName}
                                </span>
                                <span className="block truncate text-[11.5px] text-muted">{p.location ?? "Lokasi belum diisi"}</span>
                              </span>
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-ink-2">
                            <span className="inline-flex items-center gap-2 whitespace-nowrap">
                              <span className="size-2 rounded-full" style={{ backgroundColor: segmentColor[p.segment] }} />
                              {segmentLabels[p.segment]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5" title={band.label}>
                              <span className="w-7 font-semibold text-ink tabular-nums">{p.priorityScore ?? "—"}</span>
                              <Meter value={p.priorityScore ?? 0} color={scoreColor(p.priorityScore)} className="h-1.5 w-16" label={band.label} />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge dot className={prospectStatusColors[p.status]}>
                              {prospectStatusLabels[p.status]}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div className="grid min-w-0 gap-5 lg:col-span-5">
            <Card className="animate-fade-up" style={{ animationDelay: "240ms" }}>
              <CardHeader
                icon={PiUsersThree}
                title="Status lead (percakapan)"
                description="Jumlah percakapan per status kualifikasi."
                action={<ArrowLink href="/assistant" label="Buka Sales Assistant" />}
              />
              {leadStatusGroups.length === 0 ? (
                <p className="text-[13px] text-muted">Belum ada percakapan.</p>
              ) : (
                <HBarList
                  rows={[...leadStatusGroups]
                    .sort((a, b) => b._count - a._count)
                    .map((g) => {
                      const st = g.leadStatus as LeadStatus;
                      return {
                        key: st,
                        value: g._count,
                        label: (
                          <Badge dot className={leadStatusColors[st]}>
                            {leadStatusLabels[st]}
                          </Badge>
                        ),
                      };
                    })}
                />
              )}
            </Card>

            <Card className="animate-fade-up" style={{ animationDelay: "280ms" }}>
              <CardHeader
                icon={PiMegaphone}
                title="Marketing & konten"
                description="Performa konten yang tercatat."
                action={<ArrowLink href="/content" label="Buka konten" />}
                className="mb-2"
              />
              <ul className="divide-y divide-line">
                <MetricRow icon={PiFileText} label="Konten terbit" value={publishedContent} />
                <MetricRow icon={PiEye} label="Impresi" value={impressions.toLocaleString("id-ID")} />
                <MetricRow icon={PiCursorClick} label="Kunjungan relevan" value={visits.toLocaleString("id-ID")} />
                <MetricRow
                  icon={PiTrendUp}
                  label="Content → lead"
                  hint={`${attributedLeads} lead teratribusi`}
                  value={`${contentToLeadRate(attributedLeads, visits)}%`}
                />
              </ul>
            </Card>
          </div>
        </div>

        <Alert tone="neutral" icon={PiShieldCheck} title="Catatan transparansi" className="animate-fade-up">
          Dashboard membedakan data aktual dari perkiraan AI. Skor prioritas prospek adalah rekomendasi untuk
          membantu prioritisasi, bukan bukti bahwa sebuah perusahaan pasti membutuhkan jasa maklon. Integrasi
          WhatsApp menggunakan mode simulasi yang diberi label jelas.
        </Alert>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  pill,
  pillClass,
  className,
}: {
  icon: IconType;
  label: string;
  value: ReactNode;
  pill?: string;
  pillClass?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 p-5 sm:p-6", className)}>
      <p className="flex items-center gap-2 text-[12.5px] font-medium text-ink-2">
        <Icon className="size-4 text-muted" />
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[38px] font-semibold leading-none tracking-[-0.04em] text-ink sm:text-[46px]">{value}</span>
        {pill && (
          <span className={cn("rounded-full px-2.5 py-1 text-[11.5px] font-semibold", pillClass)}>{pill}</span>
        )}
      </div>
    </div>
  );
}

function percent(numerator: number, denominator: number) {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;
}

function SummaryCell({ label, value, hint }: { label: string; value: ReactNode; hint: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-surface-2 px-4 py-3 ring-1 ring-line">
      <dt className="truncate text-[11.5px] font-medium text-muted">{label}</dt>
      <dd className="mt-1 text-[20px] font-semibold leading-tight tracking-[-0.02em] text-ink">{value}</dd>
      <dd className="truncate text-[11px] text-muted">{hint}</dd>
    </div>
  );
}

function RateRow({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-medium text-ink">{label}</p>
        <p className="text-[20px] font-semibold leading-none tracking-[-0.02em] text-ink">{value}%</p>
      </div>
      <Meter value={value} label={label} />
      <p className="mt-1.5 text-[11.5px] text-muted">{detail}</p>
    </div>
  );
}

function MetricRow({
  icon,
  label,
  value,
  hint,
}: {
  icon: IconType;
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <li className="flex items-center gap-3 py-3">
      <IconBox icon={icon} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] text-ink-2">{label}</span>
        {hint && <span className="block text-[11.5px] text-muted">{hint}</span>}
      </span>
      <span className="text-[17px] font-semibold tracking-[-0.02em] text-ink tabular-nums">{value}</span>
    </li>
  );
}
