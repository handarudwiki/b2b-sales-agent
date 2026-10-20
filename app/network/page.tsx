import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import { contactKindLabels, contactKindColors } from "@/lib/labels";
import { relationshipTypeLabels, warmBand, ContextGraph } from "@/lib/graph";
import { ContactForm } from "./contact-form";
import { RelationshipForm } from "./relationship-form";
import { DeleteButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function NetworkPage() {
  const [contacts, relationships, prospects] = await Promise.all([
    prisma.contact.findMany({
      orderBy: [{ kind: "asc" }, { name: "asc" }],
      include: { prospect: { select: { companyName: true } } },
    }),
    prisma.relationship.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.prospect.findMany({
      where: { contacts: { some: {} } },
      orderBy: { warmIntroScore: "desc" },
      select: { id: true, companyName: true, warmIntroScore: true, warmIntroPath: true },
    }),
  ]);

  const contactName = new Map(contacts.map((c) => [c.id, c.name]));

  // Live graph summary (teams, bridges) to orient the user.
  const graph = new ContextGraph(
    contacts.map((c) => ({
      id: c.id,
      name: c.name,
      kind: c.kind,
      org: c.org,
      prospectId: c.prospectId,
      consent: c.consent,
    })),
    relationships,
  );
  const teamCount = graph.teamStartNodes().length;

  return (
    <div>
      <PageHeader
        title="Jaringan Relasi & Path Finder"
        subtitle="Context graph dari aset relasi internal (tim, klien lama, mitra, komunitas). Sistem menemukan jalur perkenalan hangat ke prospek untuk menaikkan peluang deal — bukan outreach dingin."
      />

      <div className="space-y-6 p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-sm text-muted">Total Kontak</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{contacts.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-muted">Relasi (edge)</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{relationships.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-muted">Titik Awal (Tim)</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{teamCount}</p>
            <p className="mt-1 text-xs text-muted">node awal pencarian jalur</p>
          </Card>
        </div>

        {/* Warm path preview per prospect */}
        {prospects.length > 0 && (
          <Card>
            <h3 className="mb-3 text-base font-semibold text-foreground">
              Jalur Perkenalan ke Prospek
            </h3>
            <div className="space-y-3">
              {prospects.map((p) => {
                const band = warmBand(p.warmIntroScore);
                return (
                  <div
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.companyName}</p>
                      <p className="text-xs text-muted">
                        {p.warmIntroPath ?? "Belum ada jalur ditemukan"}
                      </p>
                    </div>
                    <Badge className={band.color}>
                      {band.label} · {p.warmIntroScore ?? 0}/100
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Contacts list */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-0">
              <div className="border-b border-border px-5 py-3">
                <h3 className="text-base font-semibold text-foreground">Kontak dalam Graph</h3>
              </div>
              {contacts.length === 0 ? (
                <div className="p-5">
                  <EmptyState title="Belum ada kontak" description="Tambahkan tim, klien lama, mitra, atau kenalan untuk membangun graph." />
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {contacts.map((c) => (
                    <li key={c.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {c.name}
                          {c.consent && (
                            <span className="ml-2 text-xs text-emerald-600">✓ consent intro</span>
                          )}
                        </p>
                        <p className="text-xs text-muted">
                          {[c.org, c.role].filter(Boolean).join(" · ") || "—"}
                          {c.prospect && ` · ⟶ ${c.prospect.companyName}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={contactKindColors[c.kind]}>
                          {contactKindLabels[c.kind]}
                        </Badge>
                        <DeleteButton id={c.id} kind="contact" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Relationships list */}
            <Card className="p-0">
              <div className="border-b border-border px-5 py-3">
                <h3 className="text-base font-semibold text-foreground">Relasi (Edge)</h3>
              </div>
              {relationships.length === 0 ? (
                <div className="p-5">
                  <EmptyState title="Belum ada relasi" description="Hubungkan dua kontak untuk membentuk jalur." />
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {relationships.map((r) => (
                    <li key={r.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm text-foreground">
                          {contactName.get(r.fromId) ?? "?"}{" "}
                          <span className="text-muted">↔</span>{" "}
                          {contactName.get(r.toId) ?? "?"}
                        </p>
                        <p className="text-xs text-muted">
                          {relationshipTypeLabels[r.type]} · kekuatan {r.strength}/100
                          {r.reason && ` · ${r.reason}`}
                        </p>
                      </div>
                      <DeleteButton id={r.id} kind="relationship" />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Forms */}
          <div className="space-y-6">
            <Card>
              <h3 className="mb-3 text-base font-semibold text-foreground">Tambah Kontak</h3>
              <ContactForm
                prospects={await prisma.prospect.findMany({
                  orderBy: { companyName: "asc" },
                  select: { id: true, companyName: true },
                })}
              />
            </Card>
            <Card>
              <h3 className="mb-3 text-base font-semibold text-foreground">Tambah Relasi</h3>
              <RelationshipForm contacts={contacts.map((c) => ({ id: c.id, name: c.name }))} />
            </Card>
          </div>
        </div>

        <Card className="bg-accent">
          <p className="text-sm text-foreground">
            <strong>Guardrail:</strong> jalur perkenalan adalah rekomendasi untuk
            meminta <em>warm intro</em>, bukan izin menghubungi massal. Hormati
            persetujuan kontak dan kebijakan kanal. Data relasi hanya dari sumber
            yang sah dan tercatat.
          </p>
        </Card>
      </div>
    </div>
  );
}
