// ICP-driven prospect discovery.
//
// Flow (BRD Module A, Journey A): the team defines an Ideal Customer Profile
// (segment + area + keywords + min score); the system SOURCES candidates,
// then cleans / dedupes / scores / qualifies them deterministically. The team
// reviews before anything is saved to the pipeline.
//
// COMPLIANCE: candidates must carry a source and a verified date (BR#2) and
// must never be fabricated and presented as real (BR#3). This module is
// provider-agnostic: a real data provider (Google Places, Apollo, ...) can be
// plugged in via the `ProspectSource` interface. Until a provider key is
// configured, a clearly LABELED SIMULATION source is used, mirroring the
// WhatsApp "simulated channel" approach already in the product.

import type { BusinessSegment, DiscoverySource } from "@prisma/client";
import { scoreProspect, buildDedupeKey } from "./prospecting";

export type IcpInput = {
  segment: BusinessSegment;
  area: string;
  keywords: string[];
  minScore: number;
};

// A raw candidate as returned by a source (before cleaning/scoring).
export type RawCandidate = {
  companyName: string;
  segment: BusinessSegment;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  fitIndication?: string | null;
  source: string; // human-readable provenance
};

// Pluggable source interface. Implement this to add a real provider later.
export interface ProspectSource {
  readonly kind: DiscoverySource;
  readonly isSimulated: boolean;
  search(icp: IcpInput): Promise<RawCandidate[]> | RawCandidate[];
}

// ---------------------------------------------------------------------------
// Simulation source — deterministic candidate generator (labeled).
// Produces plausible, clearly-simulated candidates per segment + area so the
// discovery workflow is demonstrable without a paid data provider.
// ---------------------------------------------------------------------------

const SEGMENT_SEED: Record<
  BusinessSegment,
  { names: string[]; keyword: string; webSuffix: string }
> = {
  BEAUTY_CLINIC: {
    names: ["Glow Derma", "Aura Aesthetic", "Belle Skin", "Lumina Clinic", "Radiant Care", "Nadia Beauty"],
    keyword: "klinik kecantikan",
    webSuffix: "clinic.co.id",
  },
  NEW_BRAND: {
    names: ["Serené Labs", "Pure Co", "Botaniq", "Nusa Beauty", "Elementa", "Kirana Skin"],
    keyword: "brand baru",
    webSuffix: "brand.id",
  },
  PRIVATE_LABEL: {
    names: ["Prima Kosmetika", "Mega Formulasi", "Indo Private Label", "Sentosa Manufaktur"],
    keyword: "private label",
    webSuffix: "corp.co.id",
  },
  INFLUENCER: {
    names: ["Tasya Beauty", "Dinda Glow", "Rani Skincare", "Beauty by Kiki", "Nabila Care"],
    keyword: "personal brand",
    webSuffix: "id",
  },
  HERBAL_STORE: {
    names: ["Herba Sehat", "Jamu Nusantara", "Toko Herbal Asri", "Griya Herbal", "Daun Mujarab"],
    keyword: "toko herbal",
    webSuffix: "herbal.id",
  },
  UMKM: {
    names: ["UMKM Lestari", "Berkah Mandiri", "Karya Ibu", "Rumah Produksi Sari", "Usaha Jaya"],
    keyword: "umkm",
    webSuffix: "umkm.id",
  },
  OTHER: {
    names: ["Mitra Sejahtera", "Cahaya Abadi", "Sumber Makmur"],
    keyword: "bisnis",
    webSuffix: "co.id",
  },
};

// Simple deterministic hash so the same ICP yields the same candidate set.
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export class SimulationSource implements ProspectSource {
  readonly kind: DiscoverySource = "SIMULATION";
  readonly isSimulated = true;

  search(icp: IcpInput): RawCandidate[] {
    const seed = SEGMENT_SEED[icp.segment] ?? SEGMENT_SEED.OTHER;
    const base = hash(`${icp.segment}|${icp.area}|${icp.keywords.join(",")}`);
    const count = 5 + (base % 4); // 5-8 candidates
    const out: RawCandidate[] = [];

    for (let i = 0; i < count; i++) {
      const name = seed.names[(base + i) % seed.names.length];
      const unique = `${name} ${icp.area}`;
      const h = hash(unique + i);
      // Vary completeness so dedup/scoring/flagging are exercised realistically.
      const hasWeb = h % 3 !== 0;
      const hasEmail = h % 2 === 0;
      const hasPhone = h % 4 !== 1;

      const companyName = `${name} ${icp.area}`;
      out.push({
        companyName,
        segment: icp.segment,
        website: hasWeb ? `${slug(name)}.${seed.webSuffix}` : null,
        email: hasEmail ? `info@${slug(name)}.${seed.webSuffix}` : null,
        phone: hasPhone ? `08${(h % 900000000 + 100000000).toString()}` : null,
        location: icp.area,
        fitIndication: `${seed.keyword} di ${icp.area}${
          icp.keywords.length ? `, fokus: ${icp.keywords.join(", ")}` : ""
        }`,
        source: `SIMULASI · ICP ${icp.segment} @ ${icp.area}`,
      });
    }
    return out;
  }
}

// Resolve the active source. Add real providers here when keys are configured.
export function resolveSource(): ProspectSource {
  // Example for the future:
  // if (process.env.GOOGLE_PLACES_API_KEY) return new GooglePlacesSource(...);
  return new SimulationSource();
}

// ---------------------------------------------------------------------------
// Discovery pipeline
// ---------------------------------------------------------------------------

export type ScoredCandidate = RawCandidate & {
  dedupeKey: string;
  score: number;
  reason: string;
  isIncomplete: boolean;
  qualified: boolean; // score >= ICP minScore
};

export type DiscoveryResult = {
  source: DiscoverySource;
  isSimulated: boolean;
  candidates: ScoredCandidate[];
  found: number;
  qualified: number;
};

// Run the full pipeline: source -> clean -> score -> qualify against ICP.
// Deduplication against the EXISTING database is done by the caller (needs DB).
export async function runDiscovery(
  icp: IcpInput,
  source: ProspectSource = resolveSource(),
): Promise<DiscoveryResult> {
  const raw = await source.search(icp);

  // In-batch dedup first (two sources could return the same company).
  const seen = new Set<string>();
  const candidates: ScoredCandidate[] = [];

  for (const c of raw) {
    const dedupeKey = buildDedupeKey(c);
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const { score, reason, isIncomplete } = scoreProspect({
      segment: c.segment,
      website: c.website,
      email: c.email,
      phone: c.phone,
      location: c.location,
      fitIndication: c.fitIndication,
    });

    candidates.push({
      ...c,
      dedupeKey,
      score,
      reason,
      isIncomplete,
      qualified: score >= icp.minScore,
    });
  }

  // Highest score first.
  candidates.sort((a, b) => b.score - a.score);

  return {
    source: source.kind,
    isSimulated: source.isSimulated,
    candidates,
    found: candidates.length,
    qualified: candidates.filter((c) => c.qualified).length,
  };
}
