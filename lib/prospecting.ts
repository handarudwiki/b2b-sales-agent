// Deterministic prospecting logic (BRD §15: avoid AI for deterministic decisions).
// Deduplication, segment detection, and lead scoring with a reviewable reason.

import type { BusinessSegment } from "@prisma/client";

export function normalize(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/\b(cv|pt|ud|toko|klinik|the|co|ltd)\b/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

// FR-03: build a dedupe key from normalized company + strongest available identifier.
export function buildDedupeKey(input: {
  companyName: string;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
}): string {
  const name = normalize(input.companyName);
  const identifier =
    normalize(input.website) ||
    normalize(input.email) ||
    normalize(input.phone) ||
    "";
  return identifier ? `${name}:${identifier}` : name;
}

// FR-04: categorize into a business segment from free-text signals.
const SEGMENT_KEYWORDS: { segment: BusinessSegment; words: string[] }[] = [
  { segment: "BEAUTY_CLINIC", words: ["klinik", "clinic", "aesthetic", "estetika", "skincare clinic"] },
  { segment: "HERBAL_STORE", words: ["toko herbal", "herbal store", "jamu", "apotek herbal"] },
  { segment: "INFLUENCER", words: ["influencer", "selebgram", "content creator", "personal brand", "beauty vlogger"] },
  { segment: "PRIVATE_LABEL", words: ["private label", "pabrik", "distributor", "corporation", "corp", "tbk"] },
  { segment: "UMKM", words: ["umkm", "ukm", "usaha kecil", "homemade", "rumahan"] },
  { segment: "NEW_BRAND", words: ["startup", "brand baru", "new brand", "rintisan", "launch"] },
];

export function detectSegment(
  text: string,
  fallback: BusinessSegment = "OTHER",
): BusinessSegment {
  const haystack = text.toLowerCase();
  for (const { segment, words } of SEGMENT_KEYWORDS) {
    if (words.some((w) => haystack.includes(w))) return segment;
  }
  return fallback;
}

export type ScoreInput = {
  segment: BusinessSegment;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  fitIndication?: string | null;
  // Module E — warm-introduction bonus (0-20) from the relationship path finder.
  warmIntroBonus?: number | null;
};

export type ScoreResult = {
  score: number; // 0-100
  reason: string; // reviewable justification (BR#2)
  isIncomplete: boolean; // BR#3
};

// Deterministic lead scoring. The score is a prioritization aid, NOT proof of
// intent to buy (BRD guardrail: "skor AI merupakan rekomendasi ... bukan bukti").
export function scoreProspect(input: ScoreInput): ScoreResult {
  const reasons: string[] = [];
  let score = 0;

  // Segment relevance to maklon herbal/kosmetik services.
  const segmentWeight: Record<BusinessSegment, number> = {
    BEAUTY_CLINIC: 30,
    NEW_BRAND: 28,
    PRIVATE_LABEL: 26,
    INFLUENCER: 24,
    HERBAL_STORE: 22,
    UMKM: 20,
    OTHER: 8,
  };
  const sw = segmentWeight[input.segment];
  score += sw;
  reasons.push(`Segmen "${input.segment}" relevan dengan layanan maklon (+${sw}).`);

  // Contactability — can the team actually reach them?
  if (input.website) {
    score += 15;
    reasons.push("Memiliki website/profil bisnis publik (+15).");
  }
  if (input.email) {
    score += 10;
    reasons.push("Email kontak tersedia (+10).");
  }
  if (input.phone) {
    score += 10;
    reasons.push("Nomor telepon tersedia (+10).");
  }
  if (input.location) {
    score += 7;
    reasons.push("Lokasi diketahui (+7).");
  }

  // Explicit fit signal added by the team.
  if (input.fitIndication && input.fitIndication.trim().length > 0) {
    score += 18;
    reasons.push("Ada indikasi kecocokan yang dicatat tim (+18).");
  }

  // Module E — warm introduction raises probability-to-deal vs cold outreach.
  const warm = Math.max(0, Math.min(20, Math.round(input.warmIntroBonus ?? 0)));
  if (warm > 0) {
    score += warm;
    reasons.push(
      `Ada jalur perkenalan hangat ke prospek ini (+${warm}). Warm intro meningkatkan peluang deal dibanding pendekatan dingin.`,
    );
  }

  score = Math.max(0, Math.min(100, score));

  // BR#3: flag incomplete prospects instead of fabricating data.
  const missing: string[] = [];
  if (!input.website) missing.push("website");
  if (!input.email && !input.phone) missing.push("kontak (email/telepon)");
  if (!input.location) missing.push("lokasi");
  const isIncomplete = missing.length > 0;
  if (isIncomplete) {
    reasons.push(
      `⚠ Data belum lengkap: ${missing.join(", ")}. Perlu verifikasi manual sebelum tindak lanjut.`,
    );
  }

  return { score, reason: reasons.join(" "), isIncomplete };
}

export function scoreBand(score: number | null | undefined): {
  label: string;
  color: string;
} {
  if (score == null) return { label: "Belum dinilai", color: "bg-slate-100 text-slate-600" };
  if (score >= 70) return { label: "Prioritas Tinggi", color: "bg-emerald-100 text-emerald-700" };
  if (score >= 45) return { label: "Prioritas Sedang", color: "bg-amber-100 text-amber-700" };
  return { label: "Prioritas Rendah", color: "bg-slate-100 text-slate-600" };
}
