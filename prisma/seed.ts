import { PrismaClient } from "@prisma/client";
import { buildDedupeKey, scoreProspect } from "../lib/prospecting";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // --- Users ---
  const marketing = await prisma.user.upsert({
    where: { email: "marketing@arbain.co.id" },
    update: {},
    create: { name: "Rina (Marketing)", email: "marketing@arbain.co.id", role: "MARKETING" },
  });
  const sales = await prisma.user.upsert({
    where: { email: "sales@arbain.co.id" },
    update: {},
    create: { name: "Budi (Sales)", email: "sales@arbain.co.id", role: "SALES" },
  });
  await prisma.user.upsert({
    where: { email: "management@arbain.co.id" },
    update: {},
    create: { name: "Pak Arba'in (Management)", email: "management@arbain.co.id", role: "MANAGEMENT" },
  });

  // --- Knowledge base (approved, grounds the AI assistant) ---
  const knowledge = [
    {
      category: "PROCESS" as const,
      question: "Apa itu jasa maklon herbal dan kosmetik?",
      answer:
        "Jasa maklon adalah layanan pengembangan dan produksi produk herbal atau kosmetik dengan merek Anda sendiri. Kami membantu dari diskusi kebutuhan, formulasi, pembuatan sampel, pengurusan legalitas, produksi, hingga produk siap dipasarkan.",
      keywords: ["maklon", "jasa maklon", "apa itu maklon", "herbal", "kosmetik"],
    },
    {
      category: "PROCESS" as const,
      question: "Bagaimana tahapan maklon dari diskusi hingga produksi?",
      answer:
        "Tahapannya: 1) Diskusi kebutuhan, 2) Formulasi oleh tim R&D, 3) Pembuatan sampel dan evaluasi, 4) Pengurusan legalitas, 5) Produksi setelah persyaratan terpenuhi, 6) Pengiriman produk. Setiap tahap melibatkan konfirmasi dari tim terkait.",
      keywords: ["tahapan", "proses", "alur", "langkah maklon"],
    },
    {
      category: "SERVICE_CATALOG" as const,
      question: "Apakah perusahaan melayani brand baru?",
      answer:
        "Ya, kami melayani pemilik brand baru, UMKM, klinik kecantikan, toko herbal, influencer, dan perusahaan yang ingin meluncurkan produk private label.",
      keywords: ["brand baru", "startup", "melayani", "umkm", "klinik", "influencer"],
    },
    {
      category: "PROCESS" as const,
      question: "Informasi apa yang perlu disiapkan sebelum konsultasi?",
      answer:
        "Siapkan gambaran konsep produk, kategori (herbal/kosmetik), target pasar, tahap bisnis Anda, dan gambaran kebutuhan pengembangan. Informasi ini membantu konsultasi lebih terarah.",
      keywords: ["persiapan", "sebelum konsultasi", "informasi", "disiapkan"],
    },
    {
      category: "PROCESS" as const,
      question: "Bagaimana proses formulasi dan pembuatan sampel?",
      answer:
        "Tim R&D mengembangkan formula sesuai konsep Anda, lalu dibuat sampel untuk dievaluasi. Hasil formulasi dan sampel dikonfirmasi oleh tim terkait; kami tidak menjanjikan hasil akhir sebelum evaluasi dilakukan.",
      keywords: ["formulasi", "sampel", "formula", "r&d"],
    },
    {
      category: "LEGALITY" as const,
      question: "Bagaimana proses pengurusan legalitas?",
      answer:
        "Kami membantu memberikan informasi mengenai dokumen dan legalitas yang diperlukan berdasarkan panduan resmi perusahaan. Detail persyaratan dan waktu dikonfirmasi oleh tim legalitas.",
      keywords: ["legalitas", "izin", "bpom", "dokumen", "legal"],
    },
    {
      category: "FAQ" as const,
      question: "Bagaimana cara menghubungi tim untuk konsultasi?",
      answer:
        "Anda dapat meminta jadwal konsultasi melalui asisten ini, dan tim sales akan menindaklanjuti. Beri tahu saya jika Anda ingin saya bantu jadwalkan.",
      keywords: ["kontak", "hubungi", "konsultasi", "jadwal", "cara menghubungi"],
    },
    {
      category: "CLAIM_GUIDELINE" as const,
      question: "Panduan klaim produk herbal dan kosmetik",
      answer:
        "AI tidak boleh membuat klaim pengobatan, khasiat, atau keamanan produk yang belum memiliki dasar dan persetujuan. Pertanyaan terkait klaim diteruskan ke tim terkait.",
      keywords: ["klaim", "khasiat", "pengobatan", "menyembuhkan"],
    },
  ];
  for (const k of knowledge) {
    const existing = await prisma.knowledgeEntry.findFirst({ where: { question: k.question } });
    if (!existing) await prisma.knowledgeEntry.create({ data: k });
  }

  // --- Prospects ---
  const rawProspects = [
    { companyName: "Glow Aesthetic Clinic", segment: "BEAUTY_CLINIC" as const, website: "glowclinic.co.id", email: "info@glowclinic.co.id", location: "Jakarta", fitIndication: "Ingin lini skincare sendiri" },
    { companyName: "Herbamart Nusantara", segment: "HERBAL_STORE" as const, website: "herbamart.id", phone: "081234567890", location: "Bandung" },
    { companyName: "Startup Beauty Lab", segment: "NEW_BRAND" as const, website: "beautylab.io", email: "founder@beautylab.io", location: "Surabaya", fitIndication: "Sedang riset formula serum" },
    { companyName: "Dinda Beauty (Influencer)", segment: "INFLUENCER" as const, email: "dinda@mgmt.com", location: "Jakarta" },
    { companyName: "UMKM Jamu Sehat", segment: "UMKM" as const, phone: "082198765432", location: "Yogyakarta" },
  ];
  for (const p of rawProspects) {
    const dedupeKey = buildDedupeKey(p);
    const existing = await prisma.prospect.findUnique({ where: { dedupeKey } });
    if (existing) continue;
    const { score, reason, isIncomplete } = scoreProspect(p);
    await prisma.prospect.create({
      data: {
        ...p,
        dedupeKey,
        priorityScore: score,
        scoreReason: reason,
        isIncomplete,
        dataSource: "Seed data (contoh)",
        lastVerifiedAt: new Date(),
        ownerId: sales.id,
        status: "NEW",
      },
    });
  }

  // --- Content sample ---
  const existingContent = await prisma.content.findFirst({ where: { title: { contains: "Panduan" } } });
  if (!existingContent) {
    await prisma.content.create({
      data: {
        title: "Panduan memulai brand herbal atau kosmetik",
        segment: "NEW_BRAND",
        goal: "Edukasi pemilik brand baru",
        body: "# Panduan memulai brand\n\nKonten contoh untuk demo. Gunakan generator untuk membuat draft lengkap.",
        status: "DRAFT",
        keywords: ["brand herbal", "jasa maklon"],
        authorId: marketing.id,
        impressions: 1200,
        visits: 340,
        attributedLeads: 8,
      },
    });
  }

  // --- Module E: Context graph (contacts + relationships) ---
  const glow = await prisma.prospect.findFirst({ where: { companyName: "Glow Aesthetic Clinic" } });
  const beautyLab = await prisma.prospect.findFirst({ where: { companyName: "Startup Beauty Lab" } });

  async function upsertContact(data: {
    name: string;
    kind: "TEAM" | "PAST_CLIENT" | "PARTNER" | "COMMUNITY" | "PERSON";
    org?: string;
    role?: string;
    source?: string;
    consent?: boolean;
    prospectId?: string | null;
    userId?: string | null;
  }) {
    const existing = await prisma.contact.findFirst({ where: { name: data.name } });
    if (existing) return existing;
    return prisma.contact.create({ data });
  }

  // Team start nodes
  const budi = await upsertContact({ name: "Budi (Sales)", kind: "TEAM", org: "CV Arba'in", role: "Sales", userId: sales.id, consent: true, source: "Internal" });
  const rina = await upsertContact({ name: "Rina (Marketing)", kind: "TEAM", org: "CV Arba'in", role: "Marketing", userId: marketing.id, consent: true, source: "Internal" });

  // Intermediaries
  const pastClient = await upsertContact({ name: "Hendra", kind: "PAST_CLIENT", org: "Herbal Jaya", role: "Owner", consent: true, source: "Riwayat klien" });
  const partner = await upsertContact({ name: "Dewi", kind: "PARTNER", org: "Beauty Distributor", role: "Direktur", consent: true, source: "Mitra" });
  const community = await upsertContact({ name: "Pak Yusuf", kind: "COMMUNITY", org: "Asosiasi Klinik", role: "Ketua", consent: false, source: "Komunitas" });

  // Bridge contacts into prospects
  const glowBridge = glow
    ? await upsertContact({ name: "dr. Lina", kind: "PERSON", org: "Glow Aesthetic Clinic", role: "Pemilik", consent: true, source: "Referral", prospectId: glow.id })
    : null;
  const labBridge = beautyLab
    ? await upsertContact({ name: "Andra", kind: "PERSON", org: "Startup Beauty Lab", role: "Founder", consent: true, source: "LinkedIn", prospectId: beautyLab.id })
    : null;

  async function link(fromId: string, toId: string, type: "COLLEAGUE" | "FRIEND" | "FORMER_CLIENT" | "BUSINESS" | "COMMUNITY" | "FAMILY" | "REFERRAL", strength: number, reason: string) {
    const existing = await prisma.relationship.findFirst({
      where: { OR: [{ fromId, toId }, { fromId: toId, toId: fromId }] },
    });
    if (existing) return;
    await prisma.relationship.create({ data: { fromId, toId, type, strength, reason, source: "Seed" } });
  }

  await link(budi.id, rina.id, "COLLEAGUE", 90, "Satu tim");
  await link(budi.id, pastClient.id, "FORMER_CLIENT", 80, "Klien proyek 2023");
  await link(rina.id, partner.id, "BUSINESS", 70, "Mitra distribusi");
  await link(partner.id, community.id, "COMMUNITY", 55, "Satu asosiasi");
  // Path into Glow: Budi → Hendra → dr. Lina (2 hops, kuat)
  if (glowBridge) await link(pastClient.id, glowBridge.id, "FRIEND", 75, "Teman lama dr. Lina");
  // Path into Beauty Lab: Rina → Dewi → Andra (via partner)
  if (labBridge) await link(partner.id, labBridge.id, "REFERRAL", 60, "Dewi kenal Andra lewat event");

  // Compute warm paths for bridged prospects
  const { ContextGraph, warmIntroBonus } = await import("../lib/graph");
  const allContacts = await prisma.contact.findMany({
    select: { id: true, name: true, kind: true, org: true, prospectId: true, consent: true },
  });
  const allRels = await prisma.relationship.findMany({
    select: { fromId: true, toId: true, type: true, strength: true },
  });
  const graph = new ContextGraph(allContacts, allRels);
  for (const target of [glow, beautyLab]) {
    if (!target) continue;
    const path = graph.findWarmPath(target.id);
    const bonus = warmIntroBonus(path?.score ?? 0);
    const { scoreProspect } = await import("../lib/prospecting");
    const { score, reason, isIncomplete } = scoreProspect({
      segment: target.segment,
      website: target.website,
      email: target.email,
      phone: target.phone,
      location: target.location,
      fitIndication: target.fitIndication,
      warmIntroBonus: bonus,
    });
    await prisma.prospect.update({
      where: { id: target.id },
      data: {
        warmIntroScore: path?.score ?? 0,
        warmIntroPath: path?.summary ?? null,
        warmIntroReason: path?.reason ?? null,
        priorityScore: score,
        scoreReason: reason,
        isIncomplete,
      },
    });
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
