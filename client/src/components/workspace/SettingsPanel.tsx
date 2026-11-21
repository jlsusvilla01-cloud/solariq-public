import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Copy, ExternalLink, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { ApiFetch } from "@/lib/api";
import { Field, SectionHeader, inputCls, panelCls, primaryBtn, ghostBtn, toNum, fmtDate } from "./ui";

type Profile = Record<string, any> & { quoteUrl: string; slug: string };

const TEXT_FIELDS = ["companyName", "slug", "contactPhone", "contactEmail", "notifyEmail", "notifyPhone", "messengerUrl", "reviewUrl", "serviceArea"] as const;
const NUM_FIELDS = ["gridPricePerKw", "hybridPricePerKw", "utilityRate", "financeMonths", "financeAprPct", "downPaymentPct", "proposalValidDays"] as const;

export default function SettingsPanel({ api, base }: { api: ApiFetch; base: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: profile } = useQuery<Profile>({ queryKey: [base, "profile"], queryFn: () => api(`${base}/profile`) });
  const { data: messages = [] } = useQuery<any[]>({ queryKey: [base, "messages"], queryFn: () => api(`${base}/messages`) });
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!profile) return;
    const f: Record<string, string> = {};
    for (const k of [...TEXT_FIELDS, ...NUM_FIELDS]) f[k] = profile[k] == null ? "" : String(profile[k]);
    setForm(f);
  }, [profile]);

  const save = useMutation({
    mutationFn: () => {
      const body: Record<string, any> = {};
      for (const k of TEXT_FIELDS) body[k] = form[k]?.trim() || null;
      body.companyName = form.companyName?.trim() || "";
      body.slug = form.slug?.trim().toLowerCase() || undefined;
      for (const k of NUM_FIELDS) body[k] = toNum(form[k]);
      if (body.financeMonths != null) body.financeMonths = Math.round(body.financeMonths);
      if (body.proposalValidDays != null) body.proposalValidDays = Math.round(body.proposalValidDays);
      return api(`${base}/profile`, { method: "PUT", body: JSON.stringify(body) });
    },
    onSuccess: (p) => { qc.setQueryData([base, "profile"], p); toast({ title: "Settings saved" }); },
    onError: (e: any) => toast({ title: "Could not save settings", description: e.message, variant: "destructive" }),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const copy = (text: string) => navigator.clipboard?.writeText(text).then(() => toast({ title: "Link copied" }));

  if (!profile) return <div className="text-xs text-white/30 p-4">Loading settings…</div>;

  return (
    <div className="space-y-6">
      <SectionHeader icon={<Settings size={20} className="text-[#fbbf24]" />} title="Settings"
        subtitle="Your company details, proposal defaults and where new-lead alerts go."
        actions={<Button onClick={() => save.mutate()} disabled={save.isPending} className={primaryBtn}>{save.isPending ? "Saving…" : "Save settings"}</Button>} />

      <div className={`${panelCls} p-5 space-y-3`}>
        <div className="text-sm font-black text-white">Your quote-request page</div>
        <p className="text-[11px] text-white/45">Share this link on Facebook, in Messenger replies and on your posters. Every request lands in Leads and alerts you right away.</p>
        <div className="flex flex-wrap items-center gap-2">
          <code className="text-[11px] text-[#fbbf24] bg-black/30 px-3 py-2 rounded-lg break-all">{profile.quoteUrl}</code>
          <Button variant="outline" onClick={() => copy(profile.quoteUrl)} className={ghostBtn}><Copy size={12} />Copy</Button>
          <a href={profile.quoteUrl} target="_blank" rel="noopener noreferrer"><Button variant="outline" className={ghostBtn}><ExternalLink size={12} />Open</Button></a>
        </div>
      </div>

      <div className={`${panelCls} p-5 space-y-4`}>
        <div className="text-sm font-black text-white">Company</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Company name"><Input value={form.companyName ?? ""} onChange={set("companyName")} className={inputCls} /></Field>
          <Field label="Quote page address" hint="Lowercase letters, numbers and dashes."><Input value={form.slug ?? ""} onChange={set("slug")} className={inputCls} /></Field>
          <Field label="Contact phone (shown to clients)"><Input value={form.contactPhone ?? ""} onChange={set("contactPhone")} className={inputCls} /></Field>
          <Field label="Contact email (shown to clients)"><Input value={form.contactEmail ?? ""} onChange={set("contactEmail")} className={inputCls} /></Field>
          <Field label="Service area" hint="For example: Iloilo City, Pavia, Oton"><Input value={form.serviceArea ?? ""} onChange={set("serviceArea")} className={inputCls} /></Field>
          <Field label="Facebook Messenger link" hint="Your m.me link, starting with https://"><Input value={form.messengerUrl ?? ""} onChange={set("messengerUrl")} placeholder="https://m.me/yourpage" className={inputCls} /></Field>
          <Field label="Google review link" hint="From your Google Business Profile: Share review form." className="sm:col-span-2"><Input value={form.reviewUrl ?? ""} onChange={set("reviewUrl")} placeholder="https://g.page/r/..." className={inputCls} /></Field>
        </div>
      </div>

      <div className={`${panelCls} p-5 space-y-4`}>
        <div className="text-sm font-black text-white">New-lead alerts</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Alert email"><Input value={form.notifyEmail ?? ""} onChange={set("notifyEmail")} className={inputCls} /></Field>
          <Field label="Alert mobile number" hint="Philippine mobile, e.g. 0917 123 4567"><Input value={form.notifyPhone ?? ""} onChange={set("notifyPhone")} className={inputCls} /></Field>
        </div>
      </div>

      <div className={`${panelCls} p-5 space-y-4`}>
        <div className="text-sm font-black text-white">Proposal defaults</div>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Grid-tie price (₱ per kW)"><Input inputMode="numeric" value={form.gridPricePerKw ?? ""} onChange={set("gridPricePerKw")} placeholder="e.g. 45000" className={inputCls} /></Field>
          <Field label="Hybrid price (₱ per kW, with battery)"><Input inputMode="numeric" value={form.hybridPricePerKw ?? ""} onChange={set("hybridPricePerKw")} placeholder="e.g. 60000" className={inputCls} /></Field>
          <Field label="Utility rate (₱ per kWh)" hint="MORE Power residential, Nov 2026: ₱15.68"><Input inputMode="decimal" value={form.utilityRate ?? ""} onChange={set("utilityRate")} className={inputCls} /></Field>
          <Field label="Instalment months" hint="0 = cash only"><Input inputMode="numeric" value={form.financeMonths ?? ""} onChange={set("financeMonths")} className={inputCls} /></Field>
          <Field label="Interest per year (%)"><Input inputMode="decimal" value={form.financeAprPct ?? ""} onChange={set("financeAprPct")} className={inputCls} /></Field>
          <Field label="Down payment (%)"><Input inputMode="decimal" value={form.downPaymentPct ?? ""} onChange={set("downPaymentPct")} className={inputCls} /></Field>
          <Field label="Proposal valid for (days)"><Input inputMode="numeric" value={form.proposalValidDays ?? ""} onChange={set("proposalValidDays")} className={inputCls} /></Field>
        </div>
      </div>

      <div className={`${panelCls} p-5 space-y-3`}>
        <div className="text-sm font-black text-white">Messages sent</div>
        <p className="text-[11px] text-white/45">Every lead alert, proposal and review request the system tried to send. "Skipped" means email or SMS is not switched on yet.</p>
        {messages.length === 0 ? <p className="text-[11px] text-white/30">Nothing sent yet.</p> : (
          <div className="divide-y divide-white/5">
            {messages.slice(0, 20).map(m => (
              <div key={m.id} className="py-2 flex flex-wrap items-center gap-3 text-[11px]">
                {m.channel === "sms" ? <MessageSquare size={12} className="text-white/40" /> : <Mail size={12} className="text-white/40" />}
                <span className="text-white/70 w-28">{m.purpose.replace(/_/g, " ")}</span>
                <span className="text-white/50 flex-1 min-w-[120px] truncate">{m.recipient}</span>
                <span className={m.status === "sent" ? "text-green-400" : m.status === "skipped" ? "text-yellow-400" : "text-red-400"}>{m.status}</span>
                <span className="text-white/30 w-24 text-right">{fmtDate(m.createdAt)}</span>
                {m.detail && m.status !== "sent" && <span className="basis-full text-white/30 pl-6">{m.detail}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
