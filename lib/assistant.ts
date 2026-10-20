// WhatsApp AI Sales Assistant engine.
// Grounded, rule-based retrieval over the APPROVED knowledge base (NFR-05).
// It never fabricates service info; unknown questions escalate to a human (BR#6).

import type { KnowledgeEntry, LeadStatus } from "@prisma/client";

const STOPWORDS = new Set([
  "yang", "dan", "atau", "untuk", "dengan", "apa", "apakah", "bagaimana",
  "cara", "saya", "kami", "ini", "itu", "ke", "di", "dari", "pada", "adalah",
  "the", "is", "a", "an", "of", "to", "for", "how", "what", "do", "you",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

export type GroundedAnswer = {
  answer: string;
  groundedOnIds: string[];
  isFallback: boolean;
};

const FALLBACK_MESSAGE =
  "Mohon maaf, informasi ini belum tersedia dalam basis pengetahuan resmi kami. " +
  "Saya akan meneruskan pertanyaan Anda ke tim sales agar dijawab dengan akurat. " +
  "Apakah Anda ingin saya jadwalkan konsultasi dengan tim?";

// BR#4: price, minimum order, cost estimate, timeline, and special terms may
// only be answered from an official source. Without an approved entry carrying
// that info, these questions are routed to a human instead of guessed.
const GUARDED_TOPIC_PATTERNS = [
  /\bharga\b/i, /\bbiaya\b/i, /\btarif\b/i, /\bongkos\b/i,
  /\bminimum\s*order\b/i, /\bmoq\b/i, /\bminimal\s*(order|pesan|produksi)\b/i,
  /\bberapa\s*(lama|harga|biaya|cepat)\b/i, /\bkapan\s*(selesai|jadi|produksi)\b/i,
  /\bdurasi\b/i, /\bdiskon\b/i, /\bpenawaran\b/i,
];

function isGuardedTopic(question: string): boolean {
  return GUARDED_TOPIC_PATTERNS.some((re) => re.test(question));
}

// Retrieve the best-matching approved knowledge entry by keyword overlap.
export function answerFromKnowledge(
  question: string,
  entries: Pick<KnowledgeEntry, "id" | "question" | "answer" | "keywords" | "isApproved">[],
): GroundedAnswer {
  const approved = entries.filter((e) => e.isApproved);
  const qTokens = new Set(tokenize(question));
  if (qTokens.size === 0 || approved.length === 0) {
    return { answer: FALLBACK_MESSAGE, groundedOnIds: [], isFallback: true };
  }

  // Guarded commercial topics must come from an entry whose keywords explicitly
  // cover that topic; otherwise escalate rather than answer from a loose match.
  const guarded = isGuardedTopic(question);

  let best: { entry: (typeof approved)[number]; score: number; kwHit: boolean } | null = null;
  for (const entry of approved) {
    const entryTokens = new Set([
      ...tokenize(entry.question),
      ...entry.keywords.flatMap((k) => tokenize(k)),
    ]);
    let overlap = 0;
    for (const t of qTokens) if (entryTokens.has(t)) overlap++;
    // keyword hits weigh extra
    const kwHit = entry.keywords.some((k) =>
      question.toLowerCase().includes(k.toLowerCase()),
    );
    const score = overlap + (kwHit ? 2 : 0);
    if (score > 0 && (!best || score > best.score)) best = { entry, score, kwHit };
  }

  // Require a reasonably confident match: either a direct keyword hit or at
  // least two overlapping meaningful tokens. A single loose token is not enough.
  const confident = best != null && (best.kwHit || best.score >= 2);
  if (!best || !confident) {
    return { answer: FALLBACK_MESSAGE, groundedOnIds: [], isFallback: true };
  }

  // For guarded commercial topics, only answer if the matched entry explicitly
  // targets that topic via a keyword hit (approved official info). Else escalate.
  if (guarded && !best.kwHit) {
    return { answer: FALLBACK_MESSAGE, groundedOnIds: [], isFallback: true };
  }

  return {
    answer: best.entry.answer,
    groundedOnIds: [best.entry.id],
    isFallback: false,
  };
}

// Lead Qualification Framework (BRD §7). Signals captured through conversation.
export type QualificationSignals = {
  productInterest?: string | null;
  businessStage?: string | null;
  targetMarket?: string | null;
  developmentReadiness?: string | null;
  timeline?: string | null;
  budgetReadiness?: string | null;
  decisionAuthority?: string | null;
};

export type QualificationResult = {
  status: LeadStatus;
  filledCount: number;
  totalCount: number;
  reason: string;
};

// Deterministic lead classification based on how much is known + product fit.
export function classifyLead(signals: QualificationSignals): QualificationResult {
  const fields = [
    signals.productInterest,
    signals.businessStage,
    signals.targetMarket,
    signals.developmentReadiness,
    signals.timeline,
    signals.budgetReadiness,
    signals.decisionAuthority,
  ];
  const filledCount = fields.filter((f) => f && f.trim().length > 0).length;
  const totalCount = fields.length;

  const hasProductFit =
    !!signals.productInterest &&
    /herbal|kosmetik|cosmetic|skincare|jamu|supplement|suplemen|minuman/i.test(
      signals.productInterest,
    );

  let status: LeadStatus;
  let reason: string;

  if (!hasProductFit && filledCount <= 1) {
    status = "UNQUALIFIED";
    reason = "Kebutuhan belum jelas dan belum ada kecocokan produk dengan layanan maklon.";
  } else if (!hasProductFit) {
    status = "EARLY_STAGE";
    reason = "Masih tahap eksplorasi; kategori produk belum jelas termasuk layanan maklon.";
  } else if (filledCount >= 4) {
    status = "QUALIFIED";
    reason = `Kecocokan produk terkonfirmasi dan ${filledCount}/${totalCount} kriteria kualifikasi terisi.`;
  } else {
    status = "EARLY_STAGE";
    reason = `Produk sesuai layanan, namun baru ${filledCount}/${totalCount} kriteria terisi. Perlu edukasi lebih lanjut.`;
  }

  return { status, filledCount, totalCount, reason };
}

// FR-09: generate a needs summary for sales (so they don't repeat basic questions).
export function buildNeedsSummary(
  signals: QualificationSignals,
  classification: QualificationResult,
): string {
  const rows: string[] = [];
  const add = (label: string, v?: string | null) => {
    rows.push(`- ${label}: ${v && v.trim() ? v.trim() : "belum dikonfirmasi"}`);
  };
  add("Minat produk", signals.productInterest);
  add("Tahap bisnis", signals.businessStage);
  add("Target pasar", signals.targetMarket);
  add("Kesiapan pengembangan", signals.developmentReadiness);
  add("Timeline", signals.timeline);
  add("Kesiapan anggaran", signals.budgetReadiness);
  add("Otoritas keputusan", signals.decisionAuthority);

  return [
    `Status kualifikasi: ${classification.status} (${classification.filledCount}/${classification.totalCount} kriteria terisi).`,
    `Alasan: ${classification.reason}`,
    "",
    "Ringkasan kebutuhan:",
    ...rows,
    "",
    "Catatan: informasi di atas berasal dari percakapan awal dan perlu dikonfirmasi saat konsultasi.",
  ].join("\n");
}

export const assistantConstants = { FALLBACK_MESSAGE };
