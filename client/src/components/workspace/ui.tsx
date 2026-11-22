import type { ReactNode } from "react";

// Shared styles so every workspace panel matches the existing SolarIQ look.
export const inputCls = "bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs";
export const selectCls = "bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white text-xs rounded-lg px-3 py-2 h-9";
export const panelCls = "bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl";
export const primaryBtn = "bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs h-9 gap-1.5 hover:brightness-110";
export const ghostBtn = "border-[hsl(220_18%_22%)] text-white/70 text-xs h-9 gap-1.5";

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block text-[10px] text-white/45 space-y-1 ${className}`}>
      <span className="font-bold uppercase tracking-wider">{label}</span>
      {children}
      {hint && <span className="block text-[10px] text-white/30 normal-case tracking-normal">{hint}</span>}
    </label>
  );
}

export function SectionHeader({ icon, title, subtitle, actions }: { icon: ReactNode; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-4 justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/10">
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-3">{icon}{title}</h2>
        {subtitle && <p className="text-white/40 text-xs mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl">
      <p className="text-sm text-white/50">{title}</p>
      {body && <p className="text-[11px] text-white/30 mt-1 max-w-md mx-auto">{body}</p>}
    </div>
  );
}

/** Parses a number typed by a person ("45,000" → 45000); empty or invalid → null. */
export function toNum(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(String(v).replace(/[,₱\s]/g, ""));
  return String(v).trim() !== "" && Number.isFinite(n) ? n : null;
}

export const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—";

export function timeAgo(iso?: string | null): string {
  if (!iso) return "";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
