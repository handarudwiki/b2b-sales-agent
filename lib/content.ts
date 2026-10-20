// Module C — AI Marketing & GEO Content generation (rule-based drafting + GEO scoring).
// Generates a structured draft and SEO/GEO recommendations the marketing team reviews.
// Claims about health/cosmetics must be validated before publish (BR#7, NFR-08).

import type { BusinessSegment } from "@prisma/client";

type SegmentTemplate = {
  angle: string;
  intro: string;
  sections: { heading: string; body: string }[];
  faqPairs: { q: string; a: string }[];
  keywords: string[];
};

const TEMPLATES: Record<BusinessSegment, SegmentTemplate> = {
  NEW_BRAND: {
    angle: "panduan memulai brand herbal atau kosmetik",
    intro:
      "Memulai brand herbal atau kosmetik sendiri bisa terasa rumit. Panduan ini merangkum langkah awal yang perlu dipahami pemilik brand baru sebelum masuk ke proses pengembangan produk.",
    sections: [
      { heading: "Menentukan Konsep Produk", body: "Mulailah dengan kejelasan target pasar, masalah yang ingin diselesaikan, dan positioning brand Anda." },
      { heading: "Memahami Jasa Maklon", body: "Jasa maklon membantu mewujudkan ide menjadi produk jadi, mulai dari diskusi kebutuhan, formulasi, sampel, legalitas, hingga produksi." },
      { heading: "Apa yang Perlu Disiapkan", body: "Siapkan gambaran konsep, referensi produk, target pasar, dan perkiraan kebutuhan agar diskusi awal lebih terarah." },
    ],
    faqPairs: [
      { q: "Apakah brand baru bisa menggunakan jasa maklon?", a: "Ya, jasa maklon umum digunakan oleh pemilik brand baru untuk mengembangkan produk dengan merek sendiri." },
      { q: "Apa langkah pertama memulai brand?", a: "Mulai dari menentukan konsep, target pasar, dan kategori produk sebelum berkonsultasi." },
    ],
    keywords: ["brand herbal", "brand kosmetik", "memulai brand", "jasa maklon", "private label"],
  },
  UMKM: {
    angle: "tahapan pengembangan produk private label untuk UMKM",
    intro:
      "UMKM yang ingin naik kelas sering mempertimbangkan produk private label. Artikel ini menjelaskan tahapan pengembangan produk secara ringkas.",
    sections: [
      { heading: "Kenapa Private Label", body: "Private label memungkinkan UMKM memiliki produk bermerek sendiri tanpa membangun pabrik." },
      { heading: "Tahapan Pengembangan", body: "Diskusi kebutuhan, formulasi, pembuatan sampel, legalitas, lalu produksi sesuai kesiapan." },
      { heading: "Persiapan Sebelum Konsultasi", body: "Catat kategori produk, target pasar, dan perkiraan kebutuhan volume." },
    ],
    faqPairs: [
      { q: "Apa itu produk private label?", a: "Produk yang diproduksi pihak lain namun dijual dengan merek Anda sendiri." },
      { q: "Apakah UMKM bisa maklon dalam jumlah kecil?", a: "Ketentuan volume dikonfirmasi tim saat konsultasi sesuai kebijakan perusahaan." },
    ],
    keywords: ["umkm", "private label", "pengembangan produk", "maklon umkm"],
  },
  BEAUTY_CLINIC: {
    angle: "pertanyaan yang perlu disiapkan klinik kecantikan sebelum konsultasi",
    intro:
      "Klinik kecantikan yang ingin memiliki lini produk sendiri perlu mempersiapkan beberapa hal sebelum berkonsultasi mengenai pengembangan produk.",
    sections: [
      { heading: "Mendefinisikan Kebutuhan Produk", body: "Tentukan jenis produk, karakteristik yang diinginkan, dan positioning untuk pasien klinik." },
      { heading: "Proses Pengembangan", body: "Pahami alur dari diskusi kebutuhan hingga produksi agar ekspektasi selaras." },
      { heading: "Informasi untuk Konsultasi", body: "Siapkan konsep, target pasar, dan pertanyaan teknis utama." },
    ],
    faqPairs: [
      { q: "Apakah klinik bisa membuat produk sendiri?", a: "Ya, melalui jasa maklon klinik dapat mengembangkan produk dengan merek klinik." },
      { q: "Apa yang perlu disiapkan sebelum konsultasi?", a: "Konsep produk, target pasar, dan daftar pertanyaan utama." },
    ],
    keywords: ["klinik kecantikan", "produk klinik", "maklon kosmetik", "skincare klinik"],
  },
  HERBAL_STORE: {
    angle: "panduan awal memahami proses pengembangan produk herbal",
    intro:
      "Toko herbal yang ingin memiliki produk sendiri dapat memahami proses pengembangan produk herbal melalui panduan singkat ini.",
    sections: [
      { heading: "Memahami Produk Herbal", body: "Kenali kategori produk herbal yang sesuai dengan pasar toko Anda." },
      { heading: "Alur Pengembangan", body: "Diskusi kebutuhan, formulasi, sampel, legalitas, lalu produksi." },
      { heading: "Persiapan Konsultasi", body: "Siapkan konsep, target konsumen, dan referensi produk." },
    ],
    faqPairs: [
      { q: "Apakah toko herbal bisa membuat produk bermerek sendiri?", a: "Ya, melalui jasa maklon herbal dengan merek toko Anda." },
      { q: "Apa langkah awalnya?", a: "Mulai dari konsep produk dan konsultasi kebutuhan." },
    ],
    keywords: ["toko herbal", "produk herbal", "maklon herbal", "jamu"],
  },
  INFLUENCER: {
    angle: "pertimbangan bisnis sebelum meluncurkan produk personal brand",
    intro:
      "Influencer yang ingin meluncurkan produk sendiri sebaiknya mempertimbangkan beberapa aspek bisnis sebelum memulai pengembangan.",
    sections: [
      { heading: "Memahami Audiens", body: "Produk yang kuat berangkat dari kebutuhan nyata audiens Anda." },
      { heading: "Proses di Balik Produk", body: "Pahami alur maklon dari ide hingga produk siap edar." },
      { heading: "Persiapan Konsultasi", body: "Siapkan konsep, kategori produk, dan ekspektasi peluncuran." },
    ],
    faqPairs: [
      { q: "Bagaimana influencer membuat produk sendiri?", a: "Melalui jasa maklon yang membantu mewujudkan konsep menjadi produk bermerek pribadi." },
      { q: "Apa yang perlu dipersiapkan?", a: "Konsep produk, pemahaman audiens, dan tujuan peluncuran." },
    ],
    keywords: ["personal brand", "produk influencer", "maklon kosmetik", "launch produk"],
  },
  PRIVATE_LABEL: {
    angle: "panduan private label untuk perusahaan",
    intro:
      "Perusahaan yang ingin meluncurkan lini private label dapat memahami alur kerja sama maklon melalui panduan ini.",
    sections: [
      { heading: "Model Private Label", body: "Produksi oleh mitra maklon dengan merek perusahaan Anda." },
      { heading: "Alur Kerja Sama", body: "Diskusi kebutuhan, formulasi, sampel, legalitas, dan produksi." },
      { heading: "Persiapan", body: "Siapkan spesifikasi produk, target pasar, dan kebutuhan volume." },
    ],
    faqPairs: [
      { q: "Apa keuntungan private label?", a: "Memiliki produk bermerek sendiri tanpa membangun fasilitas produksi." },
      { q: "Bagaimana memulai kerja sama?", a: "Mulai dari konsultasi kebutuhan dengan tim." },
    ],
    keywords: ["private label", "maklon", "produksi kosmetik", "produksi herbal"],
  },
  OTHER: {
    angle: "pengenalan jasa maklon herbal dan kosmetik",
    intro:
      "Jasa maklon membantu mewujudkan ide produk menjadi produk jadi bermerek sendiri. Artikel ini mengenalkan alur dan manfaatnya.",
    sections: [
      { heading: "Apa Itu Jasa Maklon", body: "Layanan pengembangan dan produksi produk dengan merek pelanggan." },
      { heading: "Alur Umum", body: "Diskusi kebutuhan, formulasi, sampel, legalitas, produksi, pengiriman." },
      { heading: "Mulai dari Mana", body: "Mulai dari konsep dan konsultasi kebutuhan." },
    ],
    faqPairs: [
      { q: "Apa itu jasa maklon?", a: "Jasa pengembangan dan produksi produk dengan merek Anda sendiri." },
      { q: "Bagaimana memulainya?", a: "Mulai dari konsultasi kebutuhan dengan tim." },
    ],
    keywords: ["jasa maklon", "maklon herbal", "maklon kosmetik"],
  },
};

export type GeneratedContent = {
  title: string;
  body: string;
  metaTitle: string;
  metaDescription: string;
  headings: string[];
  faqPairs: { q: string; a: string }[];
  keywords: string[];
};

export function generateContent(
  segment: BusinessSegment,
  goal?: string,
): GeneratedContent {
  const t = TEMPLATES[segment];
  const title = capitalize(t.angle);
  const headings = t.sections.map((s) => s.heading);

  const bodyParts: string[] = [`# ${title}`, "", t.intro, ""];
  if (goal && goal.trim()) {
    bodyParts.push(`> Tujuan konten: ${goal.trim()}`, "");
  }
  for (const s of t.sections) {
    bodyParts.push(`## ${s.heading}`, "", s.body, "");
  }
  bodyParts.push("## Pertanyaan yang Sering Diajukan", "");
  for (const f of t.faqPairs) {
    bodyParts.push(`### ${f.q}`, "", f.a, "");
  }
  bodyParts.push(
    "---",
    "*Catatan: draft ini perlu ditinjau tim marketing untuk akurasi, klaim, dan kesesuaian merek sebelum dipublikasikan. Klaim kesehatan/kosmetik wajib divalidasi.*",
  );

  return {
    title,
    body: bodyParts.join("\n"),
    metaTitle: `${title} | CV Arba'in Jaya Mandiri`.slice(0, 60),
    metaDescription: t.intro.slice(0, 155),
    headings,
    faqPairs: t.faqPairs,
    keywords: t.keywords,
  };
}

// FR-13: GEO readiness heuristic (0-100). Rewards structure favored by AI search.
export type GeoInput = {
  title: string;
  body: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  headings?: string[];
  faqPairs?: unknown;
  keywords?: string[];
};

export type GeoResult = { score: number; recommendations: string[] };

export function evaluateGeo(input: GeoInput): GeoResult {
  const recs: string[] = [];
  let score = 0;

  const words = input.body.trim().split(/\s+/).filter(Boolean).length;
  if (words >= 300) score += 20;
  else recs.push(`Perpanjang konten (${words} kata) menjadi minimal 300 kata untuk konteks yang cukup.`);

  const headingCount = (input.body.match(/^#{2,3}\s/gm) || []).length;
  if (headingCount >= 3) score += 20;
  else recs.push("Tambahkan minimal 3 heading (H2/H3) untuk struktur yang mudah dipahami mesin.");

  const faqCount = Array.isArray(input.faqPairs) ? input.faqPairs.length : 0;
  if (faqCount >= 2) score += 20;
  else recs.push("Sertakan minimal 2 pasangan tanya-jawab (format Q&A disukai AI search).");

  if (input.metaTitle && input.metaTitle.length >= 15 && input.metaTitle.length <= 60) score += 15;
  else recs.push("Atur meta title 15–60 karakter.");

  if (input.metaDescription && input.metaDescription.length >= 70 && input.metaDescription.length <= 160) score += 15;
  else recs.push("Atur meta description 70–160 karakter.");

  if ((input.keywords?.length ?? 0) >= 3) score += 10;
  else recs.push("Tambahkan minimal 3 kata kunci relevan.");

  if (recs.length === 0) recs.push("Struktur konten sudah memenuhi rekomendasi dasar SEO/GEO.");

  return { score: Math.min(100, score), recommendations: recs };
}

// NFR-08 / BR#7: simple claim guardrail flagging unverified health/efficacy claims.
const RISKY_CLAIM_PATTERNS = [
  /menyembuhkan/i, /mengobati/i, /obat/i, /100%\s*(aman|ampuh|efektif)/i,
  /dijamin/i, /pasti\s*(sembuh|berhasil)/i, /tanpa\s*efek\s*samping/i,
  /terbukti\s*secara\s*medis/i, /bpom\s*pasti/i, /halal\s*pasti/i,
];

export function detectRiskyClaims(body: string): string[] {
  const found = new Set<string>();
  for (const re of RISKY_CLAIM_PATTERNS) {
    const m = body.match(re);
    if (m) found.add(m[0]);
  }
  return [...found];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
