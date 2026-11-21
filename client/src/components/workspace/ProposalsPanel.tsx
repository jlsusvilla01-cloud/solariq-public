import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Copy, ExternalLink, Send, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { ApiFetch } from "@/lib/api";
import { calculateProposal, peso, ASSUMPTIONS, type SystemType } from "@shared/solarMath";
import { Field, SectionHeader, EmptyState, inputCls, selectCls, panelCls, primaryBtn, ghostBtn, toNum, fmtDate } from "./ui";
import type { Lead } from "./LeadsPanel";

type Form = {
  leadId: number | null; clientName: string; clientPhone: string; clientEmail: string; address: string; notes: string;
  monthlyBill: string; utilityRate: string; systemType: SystemType; pricePerKw: string; systemKw: string; batteryKwh: string;
  extrasAmount: string; discountAmount: string; financeMonths: string; financeAprPct: string; downPaymentPct: string;
};

const statusColor: Record<string, string> = {
  draft: "text-white/50 border-white/15", sent: "text-sky-400 border-sky-400/30",
  accepted: "text-green-400 border-green-400/30", declined: "text-red-400 border-red-400/30",
};

export default function ProposalsPanel({ api, base, fromLead, onLeadUsed }: { api: ApiFetch; base: string; fromLead?: Lead | null; onLeadUsed?: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const key = [base, "proposals"];
  const { data: proposals = [], isLoading } = useQuery<any[]>({ queryKey: key, queryFn: () => api(`${base}/proposals`) });
  const { data: profile } = useQuery<any>({ queryKey: [base, "profile"], queryFn: () => api(`${base}/profile`) });
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<Form | null>(null);

  const blank = (lead?: Lead | null): Form => ({
    leadId: lead?.id ?? null, clientName: lead?.clientName ?? "", clientPhone: lead?.clientPhone ?? "", clientEmail: lead?.clientEmail ?? "",
    address: lead?.address ?? "", notes: "", monthlyBill: lead?.monthlyBill ? String(lead.monthlyBill) : "",
    utilityRate: String(profile?.utilityRate ?? 15.68), systemType: "grid",
    pricePerKw: profile?.gridPricePerKw ? String(profile.gridPricePerKw) : "", systemKw: "", batteryKwh: "",
    extrasAmount: "", discountAmount: "", financeMonths: String(profile?.financeMonths ?? 0),
    financeAprPct: profile?.financeAprPct != null ? String(profile.financeAprPct) : "", downPaymentPct: profile?.downPaymentPct != null ? String(profile.downPaymentPct) : "",
  });

  useEffect(() => {
    if (fromLead && profile) { setForm(blank(fromLead)); setEditing("new"); onLeadUsed?.(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromLead, profile]);

  const preview = useMemo(() => {
    if (!form) return null;
    const bill = toNum(form.monthlyBill), rate = toNum(form.utilityRate), price = toNum(form.pricePerKw);
    if (!bill || !rate || !price) return null;
    return calculateProposal({
      monthlyBill: bill, utilityRate: rate, systemType: form.systemType, pricePerKw: price,
      systemKw: toNum(form.systemKw), extrasAmount: toNum(form.extrasAmount), discountAmount: toNum(form.discountAmount),
      financeMonths: toNum(form.financeMonths), financeAprPct: toNum(form.financeAprPct), downPaymentPct: toNum(form.downPaymentPct),
    });
  }, [form]);

  const save = useMutation({
    mutationFn: () => {
      const f = form!;
      const body = {
        leadId: f.leadId, clientName: f.clientName.trim(), clientPhone: f.clientPhone.trim() || null, clientEmail: f.clientEmail.trim() || null,
        address: f.address.trim() || null, notes: f.notes.trim() || null,
        monthlyBill: toNum(f.monthlyBill), utilityRate: toNum(f.utilityRate), systemType: f.systemType, pricePerKw: toNum(f.pricePerKw),
        systemKw: toNum(f.systemKw), batteryKwh: toNum(f.batteryKwh), extrasAmount: toNum(f.extrasAmount), discountAmount: toNum(f.discountAmount),
        financeMonths: toNum(f.financeMonths) ?? 0, financeAprPct: toNum(f.financeAprPct) ?? 0, downPaymentPct: toNum(f.downPaymentPct) ?? 0,
      };
      if (body.financeMonths) body.financeMonths = Math.round(body.financeMonths);
      return editing === "new"
        ? api(`${base}/proposals`, { method: "POST", body: JSON.stringify(body) })
        : api(`${base}/proposals/${editing}`, { method: "PUT", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); qc.invalidateQueries({ queryKey: [base, "leads"] }); setEditing(null); setForm(null); toast({ title: "Proposal saved" }); },
    onError: (e: any) => toast({ title: "Could not save proposal", description: e.message, variant: "destructive" }),
  });
  const send = useMutation({
    mutationFn: (id: number) => api(`${base}/proposals/${id}/send`, { method: "POST", body: JSON.stringify({ channels: ["email", "sms"] }) }),
    onSuccess: (r: any) => {
      qc.invalidateQueries({ queryKey: key });
      const results = Object.entries(r.results || {}) as [string, any][];
      const sent = results.filter(([, v]) => v.ok).map(([k]) => k);
      if (sent.length) toast({ title: `Sent by ${sent.join(" and ")}` });
      else toast({ title: "Not sent", description: results.length ? results.map(([k, v]) => `${k}: ${v.detail || v.status}`).join(" · ") : "The client has no email or mobile number. Copy the link and send it in Messenger.", variant: "destructive" });
    },
    onError: (e: any) => toast({ title: "Could not send", description: e.message, variant: "destructive" }),
  });
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api(`${base}/proposals/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
  const remove = useMutation({
    mutationFn: (id: number) => api(`${base}/proposals/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast({ title: "Proposal deleted" }); },
  });

  const linkFor = (p: any) => `${window.location.origin}/#/p/${p.shareToken}`;
  const copy = (text: string) => navigator.clipboard?.writeText(text).then(() => toast({ title: "Link copied", description: "Paste it into Messenger or Viber." }));
  const startEdit = (p: any) => {
    const i = p.inputs;
    setForm({
      leadId: p.leadId, clientName: p.clientName, clientPhone: p.clientPhone || "", clientEmail: p.clientEmail || "", address: p.address || "", notes: p.notes || "",
      monthlyBill: String(i.monthlyBill), utilityRate: String(i.utilityRate), systemType: i.systemType, pricePerKw: String(i.pricePerKw),
      systemKw: i.systemKw ? String(i.systemKw) : "", batteryKwh: i.batteryKwh ? String(i.batteryKwh) : "",
      extrasAmount: i.extrasAmount ? String(i.extrasAmount) : "", discountAmount: i.discountAmount ? String(i.discountAmount) : "",
      financeMonths: String(i.financeMonths ?? 0), financeAprPct: String(i.financeAprPct ?? ""), downPaymentPct: String(i.downPaymentPct ?? ""),
    });
    setEditing(p.id);
  };
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setForm(f => {
      if (!f) return f;
      const next = { ...f, [k]: value } as Form;
      if (k === "systemType" && profile) {
        const p = value === "hybrid" ? profile.hybridPricePerKw : profile.gridPricePerKw;
        if (p) next.pricePerKw = String(p);
      }
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <SectionHeader icon={<FileText size={20} className="text-[#fbbf24]" />} title="Proposals"
        subtitle="Turn a customer's electric bill into a priced proposal with savings, payback and monthly payments."
        actions={<Button onClick={() => { setForm(blank()); setEditing("new"); }} disabled={!profile} className={primaryBtn}><Plus size={14} />New proposal</Button>} />

      {editing !== null && form && (
        <div className="grid lg:grid-cols-5 gap-4">
          <div className={`${panelCls} p-5 space-y-4 lg:col-span-3`}>
            <div className="text-sm font-black text-white">{editing === "new" ? "New proposal" : "Edit proposal"}</div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Client name *"><Input value={form.clientName} onChange={set("clientName")} className={inputCls} /></Field>
              <Field label="Address"><Input value={form.address} onChange={set("address")} className={inputCls} /></Field>
              <Field label="Client mobile"><Input value={form.clientPhone} onChange={set("clientPhone")} className={inputCls} /></Field>
              <Field label="Client email"><Input value={form.clientEmail} onChange={set("clientEmail")} className={inputCls} /></Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Monthly bill (₱) *"><Input inputMode="numeric" value={form.monthlyBill} onChange={set("monthlyBill")} placeholder="e.g. 8000" className={inputCls} /></Field>
              <Field label="Utility rate (₱/kWh) *"><Input inputMode="decimal" value={form.utilityRate} onChange={set("utilityRate")} className={inputCls} /></Field>
              <Field label="System type">
                <select value={form.systemType} onChange={set("systemType")} className={`${selectCls} w-full`}>
                  <option value="grid">Grid-tie (no battery)</option>
                  <option value="hybrid">Hybrid with battery</option>
                </select>
              </Field>
              <Field label="Price per kW (₱) *" hint={form.systemType === "hybrid" ? "All-in, battery included" : undefined}><Input inputMode="numeric" value={form.pricePerKw} onChange={set("pricePerKw")} className={inputCls} /></Field>
              <Field label="System size (kW)" hint={preview && !form.systemKw ? `Auto: ${preview.systemKw} kW` : "Leave blank to size automatically"}><Input inputMode="decimal" value={form.systemKw} onChange={set("systemKw")} className={inputCls} /></Field>
              {form.systemType === "hybrid" && <Field label="Battery (kWh)"><Input inputMode="decimal" value={form.batteryKwh} onChange={set("batteryKwh")} className={inputCls} /></Field>}
              <Field label="Add-ons (₱)"><Input inputMode="numeric" value={form.extrasAmount} onChange={set("extrasAmount")} className={inputCls} /></Field>
              <Field label="Discount (₱)"><Input inputMode="numeric" value={form.discountAmount} onChange={set("discountAmount")} className={inputCls} /></Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Instalment months" hint="0 = cash price only"><Input inputMode="numeric" value={form.financeMonths} onChange={set("financeMonths")} className={inputCls} /></Field>
              <Field label="Interest per year (%)"><Input inputMode="decimal" value={form.financeAprPct} onChange={set("financeAprPct")} className={inputCls} /></Field>
              <Field label="Down payment (%)"><Input inputMode="decimal" value={form.downPaymentPct} onChange={set("downPaymentPct")} className={inputCls} /></Field>
            </div>
            <Field label="Notes for the client"><Input value={form.notes} onChange={set("notes")} placeholder="Brands, warranty, inclusions" className={inputCls} /></Field>
            <div className="flex gap-2">
              <Button onClick={() => save.mutate()} disabled={save.isPending || !preview || !form.clientName.trim()} className={primaryBtn}>{save.isPending ? "Saving…" : "Save proposal"}</Button>
              <Button variant="outline" onClick={() => { setEditing(null); setForm(null); }} className={ghostBtn}>Cancel</Button>
            </div>
          </div>
          <div className={`${panelCls} p-5 lg:col-span-2 space-y-3`}>
            <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">What the client sees</div>
            {!preview ? <p className="text-xs text-white/35">Enter the monthly bill, utility rate and price per kW to see the numbers.</p> : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["System", `${preview.systemKw} kW`],
                    ["Total price", peso(preview.totalPrice)],
                    ["Saves per month", peso(preview.monthlySavings)],
                    ["New bill", `about ${peso(preview.newMonthlyBill)}`],
                    ["Payback", preview.paybackYears ? `${preview.paybackYears.toFixed(1)} years` : "—"],
                    ["10-year savings", peso(preview.tenYearSavings)],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-black/20 rounded-xl p-3">
                      <div className="text-[9px] text-white/35 uppercase font-black tracking-widest">{l}</div>
                      <div className="text-base font-black text-white tabular-nums">{v}</div>
                    </div>
                  ))}
                </div>
                {preview.financed && (
                  <div className="border border-[#fbbf24]/20 bg-[#fbbf24]/5 rounded-xl p-3 text-xs text-white/80">
                    {peso(preview.downPayment)} down, then <span className="font-black text-[#fbbf24]">{peso(preview.monthlyPayment)}/month</span> for {preview.financeMonths} months
                    {preview.monthlyPayment <= preview.monthlySavings ? " — less than the monthly savings." : "."}
                  </div>
                )}
                <p className="text-[10px] text-white/30 leading-relaxed">
                  Assumes {ASSUMPTIONS.kwhPerKwMonth} kWh per kW each month, {Math.round(ASSUMPTIONS.selfUseShare[form.systemType] * 100)}% used on site,
                  exports credited at ₱{ASSUMPTIONS.exportCreditPerKwh}/kWh, and savings capped at the current bill.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {isLoading ? <div className="text-xs text-white/30 p-4">Loading proposals…</div> : proposals.length === 0 && editing === null ? (
        <EmptyState title="No proposals yet." body="Click New proposal, or open a lead and choose Proposal. Set your prices in Settings so they fill in automatically." />
      ) : (
        <div className="space-y-3">
          {proposals.map(p => (
            <div key={p.id} className={`${panelCls} p-4 flex flex-wrap items-center gap-4`}>
              <div className="flex-1 min-w-[180px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{p.clientName}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border font-black uppercase ${statusColor[p.status] || statusColor.draft}`}>{p.status}</span>
                </div>
                <div className="text-[10px] text-white/40 mt-1">
                  {p.result.systemKw} kW {p.inputs.systemType === "hybrid" ? "hybrid" : "grid-tie"} · {peso(p.result.totalPrice)} · saves {peso(p.result.monthlySavings)}/mo · valid to {fmtDate(p.validUntil)}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <a href={linkFor(p)} target="_blank" rel="noopener noreferrer"><Button variant="outline" className={`${ghostBtn} h-8`}><ExternalLink size={12} />View</Button></a>
                <Button variant="outline" onClick={() => copy(linkFor(p))} className={`${ghostBtn} h-8`}><Copy size={12} />Copy link</Button>
                <Button variant="outline" onClick={() => send.mutate(p.id)} disabled={send.isPending} className={`${ghostBtn} h-8`}><Send size={12} />Send</Button>
                {p.status !== "accepted" && <Button variant="outline" onClick={() => startEdit(p)} className={`${ghostBtn} h-8`}><Edit2 size={12} />Edit</Button>}
                <select value={p.status} onChange={e => setStatus.mutate({ id: p.id, status: e.target.value })} className="bg-transparent text-[10px] text-white/60 border border-white/10 rounded px-2 h-8">
                  {["draft", "sent", "accepted", "declined"].map(s => <option key={s} value={s} className="bg-[hsl(220_24%_9%)]">{s}</option>)}
                </select>
                <Button variant="outline" onClick={() => { if (window.confirm(`Delete the proposal for ${p.clientName}?`)) remove.mutate(p.id); }} className="border-red-500/20 text-red-400 text-[10px] h-8 px-2"><Trash2 size={12} /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
