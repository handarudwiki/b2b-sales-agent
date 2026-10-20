// Human-readable Indonesian labels + badge colors for enums.

import type {
  BusinessSegment,
  ProspectStatus,
  LeadStatus,
  MeetingStatus,
  ContentStatus,
  KnowledgeCategory,
  Role,
  ConversationChannel,
  ContactKind,
} from "@prisma/client";

export const contactKindLabels: Record<ContactKind, string> = {
  TEAM: "Tim Internal",
  PAST_CLIENT: "Klien Lama",
  PARTNER: "Mitra / Vendor",
  COMMUNITY: "Tokoh Komunitas",
  PERSON: "Kenalan",
};

export const contactKindColors: Record<ContactKind, string> = {
  TEAM: "bg-violet-100 text-violet-700",
  PAST_CLIENT: "bg-emerald-100 text-emerald-700",
  PARTNER: "bg-sky-100 text-sky-700",
  COMMUNITY: "bg-amber-100 text-amber-700",
  PERSON: "bg-slate-100 text-slate-700",
};

export const segmentLabels: Record<BusinessSegment, string> = {
  NEW_BRAND: "Brand Baru / Startup",
  UMKM: "UMKM",
  BEAUTY_CLINIC: "Klinik Kecantikan",
  HERBAL_STORE: "Toko Herbal",
  INFLUENCER: "Influencer / Personal Brand",
  PRIVATE_LABEL: "Private Label",
  OTHER: "Lainnya",
};

export const segmentOptions = Object.entries(segmentLabels) as [
  BusinessSegment,
  string,
][];

export const prospectStatusLabels: Record<ProspectStatus, string> = {
  NEW: "Baru",
  REVIEWED: "Ditinjau",
  CONTACTED: "Dihubungi",
  INTERESTED: "Tertarik",
  QUALIFIED: "Berkualitas",
  MEETING_SCHEDULED: "Meeting Terjadwal",
  NOT_A_FIT: "Tidak Sesuai",
};

export const prospectStatusColors: Record<ProspectStatus, string> = {
  NEW: "bg-slate-100 text-slate-700",
  REVIEWED: "bg-sky-100 text-sky-700",
  CONTACTED: "bg-indigo-100 text-indigo-700",
  INTERESTED: "bg-amber-100 text-amber-700",
  QUALIFIED: "bg-emerald-100 text-emerald-700",
  MEETING_SCHEDULED: "bg-teal-100 text-teal-700",
  NOT_A_FIT: "bg-rose-100 text-rose-700",
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  UNQUALIFIED: "Belum Terkualifikasi",
  EARLY_STAGE: "Tahap Awal",
  QUALIFIED: "Berkualitas",
  MEETING_SCHEDULED: "Meeting Terjadwal",
  MEETING_COMPLETED: "Meeting Selesai",
  FOLLOW_UP: "Perlu Tindak Lanjut",
  CONVERTED: "Konversi",
  LOST: "Hilang / Tidak Sesuai",
};

export const leadStatusColors: Record<LeadStatus, string> = {
  UNQUALIFIED: "bg-slate-100 text-slate-700",
  EARLY_STAGE: "bg-sky-100 text-sky-700",
  QUALIFIED: "bg-emerald-100 text-emerald-700",
  MEETING_SCHEDULED: "bg-teal-100 text-teal-700",
  MEETING_COMPLETED: "bg-cyan-100 text-cyan-700",
  FOLLOW_UP: "bg-amber-100 text-amber-700",
  CONVERTED: "bg-green-100 text-green-700",
  LOST: "bg-rose-100 text-rose-700",
};

export const meetingStatusLabels: Record<MeetingStatus, string> = {
  SCHEDULED: "Terjadwal",
  COMPLETED: "Terlaksana",
  NO_SHOW: "Tidak Hadir",
  CANCELLED: "Dibatalkan",
};

export const meetingStatusColors: Record<MeetingStatus, string> = {
  SCHEDULED: "bg-teal-100 text-teal-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  NO_SHOW: "bg-rose-100 text-rose-700",
  CANCELLED: "bg-slate-100 text-slate-700",
};

export const contentStatusLabels: Record<ContentStatus, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "Dalam Review",
  APPROVED: "Disetujui",
  PUBLISHED: "Terbit",
  REJECTED: "Ditolak",
};

export const contentStatusColors: Record<ContentStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  IN_REVIEW: "bg-amber-100 text-amber-700",
  APPROVED: "bg-sky-100 text-sky-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
};

export const knowledgeCategoryLabels: Record<KnowledgeCategory, string> = {
  COMPANY_PROFILE: "Profil Perusahaan",
  SERVICE_CATALOG: "Katalog Layanan",
  PROCESS: "Proses Maklon",
  LEGALITY: "Legalitas",
  FAQ: "FAQ",
  CLAIM_GUIDELINE: "Panduan Klaim",
};

export const roleLabels: Record<Role, string> = {
  MARKETING: "Marketing",
  SALES: "Sales",
  MANAGEMENT: "Management",
  ADMIN: "Admin",
};

export const channelLabels: Record<ConversationChannel, string> = {
  WHATSAPP_SIMULATED: "WhatsApp (Simulasi)",
  WHATSAPP: "WhatsApp",
  WEB: "Web",
};
