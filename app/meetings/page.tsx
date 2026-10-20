import {
  PiCalendarCheck,
  PiCalendarDots,
  PiPercent,
  PiClock,
  PiTarget,
  PiUserCircle,
  PiWhatsappLogo,
} from "react-icons/pi";
import { prisma } from "@/lib/prisma";
import {
  Badge,
  Card,
  EmptyState,
  Meter,
  PageHeader,
  Stat,
  selectClass,
} from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { meetingStatusLabels, meetingStatusColors } from "@/lib/labels";
import { updateMeetingStatus } from "@/app/actions";
import { meetingAttendanceRate } from "@/lib/metrics";
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
  const attendance = meetingAttendanceRate(completed, completed + noShow);

  return (
    <div>
      <PageHeader
        title="Meeting & Konsultasi"
        subtitle="Kelola jadwal konsultasi dan catat kehadiran untuk mengukur meeting attendance rate."
      />

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Stat label="Total terjadwal" value={scheduled} icon={PiCalendarDots} />
          <Stat label="Terlaksana" value={completed} icon={PiCalendarCheck} tone="green" />
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12.5px] font-medium text-ink-2">Attendance rate</p>
              <span className="grid size-8 place-items-center rounded-xl bg-lime text-ink">
                <PiPercent className="size-4" />
              </span>
            </div>
            <div>
              <p className="text-[32px] font-semibold leading-none tracking-[-0.03em] text-ink">{attendance}%</p>
              <Meter value={attendance} color="#12a150" className="mt-3 h-1.5" label="Attendance rate" />
              <p className="mt-2 text-xs text-muted">Dari meeting yang sudah lewat</p>
            </div>
          </Card>
        </div>

        {meetings.length === 0 ? (
          <EmptyState
            icon={PiCalendarDots}
            title="Belum ada meeting"
            description="Jadwalkan konsultasi dari halaman prospek atau percakapan asisten."
          />
        ) : (
          <Card className="overflow-hidden p-0 sm:p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-200 text-left text-[13px]">
                <thead>
                  <tr className="border-b border-line bg-surface-2 text-[11.5px] text-muted">
                    <th className="px-5 py-3.5 font-medium">Jadwal</th>
                    <th className="px-4 py-3.5 font-medium">Judul</th>
                    <th className="px-4 py-3.5 font-medium">Terkait</th>
                    <th className="px-4 py-3.5 font-medium">Status</th>
                    <th className="px-4 py-3.5 font-medium">Ubah status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {meetings.map((m) => {
                    const at = new Date(m.scheduledAt);
                    const related = m.prospect?.companyName || m.conversation?.contactName;
                    return (
                      <tr key={m.id} className="transition-colors hover:bg-surface-2/70">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="grid w-12 shrink-0 overflow-hidden rounded-xl text-center ring-1 ring-line">
                              <span className="bg-ink py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lime">
                                {at.toLocaleDateString("id-ID", { month: "short" })}
                              </span>
                              <span className="bg-surface py-1 text-[17px] font-semibold leading-none text-ink">
                                {at.getDate()}
                              </span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
                              <PiClock className="size-3.5" />
                              {at.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-ink">{m.title}</td>
                        <td className="px-4 py-3.5 text-ink-2">
                          {related ? (
                            <span className="inline-flex items-center gap-1.5">
                              {m.prospect ? (
                                <PiTarget className="size-4 text-muted" />
                              ) : m.conversation ? (
                                <PiWhatsappLogo className="size-4 text-muted" />
                              ) : (
                                <PiUserCircle className="size-4 text-muted" />
                              )}
                              {related}
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge dot className={meetingStatusColors[m.status]}>
                            {meetingStatusLabels[m.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <form action={updateMeetingStatus} className="flex gap-2">
                            <input type="hidden" name="id" value={m.id} />
                            <select name="status" defaultValue={m.status} className={`${selectClass} h-9 w-40 text-[12.5px]`}>
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>{meetingStatusLabels[s]}</option>
                              ))}
                            </select>
                            <SubmitButton variant="secondary" size="sm" className="h-9">
                              Set
                            </SubmitButton>
                          </form>
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
