import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge } from "@/components/ui";
import { buttonClass, inputClass, labelClass } from "@/components/ui";
import {
  leadStatusLabels,
  leadStatusColors,
  channelLabels,
} from "@/lib/labels";
import {
  sendMessage,
  updateQualification,
  requestHandoff,
  setLeadStatus,
  scheduleMeeting,
} from "@/app/actions";
import { formatMs } from "@/lib/metrics";
import type { LeadStatus } from "@prisma/client";

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

  return (
    <div>
      <PageHeader
        title={convo.contactName || "Percakapan"}
        subtitle={`${channelLabels[convo.channel]} · Median respons AI pertama: ${formatMs(convo.firstResponseMs)}`}
        action={
          <Link href="/assistant" className={buttonClass("secondary")}>
            ← Kembali
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-3">
        {/* Chat */}
        <div className="lg:col-span-2">
          <Card className="flex h-[600px] flex-col p-0">
            {convo.handoffRequested && (
              <div className="border-b border-border bg-orange-50 px-4 py-2 text-sm text-orange-700">
                🤝 Percakapan ini sudah diteruskan ke tim sales (human handoff). AI tidak
                lagi membalas otomatis.
              </div>
            )}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {convo.messages.map((m) => {
                const isProspect = m.sender === "PROSPECT";
                return (
                  <div key={m.id} className={`flex ${isProspect ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                        isProspect
                          ? "bg-primary text-primary-foreground"
                          : m.sender === "HUMAN"
                            ? "bg-indigo-100 text-indigo-900"
                            : "bg-slate-100 text-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p className={`mt-1 text-[10px] ${isProspect ? "text-violet-100" : "text-muted"}`}>
                        {m.sender === "AI" ? "Asisten AI" : m.sender === "HUMAN" ? "Sales" : "Calon klien"}
                        {m.isFallback && " · fallback/eskalasi"}
                        {m.groundedOnIds.length > 0 && " · 📚 berbasis FAQ"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <form action={sendMessage} className="flex gap-2 border-t border-border p-3">
              <input type="hidden" name="conversationId" value={convo.id} />
              <input
                name="body"
                required
                autoComplete="off"
                className={inputClass}
                placeholder={
                  convo.handoffRequested
                    ? "Balas sebagai calon klien (AI tidak merespons)..."
                    : "Ketik pesan calon klien..."
                }
              />
              <button className={buttonClass("primary")}>Kirim</button>
            </form>
          </Card>
        </div>

        {/* Qualification + actions */}
        <div className="space-y-6">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Status Lead</h3>
              <Badge className={leadStatusColors[convo.leadStatus]}>
                {leadStatusLabels[convo.leadStatus]}
              </Badge>
            </div>
            <form action={setLeadStatus} className="flex gap-2">
              <input type="hidden" name="conversationId" value={convo.id} />
              <select name="leadStatus" defaultValue={convo.leadStatus} className={inputClass}>
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>{leadStatusLabels[s]}</option>
                ))}
              </select>
              <button className={buttonClass("secondary")}>Set</button>
            </form>
          </Card>

          <Card>
            <h3 className="mb-1 text-base font-semibold text-foreground">Kualifikasi Kebutuhan</h3>
            <p className="mb-3 text-xs text-muted">
              Isi sinyal yang terkumpul. Status lead & ringkasan dihitung otomatis.
            </p>
            <form action={updateQualification} className="space-y-3">
              <input type="hidden" name="conversationId" value={convo.id} />
              {QUAL_FIELDS.map((f) => (
                <div key={f.key}>
                  <label className={labelClass}>{f.label}</label>
                  <input
                    name={f.key}
                    defaultValue={signals[f.key] ?? ""}
                    className={inputClass}
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
              <button className={`${buttonClass("primary")} w-full`}>
                Perbarui Kualifikasi
              </button>
            </form>
          </Card>

          {convo.needsSummary && (
            <Card>
              <h3 className="mb-2 text-base font-semibold text-foreground">Ringkasan untuk Sales</h3>
              <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-foreground">
                {convo.needsSummary}
              </pre>
            </Card>
          )}

          <Card>
            <h3 className="mb-3 text-base font-semibold text-foreground">Tindakan</h3>
            <div className="space-y-3">
              {!convo.handoffRequested && (
                <form action={requestHandoff}>
                  <input type="hidden" name="conversationId" value={convo.id} />
                  <input type="hidden" name="reason" value="Diteruskan ke sales untuk konsultasi." />
                  <button className={`${buttonClass("secondary")} w-full`}>
                    🤝 Teruskan ke Sales (Handoff)
                  </button>
                </form>
              )}
              <form action={scheduleMeeting} className="space-y-2 border-t border-border pt-3">
                <input type="hidden" name="conversationId" value={convo.id} />
                <input type="hidden" name="title" value={`Konsultasi — ${convo.contactName || "Calon klien"}`} />
                <label className={labelClass}>Jadwalkan konsultasi</label>
                <input name="scheduledAt" type="datetime-local" required className={inputClass} />
                <button className={`${buttonClass("primary")} w-full`}>📅 Jadwalkan Meeting</button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
