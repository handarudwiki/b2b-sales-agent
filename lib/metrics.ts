// Deterministic KPI calculations (BRD §13.3). Dashboard must only show metrics
// backed by real recorded data (BRD Module D principle).

export function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10; // 1 decimal
}

export function qualifiedLeadRate(qualified: number, totalQualifiedPool: number) {
  return pct(qualified, totalQualifiedPool);
}

export function meetingAttendanceRate(completed: number, scheduled: number) {
  return pct(completed, scheduled);
}

export function leadToMeetingRate(meetingsScheduled: number, totalLeads: number) {
  return pct(meetingsScheduled, totalLeads);
}

export function contentToLeadRate(attributedLeads: number, relevantVisits: number) {
  return pct(attributedLeads, relevantVisits);
}

export function formatMs(ms: number | null | undefined): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)} dtk`;
  return `${Math.floor(s / 60)} mnt ${Math.round(s % 60)} dtk`;
}

// Median of a numeric array (used for response time).
export function median(values: number[]): number | null {
  const nums = values.filter((v) => typeof v === "number" && !isNaN(v)).sort((a, b) => a - b);
  if (nums.length === 0) return null;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[mid] : Math.round((nums[mid - 1] + nums[mid]) / 2);
}
