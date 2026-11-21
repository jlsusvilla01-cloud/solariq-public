/**
 * Net-metering workflow. The default steps follow the usual distribution-utility
 * process in the Philippines; contractors can rename steps to match what their
 * utility (for example MORE Power) currently asks for.
 */
export type StepStatus = "todo" | "in_progress" | "done" | "blocked";

export interface NetMeteringStep {
  key: string;
  label: string;
  status: StepStatus;
  startedAt?: string | null; // ISO date
  doneAt?: string | null;
  dueDate?: string | null; // YYYY-MM-DD
  note?: string | null; // shown to the client on the tracking page
}

export const DEFAULT_STEPS: { key: string; label: string; legacy: string }[] = [
  { key: "documents", label: "Requirements gathered (ID, latest bill, single-line diagram, permits)", legacy: "pending" },
  { key: "application", label: "Application filed with the utility", legacy: "applied" },
  { key: "evaluation", label: "Technical evaluation by the utility", legacy: "applied" },
  { key: "inspection", label: "Site inspection", legacy: "surveyed" },
  { key: "agreement", label: "Net-Metering Agreement signed", legacy: "nma_signed" },
  { key: "meter", label: "Bi-directional meter installed", legacy: "meter_installed" },
  { key: "certificate", label: "Certificate of Compliance issued", legacy: "completed" },
];

export const STALL_DAYS = 21;

export function defaultSteps(): NetMeteringStep[] {
  return DEFAULT_STEPS.map(s => ({ key: s.key, label: s.label, status: "todo" as StepStatus, startedAt: null, doneAt: null, dueDate: null, note: null }));
}

/** A step is stalled when it has been in progress too long or is past its due date. */
export function isStalled(step: NetMeteringStep, now = new Date()): boolean {
  if (step.status === "done") return false;
  if (step.dueDate && new Date(step.dueDate + "T23:59:59") < now) return true;
  if (step.status === "in_progress" && step.startedAt) {
    const days = (now.getTime() - new Date(step.startedAt).getTime()) / 86_400_000;
    return days > STALL_DAYS;
  }
  return false;
}

/** Maps the checklist back onto the older single status field so existing screens keep working. */
export function legacyStatus(steps: NetMeteringStep[]): string {
  let status = "pending";
  for (const s of steps) {
    if (s.status !== "done") break;
    status = DEFAULT_STEPS.find(d => d.key === s.key)?.legacy ?? status;
  }
  if (steps.length > 0 && steps.every(s => s.status === "done")) status = "completed";
  return status;
}

export function progressPct(steps: NetMeteringStep[]): number {
  if (!steps.length) return 0;
  return Math.round((steps.filter(s => s.status === "done").length / steps.length) * 100);
}

/** Validates steps coming from the browser and stamps start and finish dates. */
export function normalizeSteps(input: unknown, previous: NetMeteringStep[] = [], now = new Date()): NetMeteringStep[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > 20) return null;
  const prevByKey = new Map(previous.map(s => [s.key, s]));
  const out: NetMeteringStep[] = [];
  const seen = new Set<string>();
  for (const raw of input) {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    const key = String(r.key ?? "").trim().slice(0, 40);
    const label = String(r.label ?? "").trim().slice(0, 160);
    const status = r.status as StepStatus;
    if (!key || !label || seen.has(key) || !["todo", "in_progress", "done", "blocked"].includes(status)) return null;
    seen.add(key);
    const prev = prevByKey.get(key);
    const dueDate = typeof r.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.dueDate) ? r.dueDate : null;
    const note = typeof r.note === "string" && r.note.trim() ? r.note.trim().slice(0, 500) : null;
    const nowIso = now.toISOString();
    const startedAt = status === "todo" ? null : (prev?.startedAt ?? (typeof r.startedAt === "string" ? r.startedAt : null) ?? nowIso);
    const doneAt = status === "done" ? (prev?.status === "done" && prev.doneAt ? prev.doneAt : nowIso) : null;
    out.push({ key, label, status, startedAt, doneAt, dueDate, note });
  }
  return out;
}
