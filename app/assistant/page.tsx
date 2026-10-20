import Link from "next/link";
import { BsCheck2All } from "react-icons/bs";
import {
  PiChatsCircle,
  PiHandshake,
  PiPhone,
  PiPlay,
  PiRobot,
  PiSealCheck,
  PiUser,
  PiWhatsappLogo,
} from "react-icons/pi";
import { prisma } from "@/lib/prisma";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  Field,
  PageHeader,
  Stat,
  inputClass,
} from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { avatarColor } from "@/components/tokens";
import { leadStatusLabels, leadStatusColors, channelLabels } from "@/lib/labels";
import { startConversation } from "@/app/actions";

export const dynamic = "force-dynamic";

const QUALIFIED = ["QUALIFIED", "MEETING_SCHEDULED", "MEETING_COMPLETED", "CONVERTED"];

function listTime(date: Date, now: Date) {
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default async function AssistantPage() {
  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { messages: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const now = new Date();
  const handoffs = conversations.filter((c) => c.handoffRequested).length;
  const qualified = conversations.filter((c) => QUALIFIED.includes(c.leadStatus)).length;

  return (
    <div>
      <PageHeader
        title="WhatsApp AI Sales Assistant"
        subtitle="Menjawab pertanyaan awal berdasarkan basis pengetahuan resmi, mengidentifikasi kebutuhan, dan mengarahkan prospek ke konsultasi."
      />

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Stat label="Percakapan" value={conversations.length} icon={PiChatsCircle} />
          <Stat label="Diteruskan ke sales" value={handoffs} icon={PiHandshake} tone="amber" />
          <Stat label="Lead berkualitas" value={qualified} icon={PiSealCheck} tone="green" />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {conversations.length === 0 ? (
              <EmptyState
                icon={PiWhatsappLogo}
                title="Belum ada percakapan"
                description="Mulai simulasi percakapan WhatsApp untuk menguji logika asisten."
              />
            ) : (
              <Card className="overflow-hidden p-0 sm:p-0">
                <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
                  <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Kotak masuk</h3>
                  <span className="text-[12px] text-muted">{conversations.length} percakapan</span>
                </div>
                <ul className="divide-y divide-line">
                  {conversations.map((c) => {
                    const last = c.messages[0];
                    const name = c.contactName || "Calon klien";
                    return (
                      <li key={c.id}>
                        <Link
                          href={`/assistant/${c.id}`}
                          className="group flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-surface-2/70 sm:px-6"
                        >
                          <span className="relative">
                            <Avatar name={name} color={avatarColor(c.id)} />
                            <span className="absolute -bottom-0.5 -right-0.5 grid size-[18px] place-items-center rounded-full bg-[#25d366] text-white ring-2 ring-surface">
                              <PiWhatsappLogo className="size-3" />
                            </span>
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-3">
                              <p className="truncate text-[14px] font-semibold text-ink">
                                {name}
                                {c.contactPhone && (
                                  <span className="ml-2 text-[12px] font-normal text-muted">{c.contactPhone}</span>
                                )}
                              </p>
                              <span className="shrink-0 text-[11.5px] text-muted">
                                {listTime(last?.createdAt ?? c.updatedAt, now)}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-3">
                              <p className="flex min-w-0 items-center gap-1 text-[12.5px] text-muted">
                                {last?.sender === "PROSPECT" ? (
                                  <BsCheck2All className="size-4 shrink-0 text-wa-tick" />
                                ) : (
                                  <PiRobot className="size-3.5 shrink-0" />
                                )}
                                <span className="truncate">{last?.body ?? "Belum ada pesan"}</span>
                              </p>
                              <div className="flex shrink-0 items-center gap-1.5">
                                {c.handoffRequested && (
                                  <Badge icon={PiHandshake} className="bg-orange-100 text-orange-700">
                                    Handoff
                                  </Badge>
                                )}
                                <Badge dot className={leadStatusColors[c.leadStatus]}>
                                  {leadStatusLabels[c.leadStatus]}
                                </Badge>
                              </div>
                            </div>
                            <p className="mt-1 text-[11px] text-muted">
                              {c._count.messages} pesan · {channelLabels[c.channel]}
                            </p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            )}
          </div>

          <div className="lg:col-span-4">
            <Card className="overflow-hidden p-0 sm:p-0 lg:sticky lg:top-24">
              <div className="relative overflow-hidden bg-wa-header px-5 py-5 text-white sm:px-6">
                <div className="wa-wallpaper absolute inset-0 opacity-[0.08]" />
                <div className="relative flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-white/15">
                    <PiWhatsappLogo className="size-6" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold">Mulai percakapan baru</h3>
                    <p className="text-[12px] text-white/75">Simulasi kanal WhatsApp</p>
                  </div>
                </div>
              </div>
              <form action={startConversation} className="space-y-4 p-5 sm:p-6">
                <Field label="Nama (opsional)" icon={PiUser}>
                  <input name="contactName" className={inputClass} placeholder="mis. Ibu Sari" />
                </Field>
                <Field label="No. WhatsApp (opsional)" icon={PiPhone}>
                  <input name="contactPhone" className={inputClass} placeholder="08xx" />
                </Field>
                <SubmitButton icon={<PiPlay />} size="lg" className="w-full">
                  Mulai Simulasi
                </SubmitButton>
                <p className="text-[11.5px] leading-relaxed text-muted">
                  Mode simulasi diberi label jelas karena integrasi kanal resmi memerlukan akses tersendiri.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
