import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, AlertTriangle, CheckCircle2, Circle, Clock, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { ApiFetch } from "@/lib/api";
import { isStalled, progressPct, type NetMeteringStep, type StepStatus } from "@shared/netMetering";
import { inputCls, panelCls, primaryBtn, ghostBtn, fmtDate } from "./ui";

const STATUS_LABEL: Record<StepStatus, string> = { todo: "To do", in_progress: "In progress", done: "Done", blocked: "Blocked" };

export function NetMeteringPanel({ api, base, projectId }: { api: ApiFetch; base: string; projectId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const key = [base, "net-metering", projectId];
  const { data } = useQuery<{ steps: NetMeteringStep[]; saved: boolean; updatedAt: string | null }>({
    queryKey: key, queryFn: () => api(`${base}/projects/${projectId}/net-metering`),
  });
  const [steps, setSteps] = useState<NetMeteringStep[]>([]);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { if (data) { setSteps(data.steps); setDirty(false); } }, [data]);

  const save = useMutation({
    mutationFn: () => api(`${base}/projects/${projectId}/net-metering`, { method: "PUT", body: JSON.stringify({ steps }) }),
    onSuccess: (d) => { qc.setQueryData(key, d); qc.invalidateQueries({ queryKey: [base, "projects"] }); qc.invalidateQueries({ queryKey: ["/api/admin/projects"] }); toast({ title: "Net-metering checklist saved", description: "Your client sees the update on their tracking page." }); },
    onError: (e: any) => toast({ title: "Could not save", description: e.message, variant: "destructive" }),
  });

  const update = (i: number, patch: Partial<NetMeteringStep>) => { setSteps(s => s.map((x, j) => (j === i ? { ...x, ...patch } : x))); setDirty(true); };
  const addStep = () => { setSteps(s => [...s, { key: `custom-${Date.now()}`, label: "New step", status: "todo" }]); setDirty(true); };
  const stalled = steps.filter(s => isStalled(s));
  const pct = progressPct(steps);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-black text-white flex items-center gap-2"><CreditCard size={15} className="text-sky-400" />Net-metering checklist · {pct}%</div>
          <p className="text-[11px] text-white/40 mt-0.5">Rename steps to match what MORE Power currently asks for. Notes are shown to your client.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addStep} className={`${ghostBtn} h-8`}><Plus size={12} />Add step</Button>
          <Button onClick={() => save.mutate()} disabled={!dirty || save.isPending} className={`${primaryBtn} h-8`}>{save.isPending ? "Saving…" : dirty ? "Save checklist" : "Saved"}</Button>
        </div>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-sky-400 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
      {stalled.length > 0 && (
        <div className="flex items-center gap-2 text-[11px] text-orange-300 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2">
          <AlertTriangle size={13} /> {stalled.length} step{stalled.length > 1 ? "s are" : " is"} past due or stuck for over 3 weeks. Follow up with the utility.
        </div>
      )}
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={s.key} className={`${panelCls} p-3 grid sm:grid-cols-12 gap-2 items-center ${isStalled(s) ? "border-orange-500/40" : ""}`}>
            <div className="sm:col-span-5 flex items-center gap-2">
              {s.status === "done" ? <CheckCircle2 size={14} className="text-green-400 shrink-0" /> : s.status === "in_progress" ? <Clock size={14} className="text-[#fbbf24] shrink-0" /> : s.status === "blocked" ? <AlertTriangle size={14} className="text-red-400 shrink-0" /> : <Circle size={14} className="text-white/20 shrink-0" />}
              <Input value={s.label} onChange={e => update(i, { label: e.target.value })} className={`${inputCls} h-8`} aria-label="Step name" />
            </div>
            <select value={s.status} onChange={e => update(i, { status: e.target.value as StepStatus })} className="sm:col-span-2 bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white text-[11px] rounded-lg px-2 h-8">
              {(Object.keys(STATUS_LABEL) as StepStatus[]).map(k => <option key={k} value={k}>{STATUS_LABEL[k]}</option>)}
            </select>
            <Input type="date" value={s.dueDate ?? ""} onChange={e => update(i, { dueDate: e.target.value || null })} className={`${inputCls} h-8 sm:col-span-2`} aria-label="Target date" />
            <Input value={s.note ?? ""} onChange={e => update(i, { note: e.target.value })} placeholder="Note for client" className={`${inputCls} h-8 sm:col-span-3`} />
            {(s.doneAt || s.startedAt) && <div className="sm:col-span-12 text-[10px] text-white/30 pl-6">{s.doneAt ? `Done ${fmtDate(s.doneAt)}` : `Started ${fmtDate(s.startedAt)}`}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Sends the client a Google review link by SMS and/or email. */
export function ReviewRequestButton({ api, base, projectId, compact }: { api: ApiFetch; base: string; projectId: number; compact?: boolean }) {
  const { toast } = useToast();
  const send = useMutation({
    mutationFn: (force: boolean) => api(`${base}/projects/${projectId}/request-review`, { method: "POST", body: JSON.stringify({ force }) }),
    onSuccess: (r: any) => {
      const results = Object.entries(r.results || {}) as [string, any][];
      const sent = results.filter(([, v]) => v.ok).map(([k]) => k);
      if (sent.length) toast({ title: `Review request sent by ${sent.join(" and ")}` });
      else toast({ title: "Not sent", description: results.map(([k, v]) => `${k}: ${v.detail || v.status}`).join(" · "), variant: "destructive" });
    },
    onError: (e: any, force) => {
      if (e.status === 409 && !force && window.confirm(`${e.message} Send another one anyway?`)) send.mutate(true);
      else if (e.status !== 409 || force) toast({ title: "Could not send review request", description: e.message, variant: "destructive" });
    },
  });
  return (
    <Button variant="outline" onClick={() => send.mutate(false)} disabled={send.isPending} className={`${ghostBtn} ${compact ? "h-7 text-[10px]" : "h-8"}`}>
      <Star size={12} className="text-[#fbbf24]" />{send.isPending ? "Sending…" : "Ask for a Google review"}
    </Button>
  );
}
