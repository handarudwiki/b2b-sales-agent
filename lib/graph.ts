// Module E — Relationship Path Finder over a Context Graph.
//
// Goal: increase probability-to-deal by replacing cold outreach with a warm
// introduction. Given the internal relationship network (team members, past
// clients, partners, community figures) we find the strongest, shortest path
// from any TEAM contact to a contact that bridges into the target prospect.
//
// This is DETERMINISTIC graph search (Dijkstra on a cost derived from edge
// strength), NOT AI — per BRD §15 ("jangan gunakan AI untuk keputusan
// deterministik ... gunakan logika aplikasi biasa"). Every path carries a
// reviewable explanation (BR#2).

import type { ContactKind, RelationshipType } from "@prisma/client";

export type GraphNode = {
  id: string;
  name: string;
  kind: ContactKind;
  org?: string | null;
  prospectId?: string | null; // non-null => this contact bridges into a prospect
  consent: boolean;
};

export type GraphEdge = {
  fromId: string;
  toId: string;
  type: RelationshipType;
  strength: number; // 1-100
};

export type PathHop = {
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  type: RelationshipType;
  strength: number;
};

export type WarmPath = {
  nodeIds: string[];
  nodeNames: string[];
  hops: PathHop[];
  // 0-100: combined strength of the path (geometric-mean style, decays with length)
  score: number;
  summary: string; // "Budi → Rina → PT X"
  reason: string; // reviewable explanation
};

const relTypeLabel: Record<RelationshipType, string> = {
  COLLEAGUE: "rekan kerja",
  FRIEND: "teman",
  FORMER_CLIENT: "mantan klien",
  BUSINESS: "relasi bisnis",
  COMMUNITY: "komunitas",
  FAMILY: "keluarga",
  REFERRAL: "referral",
};

type AdjEntry = { toId: string; type: RelationshipType; strength: number };

export class ContextGraph {
  private nodes = new Map<string, GraphNode>();
  private adj = new Map<string, AdjEntry[]>();

  constructor(nodes: GraphNode[], edges: GraphEdge[]) {
    for (const n of nodes) {
      this.nodes.set(n.id, n);
      this.adj.set(n.id, []);
    }
    // Undirected: add both directions so an intro can flow either way.
    for (const e of edges) {
      if (!this.nodes.has(e.fromId) || !this.nodes.has(e.toId)) continue;
      const s = clampStrength(e.strength);
      this.adj.get(e.fromId)!.push({ toId: e.toId, type: e.type, strength: s });
      this.adj.get(e.toId)!.push({ toId: e.fromId, type: e.type, strength: s });
    }
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  // All contacts that bridge into the given prospect (targets of the search).
  bridgeContactsFor(prospectId: string): GraphNode[] {
    return [...this.nodes.values()].filter((n) => n.prospectId === prospectId);
  }

  teamStartNodes(): GraphNode[] {
    return [...this.nodes.values()].filter((n) => n.kind === "TEAM");
  }

  // Dijkstra from a set of sources, minimizing accumulated edge cost where
  // cost(edge) = 1 - strength/100 (strong ties are "cheaper" / closer).
  // Returns the best path to the closest target bridge contact.
  findWarmPath(prospectId: string): WarmPath | null {
    const targets = new Set(this.bridgeContactsFor(prospectId).map((n) => n.id));
    if (targets.size === 0) return null;

    const sources = this.teamStartNodes();
    if (sources.length === 0) return null;

    const dist = new Map<string, number>();
    const prev = new Map<string, { nodeId: string; type: RelationshipType; strength: number }>();
    // simple array-based priority queue (graphs here are small)
    const pq: { id: string; d: number }[] = [];

    for (const s of sources) {
      dist.set(s.id, 0);
      pq.push({ id: s.id, d: 0 });
    }

    const visited = new Set<string>();
    let reachedTarget: string | null = null;

    while (pq.length > 0) {
      // extract-min
      pq.sort((a, b) => a.d - b.d);
      const { id: u, d } = pq.shift()!;
      if (visited.has(u)) continue;
      visited.add(u);

      if (targets.has(u) && this.nodes.get(u)!.kind !== "TEAM") {
        reachedTarget = u;
        break;
      }

      for (const edge of this.adj.get(u) ?? []) {
        const w = 1 - clampStrength(edge.strength) / 100; // cost in [0,1)
        const nd = d + w + 0.15; // +0.15 per hop so shorter chains are preferred
        if (nd < (dist.get(edge.toId) ?? Infinity)) {
          dist.set(edge.toId, nd);
          prev.set(edge.toId, { nodeId: u, type: edge.type, strength: edge.strength });
          pq.push({ id: edge.toId, d: nd });
        }
      }
    }

    if (!reachedTarget) return null;

    // reconstruct path
    const nodeIds: string[] = [];
    let cur: string | undefined = reachedTarget;
    while (cur) {
      nodeIds.unshift(cur);
      cur = prev.get(cur)?.nodeId;
    }

    const hops: PathHop[] = [];
    for (let i = 0; i < nodeIds.length - 1; i++) {
      const fromId = nodeIds[i];
      const toId = nodeIds[i + 1];
      const link = prev.get(toId)!;
      hops.push({
        fromId,
        toId,
        fromName: this.nodes.get(fromId)!.name,
        toName: this.nodes.get(toId)!.name,
        type: link.type,
        strength: link.strength,
      });
    }

    const nodeNames = nodeIds.map((id) => this.nodes.get(id)!.name);
    const score = scorePath(hops);
    const summary = nodeNames.join(" → ");
    const reason = buildReason(hops, score);

    return { nodeIds, nodeNames, hops, score, summary, reason };
  }
}

function clampStrength(s: number): number {
  return Math.max(1, Math.min(100, Math.round(s)));
}

// Path score 0-100: geometric mean of edge strengths, penalized by hop count.
// Shorter + stronger chains score higher; a long chain of weak ties scores low.
function scorePath(hops: PathHop[]): number {
  if (hops.length === 0) return 0;
  const product = hops.reduce((acc, h) => acc * (clampStrength(h.strength) / 100), 1);
  const geoMean = Math.pow(product, 1 / hops.length); // 0..1
  // length decay: 1 hop = x1.0, 2 hops = x0.85, 3 = x0.72, ...
  const lengthFactor = Math.pow(0.85, hops.length - 1);
  return Math.round(geoMean * lengthFactor * 100);
}

function buildReason(hops: PathHop[], score: number): string {
  if (hops.length === 0) return "Belum ada jalur perkenalan yang ditemukan.";
  const steps = hops
    .map((h) => `${h.fromName} mengenal ${h.toName} (${relTypeLabel[h.type]}, kekuatan ${h.strength}/100)`)
    .join("; ");
  const degree = hops.length === 1 ? "koneksi langsung (1 hop)" : `${hops.length} hop`;
  return `Jalur perkenalan hangat melalui ${degree}: ${steps}. Skor jalur ${score}/100 — makin tinggi, makin besar peluang warm intro berhasil. Mintalah bantuan perkenalan daripada melakukan pendekatan dingin.`;
}

// Warm-intro bonus added to prospect priority score (0-20 range).
export function warmIntroBonus(pathScore: number | null | undefined): number {
  if (!pathScore || pathScore <= 0) return 0;
  return Math.round((pathScore / 100) * 20);
}

export function warmBand(score: number | null | undefined): {
  label: string;
  color: string;
} {
  if (score == null || score <= 0)
    return { label: "Tidak ada jalur", color: "bg-slate-100 text-slate-600" };
  if (score >= 60) return { label: "Jalur Kuat", color: "bg-violet-100 text-violet-700" };
  if (score >= 30) return { label: "Jalur Sedang", color: "bg-amber-100 text-amber-700" };
  return { label: "Jalur Lemah", color: "bg-slate-100 text-slate-600" };
}

export const relationshipTypeLabels = relTypeLabel;
