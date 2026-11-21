import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Target, Plus, Phone, MessageSquare, FileText, Trash2, Edit2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { ApiFetch } from "@/lib/api";
import { peso } from "@shared/solarMath";
import { Field, SectionHeader, EmptyState, inputCls, selectCls, panelCls, primaryBtn, ghostBtn, toNum, timeAgo } from "./ui";

export type Lead = {
  id: number; clientName: string; clientEmail: string | null; clientPhone: string | null;
  source: string; status: string; score: number | null; notes: string | null;
  monthlyBill: number | null; address: string | null; createdAt: string;
};

export const STAGES: { id: string; label: string }[] = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "survey_scheduled", label: "Survey set" },
  { id: "quoted", label: "Quoted" },
  { id: "closed_won", label: "Won" },
  { id: "closed_lost", label: "Lost" },
];
const SOURCES = ["facebook", "quote_form", "referral", "walk-in", "web", "other"];

const EMPTY = { clientName: "", clientPhone: "", clientEmail: "", address: "", monthlyBill: "", source: "facebook", status: "new", notes: "" };

export default function LeadsPanel({ api, base, onCreateProposal }: { api: ApiFetch; base: string; onCreateProposal?: (lead: Lead) => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const key = [base, "leads"];
  const { data: leads = [], isLoading } = useQuery<Lead[]>({ queryKey: key, queryFn: () => api(`${base}/leads`) });
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [showClosed, setShowClosed] = useState(false);

  const save = useMutation({
    mutationFn: () => {
      const body = {
        clientName: form.clientName.trim(), clientPhone: form.clientPhone.trim() || null, clientEmail: form.clientEmail.trim() || null,
        address: form.address.trim() || null, monthlyBill: toNum(form.monthlyBill), source: form.source, status: form.status, notes: form.notes.trim() || null,
      };
      return editing === "new"
        ? api(`${base}/leads`, { method: "POST", body: JSON.stringify(body) })
        : api(`${base}/leads/${editing}`, { method: "PATCH", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); setEditing(null); setForm(EMPTY); toast({ title: "Lead saved" }); },
    onError: (e: any) => toast({ title: "Could not save lead", description: e.message, variant: "destructive" }),
  });
  const move = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api(`${base}/leads/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: (e: any) => toast({ title: "Could not update lead", description: e.message, variant: "destructive" }),
  });
  const remove = useMutation({
    mutationFn: (id: number) => api(`${base}/leads/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast({ title: "Lead deleted" }); },
  });

  const counts = useMemo(() => Object.fromEntries(STAGES.map(s => [s.id, leads.filter(l => l.status === s.id).length])), [leads]);
  const uncontacted = leads.filter(l => l.status === "new" && Date.now() - new Date(l.createdAt).getTime() > 60 * 60_000).length;
  const visibleStages = STAGES.filter(s => showClosed || !s.id.startsWith("closed"));

  const startEdit = (l: Lead) => {
    setForm({
      clientName: l.clientName, clientPhone: l.clientPhone || "", clientEmail: l.clientEmail || "", address: l.address || "",
      monthlyBill: l.monthlyBill ? String(l.monthlyBill) : "", source: l.source || "other", status: l.status, notes: l.notes || "",
    });
    setEditing(l.id);
  };
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const won = counts.closed_won || 0;
  const decided = won + (counts.closed_lost || 0);

  return (
    <div className="space-y-5">
      <SectionHeader icon={<Target size={20} className="text-[#fbbf24]" />} title="Leads"
        subtitle={`${leads.length} total · ${decided ? Math.round((won / decided) * 100) : 0}% won of decided leads`}
        actions={<>
          <Button variant="outline" onClick={() => setShowClosed(s => !s)} className={ghostBtn}>{showClosed ? "Hide won/lost" : "Show won/lost"}</Button>
          <Button onClick={() => { setForm(EMPTY); setEditing("new"); }} className={primaryBtn}><Plus size={14} />Add lead</Button>
        </>} />

      {uncontacted > 0 && (
        <div className="flex items-center gap-2 text-[11px] text-orange-300 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-2.5">
          <AlertTriangle size={13} /> {uncontacted} new lead{uncontacted > 1 ? "s have" : " has"} waited over an hour. Leads called within minutes close far more often.
        </div>
      )}

      {editing !== null && (
        <div className={`${panelCls} p-5 space-y-3`}>
          <div className="text-sm font-black text-white">{editing === "new" ? "Add lead" : "Edit lead"}</div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Name *"><Input value={form.clientName} onChange={set("clientName")} className={inputCls} /></Field>
            <Field label="Mobile"><Input value={form.clientPhone} onChange={set("clientPhone")} className={inputCls} /></Field>
            <Field label="Email"><Input value={form.clientEmail} onChange={set("clientEmail")} className={inputCls} /></Field>
            <Field label="Address"><Input value={form.address} onChange={set("address")} className={inputCls} /></Field>
            <Field label="Monthly bill (₱)"><Input inputMode="numeric" value={form.monthlyBill} onChange={set("monthlyBill")} className={inputCls} /></Field>
            <Field label="Source">
              <select value={form.source} onChange={set("source")} className={`${selectCls} w-full`}>{SOURCES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select>
            </Field>
            <Field label="Stage">
              <select value={form.status} onChange={set("status")} className={`${selectCls} w-full`}>{STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
            </Field>
            <Field label="Notes" className="sm:col-span-2"><Input value={form.notes} onChange={set("notes")} className={inputCls} /></Field>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => form.clientName.trim() ? save.mutate() : toast({ title: "Name is required", variant: "destructive" })} disabled={save.isPending} className={primaryBtn}>{save.isPending ? "Saving…" : "Save"}</Button>
            <Button variant="outline" onClick={() => setEditing(null)} className={ghostBtn}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? <div className="text-xs text-white/30 p-4">Loading leads…</div> : leads.length === 0 ? (
        <EmptyState title="No leads yet." body="Add one, or share your quote-request page from Settings so new enquiries arrive here automatically." />
      ) : (
        <div className={`grid gap-4 ${showClosed ? "lg:grid-cols-6 md:grid-cols-3" : "lg:grid-cols-4 md:grid-cols-2"}`}>
          {visibleStages.map(stage => (
            <div key={stage.id} className="space-y-3 min-w-0">
              <div className="flex items-center justify-between pb-2 border-b border-white/5 px-1">
                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{stage.label}</span>
                <span className="bg-white/5 text-[9px] px-2 py-0.5 rounded text-white/60">{counts[stage.id] || 0}</span>
              </div>
              {leads.filter(l => l.status === stage.id).map(lead => {
                const late = lead.status === "new" && Date.now() - new Date(lead.createdAt).getTime() > 60 * 60_000;
                return (
                  <div key={lead.id} className={`${panelCls} p-3 space-y-2 ${late ? "border-orange-500/40" : ""}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{lead.clientName}</div>
                        <div className="text-[10px] text-white/35">{lead.source.replace("_", " ")} · {timeAgo(lead.createdAt)}</div>
                      </div>
                      {lead.monthlyBill ? <span className="text-[10px] text-[#fbbf24] font-bold whitespace-nowrap">{peso(lead.monthlyBill)}/mo</span> : null}
                    </div>
                    {lead.notes && <p className="text-[10px] text-white/45 line-clamp-2 whitespace-pre-line">{lead.notes}</p>}
                    <div className="flex flex-wrap gap-1.5">
                      {lead.clientPhone && <a href={`tel:${lead.clientPhone}`} className="text-[10px] text-sky-400 flex items-center gap-1 hover:underline"><Phone size={10} />Call</a>}
                      {lead.clientPhone && <a href={`sms:${lead.clientPhone}`} className="text-[10px] text-sky-400 flex items-center gap-1 hover:underline"><MessageSquare size={10} />Text</a>}
                      {onCreateProposal && <button onClick={() => onCreateProposal(lead)} className="text-[10px] text-[#fbbf24] flex items-center gap-1 hover:underline"><FileText size={10} />Proposal</button>}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                      <select value={lead.status} onChange={e => move.mutate({ id: lead.id, status: e.target.value })} className="bg-transparent text-[10px] text-white/60 border border-white/10 rounded px-1.5 py-1 flex-1 min-w-0">
                        {STAGES.map(s => <option key={s.id} value={s.id} className="bg-[hsl(220_24%_9%)]">{s.label}</option>)}
                      </select>
                      <button onClick={() => startEdit(lead)} className="text-white/40 hover:text-white p-1" aria-label="Edit lead"><Edit2 size={11} /></button>
                      <button onClick={() => { if (window.confirm(`Delete ${lead.clientName}?`)) remove.mutate(lead.id); }} className="text-red-400/60 hover:text-red-400 p-1" aria-label="Delete lead"><Trash2 size={11} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
