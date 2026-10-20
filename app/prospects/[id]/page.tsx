import { notFound } from "next/navigation";
import Link from "next/link";
import {
  PiArrowsClockwise,
  PiCalendarPlus,
  PiChatText,
  PiClock,
  PiDatabase,
  PiEnvelope,
  PiFlask,
  PiGlobe,
  PiGraph,
  PiKanban,
  PiMapPin,
  PiNote,
  PiPhone,
  PiPlus,
  PiSealCheck,
  PiUser,
  PiWarningOctagon,
} from "react-icons/pi";
import { prisma } from "@/lib/prisma";
import {
  Alert,
  Avatar,
  Badge,
  Card,
  CardHeader,
  InfoRow,
  PageHeader,
  inputClass,
  labelClass,
  selectClass,
} from "@/components/ui";
import { ScoreRing, Stepper } from "@/components/charts";
import { PathChain } from "@/components/path-chain";
import { DateTimePicker } from "@/components/date-time-picker";
import { SubmitButton } from "@/components/submit-button";
import {
  segmentLabels,
  prospectStatusLabels,
  prospectStatusColors,
  contactKindLabels,
  contactKindColors,
  meetingStatusLabels,
  meetingStatusColors,
} from "@/lib/labels";
import { scoreBand } from "@/lib/prospecting";
import { warmBand } from "@/lib/graph";
import {
  updateProspectStatus,
  addProspectNote,
  reverifyProspect,
  scheduleMeeting,
  recomputeWarmPath,
} from "@/app/actions";
import { scoreColor, segmentColor, segmentIcon, tint } from "@/components/tokens";
import type { ProspectStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUSES: ProspectStatus[] = [
  "NEW",
  "REVIEWED",
  "CONTACTED",
  "INTERESTED",
  "QUALIFIED",
  "MEETING_SCHEDULED",
  "NOT_A_FIT",
];

const PIPELINE: ProspectStatus[] = STATUSES.filter((s) => s !== "NOT_A_FIT");

function formatDateTime(date: Date) {
  return date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

export default async function ProspectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prospect = await prisma.prospect.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: "desc" } },
      meetings: { orderBy: { scheduledAt: "desc" } },
      contacts: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!prospect) notFound();

  const band = scoreBand(prospect.priorityScore);
  const warm = warmBand(prospect.warmIntroScore);
  const notAFit = prospect.status === "NOT_A_FIT";
  const SegmentIcon = segmentIcon[prospect.segment];

  return (
    <div>
      <PageHeader
        back={{ href: "/prospects", label: "Prospek" }}
        title={
          <span className="flex items-center gap-4">
            <Avatar name={prospect.companyName} color={segmentColor[prospect.segment]} icon={SegmentIcon} size="lg" />
            <span className="min-w-0">{prospect.companyName}</span>
          </span>
        }
        meta={
          <>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-[11.5px] font-medium leading-none"
              style={tint(segmentColor[prospect.segment], 14)}
            >
              <SegmentIcon className="size-3.5" />
              {segmentLabels[prospect.segment]}
            </span>
            <Badge dot className={prospectStatusColors[prospect.status]}>
              {prospectStatusLabels[prospect.status]}
            </Badge>
            {prospect.location && <Badge icon={PiMapPin}>{prospect.location}</Badge>}
            {prospect.isSimulated && (
              <Badge icon={PiFlask} className="bg-amber-100 text-amber-800">
                Data simulasi
              </Badge>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <Card className="animate-fade-up">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <ScoreRing value={prospect.priorityScore} color={scoreColor(prospect.priorityScore)} size={140} stroke={12}>
                <div>
                  <p className="text-[36px] font-semibold leading-none tracking-[-0.04em] text-ink">
                    {prospect.priorityScore ?? "—"}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-muted">dari 100</p>
                </div>
              </ScoreRing>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Rekomendasi prioritas (AI)</h3>
                    <Badge className={band.color}>{band.label}</Badge>
                  </div>
                  <form action={reverifyProspect}>
                    <input type="hidden" name="id" value={prospect.id} />
                    <SubmitButton variant="secondary" size="sm" icon={<PiArrowsClockwise />}>
                      Hitung ulang skor
                    </SubmitButton>
                  </form>
                </div>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-2">{prospect.scoreReason}</p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <PiDatabase className="size-4" />
                    Sumber: <span className="text-ink-2">{prospect.dataSource ?? "—"}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <PiSealCheck className="size-4" />
                    Verifikasi terakhir:{" "}
                    <span className="text-ink-2">
                      {prospect.lastVerifiedAt ? formatDateTime(new Date(prospect.lastVerifiedAt)) : "—"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            {prospect.isIncomplete && (
              <Alert tone="warning" className="mt-5">
                Data belum lengkap. Lengkapi dan verifikasi sebelum tindak lanjut — data tidak dilengkapi dengan
                informasi rekaan.
              </Alert>
            )}
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: "60ms" }}>
            <CardHeader
              icon={PiGraph}
              title="Jalur perkenalan (warm intro)"
              description="Rute perkenalan hangat dari jaringan internal."
              action={
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[24px] font-semibold leading-none tracking-[-0.03em] text-ink">
                      {prospect.warmIntroScore ?? 0}
                    </p>
                    <p className="mt-1 text-[11px] text-muted">skor jalur</p>
                  </div>
                  <Badge className={warm.color}>{warm.label}</Badge>
                </div>
              }
            />

            {prospect.warmIntroPath ? (
              <>
                <PathChain names={prospect.warmIntroPath.split(" → ")} />
                <p className="mt-4 text-[13.5px] leading-relaxed text-ink-2">{prospect.warmIntroReason}</p>
              </>
            ) : (
              <Alert tone="neutral">
                Belum ada jalur perkenalan ke prospek ini. Tambahkan kontak jembatan di{" "}
                <Link href="/network" className="font-semibold text-ink underline underline-offset-4">
                  Jaringan Relasi
                </Link>{" "}
                dan hubungkan dengan tim internal.
              </Alert>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              {prospect.contacts.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {prospect.contacts.map((c) => (
                    <Badge key={c.id} dot className={contactKindColors[c.kind]}>
                      {c.name} · {contactKindLabels[c.kind]}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-[12.5px] text-muted">Belum ada kontak jembatan.</span>
              )}
              <form action={recomputeWarmPath}>
                <input type="hidden" name="prospectId" value={prospect.id} />
                <SubmitButton variant="ghost" size="sm" icon={<PiArrowsClockwise />}>
                  Hitung ulang jalur
                </SubmitButton>
              </form>
            </div>
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: "120ms" }}>
            <CardHeader icon={PiNote} title="Catatan tindak lanjut" />
            <form action={addProspectNote} className="flex gap-2">
              <input type="hidden" name="prospectId" value={prospect.id} />
              <input name="body" required className={inputClass} placeholder="Tambahkan catatan..." />
              <SubmitButton icon={<PiPlus />} className="h-11">
                Tambah
              </SubmitButton>
            </form>
            {prospect.notes.length === 0 ? (
              <p className="mt-4 text-[13px] text-muted">Belum ada catatan.</p>
            ) : (
              <ul className="relative mt-5 space-y-3 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-line">
                {prospect.notes.map((n) => (
                  <li key={n.id} className="relative flex gap-3">
                    <span className="z-[1] mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-surface text-ink-2 ring-1 ring-line">
                      <PiChatText className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1 rounded-2xl bg-surface-2 px-4 py-3 ring-1 ring-line">
                      <p className="text-[13.5px] leading-relaxed text-ink">{n.body}</p>
                      <p className="mt-1 text-[11.5px] text-muted">{formatDateTime(new Date(n.createdAt))}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: "180ms" }}>
            <CardHeader icon={PiCalendarPlus} title="Jadwalkan konsultasi" />
            <form action={scheduleMeeting} className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto] sm:items-end">
              <input type="hidden" name="prospectId" value={prospect.id} />
              <div>
                <label className={labelClass}>Judul</label>
                <input name="title" required className={inputClass} defaultValue={`Konsultasi — ${prospect.companyName}`} />
              </div>
              <div>
                <label className={labelClass}>Waktu</label>
                <DateTimePicker name="scheduledAt" required />
              </div>
              <SubmitButton icon={<PiCalendarPlus />} className="h-11">
                Jadwalkan
              </SubmitButton>
            </form>
            {prospect.meetings.length > 0 && (
              <ul className="mt-5 divide-y divide-line rounded-2xl ring-1 ring-line">
                {prospect.meetings.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-ink">{m.title}</p>
                      <p className="mt-0.5 inline-flex items-center gap-1.5 text-[11.5px] text-muted">
                        <PiClock className="size-3.5" />
                        {formatDateTime(new Date(m.scheduledAt))}
                      </p>
                    </div>
                    <Badge dot className={meetingStatusColors[m.status]}>
                      {meetingStatusLabels[m.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-5 lg:col-span-4">
          <Card className="animate-fade-up" style={{ animationDelay: "90ms" }}>
            <CardHeader icon={PiKanban} title="Status pipeline" />
            {notAFit ? (
              <Alert tone="danger" icon={PiWarningOctagon} className="mb-5">
                Ditandai tidak sesuai.
              </Alert>
            ) : null}
            <div className="mb-5">
              <Stepper
                steps={PIPELINE.map((s) => ({ key: s, label: prospectStatusLabels[s] }))}
                current={PIPELINE.indexOf(prospect.status)}
                muted={notAFit}
              />
            </div>
            <form action={updateProspectStatus} className="flex gap-2 border-t border-line pt-4">
              <input type="hidden" name="id" value={prospect.id} />
              <select name="status" defaultValue={prospect.status} className={selectClass}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{prospectStatusLabels[s]}</option>
                ))}
              </select>
              <SubmitButton variant="secondary" className="h-11">
                Ubah
              </SubmitButton>
            </form>
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: "150ms" }}>
            <CardHeader title="Informasi prospek" className="mb-1" />
            <dl className="divide-y divide-line">
              <InfoRow icon={PiGlobe} label="Website">
                {prospect.website ? (
                  <a
                    href={prospect.website.startsWith("http") ? prospect.website : `https://${prospect.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
                  >
                    {prospect.website}
                  </a>
                ) : (
                  <Empty />
                )}
              </InfoRow>
              <InfoRow icon={PiMapPin} label="Lokasi">{prospect.location ?? <Empty />}</InfoRow>
              <InfoRow icon={PiUser} label="Narahubung">{prospect.contactPerson ?? <Empty />}</InfoRow>
              <InfoRow icon={PiEnvelope} label="Email">{prospect.email ?? <Empty />}</InfoRow>
              <InfoRow icon={PiPhone} label="Telepon">{prospect.phone ?? <Empty />}</InfoRow>
              <InfoRow icon={PiChatText} label="Indikasi kecocokan">{prospect.fitIndication ?? <Empty />}</InfoRow>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Empty() {
  return <span className="text-muted">—</span>;
}
