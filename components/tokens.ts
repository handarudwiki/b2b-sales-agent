import type { IconType } from "react-icons";
import {
  PiBooks,
  PiBuildings,
  PiCertificate,
  PiFlowArrow,
  PiLeaf,
  PiMegaphone,
  PiQuestion,
  PiRocketLaunch,
  PiShieldCheck,
  PiSparkle,
  PiStack,
  PiStorefront,
} from "react-icons/pi";
import type {
  BusinessSegment,
  ContactKind,
  KnowledgeCategory,
} from "@prisma/client";

// Keep stacks in this CVD-validated slot order; never re-sort them by value.
export const segmentOrder: BusinessSegment[] = [
  "NEW_BRAND",
  "UMKM",
  "PRIVATE_LABEL",
  "INFLUENCER",
  "BEAUTY_CLINIC",
  "HERBAL_STORE",
  "OTHER",
];

export const segmentColor: Record<BusinessSegment, string> = {
  NEW_BRAND: "#2a78d6",
  UMKM: "#eb6834",
  PRIVATE_LABEL: "#1baf7a",
  INFLUENCER: "#eda100",
  BEAUTY_CLINIC: "#e87ba4",
  HERBAL_STORE: "#008300",
  OTHER: "#a3a69e",
};

export const segmentIcon: Record<BusinessSegment, IconType> = {
  NEW_BRAND: PiRocketLaunch,
  UMKM: PiStorefront,
  PRIVATE_LABEL: PiStack,
  INFLUENCER: PiMegaphone,
  BEAUTY_CLINIC: PiSparkle,
  HERBAL_STORE: PiLeaf,
  OTHER: PiBuildings,
};

export const contactKindColor: Record<ContactKind, string> = {
  TEAM: "#6250d6",
  PAST_CLIENT: "#1baf7a",
  PARTNER: "#2a78d6",
  COMMUNITY: "#eda100",
  PERSON: "#898781",
};

export const knowledgeCategoryStyle: Record<
  KnowledgeCategory,
  { className: string; icon: IconType }
> = {
  COMPANY_PROFILE: { className: "bg-violet-100 text-violet-700", icon: PiBuildings },
  SERVICE_CATALOG: { className: "bg-sky-100 text-sky-700", icon: PiBooks },
  PROCESS: { className: "bg-teal-100 text-teal-700", icon: PiFlowArrow },
  LEGALITY: { className: "bg-amber-100 text-amber-800", icon: PiCertificate },
  FAQ: { className: "bg-slate-100 text-slate-700", icon: PiQuestion },
  CLAIM_GUIDELINE: { className: "bg-rose-100 text-rose-700", icon: PiShieldCheck },
};

export function scoreColor(score: number | null | undefined): string {
  if (score == null) return "#a3a69e";
  if (score >= 70) return "#12a150";
  if (score >= 45) return "#f0a20b";
  return "#a3a69e";
}

export function tint(color: string, amount = 16) {
  return {
    backgroundColor: `color-mix(in oklab, ${color} ${amount}%, white)`,
    color: `color-mix(in oklab, ${color} 70%, black)`,
  };
}

export function initials(name: string | null | undefined): string {
  const clean = (name ?? "").replace(/[^\p{L}\p{N}\s]/gu, " ").trim();
  if (!clean) return "?";
  const parts = clean.split(/\s+/).filter((p) => !/^(cv|pt|dr|ibu|bapak|pak|bu)$/i.test(p));
  const words = parts.length ? parts : clean.split(/\s+/);
  const first = words[0]?.[0] ?? "";
  const second = words.length > 1 ? words[words.length - 1][0] : words[0]?.[1] ?? "";
  return (first + second).toUpperCase();
}

const AVATAR_HUES = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#6250d6", "#008300"];
export function avatarColor(seed: string | null | undefined): string {
  const s = seed ?? "";
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return AVATAR_HUES[Math.abs(h) % AVATAR_HUES.length];
}
