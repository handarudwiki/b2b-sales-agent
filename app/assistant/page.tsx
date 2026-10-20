import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import { leadStatusLabels, leadStatusColors, channelLabels } from "@/lib/labels";
import { startConversation } from "@/app/actions";
import { buttonClass, inputClass, labelClass } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { messages: true } } },
  });

  return (
    <div>
      <PageHeader
        title="WhatsApp AI Sales Assistant"
        subtitle="Menjawab pertanyaan awal berdasarkan basis pengetahuan resmi, mengidentifikasi kebutuhan, dan mengarahkan prospek ke konsultasi."
      />

      <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {conversations.length === 0 ? (
            <EmptyState
              title="Belum ada percakapan"
              description="Mulai simulasi percakapan WhatsApp untuk menguji logika asisten."
            />
          ) : (
            <Card className="p-0">
              <ul className="divide-y divide-border">
                {conversations.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/assistant/${c.id}`}
                      className="flex items-center justify-between px-5 py-4 hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {c.contactName || "Calon klien"}
                          {c.contactPhone && (
                            <span className="ml-2 text-sm text-muted">{c.contactPhone}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted">
                          {c._count.messages} pesan · {channelLabels[c.channel]} ·{" "}
                          {new Date(c.updatedAt).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.handoffRequested && (
                          <Badge className="bg-orange-100 text-orange-700">Handoff</Badge>
                        )}
                        <Badge className={leadStatusColors[c.leadStatus]}>
                          {leadStatusLabels[c.leadStatus]}
                        </Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <h3 className="mb-1 text-base font-semibold text-foreground">Mulai Percakapan Baru</h3>
            <p className="mb-4 text-xs text-muted">
              Mode simulasi WhatsApp — diberi label jelas karena integrasi kanal resmi
              memerlukan akses tersendiri.
            </p>
            <form action={startConversation} className="space-y-3">
              <div>
                <label className={labelClass}>Nama (opsional)</label>
                <input name="contactName" className={inputClass} placeholder="mis. Ibu Sari" />
              </div>
              <div>
                <label className={labelClass}>No. WhatsApp (opsional)</label>
                <input name="contactPhone" className={inputClass} placeholder="08xx" />
              </div>
              <button className={`${buttonClass("primary")} w-full`}>Mulai Simulasi</button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
