import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, Plus, LogOut, Menu, X, Zap, Clock, CheckCircle2, AlertTriangle, ChevronRight, ChevronDown,
  Sun, MapPin, Target, FileText, Crosshair, Settings, Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { makeApi, ApiError, type ApiFetch } from "@/lib/api";
import Paywall from "./Paywall";
import LeadsPanel, { type Lead } from "@/components/workspace/LeadsPanel";
import ProposalsPanel from "@/components/workspace/ProposalsPanel";
import SettingsPanel from "@/components/workspace/SettingsPanel";
import { NetMeteringPanel, ReviewRequestButton } from "@/components/workspace/NetMeteringPanel";
import MarketIntelTab from "@/components/MarketIntelTab";
import { Field, inputCls, panelCls, primaryBtn, ghostBtn, toNum } from "@/components/workspace/ui";

interface UserProfile {
  id: number; name: string; email: string; company: string | null;
  trialStartDate: string; trialEndDate: string; subscriptionStatus: string;
  subscriptionPlan: string | null; billingCycle: string | null; paidUntil: string | null;
}

const BASE = "/api/user";
const TABS = [
  { id: "projects", label: "Projects", icon: LayoutDashboard },
  { id: "leads", label: "Leads", icon: Target },
  { id: "proposals", label: "Proposals", icon: FileText },
  { id: "market-intel", label: "Market Intel", icon: Crosshair },
  { id: "settings", label: "Settings", icon: Settings },
] as const;
type TabId = typeof TABS[number]["id"];

// The lead picked in Leads survives the route change to Proposals (the page may remount on navigation).
let pendingProposalLead: Lead | null = null;

const daysUntil = (iso?: string | null) => (iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)) : 0);

function PlanBanner({ user, onUpgrade }: { user: UserProfile; onUpgrade: () => void }) {
  if (user.subscriptionStatus === "active") {
    return (
      <div className="bg-green-500/5 border border-green-500/15 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-green-400 font-bold flex items-center gap-2"><CheckCircle2 size={14} />{(user.subscriptionPlan || "").replace(/^./, c => c.toUpperCase())} plan active</span>
        <span className="text-[10px] text-green-400/70">Paid through {user.paidUntil ? new Date(user.paidUntil).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—"}</span>
      </div>
    );
  }
  if (user.subscriptionStatus === "expired" || user.subscriptionStatus === "cancelled") {
    return (
      <div className="bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-red-400 font-bold flex items-center gap-2"><AlertTriangle size={14} />Your trial or plan has ended. Your data is safe; choose a plan to keep working.</span>
        <Button onClick={onUpgrade} className={`${primaryBtn} h-7`}>Choose a plan</Button>
      </div>
    );
  }
  const left = daysUntil(user.trialEndDate);
  return (
    <div className={`${left <= 3 ? "bg-orange-500/5 border-orange-500/15" : "bg-[#fbbf24]/5 border-[#fbbf24]/15"} border rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2`}>
      <span className={`text-xs font-bold flex items-center gap-2 ${left <= 3 ? "text-orange-400" : "text-[#fbbf24]"}`}><Clock size={14} />{left} day{left !== 1 ? "s" : ""} left in your free trial</span>
      <Button onClick={onUpgrade} variant="outline" className={`${ghostBtn} h-7`}>See plans</Button>
    </div>
  );
}

function ProjectCard({ proj, api }: { proj: any; api: ApiFetch }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: detail } = useQuery<any>({ queryKey: [BASE, "project", proj.id], queryFn: () => api(`${BASE}/projects/${proj.id}`), enabled: open });
  const setMilestone = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api(`${BASE}/milestones/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [BASE, "project", proj.id] }); qc.invalidateQueries({ queryKey: [BASE, "projects"] }); },
    onError: (e: any) => toast({ title: "Could not update milestone", description: e.message, variant: "destructive" }),
  });
  const trackUrl = `${window.location.origin}/#/track/${proj.shareToken}`;
  const handedOver = detail?.milestones?.some((m: any) => m.phase === "commissioned" && m.status === "completed");

  return (
    <div className={`${panelCls} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <button onClick={() => setOpen(o => !o)} className="flex-1 text-left">
          <div className="flex items-center gap-3 mb-2">
            {open ? <ChevronDown size={14} className="text-white/40" /> : <ChevronRight size={14} className="text-white/40" />}
            <h3 className="font-bold text-white text-sm">{proj.clientName}</h3>
            <Badge variant="outline" className="text-[10px] border-[#fbbf24]/20 text-[#fbbf24]">{proj.status}</Badge>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/40 mb-2 pl-6"><MapPin size={11} /> {proj.address}</div>
          <div className="flex items-center gap-6 text-[11px] pl-6">
            <span className="text-white/50"><Zap size={11} className="inline text-[#fbbf24] mr-1" />{proj.systemKw} kWp</span>
            <span className="text-white/50">Net metering: {String(proj.netMeteringStatus || "pending").replace(/_/g, " ")}</span>
          </div>
        </button>
        <div className="text-right">
          <div className="text-2xl font-black text-white">{proj.overallProgress || 0}%</div>
          <div className="w-24 h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden"><div className="h-full bg-[#fbbf24] rounded-full" style={{ width: `${proj.overallProgress || 0}%` }} /></div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
        <Link href={`/track/${proj.shareToken}`}><a className="text-[10px] text-[#fbbf24] font-bold hover:underline flex items-center gap-1">Client tracker <ChevronRight size={10} /></a></Link>
        <button onClick={() => navigator.clipboard?.writeText(trackUrl).then(() => toast({ title: "Tracker link copied" }))} className="text-[10px] text-white/50 hover:text-white flex items-center gap-1"><Copy size={10} />Copy link for client</button>
        <div className="flex-1" />
        <ReviewRequestButton api={api} base={BASE} projectId={proj.id} compact />
      </div>
      {open && (
        <div className="mt-5 space-y-6">
          {handedOver && <div className="text-[11px] text-green-300 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">Handover is done. This is the best moment to ask for a Google review.</div>}
          <div>
            <div className="text-sm font-black text-white mb-2">Milestones</div>
            {!detail ? <div className="text-xs text-white/30">Loading…</div> : (
              <div className="space-y-1.5">
                {detail.milestones.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-3 text-[11px]">
                    {m.status === "completed" ? <CheckCircle2 size={13} className="text-green-400" /> : m.status === "in_progress" ? <Clock size={13} className="text-[#fbbf24]" /> : m.status === "blocked" ? <AlertTriangle size={13} className="text-red-400" /> : <span className="w-[13px] h-[13px] rounded-full border border-white/20" />}
                    <span className="flex-1 text-white/75">{m.title}</span>
                    <select value={m.status} onChange={e => setMilestone.mutate({ id: m.id, status: e.target.value })} className="bg-transparent text-[10px] text-white/60 border border-white/10 rounded px-1.5 py-1">
                      {["pending", "in_progress", "completed", "blocked"].map(s => <option key={s} value={s} className="bg-[hsl(220_24%_9%)]">{s.replace("_", " ")}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
          <NetMeteringPanel api={api} base={BASE} projectId={proj.id} />
        </div>
      )}
    </div>
  );
}

function ProjectsTab({ api, user }: { api: ApiFetch; user: UserProfile }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: projects = [], isLoading } = useQuery<any[]>({ queryKey: [BASE, "projects"], queryFn: () => api(`${BASE}/projects`) });
  const [adding, setAdding] = useState(false);
  const empty = { clientName: "", clientEmail: "", clientPhone: "", address: "", systemKw: "6", panelCount: "10", contractValue: "" };
  const [form, setForm] = useState(empty);
  const create = useMutation({
    mutationFn: () => api(`${BASE}/projects`, { method: "POST", body: JSON.stringify({
      clientName: form.clientName, clientEmail: form.clientEmail, clientPhone: form.clientPhone, address: form.address,
      systemKw: toNum(form.systemKw) ?? 6, panelCount: toNum(form.panelCount) ?? 0, contractValue: toNum(form.contractValue) ?? 0,
    }) }),
    onSuccess: (p: any) => { qc.invalidateQueries({ queryKey: [BASE, "projects"] }); setAdding(false); setForm(empty); toast({ title: "Project created", description: `${p.clientName}'s tracker is ready to share.` }); },
    onError: (e: any) => toast({ title: "Could not create project", description: e.message, variant: "destructive" }),
  });
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[9px] font-black text-[#fbbf24]/60 uppercase tracking-[0.3em] mb-1">Welcome back</p>
          <h1 className="text-2xl font-black text-white">{user.company || user.name}'s projects</h1>
        </div>
        <Button onClick={() => setAdding(true)} className={primaryBtn}><Plus size={14} />New project</Button>
      </div>
      {adding && (
        <div className={`${panelCls} p-5 space-y-3`}>
          <div className="flex justify-between"><span className="text-sm font-black text-white">New solar project</span><button onClick={() => setAdding(false)} className="text-white/30 hover:text-white" aria-label="Close"><X size={16} /></button></div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Client name *"><Input value={form.clientName} onChange={set("clientName")} className={inputCls} /></Field>
            <Field label="Client mobile"><Input value={form.clientPhone} onChange={set("clientPhone")} className={inputCls} /></Field>
            <Field label="Client email"><Input value={form.clientEmail} onChange={set("clientEmail")} className={inputCls} /></Field>
            <Field label="Address *" className="sm:col-span-3"><Input value={form.address} onChange={set("address")} className={inputCls} /></Field>
            <Field label="System kW"><Input inputMode="decimal" value={form.systemKw} onChange={set("systemKw")} className={inputCls} /></Field>
            <Field label="Panel count"><Input inputMode="numeric" value={form.panelCount} onChange={set("panelCount")} className={inputCls} /></Field>
            <Field label="Contract value (₱)"><Input inputMode="numeric" value={form.contractValue} onChange={set("contractValue")} className={inputCls} /></Field>
          </div>
          <Button onClick={() => (form.clientName.trim() && form.address.trim() ? create.mutate() : toast({ title: "Client name and address are required", variant: "destructive" }))} disabled={create.isPending} className={primaryBtn}>{create.isPending ? "Creating…" : "Create project"}</Button>
        </div>
      )}
      {isLoading ? <div className="text-xs text-white/30">Loading projects…</div> : projects.length === 0 && !adding ? (
        <div className={`${panelCls} border-dashed p-12 text-center`}>
          <Sun size={40} className="text-[#fbbf24]/20 mx-auto mb-4" />
          <h3 className="text-white font-bold mb-2">No projects yet</h3>
          <p className="text-white/40 text-sm mb-6">Create a project to give your client a live progress tracker and manage net metering.</p>
          <Button onClick={() => setAdding(true)} className={primaryBtn}><Plus size={14} />Create first project</Button>
        </div>
      ) : (
        <div className="grid gap-4">{projects.map(p => <ProjectCard key={p.id} proj={p} api={api} />)}</div>
      )}
    </div>
  );
}

function Dashboard() {
  const [, navigate] = useLocation();
  const params = useParams<{ tab?: string }>();
  const tab: TabId = (TABS.find(t => t.id === params.tab)?.id ?? "projects") as TabId;
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [proposalLead, setProposalLead] = useState<Lead | null>(null);
  useEffect(() => {
    if (tab === "proposals" && pendingProposalLead) { setProposalLead(pendingProposalLead); pendingProposalLead = null; }
  }, [tab]);

  const signOut = () => {
    try { localStorage.removeItem("solariq_user_token"); localStorage.removeItem("solariq_user"); } catch { /* ignore */ }
    navigate("/signin");
  };
  const api = useMemo(() => makeApi({ tokenKey: "solariq_user_token", onUnauthorized: signOut, onPaymentRequired: () => setPaywall(true) }), []);
  const { data: user, refetch: refetchUser } = useQuery<UserProfile>({ queryKey: [BASE, "me"], queryFn: () => api(`${BASE}/me`), retry: false });

  useEffect(() => {
    let token = "";
    try { token = localStorage.getItem("solariq_user_token") || ""; } catch { /* ignore */ }
    if (!token) navigate("/signin");
  }, []);

  // Returning from PayMongo: the webhook activates the plan, so poll briefly for it.
  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("payment");
    if (!status) return;
    window.history.replaceState(null, "", window.location.pathname + window.location.hash);
    if (status === "cancelled") { toast({ title: "Payment cancelled", description: "No charge was made." }); return; }
    toast({ title: "Payment received", description: "Activating your plan…" });
    let tries = 0;
    const t = setInterval(async () => {
      tries++;
      const r = await refetchUser();
      if (r.data?.subscriptionStatus === "active" || tries >= 10) clearInterval(t);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { if (user && (user.subscriptionStatus === "expired" || user.subscriptionStatus === "cancelled")) setPaywall(true); }, [user?.subscriptionStatus]);

  const startCheckout = async (plan: string, billingCycle: string) => {
    try {
      const r = await api("/api/user/checkout", { method: "POST", body: JSON.stringify({ plan, billingCycle }) });
      window.location.href = r.checkoutUrl;
    } catch (e: any) {
      throw new Error(e instanceof ApiError ? e.message : "The payment page could not be opened.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[hsl(220_28%_6%)] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#fbbf24] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  const expired = user.subscriptionStatus === "expired" || user.subscriptionStatus === "cancelled";
  const go = (id: string) => { navigate(id === "projects" ? "/dashboard" : `/dashboard/${id}`); setSidebarOpen(false); };

  return (
    <div className="min-h-screen bg-[hsl(220_28%_6%)] flex">
      {paywall && <Paywall onCheckout={startCheckout} expired={expired} onDismiss={() => setPaywall(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col w-56 bg-[hsl(220_24%_9%)] border-r border-[hsl(220_18%_14%)] transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[hsl(220_18%_14%)]">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="8" fill="#fbbf24" /><circle cx="16" cy="16" r="4" fill="white" opacity="0.95" /></svg>
          <span className="font-black text-sm text-white">Solar<span className="text-[#fbbf24]">IQ</span></span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => go(id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-left transition-all ${tab === id ? "bg-[#fbbf24] text-[hsl(220_28%_6%)] font-black" : "text-white/50 hover:text-white hover:bg-[hsl(220_20%_14%)]"}`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-[hsl(220_18%_14%)]">
          <div className="px-2 mb-3 min-w-0">
            <p className="text-[10px] font-black text-white truncate">{user.name}</p>
            <p className="text-[9px] text-white/30 truncate">{user.email}</p>
          </div>
          <button onClick={signOut} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] text-red-400/60 hover:text-red-400 hover:bg-red-400/5"><LogOut size={12} />Sign out</button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/70 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex lg:hidden items-center gap-3 px-4 py-3.5 border-b border-[hsl(220_18%_14%)] bg-[hsl(220_24%_9%)] sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-white/50 hover:text-white" aria-label="Open menu"><Menu size={20} /></button>
          <span className="font-black text-sm text-white">{TABS.find(t => t.id === tab)?.label}</span>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <PlanBanner user={user} onUpgrade={() => setPaywall(true)} />
            {tab === "projects" && <ProjectsTab api={api} user={user} />}
            {tab === "leads" && <LeadsPanel api={api} base={BASE} onCreateProposal={lead => { pendingProposalLead = lead; go("proposals"); }} />}
            {tab === "proposals" && <ProposalsPanel api={api} base={BASE} fromLead={proposalLead} onLeadUsed={() => setProposalLead(null)} />}
            {tab === "market-intel" && <MarketIntelTab apiFetch={api} base={BASE} />}
            {tab === "settings" && <SettingsPanel api={api} base={BASE} />}
          </div>
        </main>
      </div>
    </div>
  );
}

// The dashboard keeps its own query cache so a contractor's data never mixes with an admin session in the same browser.
const dashboardClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: (count, err: any) => !(err instanceof ApiError && err.status < 500) && count < 2 } } });

export default function UserDashboard() {
  return <QueryClientProvider client={dashboardClient}><Dashboard /></QueryClientProvider>;
}
