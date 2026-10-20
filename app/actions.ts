"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  buildDedupeKey,
  detectSegment,
  scoreProspect,
} from "@/lib/prospecting";
import {
  answerFromKnowledge,
  classifyLead,
  buildNeedsSummary,
  type QualificationSignals,
} from "@/lib/assistant";
import { generateContent, evaluateGeo, detectRiskyClaims } from "@/lib/content";
import { parseCsv } from "@/lib/csv";
import { ContextGraph, warmIntroBonus } from "@/lib/graph";
import { runDiscovery, resolveSource, type ScoredCandidate } from "@/lib/discovery";
import type {
  BusinessSegment,
  ProspectStatus,
  LeadStatus,
  MeetingStatus,
  ContentStatus,
  KnowledgeCategory,
  ContactKind,
  RelationshipType,
} from "@prisma/client";

async function log(action: string, entity?: string, detail?: unknown) {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        entity,
        detail: detail === undefined ? undefined : (detail as object),
      },
    });
  } catch {
    // logging must never break the main flow (NFR-02)
  }
}

// ---------------------------------------------------------------------------
// Module A — Prospects
// ---------------------------------------------------------------------------

const prospectSchema = z.object({
  companyName: z.string().min(1, "Nama perusahaan wajib diisi"),
  segment: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  fitIndication: z.string().optional(),
  dataSource: z.string().optional(),
});

export async function createProspect(formData: FormData) {
  const parsed = prospectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  const d = parsed.data;
  const clean = (v?: string) => (v && v.trim() ? v.trim() : undefined);

  const segment: BusinessSegment =
    (clean(d.segment) as BusinessSegment) ||
    detectSegment(`${d.companyName} ${d.fitIndication ?? ""}`);

  const dedupeKey = buildDedupeKey({
    companyName: d.companyName,
    website: d.website,
    email: d.email,
    phone: d.phone,
  });

  const existing = await prisma.prospect.findUnique({ where: { dedupeKey } });
  if (existing) {
    return { error: "Prospek dengan identitas serupa sudah ada (duplikat terdeteksi)." };
  }

  const { score, reason, isIncomplete } = scoreProspect({
    segment,
    website: clean(d.website),
    email: clean(d.email),
    phone: clean(d.phone),
    location: clean(d.location),
    fitIndication: clean(d.fitIndication),
  });

  const created = await prisma.prospect.create({
    data: {
      companyName: d.companyName.trim(),
      segment,
      website: clean(d.website),
      location: clean(d.location),
      contactPerson: clean(d.contactPerson),
      phone: clean(d.phone),
      email: clean(d.email),
      fitIndication: clean(d.fitIndication),
      dataSource: clean(d.dataSource) ?? "Entri manual",
      lastVerifiedAt: new Date(),
      priorityScore: score,
      scoreReason: reason,
      isIncomplete,
      dedupeKey,
    },
  });
  await log("prospect.create", `Prospect:${created.id}`, { score });
  revalidatePath("/prospects");
  revalidatePath("/");
  redirect(`/prospects/${created.id}`);
}

export async function importProspectsCsv(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Pilih file CSV terlebih dahulu." };
  }
  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length === 0) return { error: "CSV kosong atau tidak terbaca." };

  let imported = 0;
  let duplicates = 0;
  let flagged = 0;

  for (const row of rows) {
    const companyName = row["companyname"] || row["company"] || row["nama"] || row["name"];
    if (!companyName) continue;
    const website = row["website"] || row["web"] || undefined;
    const email = row["email"] || undefined;
    const phone = row["phone"] || row["telepon"] || row["hp"] || undefined;
    const location = row["location"] || row["lokasi"] || row["kota"] || undefined;
    const fitIndication = row["fit"] || row["catatan"] || row["note"] || undefined;

    const dedupeKey = buildDedupeKey({ companyName, website, email, phone });
    const existing = await prisma.prospect.findUnique({ where: { dedupeKey } });
    if (existing) {
      duplicates++;
      continue;
    }

    const segment = (row["segment"]?.toUpperCase() as BusinessSegment) ||
      detectSegment(`${companyName} ${row["segment"] ?? ""} ${fitIndication ?? ""}`);

    const { score, reason, isIncomplete } = scoreProspect({
      segment,
      website,
      email,
      phone,
      location,
      fitIndication,
    });
    if (isIncomplete) flagged++;

    await prisma.prospect.create({
      data: {
        companyName: companyName.trim(),
        segment,
        website,
        email,
        phone,
        location,
        fitIndication,
        dataSource: `Import CSV (${file.name})`,
        lastVerifiedAt: new Date(),
        priorityScore: score,
        scoreReason: reason,
        isIncomplete,
        dedupeKey,
      },
    });
    imported++;
  }

  await log("prospect.import", undefined, { imported, duplicates, flagged });
  revalidatePath("/prospects");
  revalidatePath("/");
  return { success: `Impor selesai: ${imported} prospek baru, ${duplicates} duplikat dilewati, ${flagged} ditandai belum lengkap.` };
}

export async function updateProspectStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as ProspectStatus;
  await prisma.prospect.update({ where: { id }, data: { status } });
  await log("prospect.status", `Prospect:${id}`, { status });
  revalidatePath(`/prospects/${id}`);
  revalidatePath("/prospects");
  revalidatePath("/");
}

export async function addProspectNote(formData: FormData) {
  const prospectId = String(formData.get("prospectId"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  await prisma.prospectNote.create({ data: { prospectId, body } });
  await log("prospect.note", `Prospect:${prospectId}`);
  revalidatePath(`/prospects/${prospectId}`);
}

export async function reverifyProspect(formData: FormData) {
  const id = String(formData.get("id"));
  const p = await prisma.prospect.findUnique({ where: { id } });
  if (!p) return;
  const { score, reason, isIncomplete } = scoreProspect({
    segment: p.segment,
    website: p.website,
    email: p.email,
    phone: p.phone,
    location: p.location,
    fitIndication: p.fitIndication,
  });
  await prisma.prospect.update({
    where: { id },
    data: { priorityScore: score, scoreReason: reason, isIncomplete, lastVerifiedAt: new Date() },
  });
  await log("prospect.reverify", `Prospect:${id}`, { score });
  revalidatePath(`/prospects/${id}`);
}

// ---------------------------------------------------------------------------
// Module B — WhatsApp AI Sales Assistant
// ---------------------------------------------------------------------------

export async function startConversation(formData: FormData) {
  const contactName = String(formData.get("contactName") ?? "").trim() || null;
  const contactPhone = String(formData.get("contactPhone") ?? "").trim() || null;
  const convo = await prisma.conversation.create({
    data: { contactName, contactPhone, channel: "WHATSAPP_SIMULATED" },
  });
  // AI greeting (grounded, standard opener)
  await prisma.message.create({
    data: {
      conversationId: convo.id,
      sender: "AI",
      body:
        "Halo! 👋 Terima kasih telah menghubungi CV Arba'in Jaya Mandiri. Saya asisten AI yang membantu menjelaskan jasa maklon herbal & kosmetik. Boleh saya tahu produk seperti apa yang ingin Anda kembangkan?",
    },
  });
  await log("conversation.start", `Conversation:${convo.id}`);
  revalidatePath("/assistant");
  redirect(`/assistant/${convo.id}`);
}

export async function sendMessage(formData: FormData) {
  const conversationId = String(formData.get("conversationId"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const convo = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!convo) return;

  const startedAt = Date.now();
  await prisma.message.create({
    data: { conversationId, sender: "PROSPECT", body },
  });

  // If handed off to a human, AI does not auto-respond (BR#5, FR-10).
  if (convo.handoffRequested) {
    revalidatePath(`/assistant/${conversationId}`);
    return;
  }

  const entries = await prisma.knowledgeEntry.findMany({
    where: { isApproved: true },
    select: { id: true, question: true, answer: true, keywords: true, isApproved: true },
  });
  const grounded = answerFromKnowledge(body, entries);

  const firstResponseMs =
    convo.firstResponseMs == null ? Date.now() - startedAt : convo.firstResponseMs;

  await prisma.message.create({
    data: {
      conversationId,
      sender: "AI",
      body: grounded.answer,
      groundedOnIds: grounded.groundedOnIds,
      isFallback: grounded.isFallback,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      firstResponseMs,
      // auto-request handoff when AI cannot answer (NFR-02, BR#6)
      handoffRequested: grounded.isFallback ? true : convo.handoffRequested,
      handoffReason: grounded.isFallback
        ? "AI tidak menemukan jawaban pada basis pengetahuan resmi."
        : convo.handoffReason,
    },
  });

  await log("ai.answer", `Conversation:${conversationId}`, {
    fallback: grounded.isFallback,
    grounded: grounded.groundedOnIds,
  });
  revalidatePath(`/assistant/${conversationId}`);
}

const signalKeys: (keyof QualificationSignals)[] = [
  "productInterest",
  "businessStage",
  "targetMarket",
  "developmentReadiness",
  "timeline",
  "budgetReadiness",
  "decisionAuthority",
];

export async function updateQualification(formData: FormData) {
  const conversationId = String(formData.get("conversationId"));
  const signals: QualificationSignals = {};
  for (const key of signalKeys) {
    const v = String(formData.get(key) ?? "").trim();
    signals[key] = v || null;
  }
  const classification = classifyLead(signals);
  const summary = buildNeedsSummary(signals, classification);

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { ...signals, leadStatus: classification.status, needsSummary: summary },
  });
  await log("ai.qualify", `Conversation:${conversationId}`, { status: classification.status });
  revalidatePath(`/assistant/${conversationId}`);
}

export async function requestHandoff(formData: FormData) {
  const conversationId = String(formData.get("conversationId"));
  const reason = String(formData.get("reason") ?? "").trim() || "Diminta oleh pengguna/sales.";
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { handoffRequested: true, handoffReason: reason },
  });
  await prisma.message.create({
    data: {
      conversationId,
      sender: "AI",
      body:
        "Baik, saya teruskan percakapan ini ke tim sales kami. Tim akan menghubungi Anda untuk konsultasi lebih lanjut. Terima kasih! 🙏",
      isFallback: true,
    },
  });
  await log("conversation.handoff", `Conversation:${conversationId}`);
  revalidatePath(`/assistant/${conversationId}`);
}

export async function setLeadStatus(formData: FormData) {
  const conversationId = String(formData.get("conversationId"));
  const leadStatus = String(formData.get("leadStatus")) as LeadStatus;
  await prisma.conversation.update({ where: { id: conversationId }, data: { leadStatus } });
  await log("lead.status", `Conversation:${conversationId}`, { leadStatus });
  revalidatePath(`/assistant/${conversationId}`);
  revalidatePath("/");
}

// ---------------------------------------------------------------------------
// Meetings
// ---------------------------------------------------------------------------

export async function scheduleMeeting(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const scheduledAt = String(formData.get("scheduledAt") ?? "");
  const prospectId = String(formData.get("prospectId") ?? "") || null;
  const conversationId = String(formData.get("conversationId") ?? "") || null;
  if (!title || !scheduledAt) return;

  const meeting = await prisma.meeting.create({
    data: {
      title,
      scheduledAt: new Date(scheduledAt),
      prospectId,
      conversationId,
      status: "SCHEDULED",
    },
  });

  if (prospectId) {
    await prisma.prospect.update({
      where: { id: prospectId },
      data: { status: "MEETING_SCHEDULED" },
    });
  }
  if (conversationId) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { leadStatus: "MEETING_SCHEDULED" },
    });
  }
  await log("meeting.schedule", `Meeting:${meeting.id}`);
  revalidatePath("/meetings");
  revalidatePath("/");
  if (conversationId) revalidatePath(`/assistant/${conversationId}`);
  if (prospectId) revalidatePath(`/prospects/${prospectId}`);
}

export async function updateMeetingStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as MeetingStatus;
  await prisma.meeting.update({ where: { id }, data: { status } });
  await log("meeting.status", `Meeting:${id}`, { status });
  revalidatePath("/meetings");
  revalidatePath("/");
}

// ---------------------------------------------------------------------------
// Module C — Content
// ---------------------------------------------------------------------------

export async function generateDraft(formData: FormData) {
  const segment = String(formData.get("segment") ?? "OTHER") as BusinessSegment;
  const goal = String(formData.get("goal") ?? "").trim() || undefined;

  const gen = generateContent(segment, goal);
  const geo = evaluateGeo({
    title: gen.title,
    body: gen.body,
    metaTitle: gen.metaTitle,
    metaDescription: gen.metaDescription,
    headings: gen.headings,
    faqPairs: gen.faqPairs,
    keywords: gen.keywords,
  });
  const riskyClaims = detectRiskyClaims(gen.body);

  const content = await prisma.content.create({
    data: {
      title: gen.title,
      segment,
      goal,
      body: gen.body,
      metaTitle: gen.metaTitle,
      metaDescription: gen.metaDescription,
      headings: gen.headings,
      faqPairs: gen.faqPairs,
      keywords: gen.keywords,
      geoScore: geo.score,
      claimsValidated: riskyClaims.length === 0,
      claimNotes:
        riskyClaims.length > 0
          ? `Perlu validasi klaim: ${riskyClaims.join(", ")}`
          : "Tidak ada klaim berisiko terdeteksi secara otomatis. Tetap perlu review manusia.",
      status: "DRAFT",
    },
  });
  await log("content.generate", `Content:${content.id}`, { geo: geo.score, riskyClaims });
  revalidatePath("/content");
  redirect(`/content/${content.id}`);
}

export async function updateContent(formData: FormData) {
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const metaTitle = String(formData.get("metaTitle") ?? "").trim() || null;
  const metaDescription = String(formData.get("metaDescription") ?? "").trim() || null;

  const existing = await prisma.content.findUnique({ where: { id } });
  if (!existing) return;

  const geo = evaluateGeo({
    title,
    body,
    metaTitle,
    metaDescription,
    headings: existing.headings,
    faqPairs: existing.faqPairs,
    keywords: existing.keywords,
  });
  const riskyClaims = detectRiskyClaims(body);

  await prisma.content.update({
    where: { id },
    data: {
      title,
      body,
      metaTitle,
      metaDescription,
      geoScore: geo.score,
      claimsValidated: riskyClaims.length === 0,
      claimNotes:
        riskyClaims.length > 0
          ? `Perlu validasi klaim: ${riskyClaims.join(", ")}`
          : "Tidak ada klaim berisiko terdeteksi otomatis.",
    },
  });
  await log("content.update", `Content:${id}`);
  revalidatePath(`/content/${id}`);
  revalidatePath("/content");
}

export async function setContentStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as ContentStatus;

  const content = await prisma.content.findUnique({ where: { id } });
  if (!content) return;

  // BR#7 / NFR-08: cannot publish unless claims validated.
  if (status === "PUBLISHED" && !content.claimsValidated) {
    return { error: "Konten tidak dapat diterbitkan sebelum klaim divalidasi." };
  }

  await prisma.content.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : content.publishedAt,
    },
  });
  await log("content.status", `Content:${id}`, { status });
  revalidatePath(`/content/${id}`);
  revalidatePath("/content");
  revalidatePath("/");
}

export async function validateContentClaims(formData: FormData) {
  const id = String(formData.get("id"));
  const note = String(formData.get("note") ?? "").trim();
  await prisma.content.update({
    where: { id },
    data: { claimsValidated: true, claimNotes: note || "Klaim divalidasi oleh reviewer." },
  });
  await log("content.validateClaims", `Content:${id}`);
  revalidatePath(`/content/${id}`);
}

// ---------------------------------------------------------------------------
// Knowledge base (NFR-06: editable without code changes)
// ---------------------------------------------------------------------------

export async function createKnowledge(formData: FormData) {
  const category = String(formData.get("category") ?? "FAQ") as KnowledgeCategory;
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const keywords = String(formData.get("keywords") ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  if (!question || !answer) return;

  await prisma.knowledgeEntry.create({
    data: { category, question, answer, keywords, isApproved: true },
  });
  await log("knowledge.create");
  revalidatePath("/knowledge");
}

export async function updateKnowledge(formData: FormData) {
  const id = String(formData.get("id"));
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const keywords = String(formData.get("keywords") ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const isApproved = formData.get("isApproved") === "on";
  await prisma.knowledgeEntry.update({
    where: { id },
    data: { question, answer, keywords, isApproved },
  });
  await log("knowledge.update", `Knowledge:${id}`);
  revalidatePath("/knowledge");
}

export async function deleteKnowledge(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.knowledgeEntry.delete({ where: { id } });
  await log("knowledge.delete", `Knowledge:${id}`);
  revalidatePath("/knowledge");
}

// ---------------------------------------------------------------------------
// Module E — Relationship Path Finder & Context Graph
// ---------------------------------------------------------------------------

// Build the context graph once and recompute the warm-intro path for a prospect.
// Also re-scores the prospect so the warm-intro bonus is reflected in priority.
async function recomputeWarmPathForProspect(prospectId: string) {
  const [contacts, relationships, prospect] = await Promise.all([
    prisma.contact.findMany({
      select: { id: true, name: true, kind: true, org: true, prospectId: true, consent: true },
    }),
    prisma.relationship.findMany({
      select: { fromId: true, toId: true, type: true, strength: true },
    }),
    prisma.prospect.findUnique({ where: { id: prospectId } }),
  ]);
  if (!prospect) return;

  const graph = new ContextGraph(contacts, relationships);
  const path = graph.findWarmPath(prospectId);

  const bonus = warmIntroBonus(path?.score ?? 0);
  const { score, reason, isIncomplete } = scoreProspect({
    segment: prospect.segment,
    website: prospect.website,
    email: prospect.email,
    phone: prospect.phone,
    location: prospect.location,
    fitIndication: prospect.fitIndication,
    warmIntroBonus: bonus,
  });

  await prisma.prospect.update({
    where: { id: prospectId },
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

// Recompute warm paths for every prospect that has at least one bridge contact.
async function recomputeAllWarmPaths() {
  const bridged = await prisma.contact.findMany({
    where: { prospectId: { not: null } },
    select: { prospectId: true },
    distinct: ["prospectId"],
  });
  for (const b of bridged) {
    if (b.prospectId) await recomputeWarmPathForProspect(b.prospectId);
  }
}

export async function createContact(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Nama kontak wajib diisi." };
  const kind = String(formData.get("kind") ?? "PERSON") as ContactKind;
  const org = String(formData.get("org") ?? "").trim() || null;
  const role = String(formData.get("role") ?? "").trim() || null;
  const source = String(formData.get("source") ?? "").trim() || null;
  const consent = formData.get("consent") === "on";
  const prospectId = String(formData.get("prospectId") ?? "").trim() || null;

  await prisma.contact.create({
    data: { name, kind, org, role, source, consent, prospectId },
  });
  await log("contact.create");
  if (prospectId) await recomputeWarmPathForProspect(prospectId);
  revalidatePath("/network");
  revalidatePath("/prospects");
  if (prospectId) revalidatePath(`/prospects/${prospectId}`);
}

export async function deleteContact(formData: FormData) {
  const id = String(formData.get("id"));
  const contact = await prisma.contact.findUnique({ where: { id } });
  await prisma.contact.delete({ where: { id } });
  await log("contact.delete", `Contact:${id}`);
  await recomputeAllWarmPaths();
  if (contact?.prospectId) revalidatePath(`/prospects/${contact.prospectId}`);
  revalidatePath("/network");
  revalidatePath("/prospects");
}

export async function createRelationship(formData: FormData) {
  const fromId = String(formData.get("fromId") ?? "");
  const toId = String(formData.get("toId") ?? "");
  if (!fromId || !toId) return { error: "Pilih kedua kontak." };
  if (fromId === toId) return { error: "Kontak tidak bisa berelasi dengan dirinya sendiri." };

  const type = String(formData.get("type") ?? "BUSINESS") as RelationshipType;
  const strengthRaw = Number(formData.get("strength") ?? 50);
  const strength = Math.max(1, Math.min(100, isNaN(strengthRaw) ? 50 : strengthRaw));
  const reason = String(formData.get("reason") ?? "").trim() || null;
  const source = String(formData.get("source") ?? "").trim() || null;

  // Avoid duplicate undirected edges (A-B == B-A).
  const existing = await prisma.relationship.findFirst({
    where: {
      OR: [
        { fromId, toId },
        { fromId: toId, toId: fromId },
      ],
    },
  });
  if (existing) {
    await prisma.relationship.update({
      where: { id: existing.id },
      data: { type, strength, reason, source },
    });
  } else {
    await prisma.relationship.create({
      data: { fromId, toId, type, strength, reason, source },
    });
  }
  await log("relationship.upsert");
  await recomputeAllWarmPaths();
  revalidatePath("/network");
  revalidatePath("/prospects");
  return { success: "Relasi disimpan dan jalur perkenalan dihitung ulang." };
}

export async function deleteRelationship(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.relationship.delete({ where: { id } });
  await log("relationship.delete", `Relationship:${id}`);
  await recomputeAllWarmPaths();
  revalidatePath("/network");
  revalidatePath("/prospects");
}

export async function recomputeWarmPath(formData: FormData) {
  const prospectId = String(formData.get("prospectId"));
  await recomputeWarmPathForProspect(prospectId);
  await log("warmpath.recompute", `Prospect:${prospectId}`);
  revalidatePath(`/prospects/${prospectId}`);
  revalidatePath("/prospects");
}

// ---------------------------------------------------------------------------
// ICP-driven Discovery
// ---------------------------------------------------------------------------

export type DiscoveryActionResult = {
  error?: string;
  source?: string;
  isSimulated?: boolean;
  found?: number;
  qualified?: number;
  newCount?: number;
  duplicates?: number;
  candidates?: (ScoredCandidate & { alreadyInPipeline: boolean })[];
};

const icpSchema = z.object({
  segment: z.string().min(1),
  area: z.string().min(1, "Daerah target wajib diisi."),
  keywords: z.string().optional(),
  minScore: z.string().optional(),
});

// Search for candidates matching the ICP, score + qualify them, and mark which
// already exist in the pipeline (dedup against the DB). Does NOT persist.
export async function discoverProspects(
  formData: FormData,
): Promise<DiscoveryActionResult> {
  const parsed = icpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ICP tidak valid." };
  }
  const d = parsed.data;
  const keywords = (d.keywords ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const minScoreNum = Number(d.minScore ?? 0);
  const minScore = Math.max(0, Math.min(100, isNaN(minScoreNum) ? 0 : minScoreNum));

  const icp = {
    segment: d.segment as BusinessSegment,
    area: d.area.trim(),
    keywords,
    minScore,
  };

  const result = await runDiscovery(icp);

  // Dedup against existing prospects in the DB.
  const keys = result.candidates.map((c) => c.dedupeKey);
  const existing = await prisma.prospect.findMany({
    where: { dedupeKey: { in: keys } },
    select: { dedupeKey: true },
  });
  const existingSet = new Set(existing.map((e) => e.dedupeKey));

  const candidates = result.candidates.map((c) => ({
    ...c,
    alreadyInPipeline: existingSet.has(c.dedupeKey),
  }));
  const duplicates = candidates.filter((c) => c.alreadyInPipeline).length;

  await log("discovery.run", undefined, {
    segment: icp.segment,
    area: icp.area,
    found: result.found,
    qualified: result.qualified,
  });

  return {
    source: result.source,
    isSimulated: result.isSimulated,
    found: result.found,
    qualified: result.qualified,
    newCount: candidates.length - duplicates,
    duplicates,
    candidates,
  };
}

// Persist the selected candidates into the pipeline and record the run (audit).
export async function saveDiscoveredProspects(formData: FormData) {
  const segment = String(formData.get("segment") ?? "OTHER") as BusinessSegment;
  const area = String(formData.get("area") ?? "").trim();
  const keywords = String(formData.get("keywords") ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const minScore = Math.max(0, Math.min(100, Number(formData.get("minScore") ?? 0) || 0));

  // Selected candidates are passed as a JSON payload.
  let selected: ScoredCandidate[] = [];
  try {
    selected = JSON.parse(String(formData.get("selected") ?? "[]"));
  } catch {
    return { error: "Data kandidat tidak valid." };
  }
  if (selected.length === 0) return { error: "Pilih minimal satu kandidat." };

  const source = resolveSource();
  let saved = 0;
  let duplicates = 0;
  let qualifiedCount = 0;

  const run = await prisma.discoveryRun.create({
    data: {
      segment,
      area,
      keywords,
      minScore,
      source: source.kind,
      candidatesFound: selected.length,
    },
  });

  for (const c of selected) {
    const dedupeKey = c.dedupeKey || buildDedupeKey(c);
    const exists = await prisma.prospect.findUnique({ where: { dedupeKey } });
    if (exists) {
      duplicates++;
      continue;
    }
    if (c.qualified) qualifiedCount++;

    await prisma.prospect.create({
      data: {
        companyName: c.companyName,
        segment: c.segment,
        website: c.website ?? undefined,
        email: c.email ?? undefined,
        phone: c.phone ?? undefined,
        location: c.location ?? undefined,
        fitIndication: c.fitIndication ?? undefined,
        dataSource: c.source,
        lastVerifiedAt: new Date(),
        priorityScore: c.score,
        scoreReason: c.reason,
        isIncomplete: c.isIncomplete,
        dedupeKey,
        status: "NEW",
        discoveryRunId: run.id,
        isSimulated: source.isSimulated,
      },
    });
    saved++;
  }

  await prisma.discoveryRun.update({
    where: { id: run.id },
    data: { savedCount: saved, duplicatesSkipped: duplicates, qualifiedCount },
  });

  await log("discovery.save", `DiscoveryRun:${run.id}`, { saved, duplicates });
  revalidatePath("/prospects");
  revalidatePath("/");
  return { success: `${saved} prospek tersimpan ke pipeline, ${duplicates} duplikat dilewati.` };
}
