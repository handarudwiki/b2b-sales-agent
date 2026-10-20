import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Stat, Badge } from "@/components/ui";
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
} from "@/lib/labels";
import type { BusinessSegment, LeadStatus } from "@prisma/client";

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

  return (
    <div>
      <PageHeader
        title="Unified Growth Dashboard"
        subtitle="Ringkasan funnel akuisisi dari data yang benar-benar tercatat. Metrik yang belum memiliki sumber data tidak ditampilkan."
      />

      <div className="space-y-8 p-8">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Funnel Prospek & Lead
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Total Prospek" value={prospectTotal} hint={`${prospectVerified} data lengkap`} />
            <Stat label="Prospek Dihubungi" value={contactedCount} />
            <Stat label="Menunjukkan Ketertarikan" value={interestedCount} />
            <Stat label="Prospek Berkualitas" value={qualifiedProspects} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Kualifikasi & Meeting
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Qualified Lead Rate"
              value={`${qualifiedLeadRate(qualifiedLeads, totalLeads)}%`}
              hint={`${qualifiedLeads} dari ${totalLeads} percakapan`}
            />
            <Stat
              label="Lead → Meeting"
              value={`${leadToMeetingRate(totalMeetings, totalLeads)}%`}
              hint={`${totalMeetings} meeting dari ${totalLeads} lead`}
            />
            <Stat
              label="Meeting Attendance"
              value={`${meetingAttendanceRate(meetingsCompleted, totalMeetings)}%`}
              hint={`${meetingsCompleted} terlaksana / ${totalMeetings} total`}
            />
            <Stat
              label="Median Respons AI"
              value={formatMs(medianMs)}
              hint="Target NFR-03: < 10 dtk"
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Marketing & Konten
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Konten Terbit" value={publishedContent} />
            <Stat label="Impresi" value={impressions.toLocaleString("id-ID")} />
            <Stat label="Kunjungan Relevan" value={visits.toLocaleString("id-ID")} />
            <Stat
              label="Content → Lead"
              value={`${contentToLeadRate(attributedLeads, visits)}%`}
              hint={`${attributedLeads} lead teratribusi`}
            />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 text-base font-semibold text-foreground">
              Distribusi Prospek per Segmen
            </h3>
            {prospectsBySegment.length === 0 ? (
              <p className="text-sm text-muted">Belum ada data prospek.</p>
            ) : (
              <div className="space-y-3">
                {prospectsBySegment
                  .sort((a, b) => b._count - a._count)
                  .map((s) => {
                    const seg = s.segment as BusinessSegment;
                    const widthPct = prospectTotal > 0 ? (s._count / prospectTotal) * 100 : 0;
                    return (
                      <div key={seg}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-foreground">{segmentLabels[seg]}</span>
                          <span className="text-muted">{s._count}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${widthPct}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-4 text-base font-semibold text-foreground">
              Status Lead (Percakapan)
            </h3>
            {leadStatusGroups.length === 0 ? (
              <p className="text-sm text-muted">Belum ada percakapan.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {leadStatusGroups
                  .sort((a, b) => b._count - a._count)
                  .map((g) => {
                    const st = g.leadStatus as LeadStatus;
                    return (
                      <Badge key={st} className={leadStatusColors[st]}>
                        {leadStatusLabels[st]}: {g._count}
                      </Badge>
                    );
                  })}
              </div>
            )}
          </Card>
        </div>

        <Card className="bg-accent">
          <p className="text-sm text-foreground">
            <strong>Catatan transparansi:</strong> dashboard membedakan data aktual
            dari perkiraan AI. Skor prioritas prospek adalah rekomendasi untuk
            membantu prioritisasi, bukan bukti bahwa sebuah perusahaan pasti
            membutuhkan jasa maklon. Integrasi WhatsApp menggunakan mode simulasi
            yang diberi label jelas.
          </p>
        </Card>
      </div>
    </div>
  );
}
