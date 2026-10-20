import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge } from "@/components/ui";
import {
  segmentLabels,
  prospectStatusLabels,
  prospectStatusColors,
} from "@/lib/labels";
import { scoreBand } from "@/lib/prospecting";
import { warmBand } from "@/lib/graph";
import { contactKindLabels, contactKindColors } from "@/lib/labels";
import {
  updateProspectStatus,
  addProspectNote,
  reverifyProspect,
  scheduleMeeting,
  recomputeWarmPath,
} from "@/app/actions";
import { buttonClass, inputClass, labelClass } from "@/components/ui";
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

  return (
    <div>
      <PageHeader
        title={prospect.companyName}
        subtitle={segmentLabels[prospect.segment]}
        action={
          <Link href="/prospects" className={buttonClass("secondary")}>
            ← Kembali
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* AI recommendation */}
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Rekomendasi Prioritas (AI)</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">{prospect.priorityScore ?? "—"}</span>
                <Badge className={band.color}>{band.label}</Badge>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{prospect.scoreReason}</p>
            <div className="mt-4 flex items-center gap-3 border-t border-border pt-3 text-xs text-muted">
              <span>Sumber: {prospect.dataSource ?? "—"}</span>
              <span>·</span>
              <span>
                Verifikasi terakhir:{" "}
                {prospect.lastVerifiedAt
                  ? new Date(prospect.lastVerifiedAt).toLocaleString("id-ID")
                  : "—"}
              </span>
              <form action={reverifyProspect} className="ml-auto">
                <input type="hidden" name="id" value={prospect.id} />
                <button className={buttonClass("ghost")}>↻ Hitung ulang skor</button>
              </form>
            </div>
            {prospect.isIncomplete && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                ⚠ Data belum lengkap. Lengkapi dan verifikasi sebelum tindak lanjut (data
                tidak dilengkapi dengan informasi rekaan).
              </p>
            )}
          </Card>

          {/* Warm introduction path (Module E) */}
          <Card className="border-violet-200">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                🕸️ Jalur Perkenalan (Warm Intro)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {prospect.warmIntroScore ?? 0}
                </span>
                <Badge className={warm.color}>{warm.label}</Badge>
              </div>
            </div>

            {prospect.warmIntroPath ? (
              <>
                <div className="flex flex-wrap items-center gap-2 rounded-lg bg-accent px-3 py-3">
                  {prospect.warmIntroPath.split(" → ").map((name, i, arr) => (
                    <span key={i} className="flex items-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-foreground shadow-sm">
                        {name}
                      </span>
                      {i < arr.length - 1 && <span className="text-primary">→</span>}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground">
                  {prospect.warmIntroReason}
                </p>
              </>
            ) : (
              <p className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-muted">
                Belum ada jalur perkenalan ke prospek ini. Tambahkan kontak jembatan di{" "}
                <Link href="/network" className="text-primary hover:underline">
                  Jaringan Relasi
                </Link>{" "}
                dan hubungkan dengan tim internal untuk menemukan jalur warm intro.
              </p>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              {prospect.contacts.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {prospect.contacts.map((c) => (
                    <Badge key={c.id} className={contactKindColors[c.kind]}>
                      {c.name} · {contactKindLabels[c.kind]}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted">Belum ada kontak jembatan.</span>
              )}
              <form action={recomputeWarmPath}>
                <input type="hidden" name="prospectId" value={prospect.id} />
                <button className={buttonClass("ghost")}>↻ Hitung ulang jalur</button>
              </form>
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <h3 className="mb-3 text-base font-semibold text-foreground">Catatan Tindak Lanjut</h3>
            <form action={addProspectNote} className="mb-4 flex gap-2">
              <input type="hidden" name="prospectId" value={prospect.id} />
              <input name="body" required className={inputClass} placeholder="Tambahkan catatan..." />
              <button className={buttonClass("primary")}>Tambah</button>
            </form>
            {prospect.notes.length === 0 ? (
              <p className="text-sm text-muted">Belum ada catatan.</p>
            ) : (
              <ul className="space-y-3">
                {prospect.notes.map((n) => (
                  <li key={n.id} className="rounded-lg border border-border bg-slate-50 px-3 py-2">
                    <p className="text-sm text-foreground">{n.body}</p>
                    <p className="mt-1 text-xs text-muted">
                      {new Date(n.createdAt).toLocaleString("id-ID")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Schedule meeting */}
          <Card>
            <h3 className="mb-3 text-base font-semibold text-foreground">Jadwalkan Konsultasi</h3>
            <form action={scheduleMeeting} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="prospectId" value={prospect.id} />
              <div className="flex-1 min-w-[180px]">
                <label className={labelClass}>Judul</label>
                <input name="title" required className={inputClass} defaultValue={`Konsultasi — ${prospect.companyName}`} />
              </div>
              <div>
                <label className={labelClass}>Waktu</label>
                <input name="scheduledAt" type="datetime-local" required className={inputClass} />
              </div>
              <button className={buttonClass("primary")}>Jadwalkan</button>
            </form>
            {prospect.meetings.length > 0 && (
              <ul className="mt-4 space-y-2">
                {prospect.meetings.map((m) => (
                  <li key={m.id} className="flex justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="text-foreground">{m.title}</span>
                    <span className="text-muted">{new Date(m.scheduledAt).toLocaleString("id-ID")}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Sidebar: info + status */}
        <div className="space-y-6">
          <Card>
            <h3 className="mb-3 text-base font-semibold text-foreground">Status Pipeline</h3>
            <div className="mb-3">
              <Badge className={prospectStatusColors[prospect.status]}>
                {prospectStatusLabels[prospect.status]}
              </Badge>
            </div>
            <form action={updateProspectStatus} className="flex gap-2">
              <input type="hidden" name="id" value={prospect.id} />
              <select name="status" defaultValue={prospect.status} className={inputClass}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{prospectStatusLabels[s]}</option>
                ))}
              </select>
              <button className={buttonClass("secondary")}>Ubah</button>
            </form>
          </Card>

          <Card>
            <h3 className="mb-3 text-base font-semibold text-foreground">Informasi Prospek</h3>
            <dl className="space-y-2 text-sm">
              <Row label="Website" value={prospect.website} isLink />
              <Row label="Lokasi" value={prospect.location} />
              <Row label="Narahubung" value={prospect.contactPerson} />
              <Row label="Email" value={prospect.email} />
              <Row label="Telepon" value={prospect.phone} />
              <Row label="Indikasi kecocokan" value={prospect.fitIndication} />
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  isLink = false,
}: {
  label: string;
  value?: string | null;
  isLink?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-foreground">
        {value ? (
          isLink ? (
            <a
              href={value.startsWith("http") ? value : `https://${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {value}
            </a>
          ) : (
            value
          )
        ) : (
          <span className="text-muted">—</span>
        )}
      </dd>
    </div>
  );
}
