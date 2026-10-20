import Link from "next/link";
import {
  PiArrowRight,
  PiArrowsLeftRight,
  PiFlagBanner,
  PiGraph,
  PiHandshake,
  PiLinkSimple,
  PiPath,
  PiShieldCheck,
  PiUserPlus,
  PiUsersThree,
} from "react-icons/pi";
import { prisma } from "@/lib/prisma";
import {
  Alert,
  Avatar,
  Badge,
  Card,
  CardHeader,
  EmptyState,
  Meter,
  PageHeader,
  Stat,
} from "@/components/ui";
import { NetworkGraph } from "@/components/network-graph";
import { PathChain } from "@/components/path-chain";
import { contactKindLabels, contactKindColors } from "@/lib/labels";
import { relationshipTypeLabels, warmBand, ContextGraph } from "@/lib/graph";
import { contactKindColor } from "@/components/tokens";
import { ContactForm } from "./contact-form";
import { RelationshipForm } from "./relationship-form";
import { DeleteButton } from "./delete-button";
import type { ContactKind } from "@prisma/client";

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
  const contactKind = new Map(contacts.map((c) => [c.id, c.kind]));

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
  const livePaths = prospects
    .map((p) => {
      const path = graph.findWarmPath(p.id);
      return path ? { prospectId: p.id, nodeIds: path.nodeIds } : null;
    })
    .filter((p): p is { prospectId: string; nodeIds: string[] } => p !== null);

  const kindsPresent = [...new Set(contacts.map((c) => c.kind))] as ContactKind[];

  return (
    <div>
      <PageHeader
        title="Jaringan Relasi & Path Finder"
        subtitle="Context graph dari aset relasi internal (tim, klien lama, mitra, komunitas). Sistem menemukan jalur perkenalan hangat ke prospek — bukan outreach dingin."
      />

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Stat label="Total kontak" value={contacts.length} icon={PiUsersThree} />
          <Stat label="Relasi" value={relationships.length} icon={PiLinkSimple} />
          <Stat label="Titik awal (tim)" value={teamCount} icon={PiFlagBanner} tone="lime" hint="Node awal pencarian jalur" />
        </div>

        <Card className="animate-fade-up">
          <CardHeader
            icon={PiGraph}
            title="Context graph"
            description="Kolom menunjukkan jarak langkah dari tim internal. Garis tebal = relasi lebih kuat."
          />
          {contacts.length === 0 ? (
            <EmptyState
              icon={PiGraph}
              title="Belum ada kontak"
              description="Tambahkan tim, klien lama, mitra, atau kenalan untuk membangun graph."
            />
          ) : (
            <>
              <div className="scrollbar-thin -mx-2 overflow-x-auto px-2">
                <NetworkGraph
                  contacts={contacts.map((c) => ({
                    id: c.id,
                    name: c.name,
                    kind: c.kind,
                    org: c.org,
                    prospectId: c.prospectId,
                  }))}
                  edges={relationships.map((r) => ({
                    id: r.id,
                    fromId: r.fromId,
                    toId: r.toId,
                    strength: r.strength,
                    type: r.type,
                  }))}
                  prospects={prospects.map((p) => ({ id: p.id, name: p.companyName }))}
                  paths={livePaths}
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-[12px] text-ink-2">
                {kindsPresent.map((k) => (
                  <span key={k} className="inline-flex items-center gap-2">
                    <span
                      className="size-3 rounded-full border-[1.5px]"
                      style={{ borderColor: contactKindColor[k], backgroundColor: `color-mix(in oklab, ${contactKindColor[k]} 18%, white)` }}
                    />
                    {contactKindLabels[k]}
                  </span>
                ))}
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-6 rounded-full bg-ink" />
                  Prospek
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="relative h-1.5 w-7 rounded-full bg-lime">
                    <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-ink" />
                  </span>
                  Jalur warm intro
                </span>
              </div>
            </>
          )}
        </Card>

        {prospects.length > 0 && (
          <Card className="animate-fade-up">
            <CardHeader icon={PiPath} title="Jalur perkenalan ke prospek" />
            <ul className="space-y-3">
              {prospects.map((p) => {
                const band = warmBand(p.warmIntroScore);
                return (
                  <li
                    key={p.id}
                    className="flex flex-col gap-3 rounded-2xl border border-line p-4 transition-colors hover:border-line-strong lg:flex-row lg:items-center"
                  >
                    <div className="min-w-0 lg:w-56">
                      <Link
                        href={`/prospects/${p.id}`}
                        className="group inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink"
                      >
                        {p.companyName}
                        <PiArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                      <div className="mt-2 flex items-center gap-2.5">
                        <Meter value={p.warmIntroScore ?? 0} color="#6250d6" className="h-1.5 w-24" label="Skor jalur" />
                        <span className="text-[12px] font-semibold text-ink tabular-nums">{p.warmIntroScore ?? 0}/100</span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      {p.warmIntroPath ? (
                        <PathChain names={p.warmIntroPath.split(" → ")} className="bg-surface-2/70" />
                      ) : (
                        <p className="text-[13px] text-muted">Belum ada jalur ditemukan</p>
                      )}
                    </div>
                    <Badge className={band.color}>{band.label}</Badge>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-8">
            <Card className="overflow-hidden p-0 sm:p-0">
              <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
                <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Kontak dalam graph</h3>
                <span className="text-[12px] text-muted">{contacts.length} kontak</span>
              </div>
              {contacts.length === 0 ? (
                <div className="p-5">
                  <EmptyState title="Belum ada kontak" description="Tambahkan kontak untuk membangun graph." />
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {contacts.map((c) => (
                    <li key={c.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2/60 sm:px-6">
                      <Avatar name={c.name} color={contactKindColor[c.kind]} />
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-[13.5px] font-semibold text-ink">
                          {c.name}
                          {c.consent && (
                            <Badge icon={PiHandshake} className="bg-emerald-50 text-emerald-700">
                              Bersedia intro
                            </Badge>
                          )}
                        </p>
                        <p className="mt-0.5 truncate text-[12px] text-muted">
                          {[c.org, c.role].filter(Boolean).join(" · ") || "—"}
                          {c.prospect && (
                            <span className="text-ink-2"> · jembatan ke {c.prospect.companyName}</span>
                          )}
                        </p>
                      </div>
                      <Badge dot className={contactKindColors[c.kind]}>
                        {contactKindLabels[c.kind]}
                      </Badge>
                      <DeleteButton id={c.id} kind="contact" />
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="overflow-hidden p-0 sm:p-0">
              <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
                <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Relasi</h3>
                <span className="text-[12px] text-muted">{relationships.length} relasi</span>
              </div>
              {relationships.length === 0 ? (
                <div className="p-5">
                  <EmptyState title="Belum ada relasi" description="Hubungkan dua kontak untuk membentuk jalur." />
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {relationships.map((r) => {
                    const fromKind = contactKind.get(r.fromId);
                    const toKind = contactKind.get(r.toId);
                    return (
                      <li key={r.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-2/60 sm:px-6">
                        <div className="flex shrink-0 -space-x-2">
                          <Avatar
                            name={contactName.get(r.fromId)}
                            color={fromKind ? contactKindColor[fromKind] : undefined}
                            size="sm"
                            className="ring-2 ring-surface"
                          />
                          <Avatar
                            name={contactName.get(r.toId)}
                            color={toKind ? contactKindColor[toKind] : undefined}
                            size="sm"
                            className="ring-2 ring-surface"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-1.5 text-[13.5px] font-medium text-ink">
                            {contactName.get(r.fromId) ?? "?"}
                            <PiArrowsLeftRight className="size-3.5 text-muted" />
                            {contactName.get(r.toId) ?? "?"}
                          </p>
                          <p className="mt-0.5 truncate text-[12px] text-muted">
                            {relationshipTypeLabels[r.type]}
                            {r.reason && ` · ${r.reason}`}
                          </p>
                        </div>
                        <div className="hidden w-32 shrink-0 sm:block">
                          <div className="mb-1 flex justify-between text-[11px] text-muted">
                            <span>Kekuatan</span>
                            <span className="font-semibold text-ink tabular-nums">{r.strength}</span>
                          </div>
                          <Meter value={r.strength} color="#0e100f" className="h-1.5" label="Kekuatan relasi" />
                        </div>
                        <DeleteButton id={r.id} kind="relationship" />
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>

          <div className="space-y-5 lg:col-span-4">
            <Card>
              <CardHeader icon={PiUserPlus} title="Tambah kontak" />
              <ContactForm
                prospects={await prisma.prospect.findMany({
                  orderBy: { companyName: "asc" },
                  select: { id: true, companyName: true },
                })}
              />
            </Card>
            <Card>
              <CardHeader icon={PiLinkSimple} title="Tambah relasi" />
              <RelationshipForm contacts={contacts.map((c) => ({ id: c.id, name: c.name }))} />
            </Card>
          </div>
        </div>

        <Alert tone="neutral" icon={PiShieldCheck} title="Guardrail">
          Jalur perkenalan adalah rekomendasi untuk meminta warm intro, bukan izin menghubungi massal. Hormati
          persetujuan kontak dan kebijakan kanal. Data relasi hanya dari sumber yang sah dan tercatat.
        </Alert>
      </div>
    </div>
  );
}
