import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import { meetingStatusLabels, meetingStatusColors } from "@/lib/labels";
import { updateMeetingStatus } from "@/app/actions";
import { buttonClass, inputClass } from "@/components/ui";
import {
  meetingAttendanceRate,
} from "@/lib/metrics";
import type { MeetingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUSES: MeetingStatus[] = ["SCHEDULED", "COMPLETED", "NO_SHOW", "CANCELLED"];

export default async function MeetingsPage() {
  const meetings = await prisma.meeting.findMany({
    orderBy: { scheduledAt: "desc" },
    include: { prospect: true, conversation: true },
  });

  const scheduled = meetings.filter((m) => m.status !== "CANCELLED").length;
  const completed = meetings.filter((m) => m.status === "COMPLETED").length;
  const noShow = meetings.filter((m) => m.status === "NO_SHOW").length;

  return (
    <div>
      <PageHeader
        title="Meeting & Konsultasi"
        subtitle="Kelola jadwal konsultasi dan catat kehadiran untuk mengukur meeting attendance rate."
      />

      <div className="space-y-6 p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-sm text-muted">Total Terjadwal</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{scheduled}</p>
          </Card>
          <Card>
            <p className="text-sm text-muted">Terlaksana</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{completed}</p>
          </Card>
          <Card>
            <p className="text-sm text-muted">Attendance Rate</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {meetingAttendanceRate(completed, completed + noShow)}%
            </p>
            <p className="mt-1 text-xs text-muted">dari meeting yang sudah lewat</p>
          </Card>
        </div>

        {meetings.length === 0 ? (
          <EmptyState
            title="Belum ada meeting"
            description="Jadwalkan konsultasi dari halaman prospek atau percakapan asisten."
          />
        ) : (
          <Card className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-slate-50 text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 font-medium">Judul</th>
                    <th className="px-4 py-3 font-medium">Waktu</th>
                    <th className="px-4 py-3 font-medium">Terkait</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Ubah</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((m) => (
                    <tr key={m.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{m.title}</td>
                      <td className="px-4 py-3 text-muted">
                        {new Date(m.scheduledAt).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {m.prospect?.companyName || m.conversation?.contactName || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={meetingStatusColors[m.status]}>
                          {meetingStatusLabels[m.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <form action={updateMeetingStatus} className="flex gap-2">
                          <input type="hidden" name="id" value={m.id} />
                          <select name="status" defaultValue={m.status} className={`${inputClass} py-1`}>
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{meetingStatusLabels[s]}</option>
                            ))}
                          </select>
                          <button className={buttonClass("ghost")}>Set</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
