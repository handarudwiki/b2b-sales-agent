import { notFound } from "next/navigation";
import { Roboto } from "next/font/google";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  PiCalendarPlus,
  PiChatCircleDots,
  PiClipboardText,
  PiHandshake,
  PiLightning,
  PiListChecks,
  PiPhone,
  PiTag,
  PiWhatsappLogo,
} from "react-icons/pi";
import { prisma } from "@/lib/prisma";
import {
  Alert,
  Avatar,
  Badge,
  Card,
  CardHeader,
  Meter,
  BackLink,
  inputClass,
  labelClass,
  selectClass,
} from "@/components/ui";
import { DateTimePicker } from "@/components/date-time-picker";
import { SubmitButton } from "@/components/submit-button";
import { WhatsAppSimulator, type ChatMessage } from "@/components/whatsapp-simulator";
import { avatarColor } from "@/components/tokens";
import {
  leadStatusLabels,
  leadStatusColors,
  channelLabels,
} from "@/lib/labels";
import {
  updateQualification,
  requestHandoff,
  setLeadStatus,
  scheduleMeeting,
} from "@/app/actions";
import { formatMs } from "@/lib/metrics";
import type { LeadStatus } from "@prisma/client";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const dynamic = "force-dynamic";

const LEAD_STATUSES: LeadStatus[] = [
  "UNQUALIFIED",
  "EARLY_STAGE",
  "QUALIFIED",
  "MEETING_SCHEDULED",
  "MEETING_COMPLETED",
  "FOLLOW_UP",
  "CONVERTED",
  "LOST",
];

const QUAL_FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: "productInterest", label: "Minat produk", placeholder: "herbal / kosmetik / skincare" },
  { key: "businessStage", label: "Tahap bisnis", placeholder: "ide / riset / sudah punya brand" },
  { key: "targetMarket", label: "Target pasar", placeholder: "siapa calon konsumen" },
  { key: "developmentReadiness", label: "Kesiapan pengembangan", placeholder: "konsep / formula / sampel" },
  { key: "timeline", label: "Timeline", placeholder: "kapan ingin mulai" },
  { key: "budgetReadiness", label: "Kesiapan anggaran", placeholder: "opsional" },
  { key: "decisionAuthority", label: "Otoritas keputusan", placeholder: "pengambil keputusan?" },
];

const SUGGESTIONS = [
  "Apa itu jasa maklon?",
  "Bagaimana tahapan prosesnya?",
  "Apakah bisa bantu urus izin BPOM?",
  "Apa yang perlu disiapkan sebelum konsultasi?",
  "Berapa harganya?",
];

function dayLabel(date: Date, now: Date) {
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((startOf(now) - startOf(date)) / 86400000);
  if (diff === 0) return "Hari ini";
  if (diff === 1) return "Kemarin";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function timeLabel(date: Date) {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const convo = await prisma.conversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!convo) notFound();

  const signals = {
    productInterest: convo.productInterest,
    businessStage: convo.businessStage,
    targetMarket: convo.targetMarket,
    developmentReadiness: convo.developmentReadiness,
    timeline: convo.timeline,
    budgetReadiness: convo.budgetReadiness,
    decisionAuthority: convo.decisionAuthority,
  } as Record<string, string | null>;
  const filled = QUAL_FIELDS.filter((f) => signals[f.key]?.trim()).length;

  const now = new Date();
  const chat: ChatMessage[] = convo.messages.map((m) => ({
    id: m.id,
    sender: m.sender,
    body: m.body,
    time: timeLabel(m.createdAt),
    day: dayLabel(m.createdAt, now),
    grounded: m.groundedOnIds.length > 0,
    fallback: m.isFallback,
  }));
  const animateIntro =
    convo.messages.length === 1 &&
    convo.messages[0].sender === "AI" &&
    now.getTime() - convo.createdAt.getTime() < 20000;

  const name = convo.contactName || "Calon klien";

  return (
    <div>
      <div className="flex animate-fade-up flex-wrap items-center justify-between gap-3 pb-5 pt-6">
        <BackLink href="/assistant" label="Sales Assistant" />
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge icon={PiWhatsappLogo} className="bg-emerald-50 text-emerald-700">
            {channelLabels[convo.channel]}
          </Badge>
          <Badge dot className={leadStatusColors[convo.leadStatus]}>
            {leadStatusLabels[convo.leadStatus]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,470px)_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <WhatsAppSimulator
            className={roboto.variable}
            conversationId={convo.id}
            businessName="CV Arba'in Jaya Mandiri"
            messages={chat}
            clock={timeLabel(now)}
            animateIntro={animateIntro}
            suggestions={SUGGESTIONS}
          />
        </div>

        <div className="space-y-5">
          {convo.handoffRequested && (
            <Alert tone="warning" icon={PiHandshake} title="Human handoff aktif">
              Percakapan ini sudah diteruskan ke tim sales. AI tidak lagi membalas otomatis.
            </Alert>
          )}

          <Card className="animate-fade-up">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar name={name} color={avatarColor(convo.id)} size="lg" />
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-[22px] font-semibold tracking-[-0.02em] text-ink">{name}</h1>
                <p className="mt-0.5 inline-flex items-center gap-1.5 text-[12.5px] text-muted">
                  <PiPhone className="size-3.5" />
                  {convo.contactPhone || "Nomor belum diisi"}
                </p>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-3">
              <MiniStat icon={PiLightning} label="Respons AI pertama" value={formatMs(convo.firstResponseMs)} />
              <MiniStat icon={PiChatCircleDots} label="Pesan" value={convo.messages.length} />
              <MiniStat icon={PiListChecks} label="Kriteria terisi" value={`${filled}/${QUAL_FIELDS.length}`} />
            </dl>
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: "60ms" }}>
            <CardHeader
              icon={PiTag}
              title="Status lead"
              action={
                <Badge dot className={leadStatusColors[convo.leadStatus]}>
                  {leadStatusLabels[convo.leadStatus]}
                </Badge>
              }
              className="mb-4"
            />
            <form action={setLeadStatus} className="flex gap-2">
              <input type="hidden" name="conversationId" value={convo.id} />
              <select name="leadStatus" defaultValue={convo.leadStatus} className={selectClass}>
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>{leadStatusLabels[s]}</option>
                ))}
              </select>
              <SubmitButton variant="secondary" className="h-11">
                Set
              </SubmitButton>
            </form>
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: "120ms" }}>
            <CardHeader
              icon={PiListChecks}
              title="Kualifikasi kebutuhan"
              description="Isi sinyal yang terkumpul. Status lead & ringkasan dihitung otomatis."
            />
            <div className="mb-5 flex items-center gap-3">
              <Meter value={filled} max={QUAL_FIELDS.length} color="#12a150" label="Kriteria terisi" />
              <span className="shrink-0 text-[12px] font-semibold text-ink tabular-nums">
                {filled}/{QUAL_FIELDS.length} terisi
              </span>
            </div>
            <form action={updateQualification} className="space-y-4">
              <input type="hidden" name="conversationId" value={convo.id} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {QUAL_FIELDS.map((f) => (
                  <div key={f.key}>
                    <label htmlFor={f.key} className={labelClass}>{f.label}</label>
                    <input
                      id={f.key}
                      name={f.key}
                      defaultValue={signals[f.key] ?? ""}
                      className={inputClass}
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
              </div>
              <SubmitButton icon={<PiListChecks />} className="w-full" size="lg">
                Perbarui Kualifikasi
              </SubmitButton>
            </form>
          </Card>

          {convo.needsSummary && (
            <Card className="animate-fade-up" style={{ animationDelay: "160ms" }}>
              <CardHeader icon={PiClipboardText} title="Ringkasan untuk sales" />
              <pre className="whitespace-pre-wrap rounded-2xl bg-surface-2 p-4 font-sans text-[13px] leading-relaxed text-ink ring-1 ring-line">
                {convo.needsSummary}
              </pre>
            </Card>
          )}

          <Card className="animate-fade-up" style={{ animationDelay: "200ms" }}>
            <CardHeader icon={PiHandshake} title="Tindakan" />
            <div className="space-y-4">
              {!convo.handoffRequested && (
                <form action={requestHandoff}>
                  <input type="hidden" name="conversationId" value={convo.id} />
                  <input type="hidden" name="reason" value="Diteruskan ke sales untuk konsultasi." />
                  <SubmitButton variant="secondary" icon={<PiHandshake />} className="w-full">
                    Teruskan ke Sales (Handoff)
                  </SubmitButton>
                </form>
              )}
              <form action={scheduleMeeting} className="space-y-3 rounded-2xl border border-line bg-surface-2 p-4">
                <input type="hidden" name="conversationId" value={convo.id} />
                <input type="hidden" name="title" value={`Konsultasi — ${name}`} />
                <label htmlFor="scheduledAt" className={labelClass}>Jadwalkan konsultasi</label>
                <DateTimePicker id="scheduledAt" name="scheduledAt" required />
                <SubmitButton icon={<PiCalendarPlus />} className="w-full">
                  Jadwalkan Meeting
                </SubmitButton>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-surface-2 px-3.5 py-3 ring-1 ring-line">
      <dt className="flex items-center gap-1.5 truncate text-[11px] font-medium text-muted">
        <Icon className="size-3.5 shrink-0" />
        {label}
      </dt>
      <dd className="mt-1 truncate text-[17px] font-semibold tracking-[-0.02em] text-ink">{value}</dd>
    </div>
  );
}
