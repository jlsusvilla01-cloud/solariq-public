import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Project, Milestone, Update, Faq, Testimonial, PricingPlan, MilestonePhoto, Signature, NotificationPref, Quotation, Document, Payment, Inventory, Design, InsertDesign, Lead, Referral, Vendor, PurchaseOrder, Crew } from "@shared/schema";
import {
  LayoutDashboard, ClipboardList, Star, DollarSign, LogOut, Menu, X,
  Plus, Trash2, Edit2, Eye, EyeOff, Copy, CheckCircle2, Clock, Send,
  Camera, QrCode, Bell, PenLine, Download, Image as ImageIcon, RefreshCw,
  FileText, Receipt, Package, TrendingUp, Cpu, Info, Zap, Minus,
  Users, ShoppingCart, CloudSun, Target, Building2, MapPin, Search, Filter, Truck,
  AlertTriangle, Wind, Sun, AlertCircle, CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// ── In-memory auth ──
let _adminToken = "";
let _adminName = "";
const getToken = () => _adminToken;
const authHeaders = () => ({ Authorization: `Basic ${getToken()}`, "Content-Type": "application/json" });
const apiFetch = async (url: string, opts: any = {}) => {
  const r = await fetch(url, { ...opts, headers: { ...authHeaders(), ...(opts.headers || {}) } });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};

// ── Login ──
function LoginScreen({ onLogin }: { onLogin: (token: string, name: string) => void }) {
  const [u, setU] = useState("admin"); const [p, setP] = useState("solariq2026");
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: u, password: p }) });
      if (!res.ok) { setErr("Invalid credentials"); return; }
      const data = await res.json(); 
      localStorage.setItem('solariq_admin_token', data.token);
      localStorage.setItem('solariq_admin_name', data.name);
      onLogin(data.token, data.name);
    } catch { setErr("Server error"); } finally { setLoading(false); }
  };
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };
  return (
    <div className="min-h-screen bg-[hsl(220_28%_6%)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="8" fill="#fbbf24"/><circle cx="16" cy="16" r="4" fill="white" opacity="0.95"/></svg>
          <span className="font-black text-xl text-white">Solar<span className="text-[#fbbf24]">IQ</span></span>
        </div>
        <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_18%)] rounded-2xl p-8">
          <h2 className="font-bold text-white mb-1 text-center">Admin Login</h2>
          <p className="text-white/40 text-xs text-center mb-6">Manage projects, teams & inventory</p>

          <Button variant="outline" onClick={handleGoogleLogin} className="w-full mb-6 border-[hsl(220_18%_22%)] text-white hover:bg-white/5 font-bold flex items-center gap-2 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[hsl(220_18%_18%)]"></div></div>
            <div className="relative flex justify-center text-xs"><span className="bg-[hsl(220_24%_9%)] px-2 text-white/30 uppercase">or standard login</span></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="text-xs text-white/50 mb-1 block">Username</label>
              <Input value={u} onChange={e => setU(e.target.value)} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white h-10" /></div>
            <div><label className="text-xs text-white/50 mb-1 block">Password</label>
              <Input value={p} onChange={e => setP(e.target.value)} type="password" className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white h-10" /></div>
            {err && <p className="text-red-400 text-xs">{err}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold h-10">{loading ? "Logging in..." : "Login"}</Button>
          </form>
          <p className="text-center text-white/30 text-[10px] mt-6 leading-relaxed">Demo Admin: admin / solariq2026</p>
        </div>
        <p className="text-center text-white/30 text-xs mt-8">Don't have an account? <span className="text-[#fbbf24] cursor-pointer hover:underline font-bold" onClick={handleGoogleLogin}>Sign up with Google</span></p>
      </div>
    </div>
  );
}

// ── Projects Tab ──
function ProjectsTab({ adminName }: { adminName: string }) {
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<"milestones" | "survey" | "updates" | "photos" | "netmetering" | "monitoring" | "finance" | "qr" | "notif" | "signatures">("milestones");
  const [newUpdate, setNewUpdate] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoType, setPhotoType] = useState<"before" | "progress" | "after">("progress");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ clientName: "", clientEmail: "", clientPhone: "", address: "", systemKw: "8", panelCount: "20", contractValue: "192000", startDate: "", estimatedEndDate: "", roiProjectedYears: "5", annualSavings: "45000" });

  const { data: projects = [], refetch } = useQuery<Project[]>({ queryKey: ["/api/admin/projects"], queryFn: () => apiFetch("/api/admin/projects") });
  const { data: milestones = [] } = useQuery<Milestone[]>({ queryKey: ["/api/admin/milestones", selectedId], queryFn: () => apiFetch(`/api/admin/projects/${selectedId}/milestones`), enabled: !!selectedId });
  const { data: updates = [], refetch: refetchUpdates } = useQuery<Update[]>({ queryKey: ["/api/admin/updates", selectedId], queryFn: () => apiFetch(`/api/admin/projects/${selectedId}/updates`), enabled: !!selectedId });
  const { data: photos = [], refetch: refetchPhotos } = useQuery<MilestonePhoto[]>({ queryKey: ["/api/admin/photos", selectedId], queryFn: () => apiFetch(`/api/admin/projects/${selectedId}/photos`), enabled: !!selectedId });
  const { data: qrData } = useQuery<{ qrDataUrl: string; trackUrl: string } | null>({ 
    queryKey: ["/api/admin/qr", selectedId], 
    queryFn: async () => { 
      const p = projects.find(x => x.id === selectedId); 
      if (!p) return null;
      return apiFetch(`/api/admin/qr/${p.shareToken}`);
    }, 
    enabled: !!selectedId && activeDetailTab === "qr" 
  });
  const { data: notifPref } = useQuery<NotificationPref | null>({ queryKey: ["/api/admin/notif", selectedId], queryFn: () => apiFetch(`/api/admin/projects/${selectedId}/notif`).catch(() => null), enabled: !!selectedId && activeDetailTab === "notif" });
  const { data: sigs = [] } = useQuery<Signature[]>({ queryKey: ["/api/admin/sigs", selectedId], queryFn: () => apiFetch(`/api/admin/projects/${selectedId}/signatures`), enabled: !!selectedId && activeDetailTab === "signatures" });
  const { data: survey = null, refetch: refetchSurvey } = useQuery<any>({ queryKey: ["/api/admin/survey", selectedId], queryFn: () => apiFetch(`/api/admin/projects/${selectedId}/survey`), enabled: !!selectedId && activeDetailTab === "survey" });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiFetch("/api/admin/projects", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { refetch(); setAdding(false); toast({ title: "Project created! Tracking link ready." }); },
  });
  const updateMsMutation = useMutation({
    mutationFn: ({ id, data }: any) => apiFetch(`/api/admin/milestones/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/milestones", selectedId] }); refetch(); },
  });
  const postUpdateMutation = useMutation({
    mutationFn: (msg: string) => apiFetch(`/api/admin/projects/${selectedId}/updates`, { method: "POST", body: JSON.stringify({ message: msg, type: "update", postedBy: adminName }) }),
    onSuccess: () => { refetchUpdates(); setNewUpdate(""); toast({ title: "Update posted + email sent to client" }); },
  });
  const uploadPhotoMutation = useMutation({
    mutationFn: (data: any) => apiFetch(`/api/admin/projects/${selectedId}/photos`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { refetchPhotos(); setPhotoCaption(""); toast({ title: "Photo uploaded" }); },
  });
  const deletePhotoMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/admin/photos/${id}`, { method: "DELETE" }),
    onSuccess: () => refetchPhotos(),
  });
  const saveNotifMutation = useMutation({
    mutationFn: (data: any) => apiFetch(`/api/admin/projects/${selectedId}/notif`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/notif", selectedId] }); toast({ title: "Notification preferences saved" }); },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: any) => apiFetch(`/api/admin/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { refetch(); toast({ title: "Project updated" }); },
  });

  const saveSurveyMutation = useMutation({
    mutationFn: (data: any) => apiFetch(`/api/admin/projects/${selectedId}/survey`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { refetchSurvey(); toast({ title: "Site survey saved successfully" }); },
  });

  const [notifForm, setNotifForm] = useState({ email: "", phone: "", emailEnabled: true, notifyOnMilestone: true, notifyOnUpdate: true });
  const sel = projects.find(p => p.id === selectedId);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const copyLink = (token: string) => { navigator.clipboard?.writeText(`${window.location.origin}/#/track/${token}`); toast({ title: "Tracking link copied!" }); };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      uploadPhotoMutation.mutate({ dataUrl: ev.target?.result, caption: photoCaption, photoType, postedBy: adminName, milestoneId: 0 });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const DETAIL_TABS = [
    { id: "milestones", label: "Milestones", icon: CheckCircle2 },
    { id: "survey", label: "Site Survey", icon: ClipboardList },
    { id: "updates", label: "Updates", icon: Send },
    { id: "photos", label: "Photos", icon: Camera },
    { id: "netmetering", label: "Net Metering", icon: CreditCard },
    { id: "monitoring", label: "Monitoring", icon: Zap },
    { id: "finance", label: "Finance / ROI", icon: DollarSign },
    { id: "qr", label: "QR Code", icon: QrCode },
    { id: "notif", label: "Notifications", icon: Bell },
    { id: "signatures", label: "Signatures", icon: PenLine },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-white">Projects ({projects.length})</h2>
        <Button onClick={() => setAdding(v => !v)} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] text-sm font-bold hover:brightness-110">
          <Plus size={14} className="mr-1.5" /> New Project
        </Button>
      </div>

      {adding && (
        <Card className="bg-[hsl(220_24%_9%)] border-[#fbbf24]/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-white">New Installation Project</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[["clientName","Client Name *"],["clientEmail","Email (for notifications)"],["clientPhone","Phone"],["address","Address *"]].map(([k,l]) => (
                <div key={k} className={k === "address" ? "col-span-2" : ""}>
                  <label className="text-xs text-white/50">{l}</label>
                  <Input value={(form as any)[k]} onChange={e => set(k, e.target.value)} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 h-8 text-sm" />
                </div>
              ))}
              {[["systemKw","System kWp"],["panelCount","Panels"],["contractValue","Contract ₱"],["startDate","Start Date"],["estimatedEndDate","Est. End Date"],["roiProjectedYears","ROI years"],["annualSavings","Annual Savings ₱"]].map(([k,l]) => (
                <div key={k}><label className="text-xs text-white/50">{l}</label>
                  <Input value={(form as any)[k]} onChange={e => set(k, e.target.value)} type={k.includes("Date") ? "date" : "text"} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 h-8 text-sm" /></div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate({ ...form, systemKw: +form.systemKw, panelCount: +form.panelCount, contractValue: +form.contractValue, roiProjectedYears: +form.roiProjectedYears, annualSavings: +form.annualSavings, totalLifetimeSavings: (+form.annualSavings * 25), status: "survey", overallProgress: 0 })} disabled={!form.clientName || !form.address || createMutation.isPending} className="flex-1 bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-sm">Create & Generate Link</Button>
              <Button variant="outline" onClick={() => setAdding(false)} className="border-[hsl(220_18%_22%)] text-white text-sm">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Left: project list */}
        <div className="lg:col-span-2 space-y-2">
          {projects.map(p => (
            <button key={p.id} onClick={() => setSelectedId(p.id === selectedId ? null : p.id)} className={`w-full text-left p-4 rounded-xl border transition-all ${p.id === selectedId ? "border-[#fbbf24]/50 bg-[#fbbf24]/5" : "border-[hsl(220_18%_16%)] bg-[hsl(220_24%_9%)] hover:border-[#fbbf24]/25"}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="font-semibold text-white text-sm">{p.clientName}</div>
                <Badge className={`text-[10px] ${p.status === "commissioned" ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/25"} border`}>{p.status}</Badge>
              </div>
              <div className="text-xs text-white/40 mb-2 truncate">{p.address}</div>
              <div className="h-1.5 rounded-full bg-[hsl(220_18%_18%)]"><div className="h-full rounded-full bg-[#fbbf24]" style={{ width: `${p.overallProgress}%` }} /></div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-white/30">
                <span>{p.systemKw} kWp</span>
                <span>{p.overallProgress}%</span>
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={e => { e.stopPropagation(); copyLink(p.shareToken); }} className="text-[10px] text-[#fbbf24]/60 hover:text-[#fbbf24] flex items-center gap-1 transition-colors">
                  <Copy size={9} /> Copy link
                </button>
                <a href={`/#/track/${p.shareToken}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-[10px] text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors">
                  <Eye size={9} /> Preview
                </a>
              </div>
            </button>
          ))}
        </div>

        {/* Right: detail panel */}
        {sel && (
          <div className="lg:col-span-3 bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-xl overflow-hidden">
            {/* Sub-tabs */}
            <div className="flex overflow-x-auto border-b border-[hsl(220_18%_16%)]">
              {DETAIL_TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveDetailTab(id as any)} className={`flex items-center gap-1.5 px-3 py-2.5 text-xs whitespace-nowrap transition-colors shrink-0 ${activeDetailTab === id ? "border-b-2 border-[#fbbf24] text-[#fbbf24]" : "text-white/40 hover:text-white/70"}`}>
                  <Icon size={11} />{label}
                </button>
              ))}
            </div>

            <div className="p-4">
              {/* Milestones */}
              {activeDetailTab === "milestones" && (
                <div className="space-y-1.5 max-h-80 overflow-y-auto">
                  {milestones.sort((a,b) => a.sortOrder-b.sortOrder).map(m => (
                    <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg bg-[hsl(220_20%_12%)]">
                      <Select value={m.status} onValueChange={v => updateMsMutation.mutate({ id: m.id, data: { status: v } })}>
                        <SelectTrigger className={`h-6 w-28 text-[10px] border rounded-full px-2 shrink-0 ${m.status === "completed" ? "border-green-500/30 text-green-400 bg-green-500/10" : m.status === "in_progress" ? "border-[#fbbf24]/30 text-[#fbbf24] bg-[#fbbf24]/10" : "border-[hsl(220_18%_22%)] text-white/40"}`}><SelectValue /></SelectTrigger>
                        <SelectContent>{["pending","in_progress","completed","blocked"].map(s => <SelectItem key={s} value={s}>{s.replace("_"," ")}</SelectItem>)}</SelectContent>
                      </Select>
                      <span className={`text-xs flex-1 truncate ${m.status === "pending" ? "text-white/40" : "text-white/80"}`}>{m.title}</span>
                      {m.status === "completed" && <CheckCircle2 size={12} className="text-green-400 shrink-0" />}
                    </div>
                  ))}
                </div>
              )}

              {/* Site Survey */}
              {activeDetailTab === "survey" && (
                <div className="space-y-4">
                  <div className="bg-[#fbbf24]/5 border border-[#fbbf24]/20 p-4 rounded-xl">
                    <h4 className="text-xs font-black text-[#fbbf24] uppercase tracking-widest mb-4 flex items-center gap-2">
                       <ClipboardList size={11} /> Technical Site Assessment
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-white/50 uppercase font-bold">Roof Type</label>
                        <Select 
                          defaultValue={survey?.roofType || "metal"} 
                          onValueChange={v => saveSurveyMutation.mutate({ ...survey, roofType: v })}
                        >
                          <SelectTrigger className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="metal">Metal (Rib-type/Stone-coated)</SelectItem>
                            <SelectItem value="tile">Concrete Tile</SelectItem>
                            <SelectItem value="asphalt">Asphalt Shingle</SelectItem>
                            <SelectItem value="concrete">Flat Concrete Slab</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-[10px] text-white/50 uppercase font-bold">Shading Condition</label>
                        <Select 
                          defaultValue={survey?.shadingCondition || "none"} 
                          onValueChange={v => saveSurveyMutation.mutate({ ...survey, shadingCondition: v })}
                        >
                          <SelectTrigger className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None (Clean Exposure)</SelectItem>
                            <SelectItem value="partial">Partial (Morning/Afternoon)</SelectItem>
                            <SelectItem value="heavy">Heavy (Trees/Obstructions)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-[10px] text-white/50 uppercase font-bold">Azimuth (°N)</label>
                        <Input 
                          type="number" 
                          defaultValue={survey?.roofAzimuth || 180} 
                          onBlur={e => saveSurveyMutation.mutate({ ...survey, roofAzimuth: +e.target.value })}
                          className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 h-8 text-xs" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/50 uppercase font-bold">Roof Tilt (°)</label>
                        <Input 
                          type="number" 
                          defaultValue={survey?.roofTilt || 0} 
                          onBlur={e => saveSurveyMutation.mutate({ ...survey, roofTilt: +e.target.value })}
                          className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 h-8 text-xs" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/50 uppercase font-bold">Main Breaker (Amp)</label>
                        <Input 
                          type="number" 
                          defaultValue={survey?.mainBreakerSize || 0} 
                          onBlur={e => saveSurveyMutation.mutate({ ...survey, mainBreakerSize: +e.target.value })}
                          className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 h-8 text-xs" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/50 uppercase font-bold">Est. Cable Run (m)</label>
                        <Input 
                          type="number" 
                          defaultValue={survey?.cableRunEst || 0} 
                          onBlur={e => saveSurveyMutation.mutate({ ...survey, cableRunEst: +e.target.value })}
                          className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 h-8 text-xs" 
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="text-[10px] text-white/50 uppercase font-bold">Structural / Electrical Notes</label>
                      <textarea
                        defaultValue={survey?.notes || ""}
                        onBlur={e => saveSurveyMutation.mutate({ ...survey, notes: e.target.value })}
                        rows={2}
                        className="w-full bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white rounded-lg p-3 text-xs mt-1 resize-none"
                        placeholder="Detail any obstructions or panel board requirements..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-white/40 uppercase">Surveyor Name</label>
                      <Input 
                        defaultValue={survey?.surveyorName || adminName} 
                        onBlur={e => saveSurveyMutation.mutate({ ...survey, surveyorName: e.target.value })}
                        className="bg-white/5 border-white/10 text-white h-8 text-xs" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-white/40 uppercase">Survey Date</label>
                      <Input 
                        type="date"
                        defaultValue={survey?.surveyDate || new Date().toISOString().split('T')[0]} 
                        onChange={e => saveSurveyMutation.mutate({ ...survey, surveyDate: e.target.value })}
                        className="bg-white/5 border-white/10 text-white h-8 text-xs" 
                      />
                    </div>
                  </div>
                </div>
              )}
              {activeDetailTab === "updates" && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input value={newUpdate} onChange={e => setNewUpdate(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && newUpdate.trim()) postUpdateMutation.mutate(newUpdate.trim()); }} placeholder="Type update — client gets email notification..." className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-sm h-9 flex-1" />
                    <Button onClick={() => postUpdateMutation.mutate(newUpdate.trim())} disabled={!newUpdate.trim() || postUpdateMutation.isPending} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] h-9 px-3 font-bold shrink-0"><Send size={13} /></Button>
                  </div>
                  <div className="text-xs text-white/30 flex items-center gap-1"><Bell size={10} /> Client receives email notification automatically</div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {updates.map(u => (
                      <div key={u.id} className="text-xs text-white/50 px-3 py-2 bg-[hsl(220_20%_12%)] rounded-lg">{u.message}</div>
                    ))}
                  </div>
                </div>
              )}

              {activeDetailTab === "netmetering" && (
                <div className="space-y-4">
                  <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                    <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3">DU Application Lifecycle</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-white/50 uppercase font-black">Current Status</label>
                        <Select value={sel.netMeteringStatus || 'pending'} onValueChange={v => updateProjectMutation.mutate({ id: sel.id, data: { netMeteringStatus: v } })}>
                          <SelectTrigger className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending Application</SelectItem>
                            <SelectItem value="applied">Application Submitted</SelectItem>
                            <SelectItem value="surveyed">Technical Survey Done</SelectItem>
                            <SelectItem value="nma_signed">NMA Signed</SelectItem>
                            <SelectItem value="meter_installed">Meter Installed</SelectItem>
                            <SelectItem value="completed">Energization / Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/50">Internal Notes / Phase Details</label>
                    <textarea 
                      value={sel.netMeteringNotes || ""} 
                      onChange={e => updateProjectMutation.mutate({ id: sel.id, data: { netMeteringNotes: e.target.value } })}
                      placeholder="Enter specific notes for this phase (visible to client)..."
                      rows={3} 
                      className="w-full bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white rounded-lg p-3 text-sm mt-1 resize-none focus:border-blue-500/50 transition-colors" 
                    />
                  </div>
                  <p className="text-[10px] text-white/30 italic">Tip: Updating status triggers a push notification to the client's live tracker.</p>
                </div>
              )}

              {/* ── Monitoring / IoT Tab ── */}
              {activeDetailTab === "monitoring" && (
                <div className="space-y-5">
                  {/* Inverter Model & Serial */}
                  <div className="bg-[hsl(220_20%_12%)] rounded-xl p-4 border border-white/5 space-y-3">
                    <h4 className="text-xs font-black text-[#fbbf24] uppercase tracking-widest flex items-center gap-2">
                      <Zap size={12} /> Inverter Configuration
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-white/50 uppercase font-black">Inverter Brand / Model</label>
                        <Select
                          value={sel.inverterModel || "Huawei SUN2000-8KTL"}
                          onValueChange={v => updateProjectMutation.mutate({ id: sel.id, data: { inverterModel: v } })}
                        >
                          <SelectTrigger className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Huawei SUN2000-8KTL">Huawei SUN2000-8KTL</SelectItem>
                            <SelectItem value="Huawei SUN2000-5KTL">Huawei SUN2000-5KTL</SelectItem>
                            <SelectItem value="Growatt SPH6000TL3-BH">Growatt SPH6000TL3-BH</SelectItem>
                            <SelectItem value="Solis RHI-6K-48ES-5G">Solis RHI-6K-48ES-5G</SelectItem>
                            <SelectItem value="GoodWe GW8K-ET">GoodWe GW8K-ET</SelectItem>
                            <SelectItem value="SMA Sunny Boy 6.0">SMA Sunny Boy 6.0</SelectItem>
                            <SelectItem value="Fronius Primo GEN24 6.0">Fronius Primo GEN24 6.0</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-[10px] text-white/50 uppercase font-black">Serial Number</label>
                        <Input
                          id="inv-serial"
                          defaultValue={sel.inverterSerial || ""}
                          placeholder="e.g. SN-20241201-HW"
                          className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 h-8 text-xs"
                        />
                      </div>
                    </div>
                    {/* Monitoring Status */}
                    <div>
                      <label className="text-[10px] text-white/50 uppercase font-black mb-2 block">Monitoring Status</label>
                      <div className="flex gap-2">
                        {["online", "offline", "faulted"].map(s => (
                          <button
                            key={s}
                            onClick={async () => {
                              const serial = (document.getElementById("inv-serial") as HTMLInputElement).value;
                              try {
                                await apiFetch(`/api/admin/projects/${sel.id}/inverter`, {
                                  method: "PATCH",
                                  body: JSON.stringify({ inverterModel: sel.inverterModel, inverterSerial: serial, monitoringStatus: s })
                                });
                                refetch();
                                toast({ title: `Status set to ${s}` });
                              } catch (e: any) {
                                toast({ title: "Failed to update status", variant: "destructive", description: e.message });
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                              sel.monitoringStatus === s
                                ? s === "online" ? "bg-green-500/20 border-green-500/50 text-green-400"
                                  : s === "faulted" ? "bg-red-500/20 border-red-500/50 text-red-400"
                                  : "bg-white/10 border-white/20 text-white"
                                : "bg-transparent border-white/10 text-white/30 hover:border-white/30"
                            }`}
                          >
                            {s === "online" && <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 shadow-[0_0_6px_rgba(74,222,128,0.8)] animate-pulse" />}
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={async () => {
                        const serial = (document.getElementById("inv-serial") as HTMLInputElement).value;
                        try {
                          await apiFetch(`/api/admin/projects/${sel.id}/inverter`, {
                            method: "PATCH",
                            body: JSON.stringify({ 
                              inverterModel: sel.inverterModel || "Huawei SUN2000-8KTL", 
                              inverterSerial: serial, 
                              monitoringStatus: sel.monitoringStatus || "offline" 
                            })
                          });
                          refetch();
                          toast({ title: "Inverter configuration saved ✓" });
                        } catch (e: any) {
                          toast({ title: "Failed to save config", variant: "destructive", description: e.message });
                        }
                      }}
                      className="w-full bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs h-8"
                    >
                      Save Inverter Config
                    </Button>
                  </div>

                  {/* Demo Data Generator */}
                  <div className="bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/10 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-black text-green-400 uppercase tracking-widest flex items-center gap-2">
                      <Zap size={12} /> IoT Data Simulator
                    </h4>
                    <p className="text-[11px] text-white/40 leading-relaxed">
                      Generate a realistic 24-hour solar production curve (48 readings at 30-min intervals) based on the system's <strong className="text-white/60">{sel.systemKw} kWp</strong> capacity. Simulates weather noise and a natural solar bell curve. Clears previous readings first.
                    </p>
                    <Button
                      onClick={async () => {
                        toast({ title: "Generating 48 readings…" });
                        try {
                          const d = await apiFetch(`/api/admin/projects/${sel.id}/monitoring/generate`, { method: "POST" });
                          refetch();
                          toast({ title: `✅ Generated ${d.readingsGenerated} readings — system now Online!` });
                        } catch (e: any) {
                          toast({ title: "Generation failed", variant: "destructive", description: e.message });
                        }
                      }}
                      className="w-full bg-green-600 hover:bg-green-500 text-white font-bold text-xs h-9 transition-all"
                    >
                      <Zap size={13} className="mr-2" />
                      Generate 24h Demo Data
                    </Button>
                    <p className="text-[10px] text-white/20 italic">After generating, check the Live Monitoring tab on the client tracker.</p>
                  </div>

                  {/* Current Status Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "System Size", value: `${sel.systemKw} kWp`, icon: "⚡" },
                      { label: "Panel Count", value: `${sel.panelCount} pcs`, icon: "☀️" },
                      { label: "Inv. Status", value: sel.monitoringStatus || "offline", icon: "📡" },
                    ].map(({ label, value, icon }) => (
                      <div key={label} className="bg-[hsl(220_20%_12%)] rounded-lg p-3">
                        <div className="text-lg mb-1">{icon}</div>
                        <p className="text-[9px] text-white/30 uppercase font-black tracking-widest">{label}</p>
                        <p className="text-xs font-bold text-white mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeDetailTab === "photos" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 mb-1">
                    <div><label className="text-xs text-white/50">Type</label>
                      <Select value={photoType} onValueChange={v => setPhotoType(v as any)}>
                        <SelectTrigger className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="before">Before</SelectItem><SelectItem value="progress">Progress</SelectItem><SelectItem value="after">After</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2"><label className="text-xs text-white/50">Caption</label>
                      <Input value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} placeholder="e.g. Racking installed" className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 h-7 text-xs" />
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  <Button onClick={() => fileInputRef.current?.click()} disabled={uploadPhotoMutation.isPending} className="w-full bg-[hsl(220_20%_16%)] border border-[hsl(220_18%_22%)] text-white text-xs h-9 hover:border-[#fbbf24]/40">
                    <Camera size={13} className="mr-2" /> {uploadPhotoMutation.isPending ? "Uploading..." : "Upload Photo"}
                  </Button>
                  <div className="text-xs text-white/30">Upload Before + After photos to enable the comparison slider on the client tracker.</div>
                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {photos.map(p => (
                        <div key={p.id} className="relative group">
                          <img src={p.dataUrl} alt={p.caption || ""} className="w-full h-20 rounded-lg object-cover" />
                          <div className="absolute top-1 left-1"><span className="text-[9px] bg-black/60 text-[#fbbf24] px-1 rounded">{p.photoType}</span></div>
                          <button onClick={() => deletePhotoMutation.mutate(p.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500 rounded p-0.5 transition-opacity"><X size={10} className="text-white" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {activeDetailTab === "finance" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Annual Savings</p>
                      <div className="flex items-center gap-2">
                         <span className="text-white/40 text-xs">₱</span>
                         <Input 
                           id="fin-annual" 
                           defaultValue={sel.annualSavings || 0} 
                           className="bg-transparent border-none text-xl font-black text-green-400 p-0 h-auto" 
                         />
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">ROI Period (Years)</p>
                      <Input 
                        id="fin-roi" 
                        defaultValue={sel.roiProjectedYears || 5} 
                        className="bg-transparent border-none text-xl font-black text-white p-0 h-auto" 
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      const annual = +(document.getElementById("fin-annual") as HTMLInputElement).value;
                      const roi = +(document.getElementById("fin-roi") as HTMLInputElement).value;
                      updateProjectMutation.mutate({ 
                        id: sel.id, 
                        data: { 
                          annualSavings: annual, 
                          roiProjectedYears: roi,
                          totalLifetimeSavings: annual * 25
                        } 
                      });
                    }}
                    className="w-full bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs h-8"
                  >
                    Save Financial Data
                  </Button>
                  
                  <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-white/10 p-5">
                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <TrendingUp size={14} /> 25-Year Lifetime Savings
                    </h3>
                    <p className="text-3xl font-black text-white">₱{(sel.totalLifetimeSavings || (sel.annualSavings || 0) * 25).toLocaleString()}</p>
                    <p className="text-[10px] text-white/30 mt-2 uppercase font-bold tracking-tighter italic">* Based on current Meralco/Electric utility rates + 3% annual inflation</p>
                  </Card>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40">Installation Cost</span>
                      <span className="text-white font-bold">₱{sel.contractValue?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40">Total Panels</span>
                      <span className="text-white font-bold">{sel.panelCount} units</span>
                    </div>
                    <div className="h-[1px] w-full bg-white/5" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/60 font-bold">Net Benefit</span>
                      <span className="text-[#fbbf24] font-black">₱{((sel.totalLifetimeSavings || (sel.annualSavings || 0) * 25) - (sel.contractValue || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* QR Code */}
              {activeDetailTab === "qr" && (
                <div className="text-center space-y-3">
                  {qrData ? (
                    <>
                      <img src={qrData!.qrDataUrl} alt="QR Code" className="mx-auto w-40 h-40 rounded-xl" />
                      <p className="text-xs text-white/40 break-all">{qrData!.trackUrl}</p>
                      <div className="flex gap-2 justify-center">
                        <a href={qrData!.qrDataUrl} download="qr-code.png" className="flex items-center gap-1.5 text-xs bg-[hsl(220_20%_16%)] border border-[hsl(220_18%_22%)] text-white px-3 py-2 rounded-lg hover:border-[#fbbf24]/40 transition-colors">
                          <Download size={12} /> Download QR
                        </a>
                        <button onClick={() => { navigator.clipboard?.writeText(qrData!.trackUrl); }} className="flex items-center gap-1.5 text-xs bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold px-3 py-2 rounded-lg hover:brightness-110 transition-all">
                          <Copy size={12} /> Copy Link
                        </button>
                      </div>
                      <p className="text-xs text-white/30">Print this QR on proposals, contracts, or invoices so clients can instantly access their tracker.</p>
                    </>
                  ) : (
                    <div className="py-8 text-white/30 text-sm"><RefreshCw size={16} className="mx-auto mb-2 animate-spin" />Loading QR...</div>
                  )}
                </div>
              )}

              {/* Notification Preferences */}
              {activeDetailTab === "notif" && (
                <div className="space-y-4">
                  <div className="text-xs text-white/50 flex items-center gap-1.5 mb-3"><Bell size={12} /> Client gets email when you post an update or complete a milestone</div>
                  <div className="space-y-3">
                    <div><label className="text-xs text-white/50">Client Email</label>
                      <Input
                        defaultValue={notifPref?.email || sel.clientEmail || ""}
                        id="notif-email"
                        className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 h-8 text-sm"
                        placeholder="client@email.com"
                      />
                    </div>
                    <div><label className="text-xs text-white/50">Client Phone (for SMS)</label>
                      <Input
                        defaultValue={notifPref?.phone || sel.clientPhone || ""}
                        id="notif-phone"
                        className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 h-8 text-sm"
                        placeholder="+63 917 123 4567"
                      />
                    </div>
                    {[
                      ["emailEnabled", "Email notifications enabled"],
                      ["notifyOnMilestone", "Notify on milestone completion"],
                      ["notifyOnUpdate", "Notify on new update posts"],
                    ].map(([k, l]) => (
                      <label key={k} className="flex items-center gap-2.5 cursor-pointer">
                        <input type="checkbox" id={`notif-${k}`} defaultChecked={(notifPref as any)?.[k] !== 0} className="w-4 h-4 accent-[#fbbf24]" />
                        <span className="text-xs text-white/70">{l}</span>
                      </label>
                    ))}
                  </div>
                  <Button
                    onClick={() => saveNotifMutation.mutate({
                      email: (document.getElementById("notif-email") as HTMLInputElement)?.value || "",
                      phone: (document.getElementById("notif-phone") as HTMLInputElement)?.value || "",
                      emailEnabled: (document.getElementById("notif-emailEnabled") as HTMLInputElement)?.checked ? 1 : 0,
                      notifyOnMilestone: (document.getElementById("notif-notifyOnMilestone") as HTMLInputElement)?.checked ? 1 : 0,
                      notifyOnUpdate: (document.getElementById("notif-notifyOnUpdate") as HTMLInputElement)?.checked ? 1 : 0,
                    })}
                    disabled={saveNotifMutation.isPending}
                    className="w-full bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-sm"
                  >
                    Save Notification Settings
                  </Button>
                </div>
              )}



              {/* Signatures */}
              {activeDetailTab === "signatures" && (
                <div className="space-y-3">
                  {sigs.length === 0 ? (
                    <div className="text-center py-8 text-white/30 text-sm">
                      <PenLine size={24} className="mx-auto mb-2" />
                      No signatures yet. Client can sign the commissioning certificate from the tracker page when status is "commissioned".
                    </div>
                  ) : sigs.map(sig => (
                    <div key={sig.id} className="bg-[hsl(220_20%_12%)] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-semibold text-white text-sm">{sig.signerName}</div>
                          <div className="text-xs text-white/40">{sig.signerRole} · {new Date(sig.signedAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                        <CheckCircle2 size={18} className="text-green-400" />
                      </div>
                      <img src={sig.signatureDataUrl} alt="Signature" className="w-full h-16 object-contain rounded-lg bg-[#1f2937] border border-[hsl(220_18%_22%)]" />
                      {sig.agreementText && <p className="text-[10px] text-white/30 mt-2 italic">{sig.agreementText}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── FAQ Tab ──
function FaqTab() {
  const { toast } = useToast();
  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", category: "general" });
  const [editForm, setEditForm] = useState({ question: "", answer: "", category: "general" });
  const { data: faqs = [], refetch } = useQuery<Faq[]>({ queryKey: ["/api/admin/faqs"], queryFn: () => apiFetch("/api/admin/faqs") });
  const addMutation = useMutation({
    mutationFn: (d: any) => apiFetch("/api/admin/faqs", { method: "POST", body: JSON.stringify({ ...d, published: 1 }) }),
    onSuccess: () => { refetch(); setAdding(false); setForm({ question: "", answer: "", category: "general" }); toast({ title: "FAQ added" }); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => apiFetch(`/api/admin/faqs/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { refetch(); setEditing(null); toast({ title: "FAQ updated" }); },
  });
  const deleteMutation = useMutation({ mutationFn: (id: number) => apiFetch(`/api/admin/faqs/${id}`, { method: "DELETE" }), onSuccess: () => { refetch(); } });
  const startEdit = (f: Faq) => { setEditing(f.id); setEditForm({ question: f.question, answer: f.answer, category: f.category }); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-white">FAQ Editor ({faqs.length} items)</h2>
        <Button onClick={() => setAdding(v => !v)} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] text-sm font-bold hover:brightness-110"><Plus size={14} className="mr-1.5"/>Add FAQ</Button>
      </div>
      {adding && (
        <Card className="bg-[hsl(220_24%_9%)] border-[#fbbf24]/30">
          <CardContent className="p-4 space-y-3">
            <div><label className="text-xs text-white/50">Category</label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{["general","installation","billing","permits","technical","monitoring","maintenance","structural"].map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</SelectItem>)}</SelectContent>
              </Select></div>
            <div><label className="text-xs text-white/50">Question</label><Input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 text-sm" /></div>
            <div><label className="text-xs text-white/50">Answer</label><textarea value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} rows={3} className="w-full bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white rounded-lg p-2 text-sm mt-1 resize-none" /></div>
            <div className="flex gap-2">
              <Button onClick={() => addMutation.mutate(form)} disabled={!form.question || !form.answer} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-sm flex-1">Save FAQ</Button>
              <Button variant="outline" onClick={() => setAdding(false)} className="border-[hsl(220_18%_22%)] text-white text-sm">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="space-y-2">
        {faqs.map(faq => (
          <div key={faq.id} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-xl overflow-hidden">
            {editing === faq.id ? (
              <div className="p-4 space-y-3">
                <div><label className="text-xs text-white/50">Question</label><Input value={editForm.question} onChange={e => setEditForm(f => ({ ...f, question: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 text-sm" /></div>
                <div><label className="text-xs text-white/50">Answer</label><textarea value={editForm.answer} onChange={e => setEditForm(f => ({ ...f, answer: e.target.value }))} rows={3} className="w-full bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white rounded-lg p-2 text-sm mt-1 resize-none" /></div>
                <div className="flex gap-2">
                  <Button onClick={() => updateMutation.mutate({ id: faq.id, data: editForm })} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs">Save</Button>
                  <Button variant="outline" onClick={() => setEditing(null)} className="border-[hsl(220_18%_22%)] text-white text-xs">Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{faq.question}</div>
                  <div className="text-xs text-white/40 mt-1 line-clamp-2">{faq.answer}</div>
                  <Badge className="mt-2 text-[10px] bg-[hsl(220_20%_14%)] text-white/40 border-transparent">{faq.category}</Badge>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => updateMutation.mutate({ id: faq.id, data: { published: faq.published ? 0 : 1 } })} className={`p-1.5 rounded ${faq.published ? "text-green-400" : "text-white/30"} transition-colors`}>{faq.published ? <Eye size={13}/> : <EyeOff size={13}/>}</button>
                  <button onClick={() => startEdit(faq)} className="p-1.5 text-white/40 hover:text-[#fbbf24] transition-colors"><Edit2 size={13}/></button>
                  <button onClick={() => deleteMutation.mutate(faq.id)} className="p-1.5 text-white/30 hover:text-red-400 transition-colors"><Trash2 size={13}/></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Testimonials Tab ──
function TestimonialsTab() {
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", role: "Homeowner", quote: "", rating: 5, systemSize: "", avatarInitials: "" });
  const { data: items = [], refetch } = useQuery<Testimonial[]>({ queryKey: ["/api/admin/testimonials"], queryFn: () => apiFetch("/api/admin/testimonials") });
  const addMutation = useMutation({ mutationFn: (d: any) => apiFetch("/api/admin/testimonials", { method: "POST", body: JSON.stringify({ ...d, published: 1 }) }), onSuccess: () => { refetch(); setAdding(false); toast({ title: "Testimonial added" }); } });
  const toggleMutation = useMutation({ mutationFn: ({ id, published }: any) => apiFetch(`/api/admin/testimonials/${id}`, { method: "PATCH", body: JSON.stringify({ published: published ? 0 : 1 }) }), onSuccess: () => refetch() });
  const deleteMutation = useMutation({ mutationFn: (id: number) => apiFetch(`/api/admin/testimonials/${id}`, { method: "DELETE" }), onSuccess: () => refetch() });
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-white">Testimonials ({items.length})</h2>
        <Button onClick={() => setAdding(v => !v)} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] text-sm font-bold hover:brightness-110"><Plus size={14} className="mr-1.5"/>Add Review</Button>
      </div>
      {adding && (
        <Card className="bg-[hsl(220_24%_9%)] border-[#fbbf24]/30">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[["name","Name *"],["location","Location"],["role","Role"],["systemSize","System Size"],["avatarInitials","Initials"]].map(([k,l]) => (
                <div key={k}><label className="text-xs text-white/50">{l}</label><Input value={(form as any)[k]} onChange={e => set(k, e.target.value)} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 h-8 text-sm" /></div>
              ))}
              <div><label className="text-xs text-white/50">Rating</label>
                <Select value={form.rating.toString()} onValueChange={v => set("rating", +v)}>
                  <SelectTrigger className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{[5,4,3].map(r => <SelectItem key={r} value={r.toString()}>{"★".repeat(r)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><label className="text-xs text-white/50">Quote *</label><textarea value={form.quote} onChange={e => set("quote", e.target.value)} rows={3} className="w-full bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white rounded-lg p-2 text-sm mt-1 resize-none" /></div>
            <div className="flex gap-2">
              <Button onClick={() => addMutation.mutate(form)} disabled={!form.name || !form.quote} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-sm flex-1">Add</Button>
              <Button variant="outline" onClick={() => setAdding(false)} className="border-[hsl(220_18%_22%)] text-white text-sm">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map(t => (
          <div key={t.id} className={`bg-[hsl(220_24%_9%)] border rounded-xl p-4 ${t.published ? "border-[hsl(220_18%_16%)]" : "border-[hsl(220_18%_16%)] opacity-50"}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div><div className="font-semibold text-white text-sm">{t.name}</div><div className="text-xs text-white/40">{t.role}{t.location ? ` · ${t.location}` : ""}</div></div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleMutation.mutate({ id: t.id, published: t.published })} className={`p-1.5 ${t.published ? "text-green-400" : "text-white/30"}`}>{t.published ? <Eye size={13}/> : <EyeOff size={13}/>}</button>
                <button onClick={() => deleteMutation.mutate(t.id)} className="p-1.5 text-white/30 hover:text-red-400"><Trash2 size={13}/></button>
              </div>
            </div>
            <p className="text-xs text-white/60 line-clamp-3">"{t.quote}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Pricing Tab ──
function PricingTab() {
  const { data: plans = [] } = useQuery<PricingPlan[]>({ queryKey: ["/api/admin/pricing"], queryFn: () => apiFetch("/api/admin/pricing") });
  return (
    <div className="space-y-4">
      <h2 className="font-bold text-white">Pricing Plans</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {plans.map(plan => {
          const feats: string[] = JSON.parse(plan.features || "[]");
          return (
            <div key={plan.id} className={`bg-[hsl(220_24%_9%)] border rounded-xl p-5 ${plan.highlighted ? "border-[#fbbf24]/40" : "border-[hsl(220_18%_16%)]"}`}>
              <div className="font-bold text-white mb-1">{plan.name}</div>
              <div className="text-2xl font-black text-[#fbbf24] mb-3">₱{plan.price.toLocaleString()}<span className="text-xs font-normal text-white/40">/{plan.billingCycle}</span></div>
              <ul className="space-y-1.5">
                {feats.map(f => <li key={f} className="text-xs text-white/60 flex items-start gap-1.5"><CheckCircle2 size={10} className="text-[#fbbf24] shrink-0 mt-0.5"/>{f}</li>)}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── NEW: Referral Engine Tab ──
function ReferralTab() {
  const { data: referrals = [] } = useQuery<Referral[]>({ queryKey: ["/api/admin/referrals"], queryFn: () => apiFetch("/api/admin/referrals") });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-blue-500/5 p-6 rounded-2xl border border-blue-500/10">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <TrendingUp size={24} className="text-blue-400" /> Referral Network
          </h2>
          <p className="text-white/40 text-sm mt-1">Managing {referrals.length} external agents and affiliate partners.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">Export Payouts</Button>
          <Button className="bg-blue-500 text-white font-bold">New Affiliate</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[hsl(220_24%_9%)] border-white/5 p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Recent Referrals</h3>
          <div className="space-y-4">
            {referrals.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Users size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{r.referredName}</h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Client Status: {r.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">₱{(r.commissionAmount || 0).toLocaleString()}</p>
                  <Badge className={r.status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}>
                    {r.status}
                  </Badge>
                </div>
              </div>
            ))}
            {referrals.length === 0 && <p className="text-center text-white/20 py-12 italic">No referrals yet.</p>}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-500/20 to-transparent border-white/10 p-6">
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Network Growth</h3>
            <p className="text-2xl font-black text-white">+24%</p>
            <p className="text-[10px] text-white/40 mt-1 uppercase font-bold tracking-tighter">Compared to last month</p>
            <div className="h-1.5 w-full bg-white/5 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-blue-500 w-[74%]" />
            </div>
          </Card>

          <Card className="bg-[hsl(220_24%_9%)] border-white/5 p-6">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Top Referrers</h3>
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-xs text-white/80 font-medium">Agent #{i}024</span>
                <span className="text-xs font-bold text-[#fbbf24]">₱{45000 / i}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── NEW: Logistics & Field Crews Tab ──
function LogisticsTab() {
  const { data: crews = [] } = useQuery<Crew[]>({ queryKey: ["/api/admin/crews"], queryFn: () => apiFetch("/api/admin/crews") });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-orange-500/5 p-6 rounded-2xl border border-orange-500/10">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Truck size={24} className="text-orange-400" /> Fleet & Field Crews
          </h2>
          <p className="text-white/40 text-sm mt-1">Real-time GPS and weather monitoring for {crews.length} active teams.</p>
        </div>
        <Button className="bg-orange-500 text-white font-bold">Dispatch New Crew</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {crews.map((crew) => {
          const color = crew.status === 'on-site' ? 'green' : crew.status === 'transit' ? 'blue' : 'gray';
          return (
            <Card key={crew.id} className="bg-[hsl(220_24%_9%)] border-white/5 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-500/10 text-${color}-400`}>
                    <MapPin size={20} />
                  </div>
                  <Badge className={`bg-${color}-500/10 text-${color}-400 border-none uppercase text-[8px]`}>{crew.status}</Badge>
                </div>
                <h3 className="font-bold text-white mb-1">{crew.name}</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-4">{crew.location || "Base Station"}</p>
                
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-white/30 uppercase font-black">Weather Risk</span>
                    <span className={`text-[10px] font-bold ${crew.lastWeatherRisk === 'HIGH' ? 'text-red-400' : 'text-white/60'}`}>{crew.lastWeatherRisk || "Low"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-white/30 uppercase font-black">Last Update</span>
                    <span className="text-[10px] text-white/60 font-bold">15m ago</span>
                  </div>
                </div>
              </div>
              <div className={`h-1 w-full bg-${color}-500/40`} />
            </Card>
          );
        })}
        {crews.length === 0 && [1,2,3].map(i => (
          <div key={i} className="h-48 rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-white/10 text-[10px] uppercase font-black">
            Crew Seat #{i} Available
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[hsl(220_24%_9%)] border-white/5 p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <ImageIcon size={16} className="text-blue-400" /> Recent Site Photos
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="aspect-square bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all cursor-zoom-in group relative overflow-hidden">
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[8px] text-white font-black uppercase">Project #{i}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[hsl(220_24%_9%)] border-white/5 p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Clock size={16} className="text-[#fbbf24]" /> Logistics Timeline
          </h3>
          <div className="space-y-6">
            {[
              { time: "08:15 AM", crew: "Team Alfa", action: "Arrived at Quezon City site", status: "In Progress" },
              { time: "09:45 AM", crew: "Warehouse", action: "Inverter batch #302 dispatched", status: "En Route" },
              { time: "11:20 AM", crew: "Team Charlie", action: "Structural mount verified", status: "Success" }
            ].map((log, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <div className="w-[1px] flex-1 bg-white/5 my-1" />
                </div>
                <div>
                  <p className="text-[9px] text-white/20 uppercase font-black tracking-tighter">{log.time} · {log.crew}</p>
                  <p className="text-xs font-bold text-white mt-1">{log.action}</p>
                  <p className="text-[9px] text-[#fbbf24]/60 uppercase font-bold mt-1">{log.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── NEW: Leads CRM Tab ──
function LeadsTab() {
  const { data: leads = [] } = useQuery<Lead[]>({ queryKey: ["/api/admin/leads"], queryFn: () => apiFetch("/api/admin/leads") });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Users size={24} className="text-[#fbbf24]" /> Sales Pipeline
          </h2>
          <p className="text-white/40 text-sm mt-1">Nurturing {leads.length} active opportunities in the Philippines.</p>
        </div>
        <Button className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold">
          <Plus size={16} className="mr-2" /> Add Prospect
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['new', 'contacted', 'quoted', 'closed'].map((status) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5 px-2">
              <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{status}</span>
              <span className="bg-white/5 text-[9px] px-2 py-0.5 rounded text-white/60">
                {leads.filter(l => l.status === status).length}
              </span>
            </div>
            
            <div className="space-y-3">
              {leads.filter(l => l.status === status).length > 0 ? (
                leads.filter(l => l.status === status).map(lead => (
                  <Card key={lead.id} className="bg-[hsl(220_24%_9%)] border-white/5 p-4 hover:border-[#fbbf24]/20 transition-all cursor-move group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-[#fbbf24] transition-colors">{lead.clientName}</h4>
                      <Badge className="bg-blue-500/10 text-blue-400 border-none text-[8px] px-1.5 h-4 uppercase">{lead.source}</Badge>
                    </div>
                    <p className="text-[10px] text-white/40 mb-3 truncate">{lead.notes || "No additional notes provided."}</p>
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5">
                      <div className="flex -space-x-1">
                        {[1,2,3].map(i => <div key={i} className="w-4 h-4 rounded-full bg-white/10 border border-black" />)}
                      </div>
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#fbbf24]" style={{ width: '40%' }} />
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="py-8 text-center border border-dashed border-white/5 rounded-xl">
                  <p className="text-[10px] text-white/10 uppercase font-black tracking-widest">No leads in this stage</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── NEW: Procurement & Supplier Marketplace ──
function ProcurementTab() {
  const { data: vendors = [] } = useQuery<Vendor[]>({ queryKey: ["/api/admin/vendors"], queryFn: () => apiFetch("/api/admin/vendors") });
  const [activeSubTab, setActiveSubTab] = useState<"marketplace" | "vendors" | "pos">("marketplace");

  const marketplace = [
    { id: 1, name: "Trina Solar 550W Vertex", cat: "Panels", price: "₱6,500", stock: 120, img: "🔵", vendor: "Trina PH" },
    { id: 2, name: "Growatt MIN 5000TL-X", cat: "Inverters", price: "₱42,000", stock: 15, img: "⚡", vendor: "Growatt Hub" },
    { id: 3, name: "Deye 5kW Hybrid", cat: "Inverters", price: "₱85,000", stock: 8, img: "🔋", vendor: "SolAce Distri" },
    { id: 4, name: "SolarIQ Smart Hub v2", cat: "IoT", price: "₱8,900", stock: 45, img: "🧠", vendor: "SolarIQ Warehouse" },
    { id: 5, name: "MC4 Connectors (100pk)", cat: "BOS", price: "₱1,200", stock: 200, img: "🔌", vendor: "WiredUp Inc" },
    { id: 6, name: "Aluminum Rail (6m)", cat: "Mounting", price: "₱2,800", stock: 80, img: "🏗️", vendor: "MountMaster" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Sub-Navigation ── */}
      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl w-fit border border-white/5">
        {[
          { id: "marketplace", label: "Supplier Marketplace", icon: ShoppingCart },
          { id: "vendors", label: "Approved Vendors", icon: Building2 },
          { id: "pos", label: "Purchase Orders", icon: Receipt },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveSubTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${activeSubTab === t.id ? 'bg-[#fbbf24] text-black shadow-lg shadow-[#fbbf24]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            <t.icon size={13} />{t.label}
          </button>
        ))}
      </div>

      {activeSubTab === "marketplace" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-600/20 via-transparent to-transparent p-8 rounded-3xl border border-blue-500/10 relative overflow-hidden">
             <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-6">
               <div>
                 <h2 className="text-2xl font-black text-white italic tracking-tighter">SolarIQ <span className="text-[#fbbf24]">Direct</span></h2>
                 <p className="text-white/40 text-sm mt-1">Direct-to-installer marketplace with verified Tier-1 logistics.</p>
               </div>
               <div className="flex gap-3">
                 <Input placeholder="Search components..." className="bg-black/40 border-white/10 text-xs w-64 rounded-xl" />
                 <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl"><Filter size={15} /></Button>
               </div>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#fbbf24]/5 blur-[100px] pointer-events-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketplace.map(p => (
              <Card key={p.id} className="bg-[hsl(220_24%_9%)] border-white/5 group hover:border-[#fbbf24]/30 transition-all overflow-hidden cursor-pointer">
                <div className="aspect-[4/3] bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500 relative">
                   {p.img}
                   <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[10px] font-black text-[#fbbf24]">
                      {p.price}
                   </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-white group-hover:text-[#fbbf24] transition-colors">{p.name}</h3>
                    <span className="text-[9px] text-white/30 uppercase font-bold">{p.cat}</span>
                  </div>
                  <p className="text-[10px] text-white/40 mb-4 flex items-center gap-1.5"><Building2 size={10} /> {p.vendor}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="text-[10px]">
                      <span className="text-white/20 uppercase font-black tracking-widest block">In Stock</span>
                      <span className="text-green-400 font-bold">{p.stock} units</span>
                    </div>
                    <Button size="sm" className="bg-[#fbbf24] text-black font-black text-[10px] h-8 rounded-lg px-4 hover:scale-105 transition-transform">
                      QUICK PO
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === "vendors" && (
        <Card className="bg-[hsl(220_24%_9%)] border-white/5 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-white flex items-center gap-3"><Building2 size={20} className="text-[#fbbf24]" /> Approved Vendors</h2>
          </div>
          <div className="space-y-3">
            {vendors.map(vendor => (
              <div key={vendor.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#fbbf24]/10 flex items-center justify-center text-[#fbbf24] font-black italic">{vendor.name[0]}</div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{vendor.name}</h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{vendor.category} Specialist</p>
                  </div>
                </div>
                <Button variant="ghost" className="text-[10px] text-[#fbbf24] uppercase font-black">Vendor Portal →</Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeSubTab === "pos" && (
        <div className="space-y-6">
           <Card className="bg-black border-white/5 p-6">
            <h3 className="text-white/40 font-black uppercase text-[10px] tracking-widest mb-6">Recent Order Activity</h3>
            <div className="space-y-6">
              {[
                { id: 'PO-1029', status: 'In Custom', color: 'blue', date: 'Oct 24, 2026', total: '₱650,000' },
                { id: 'PO-1031', status: 'At Port', color: 'green', date: 'Oct 26, 2026', total: '₱124,000' }
              ].map(po => (
                <div key={po.id} className="relative pl-6 border-l border-white/10 flex justify-between items-start">
                  <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${po.color === 'blue' ? 'bg-blue-400' : 'bg-green-400'}`} />
                  <div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-tighter">Order #{po.id}</p>
                    <p className="text-xs font-bold text-white mt-1">{po.status} Update</p>
                    <p className="text-[10px] text-white/40 mt-0.5">Dispatched: {po.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#fbbf24]">{po.total}</p>
                    <Button variant="ghost" className="text-[9px] p-0 h-auto text-blue-400 font-bold hover:bg-transparent hover:text-blue-300">Track Shipment</Button>
                  </div>
                </div>
              ))}
            </div>
           </Card>
        </div>
      )}
    </div>
  );
}


// ── Enhanced: Dashboard Tab Features ──
function WeatherMatrix({ projects }: { projects: Project[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const syncMutation = useMutation({
    mutationFn: () => apiFetch("/api/admin/weather/sync", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      toast({ title: "Weather Risk Synced", description: "All active project sites updated with PAGASA/OpenWeather data." });
    }
  });

  const highRiskCount = (projects || []).filter(p => p.lastWeatherRisk === "high" && p.status !== "commissioned").length;
  const regions = [
    { name: "High Risk Sites", count: highRiskCount, risk: "HIGH", color: "red", icon: AlertTriangle },
    { name: "Medium Risk Sites", count: (projects || []).filter(p => p.lastWeatherRisk === "medium" && p.status !== "commissioned").length, risk: "MID", color: "yellow", icon: Wind },
    { name: "Optimal Sites", count: (projects || []).filter(p => p.lastWeatherRisk === "low" && p.status !== "commissioned").length, risk: "LOW", color: "green", icon: Sun },
  ];

  return (
    <Card className="bg-[hsl(220_24%_9%)] border-white/10 overflow-hidden">
      <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex justify-between items-center">
        <span className="text-[10px] font-black uppercase text-white/60 tracking-widest flex items-center gap-2">
          <CloudSun size={14} className="text-blue-400" /> Operational Risk Matrix
        </span>
        <Button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending} variant="ghost" className="h-6 px-2 text-[8px] bg-[#fbbf24]/10 text-[#fbbf24] hover:bg-[#fbbf24]/20 uppercase font-black tracking-widest border border-[#fbbf24]/20">
          {syncMutation.isPending ? "Syncing..." : "Sync PAGASA Live →"}
        </Button>
      </div>
      <div className="divide-y divide-white/5">
        {regions.map((r) => (
          <div key={r.name} className="px-4 py-3 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <r.icon size={14} className={r.color === 'red' ? 'text-red-400' : r.color === 'yellow' ? 'text-yellow-400' : 'text-green-400'} />
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase mb-0.5 tracking-tighter">{r.name}</p>
                <p className="text-xs font-bold text-white">{r.count} Projects</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase text-white/20 mb-0.5">Alert Level</p>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${r.color === 'red' ? 'bg-red-500/10 text-red-100 border border-red-500/30' : r.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-100 border border-yellow-500/30' : 'bg-green-500/10 text-green-100 border border-green-500/30'}`}>
                {r.risk}
              </span>
            </div>
          </div>
        ))}
      </div>
      {highRiskCount > 0 && (
        <div className="bg-red-500/5 p-3 m-4 rounded-lg border border-red-500/20 flex gap-3 items-start">
          <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-[9px] text-red-300/80 leading-relaxed font-medium">
            <strong>SYSTEM ALERT:</strong> {highRiskCount} projects in high-risk zones. Structural mounting halted. Local crews have been auto-notified via SMS.
          </p>
        </div>
      )}
    </Card>
  );
}



// ── NEW: AI Solar Designer Tab ──
function DesignerTab() {
  const [panels, setPanels] = useState<{ x: number, y: number, id: number }[]>([]);
  const [panelWattage, setPanelWattage] = useState(400);
  const [clientName, setClientName] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);

  const addPanel = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 15; // Offset to center 30px panel
    const y = e.clientY - rect.top - 20;  // Offset to center 40px panel
    setPanels([...panels, { x, y, id: Date.now() }]);
  };

  const removePanel = (id: number) => setPanels(panels.filter(p => p.id !== id));
  
  const systemKw = (panels.length * panelWattage) / 1000;
  const annualYield = systemKw * 1450 * 0.8; // Rough Philippines irradiance estimation (1450 kWh/kWp/yr * 0.8 efficiency)

  const saveMutation = useMutation({
    mutationFn: (data: InsertDesign) => apiFetch("/api/admin/designs", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => alert("Design saved successfully!"),
  });

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Controls Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-[hsl(220_24%_9%)] border-[hsl(220_18%_16%)] p-4">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Cpu size={16} className="text-[#fbbf24]" /> Design Spec
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-white/40 uppercase font-black mb-1 block">Client Name</label>
                <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Enter client..." className="bg-white/5 border-white/10 text-xs h-9" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase font-black mb-1 block">Panel Model</label>
                <Select value={panelWattage.toString()} onValueChange={v => setPanelWattage(Number(v))}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-9 text-xs">
                    <SelectValue placeholder="Select Wattage" />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(220_24%_9%)] border-white/10">
                    <SelectItem value="350">350W Poly</SelectItem>
                    <SelectItem value="400">400W Mono-PERC</SelectItem>
                    <SelectItem value="450">450W TOPCon</SelectItem>
                    <SelectItem value="550">550W High-Efficiency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 mt-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] text-white/30 uppercase font-bold">Panels</p>
                    <p className="text-lg font-black text-white">{panels.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-[#fbbf24] uppercase font-bold">Capacity</p>
                    <p className="text-lg font-black text-[#fbbf24]">{systemKw.toFixed(2)} kW</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-white/5">
                  <p className="text-[9px] text-green-400/60 uppercase font-bold">Est. Annual Yield</p>
                  <p className="text-xl font-black text-green-400">~{annualYield.toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh/yr</p>
                </div>
              </div>
              <Button className="w-full bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold mt-2" onClick={() => saveMutation.mutate({
                clientName,
                panelCount: panels.length,
                systemKw,
                annualYield,
                layoutJson: JSON.stringify(panels),
                status: 'final',
                createdAt: new Date().toISOString()
              })}>
                Save Design
              </Button>
            </div>
          </Card>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-[10px] text-blue-200/80 leading-relaxed">
            <Info size={14} className="mb-2 text-blue-400" />
            <p><strong>Pro-Tip:</strong> Click anywhere on the roof image to place a solar panel. Right-click a panel to remove it. Our AI assumes an 80% system efficiency factor based on typical shade levels in the Philippines.</p>
          </div>
        </div>

        {/* Visual Canvas */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-black border-[hsl(220_18%_16%)] overflow-hidden shadow-2xl relative">
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#fbbf24] animate-pulse" />
              <span className="text-[10px] font-bold text-white tracking-widest uppercase">AI Design Mode — LIVE</span>
            </div>
            <div 
              ref={canvasRef}
              className="aspect-video bg-[url('/roof.png')] bg-cover bg-center cursor-crosshair relative"
              onClick={addPanel}
              onContextMenu={e => e.preventDefault()}
            >
              <div className="absolute inset-0 bg-black/20" /> {/* Subtle overlay for contrast */}
              {panels.map((p) => (
                <div 
                  key={p.id}
                  className="absolute cursor-pointer hover:ring-2 hover:ring-[#fbbf24] transition-all group"
                  style={{ left: p.x, top: p.y, width: 30, height: 45 }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removePanel(p.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src="/panel.png" className="w-full h-full object-cover shadow-lg rounded-[2px]" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={8} className="text-white" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <div className="flex justify-between items-center text-[10px] text-white/20">
            <p>SATELLITE IMAGE AUTO-SOURCED VIA SOLAR-IQ GEOSPATIAL API</p>
            <div className="flex gap-4 uppercase font-bold">
              <span>IRRADIANCE: 5.2 kWh/m²/day</span>
              <span>ORIENTATION: South (180°)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ERP: HR & Payroll Tab ──
function HRTab() {
  const { toast } = useToast();
  const { data: emps = [], refetch } = useQuery<any[]>({ queryKey: ["/api/admin/employees"], queryFn: () => apiFetch("/api/admin/employees") });
  const { data: sheets = [] } = useQuery<any[]>({ queryKey: ["/api/admin/timesheets"], queryFn: () => apiFetch("/api/admin/timesheets") });
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", role: "installer", email: "", phone: "", dailyRate: "1200", employmentType: "full-time" });
  const createMut = useMutation({
    mutationFn: (d: any) => apiFetch("/api/admin/employees", { method: "POST", body: JSON.stringify(d) }),
    onSuccess: () => { refetch(); setAdding(false); toast({ title: "Employee added" }); }
  });
  const statusColor: Record<string, string> = { active: "text-green-400 bg-green-400/10 border-green-400/20", inactive: "text-red-400 bg-red-400/10 border-red-400/20", "on-leave": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" };
  const roleColor: Record<string, string> = { installer: "bg-blue-500/10 text-blue-400", supervisor: "bg-purple-500/10 text-purple-400", sales: "bg-yellow-500/10 text-yellow-400", admin: "bg-gray-500/10 text-gray-400", engineer: "bg-cyan-500/10 text-cyan-400" };
  const totalPayroll = emps.reduce((s: number, e: any) => s + (e.dailyRate || 0) * 22, 0);
  const activeEmps = emps.filter((e: any) => e.status === "active");
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[{ label: "Total Employees", val: emps.length, icon: Users, color: "text-blue-400" }, { label: "Active", val: activeEmps.length, icon: CheckCircle2, color: "text-green-400" }, { label: "Est. Monthly Payroll", val: `₱${totalPayroll.toLocaleString()}`, icon: DollarSign, color: "text-yellow-400" }, { label: "Timesheets", val: sheets.length, icon: ClipboardList, color: "text-purple-400" }].map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-4">
            <div className={`flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest mb-2 ${color}`}><Icon size={12} />{label}</div>
            <div className="text-xl font-black text-white">{val}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <h2 className="font-black text-white">Employee Directory</h2>
        <Button onClick={() => setAdding(true)} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs h-8 gap-1.5"><Plus size={13} />Add Employee</Button>
      </div>
      {adding && (
        <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-white text-sm">New Employee</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs" />
            <Input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs" />
            <Input placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs" />
            <Input placeholder="Daily Rate ₱" type="number" value={form.dailyRate} onChange={e => setForm(f => ({ ...f, dailyRate: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs" />
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white text-xs rounded-lg px-3 py-2">
              {["installer", "supervisor", "sales", "admin", "engineer"].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={form.employmentType} onChange={e => setForm(f => ({ ...f, employmentType: e.target.value }))} className="bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white text-xs rounded-lg px-3 py-2">
              {["full-time", "part-time", "contractor"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => createMut.mutate({ ...form, dailyRate: +form.dailyRate, status: "active", hiredDate: new Date().toISOString().slice(0, 10) })} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs h-8">Save Employee</Button>
            <Button variant="outline" onClick={() => setAdding(false)} className="border-[hsl(220_18%_22%)] text-white/60 text-xs h-8">Cancel</Button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {emps.map((emp: any) => (
          <div key={emp.id} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fbbf24]/10 flex items-center justify-center text-[#fbbf24] font-black text-sm shrink-0">{emp.name[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-sm">{emp.name}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${roleColor[emp.role] || "bg-gray-500/10 text-gray-400"}`}>{emp.role}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-black uppercase ${statusColor[emp.status] || ""}`}>{emp.status}</span>
              </div>
              <div className="text-[10px] text-white/40 mt-0.5">{emp.email || "—"} · {emp.phone || "—"}</div>
              <div className="text-[10px] text-[#fbbf24]/70 font-bold mt-0.5">₱{(emp.dailyRate || 0).toLocaleString()}/day · {emp.employmentType}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ERP: Finance & Accounting Tab ──
function FinanceTab() {
  const { data: accounts = [] } = useQuery<any[]>({ queryKey: ["/api/admin/accounts"], queryFn: () => apiFetch("/api/admin/accounts") });
  const { data: journal = [] } = useQuery<any[]>({ queryKey: ["/api/admin/journal"], queryFn: () => apiFetch("/api/admin/journal") });
  const revenue = accounts.filter((a: any) => a.type === "revenue").reduce((s: number, a: any) => s + a.balance, 0);
  const expenses = accounts.filter((a: any) => a.type === "expense").reduce((s: number, a: any) => s + a.balance, 0);
  const assets = accounts.filter((a: any) => a.type === "asset").reduce((s: number, a: any) => s + a.balance, 0);
  const liabilities = accounts.filter((a: any) => a.type === "liability").reduce((s: number, a: any) => s + a.balance, 0);
  const netIncome = revenue - expenses;
  const typeColors: Record<string, string> = { asset: "text-blue-400 bg-blue-400/10", liability: "text-red-400 bg-red-400/10", equity: "text-purple-400 bg-purple-400/10", revenue: "text-green-400 bg-green-400/10", expense: "text-orange-400 bg-orange-400/10" };
  const sections = ["asset", "liability", "equity", "revenue", "expense"];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[{ label: "Total Revenue", val: `₱${revenue.toLocaleString()}`, color: "text-green-400", bg: "from-green-500/10" }, { label: "Total Expenses", val: `₱${expenses.toLocaleString()}`, color: "text-red-400", bg: "from-red-500/10" }, { label: "Net Income", val: `₱${netIncome.toLocaleString()}`, color: netIncome >= 0 ? "text-[#fbbf24]" : "text-red-400", bg: "from-yellow-500/10" }, { label: "Total Assets", val: `₱${assets.toLocaleString()}`, color: "text-blue-400", bg: "from-blue-500/10" }].map(({ label, val, color, bg }) => (
          <div key={label} className={`bg-gradient-to-br ${bg} to-transparent border border-white/5 rounded-2xl p-4`}>
            <div className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-1">{label}</div>
            <div className={`text-xl font-black ${color}`}>{val}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-black text-white mb-4">Chart of Accounts</h2>
          {sections.map(type => {
            const accs = accounts.filter((a: any) => a.type === type);
            if (!accs.length) return null;
            return (
              <div key={type} className="mb-4">
                <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg inline-block mb-2 ${typeColors[type] || ""}`}>{type}</div>
                <div className="space-y-1.5">
                  {accs.map((a: any) => (
                    <div key={a.id} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-xl px-4 py-2.5 flex items-center justify-between">
                      <div><span className="text-[10px] text-white/30 font-mono mr-2">{a.code}</span><span className="text-sm text-white font-semibold">{a.name}</span></div>
                      <div className={`font-black text-sm ${a.type === "expense" || a.type === "liability" ? "text-red-400" : "text-green-400"}`}>₱{(a.balance || 0).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div>
          <h2 className="font-black text-white mb-4">P&L Summary</h2>
          <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-5 space-y-3">
            {[{ label: "Revenue", val: revenue, color: "text-green-400" }, { label: "Cost of Goods", val: -(accounts.find((a:any) => a.code === "5000")?.balance || 0), color: "text-red-400" }, { label: "Labor & Payroll", val: -(accounts.find((a:any) => a.code === "5100")?.balance || 0), color: "text-red-400" }, { label: "Operating Expenses", val: -((accounts.find((a:any) => a.code === "5200")?.balance || 0) + (accounts.find((a:any) => a.code === "5300")?.balance || 0)), color: "text-orange-400" }].map(({ label, val, color }) => (
              <div key={label} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                <span className="text-white/60">{label}</span>
                <span className={`font-black ${color}`}>₱{Math.abs(val).toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-1">
              <span className="font-black text-white">Net Income</span>
              <span className={`font-black text-lg ${netIncome >= 0 ? "text-[#fbbf24]" : "text-red-400"}`}>₱{netIncome.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ERP: Compliance Tab ──
function ComplianceTab() {
  const { toast } = useToast();
  const { data: items = [], refetch } = useQuery<any[]>({ queryKey: ["/api/admin/compliance"], queryFn: () => apiFetch("/api/admin/compliance") });
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", category: "permit", dueDate: "", notes: "" });
  const createMut = useMutation({
    mutationFn: (d: any) => apiFetch("/api/admin/compliance", { method: "POST", body: JSON.stringify(d) }),
    onSuccess: () => { refetch(); setAdding(false); toast({ title: "Compliance item added" }); }
  });
  const markMut = useMutation({
    mutationFn: ({ id, status }: any) => apiFetch(`/api/admin/compliance/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => refetch()
  });
  const statusColor: Record<string, string> = { pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", completed: "text-green-400 bg-green-400/10 border-green-400/20", overdue: "text-red-400 bg-red-400/10 border-red-400/20", waived: "text-gray-400 bg-gray-400/10 border-gray-400/20" };
  const catIcon: Record<string, string> = { permit: "📋", license: "🪪", bir: "🏛️", pcab: "🏗️", insurance: "🛡️", inspection: "🔍" };
  const pending = items.filter((i: any) => i.status === "pending").length;
  const overdue = items.filter((i: any) => i.status === "overdue" || (i.status === "pending" && new Date(i.dueDate) < new Date())).length;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[{ label: "Total Items", val: items.length, color: "text-white" }, { label: "Pending", val: pending, color: "text-yellow-400" }, { label: "Overdue", val: overdue, color: "text-red-400" }].map(({ label, val, color }) => (
          <div key={label} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-4 text-center">
            <div className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">{label}</div>
            <div className={`text-2xl font-black ${color}`}>{val}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <h2 className="font-black text-white">Compliance Calendar</h2>
        <Button onClick={() => setAdding(true)} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs h-8 gap-1.5"><Plus size={13} />Add Item</Button>
      </div>
      {adding && (
        <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs col-span-2" />
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white text-xs rounded-lg px-3 py-2">
              {["permit", "license", "bir", "pcab", "insurance", "inspection"].map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
            </select>
            <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs" />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => createMut.mutate({ ...form })} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs h-8">Save</Button>
            <Button variant="outline" onClick={() => setAdding(false)} className="border-[hsl(220_18%_22%)] text-white/60 text-xs h-8">Cancel</Button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {items.map((item: any) => (
          <div key={item.id} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-4 flex items-center gap-4">
            <div className="text-2xl">{catIcon[item.category] || "📌"}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-sm">{item.title}</div>
              <div className="text-[10px] text-white/40">Due: {item.dueDate} · {item.category.toUpperCase()}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] px-2 py-1 rounded-full border font-black uppercase ${statusColor[item.status] || ""}`}>{item.status}</span>
              {item.status !== "completed" && (
                <Button onClick={() => markMut.mutate({ id: item.id, status: "completed" })} className="bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] h-6 px-2 font-bold hover:bg-green-500/20">✓ Done</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ERP: BOM / Manufacturing Tab ──
function BOMTab() {
  const { data: boms = [] } = useQuery<any[]>({ queryKey: ["/api/admin/bom"], queryFn: () => apiFetch("/api/admin/bom") });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="font-black text-white">Bill of Materials Templates</h2><p className="text-white/30 text-xs mt-1">Standard component lists for solar system builds</p></div>
      </div>
      {boms.map((bom: any) => {
        const items = JSON.parse(bom.items || "[]");
        return (
          <div key={bom.id} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-white">{bom.name}</h3>
                <p className="text-[10px] text-[#fbbf24] font-bold">{bom.systemKw} kWp System</p>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-white/30 uppercase font-black">Total BOM Cost</div>
                <div className="text-xl font-black text-green-400">₱{(bom.totalCost || 0).toLocaleString()}</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-white/30 border-b border-white/5">{["Component", "Qty", "Unit", "Unit Cost", "Total"].map(h => <th key={h} className="text-left py-2 px-2 font-black uppercase text-[9px] tracking-wider">{h}</th>)}</tr></thead>
                <tbody>
                  {items.map((item: any, i: number) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/2">
                      <td className="py-2.5 px-2 text-white font-semibold">{item.item}</td>
                      <td className="py-2.5 px-2 text-white/60">{item.qty}</td>
                      <td className="py-2.5 px-2 text-white/60">{item.unit}</td>
                      <td className="py-2.5 px-2 text-white/60">₱{(item.unitCost || 0).toLocaleString()}</td>
                      <td className="py-2.5 px-2 text-[#fbbf24] font-bold">₱{((item.qty || 0) * (item.unitCost || 0)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── ERP: Service Tab ──
function ServiceTab() {
  const { toast } = useToast();
  const { data: jobs = [], refetch } = useQuery<any[]>({ queryKey: ["/api/admin/service"], queryFn: () => apiFetch("/api/admin/service") });
  const { data: projs = [] } = useQuery<any[]>({ queryKey: ["/api/admin/projects"], queryFn: () => apiFetch("/api/admin/projects") });
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ projectId: "", type: "maintenance", description: "", scheduledDate: "", technicianName: "" });
  const createMut = useMutation({
    mutationFn: (d: any) => apiFetch("/api/admin/service", { method: "POST", body: JSON.stringify(d) }),
    onSuccess: () => { refetch(); setAdding(false); toast({ title: "Service job created" }); }
  });
  const resolveMut = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/admin/service/${id}`, { method: "PATCH", body: JSON.stringify({ status: "resolved", resolvedDate: new Date().toISOString() }) }),
    onSuccess: () => refetch()
  });
  const typeColor: Record<string, string> = { maintenance: "text-blue-400 bg-blue-400/10", warranty: "text-purple-400 bg-purple-400/10", inspection: "text-cyan-400 bg-cyan-400/10", emergency: "text-red-400 bg-red-400/10" };
  const statusColor: Record<string, string> = { open: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", scheduled: "text-blue-400 bg-blue-400/10 border-blue-400/20", in_progress: "text-orange-400 bg-orange-400/10 border-orange-400/20", resolved: "text-green-400 bg-green-400/10 border-green-400/20" };
  const open = jobs.filter((j: any) => j.status !== "resolved").length;
  const scheduled = jobs.filter((j: any) => j.status === "scheduled").length;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[{ label: "Open Jobs", val: open, color: "text-yellow-400" }, { label: "Scheduled", val: scheduled, color: "text-blue-400" }, { label: "Total", val: jobs.length, color: "text-white" }].map(({ label, val, color }) => (
          <div key={label} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-4 text-center">
            <div className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">{label}</div>
            <div className={`text-2xl font-black ${color}`}>{val}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <h2 className="font-black text-white">After-Sales Service Jobs</h2>
        <Button onClick={() => setAdding(true)} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs h-8 gap-1.5"><Plus size={13} />New Job</Button>
      </div>
      {adding && (
        <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} className="bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white text-xs rounded-lg px-3 py-2">
              <option value="">Select Project</option>
              {projs.map((p: any) => <option key={p.id} value={p.id}>{p.clientName}</option>)}
            </select>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white text-xs rounded-lg px-3 py-2">
              {["maintenance", "warranty", "inspection", "emergency"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <Input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs col-span-2" />
            <Input placeholder="Technician" value={form.technicianName} onChange={e => setForm(f => ({ ...f, technicianName: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs" />
            <Input type="date" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs" />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => createMut.mutate({ ...form, projectId: +form.projectId, status: form.scheduledDate ? "scheduled" : "open" })} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs h-8">Create Job</Button>
            <Button variant="outline" onClick={() => setAdding(false)} className="border-[hsl(220_18%_22%)] text-white/60 text-xs h-8">Cancel</Button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {jobs.map((job: any) => {
          const proj = projs.find((p: any) => p.id === job.projectId);
          return (
            <div key={job.id} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-4 flex items-center gap-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeColor[job.type] || ""}`}>
                {job.type === "emergency" ? "🚨" : job.type === "warranty" ? "🛡️" : job.type === "inspection" ? "🔍" : "🔧"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm">{job.description}</div>
                <div className="text-[10px] text-white/40">{proj?.clientName || `Project #${job.projectId}`} · {job.technicianName || "Unassigned"} {job.scheduledDate ? `· 📅 ${job.scheduledDate}` : ""}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[9px] px-2 py-1 rounded-full border font-black uppercase ${statusColor[job.status] || ""}`}>{job.status}</span>
                {job.status !== "resolved" && (
                  <Button onClick={() => resolveMut.mutate(job.id)} className="bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] h-6 px-2 font-bold hover:bg-green-500/20">Resolve</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ERP: Analytics Tab ──
function DashboardTab({ projects }: { projects: any[] }) {
  const { data: leads = [] } = useQuery<any[]>({ queryKey: ["/api/admin/leads"], queryFn: () => apiFetch("/api/admin/leads") });
  const { data: accounts = [] } = useQuery<any[]>({ queryKey: ["/api/admin/accounts"], queryFn: () => apiFetch("/api/admin/accounts") });
  const totalRevenue = accounts.filter((a: any) => a.type === "revenue").reduce((s: number, a: any) => s + a.balance, 0);
  const totalExpenses = accounts.filter((a: any) => a.type === "expense").reduce((s: number, a: any) => s + a.balance, 0);
  const avgDeal = projects.length ? Math.round(projects.reduce((s, p) => s + (p.contractValue || 0), 0) / projects.length) : 0;
  const commissioned = projects.filter(p => p.status === "commissioned").length;
  const closeRate = leads.length ? Math.round((commissioned / leads.length) * 100) : 0;
  const stages = [
    { label: "New Leads", count: leads.filter((l: any) => l.status === "new").length, color: "bg-blue-500" },
    { label: "Quoted", count: leads.filter((l: any) => l.status === "quoted").length, color: "bg-yellow-500" },
    { label: "Won", count: leads.filter((l: any) => l.status === "closed_won").length, color: "bg-green-500" },
    { label: "Commissioned", count: commissioned, color: "bg-[#fbbf24]" },
  ];
  const maxStage = Math.max(...stages.map(s => s.count), 1);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", val: `₱${totalRevenue.toLocaleString()}`, sub: "All time", color: "text-green-400" },
          { label: "Active Projects", val: projects.filter(p => p.status !== "commissioned").length, sub: `of ${projects.length} total`, color: "text-[#fbbf24]" },
          { label: "Avg Deal Size", val: `₱${avgDeal.toLocaleString()}`, sub: "Per project", color: "text-blue-400" },
          { label: "Lead Close Rate", val: `${closeRate}%`, sub: `${leads.length} leads`, color: "text-purple-400" },
        ].map(({ label, val, sub, color }) => (
          <div key={label} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-4">
            <div className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">{label}</div>
            <div className={`text-2xl font-black ${color}`}>{val}</div>
            <div className="text-[10px] text-white/20 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-5">
          <h3 className="font-black text-white mb-4">Sales Pipeline Funnel</h3>
          <div className="space-y-3">
            {stages.map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1.5"><span className="text-white/60">{s.label}</span><span className="font-bold text-white">{s.count}</span></div>
                <div className="h-3 bg-[hsl(220_18%_14%)] rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full transition-all duration-700`} style={{ width: `${Math.round((s.count / maxStage) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-5">
          <h3 className="font-black text-white mb-4">Project Stage Breakdown</h3>
          <div className="space-y-2">
            {["survey", "design", "permitting", "procurement", "installation", "inspection", "commissioned"].map(stage => {
              const count = projects.filter(p => p.status === stage).length;
              return (
                <div key={stage} className="flex items-center gap-3">
                  <div className="w-20 text-[10px] text-white/40 capitalize shrink-0">{stage}</div>
                  <div className="flex-1 h-2 bg-[hsl(220_18%_14%)] rounded-full overflow-hidden">
                    <div className="h-full bg-[#fbbf24] rounded-full" style={{ width: `${Math.round((count / Math.max(projects.length, 1)) * 100)}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-white/60 w-5 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-5">
        <h3 className="font-black text-white mb-4">Financial Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[{ label: "Gross Revenue", val: totalRevenue, color: "text-green-400" }, { label: "Total Expenses", val: totalExpenses, color: "text-red-400" }, { label: "Net Profit", val: totalRevenue - totalExpenses, color: "text-[#fbbf24]" }].map(({ label, val, color }) => (
            <div key={label}>
              <div className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">{label}</div>
              <div className={`text-xl font-black ${color}`}>₱{Math.abs(val).toLocaleString()}</div>
              <div className="h-1.5 bg-[hsl(220_18%_14%)] rounded-full mt-2 overflow-hidden">
                <div className={`h-full ${label === "Total Expenses" ? "bg-red-500" : label === "Net Profit" ? "bg-[#fbbf24]" : "bg-green-500"} rounded-full`} style={{ width: `${Math.round((Math.abs(val) / Math.max(totalRevenue, 1)) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ERP: Tenants Tab ──
function TenantsTab() {
  const { toast } = useToast();
  const { data: tenants = [], refetch } = useQuery<any[]>({ queryKey: ["/api/admin/tenants"], queryFn: () => apiFetch("/api/admin/tenants") });
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", subdomain: "", ownerEmail: "", primaryColor: "#fbbf24", planTier: "starter" });
  const createMut = useMutation({
    mutationFn: (d: any) => apiFetch("/api/admin/tenants", { method: "POST", body: JSON.stringify(d) }),
    onSuccess: () => { refetch(); setAdding(false); toast({ title: "Contractor account created" }); }
  });
  const planColor: Record<string, string> = { starter: "text-gray-400 bg-gray-400/10 border-gray-400/20", pro: "text-blue-400 bg-blue-400/10 border-blue-400/20", enterprise: "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20" };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-white">Contractor Accounts</h2>
          <p className="text-xs text-white/30 mt-1">Manage all solar contractor tenants on this platform</p>
        </div>
        <Button onClick={() => setAdding(true)} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs h-8 gap-1.5"><Plus size={13} />Add Contractor</Button>
      </div>
      {adding && (
        <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-white text-sm">New Contractor Account</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Company Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs" />
            <Input placeholder="Subdomain (e.g. acesolar)" value={form.subdomain} onChange={e => setForm(f => ({ ...f, subdomain: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs" />
            <Input placeholder="Owner Email" value={form.ownerEmail} onChange={e => setForm(f => ({ ...f, ownerEmail: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs" />
            <select value={form.planTier} onChange={e => setForm(f => ({ ...f, planTier: e.target.value }))} className="bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white text-xs rounded-lg px-3 py-2">
              {["starter", "pro", "enterprise"].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => createMut.mutate(form)} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs h-8">Create Account</Button>
            <Button variant="outline" onClick={() => setAdding(false)} className="border-[hsl(220_18%_22%)] text-white/60 text-xs h-8">Cancel</Button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tenants.map((t: any) => (
          <div key={t.id} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg" style={{ backgroundColor: t.primaryColor + "20", color: t.primaryColor }}>{t.name[0]}</div>
                <div>
                  <div className="font-black text-white">{t.name}</div>
                  <div className="text-[10px] text-white/30">{t.subdomain}.solariq.ph</div>
                </div>
              </div>
              <span className={`text-[9px] px-2 py-1 rounded-full border font-black uppercase ${planColor[t.planTier] || ""}`}>{t.planTier}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-white/30">Owner</span><div className="text-white font-semibold truncate">{t.ownerEmail || "—"}</div></div>
              <div><span className="text-white/30">Active Projects</span><div className="text-[#fbbf24] font-black">{t.activeProjects}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ── Elite Feature 1: Analytics & BI ──
function AnalyticsTab({ projects }: { projects: any[] }) {
  const totalRevenue = projects.reduce((s: number, p: any) => s + (p.contractValue || 0), 0);
  const completed = projects.filter((p: any) => p.status === "commissioned").length;
  const avgProgress = projects.length ? Math.round(projects.reduce((s: number, p: any) => s + (p.overallProgress || 0), 0) / projects.length) : 0;
  const totalSavings = projects.reduce((s: number, p: any) => s + (p.totalLifetimeSavings || 0), 0);
  const kpis = [
    { label: "Total Revenue", value: `₱${(totalRevenue / 1000).toFixed(0)}K`, sub: `${projects.length} contracts`, color: "#fbbf24" },
    { label: "Commissioned", value: String(completed), sub: "fully complete", color: "#22d3ee" },
    { label: "Avg Progress", value: `${avgProgress}%`, sub: "across all builds", color: "#a78bfa" },
    { label: "Client Savings", value: `₱${(totalSavings / 1_000_000).toFixed(1)}M`, sub: "lifetime projected", color: "#4ade80" },
  ];
  const barData = projects.slice(0, 8).map((p: any) => ({ name: (p.clientName as string)?.split(" ")[0] || "—", val: p.overallProgress || 0 }));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-5">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mb-1">{k.label}</p>
            <p className="text-3xl font-black" style={{ color: k.color }}>{k.value}</p>
            <p className="text-[11px] text-white/30 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-6">
        <h3 className="font-black text-white mb-4 text-sm">Project Progress Overview</h3>
        {barData.length === 0 ? <p className="text-white/30 text-sm text-center py-8">No project data yet</p> : (
          <div className="flex items-end gap-3 h-40">
            {barData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg" style={{ height: `${Math.max(d.val, 4)}%`, background: `hsl(${45 + i * 20} 90% 60%)`, minHeight: 4 }} />
                <span className="text-[9px] text-white/40 truncate w-full text-center">{d.name}</span>
                <span className="text-[9px] text-white/60 font-black">{d.val}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-5">
          <h3 className="font-black text-white text-sm mb-3">Status Breakdown</h3>
          {["survey","design","permitting","procurement","installation","inspection","commissioned"].map(s => {
            const cnt = projects.filter((p: any) => p.status === s).length;
            return (
              <div key={s} className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-white/50 w-24 capitalize">{s}</span>
                <div className="flex-1 h-1.5 bg-[hsl(220_18%_16%)] rounded-full overflow-hidden">
                  <div className="h-full bg-[#fbbf24] rounded-full" style={{ width: projects.length ? `${(cnt / projects.length) * 100}%` : "0%" }} />
                </div>
                <span className="text-[10px] text-white font-black w-4">{cnt}</span>
              </div>
            );
          })}
        </div>
        <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-5">
          <h3 className="font-black text-white text-sm mb-3">Revenue by Contract</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {[...projects].sort((a: any, b: any) => b.contractValue - a.contractValue).slice(0, 8).map((p: any) => (
              <div key={p.id} className="flex items-center gap-2 text-xs">
                <span className="text-white/50 truncate flex-1">{p.clientName}</span>
                <span className="text-[#fbbf24] font-black">₱{((p.contractValue || 0) / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Elite Feature 2: Inventory with Live Ledger ──
function InventoryTab() {
  const { toast } = useToast();
  const [ledgerItem, setLedgerItem] = useState<any>(null);
  const [txType, setTxType] = useState<"in"|"out">("in");
  const [txQty, setTxQty] = useState("1");
  const [txRef, setTxRef] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ itemName: "", category: "panels", quantity: "0", unit: "pcs", minThreshold: "5", warehouseLocation: "A1-W1" });
  const { data: items = [], refetch } = useQuery<any[]>({ queryKey: ["/api/admin/inventory"], queryFn: () => apiFetch("/api/admin/inventory") });
  const { data: txns = [], refetch: refetchTxns } = useQuery<any[]>({ queryKey: ["/api/admin/stock-transactions", ledgerItem?.id], queryFn: () => apiFetch(`/api/admin/stock-transactions?inventoryId=${ledgerItem?.id}`), enabled: !!ledgerItem });
  const addTxn = async () => {
    if (!ledgerItem || !txQty) return;
    try {
      await apiFetch("/api/admin/stock-transactions", { method: "POST", body: JSON.stringify({ inventoryId: ledgerItem.id, type: txType, quantity: +txQty, reference: txRef }) });
      toast({ title: "✅ Transaction recorded" }); setTxQty("1"); setTxRef(""); refetch(); refetchTxns();
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };
  const addItem = async () => {
    try {
      await apiFetch("/api/admin/inventory", { method: "POST", body: JSON.stringify({ ...form, quantity: +form.quantity, minThreshold: +form.minThreshold }) });
      toast({ title: "✅ Item added" }); setAdding(false); refetch();
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-white">Inventory Ledger</h2>
        <Button onClick={() => setAdding(true)} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs h-8 gap-1.5"><Plus size={13} />Add Item</Button>
      </div>
      {adding && (
        <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-white text-sm">New Inventory Item</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Input placeholder="Item Name" value={form.itemName} onChange={e => setForm(f => ({ ...f, itemName: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs" />
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white text-xs rounded-lg px-3 py-2">
              {["panels","inverters","mounting","wiring","batteries","accessories"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Input placeholder="Qty" type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs" />
            <Input placeholder="Unit (pcs, sets...)" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs" />
            <Input placeholder="Min Threshold" type="number" value={form.minThreshold} onChange={e => setForm(f => ({ ...f, minThreshold: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs" />
            <Input placeholder="Warehouse Loc." value={form.warehouseLocation} onChange={e => setForm(f => ({ ...f, warehouseLocation: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs" />
          </div>
          <div className="flex gap-2">
            <Button onClick={addItem} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs h-8">Save Item</Button>
            <Button variant="outline" onClick={() => setAdding(false)} className="border-[hsl(220_18%_22%)] text-white/60 text-xs h-8">Cancel</Button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-3">
        {items.map((item: any) => {
          const low = item.quantity <= item.minThreshold;
          return (
            <div key={item.id} className={`bg-[hsl(220_24%_9%)] border rounded-2xl p-4 flex items-center gap-4 ${low ? "border-red-500/30" : "border-[hsl(220_18%_16%)]"}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-white text-sm">{item.itemName}</span>
                  {low && <span className="text-[9px] px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-black">LOW STOCK</span>}
                </div>
                <div className="flex gap-4 text-[11px] text-white/40">
                  <span>📦 {item.category}</span>
                  <span>🗄 {item.warehouseLocation || "—"}</span>
                  <span>Min: {item.minThreshold} {item.unit}</span>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-black ${low ? "text-red-400" : "text-[#4ade80]"}`}>{item.quantity}</p>
                <p className="text-[10px] text-white/30">{item.unit}</p>
              </div>
              <Button onClick={() => setLedgerItem(item)} variant="outline" className="border-[hsl(220_18%_22%)] text-white/60 text-xs h-8 gap-1"><Receipt size={12} />Ledger</Button>
            </div>
          );
        })}
      </div>
      {ledgerItem && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[hsl(220_24%_9%)] border-l border-[hsl(220_18%_14%)] shadow-2xl z-50 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[hsl(220_18%_14%)]">
            <div>
              <h3 className="font-black text-white">{ledgerItem.itemName}</h3>
              <p className="text-xs text-white/30">Current: <span className="text-[#fbbf24] font-black">{ledgerItem.quantity} {ledgerItem.unit}</span></p>
            </div>
            <button onClick={() => setLedgerItem(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
          </div>
          <div className="p-5 border-b border-[hsl(220_18%_14%)]">
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-3">Record Transaction</p>
            <div className="flex gap-2 mb-3">
              {(["in","out"] as const).map(t => (
                <button key={t} onClick={() => setTxType(t)} className={`flex-1 py-2 rounded-xl text-xs font-black uppercase ${txType === t ? (t === "in" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30") : "bg-[hsl(220_18%_16%)] text-white/40"}`}>{t === "in" ? "▲ Stock In" : "▼ Stock Out"}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Quantity" value={txQty} onChange={e => setTxQty(e.target.value)} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs" />
              <Input placeholder="Reference / PO" value={txRef} onChange={e => setTxRef(e.target.value)} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs" />
            </div>
            <Button onClick={addTxn} className={`w-full mt-3 font-bold text-xs h-8 ${txType === "in" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>Record {txType === "in" ? "Receipt" : "Dispatch"}</Button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-2">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mb-2">History</p>
            {txns.length === 0 ? <p className="text-white/20 text-xs text-center py-8">No transactions yet</p> : txns.map((tx: any) => (
              <div key={tx.id} className={`flex items-center gap-3 p-3 rounded-xl border ${tx.type === "in" ? "border-green-500/15 bg-green-500/5" : "border-red-500/15 bg-red-500/5"}`}>
                <span className={`text-lg ${tx.type === "in" ? "text-green-400" : "text-red-400"}`}>{tx.type === "in" ? "▲" : "▼"}</span>
                <div className="flex-1">
                  <p className="text-xs font-black text-white">{tx.type === "in" ? "+" : "-"}{tx.quantity} {ledgerItem.unit}</p>
                  <p className="text-[10px] text-white/30">{tx.reference || "—"}</p>
                </div>
                <p className="text-[10px] text-white/20">{(tx.createdAt as string)?.slice(0, 10)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Elite Feature 3: Crew Scheduling Gantt ──
function SchedulingTab() {
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", projectId: "", start: "", end: "", resourceId: "" });
  const { data: scheduleData = [], refetch } = useQuery<any[]>({ queryKey: ["/api/admin/schedules"], queryFn: () => apiFetch("/api/admin/schedules") });
  const { data: projects = [] } = useQuery<any[]>({ queryKey: ["/api/admin/projects"], queryFn: () => apiFetch("/api/admin/projects") });
  const { data: employees = [] } = useQuery<any[]>({ queryKey: ["/api/admin/employees"], queryFn: () => apiFetch("/api/admin/employees") });
  const addSchedule = async () => {
    if (!form.title || !form.start || !form.end) return;
    try {
      await apiFetch("/api/admin/schedules", { method: "POST", body: JSON.stringify({ ...form, projectId: +form.projectId || 1, resourceId: form.resourceId ? +form.resourceId : null }) });
      toast({ title: "✅ Schedule added" }); setAdding(false); setForm({ title: "", projectId: "", start: "", end: "", resourceId: "" }); refetch();
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };
  const deleteSchedule = async (id: number) => {
    try { await apiFetch(`/api/admin/schedules/${id}`, { method: "DELETE" }); toast({ title: "Removed" }); refetch(); }
    catch { toast({ title: "Error", variant: "destructive" }); }
  };
  const today = new Date();
  const startOfView = new Date(today); startOfView.setDate(today.getDate() - 7);
  const days = Array.from({ length: 30 }, (_, i) => { const d = new Date(startOfView); d.setDate(startOfView.getDate() + i); return d; });
  const getBar = (s: any) => {
    const st = new Date(s.start); const en = new Date(s.end);
    const offset = Math.max(0, Math.floor((st.getTime() - startOfView.getTime()) / 86400000));
    const width = Math.max(1, Math.ceil((en.getTime() - st.getTime()) / 86400000) + 1);
    return { offset: Math.min(offset, 30), width: Math.min(width, 30 - offset) };
  };
  const colors = ["#fbbf24","#22d3ee","#a78bfa","#4ade80","#f87171","#fb923c"];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-white">Crew Scheduling</h2>
        <Button onClick={() => setAdding(true)} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs h-8 gap-1.5"><Plus size={13} />Add Schedule</Button>
      </div>
      {adding && (
        <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-white text-sm">New Schedule Entry</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Input placeholder="Task title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs col-span-2 lg:col-span-1" />
            <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} className="bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white text-xs rounded-lg px-3 py-2">
              <option value="">Select Project</option>
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.clientName}</option>)}
            </select>
            <select value={form.resourceId} onChange={e => setForm(f => ({ ...f, resourceId: e.target.value }))} className="bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white text-xs rounded-lg px-3 py-2">
              <option value="">Assign Employee</option>
              {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <Input type="date" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs" />
            <Input type="date" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs" />
          </div>
          <div className="flex gap-2">
            <Button onClick={addSchedule} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs h-8">Save</Button>
            <Button variant="outline" onClick={() => setAdding(false)} className="border-[hsl(220_18%_22%)] text-white/60 text-xs h-8">Cancel</Button>
          </div>
        </div>
      )}
      <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[hsl(220_18%_14%)]">
          <p className="text-xs font-black text-white">30-Day Timeline · {startOfView.toLocaleDateString("en-PH", { month: "short", day: "numeric" })} — {days[29].toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</p>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="flex border-b border-[hsl(220_18%_14%)] px-4">
              <div className="w-36 shrink-0 text-[9px] text-white/30 py-2 font-black uppercase">Task</div>
              <div className="flex-1 flex">
                {days.filter((_, i) => i % 5 === 0).map((d, i) => (
                  <div key={i} className="flex-1 text-center text-[9px] text-white/20 py-2">{d.getDate()}/{d.getMonth() + 1}</div>
                ))}
              </div>
            </div>
            {scheduleData.length === 0 ? (
              <div className="text-center text-white/20 text-xs py-12">No schedules yet. Click "Add Schedule" to begin.</div>
            ) : scheduleData.map((s: any, idx: number) => {
              const { offset, width } = getBar(s);
              const proj = projects.find((p: any) => p.id === s.projectId);
              return (
                <div key={s.id} className="flex items-center border-b border-[hsl(220_18%_12%)] px-4 py-2 hover:bg-[hsl(220_18%_11%)] group">
                  <div className="w-36 shrink-0">
                    <p className="text-xs font-black text-white truncate">{s.title}</p>
                    <p className="text-[9px] text-white/30 truncate">{proj?.clientName || "—"}</p>
                  </div>
                  <div className="flex-1 relative h-7">
                    <div className="absolute top-1 h-5 rounded-lg flex items-center px-2 text-[9px] font-black text-black/80" style={{ left: `${(offset / 30) * 100}%`, width: `${Math.max((width / 30) * 100, 3)}%`, backgroundColor: colors[idx % colors.length] }}>
                      <span className="truncate">{s.title}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteSchedule(s.id)} className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 ml-2"><Trash2 size={12} /></button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Elite Feature 4: Proposal Generator ──
function ProposalGeneratorTab() {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [style, setStyle] = useState("modern");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const { data: projects = [] } = useQuery<any[]>({ queryKey: ["/api/admin/projects"], queryFn: () => apiFetch("/api/admin/projects") });
  const generateProposal = async () => {
    if (!selectedProject) return;
    setGenerating(true);
    try {
      const snapshot = JSON.stringify({ clientName: selectedProject.clientName, address: selectedProject.address, systemKw: selectedProject.systemKw, panelCount: selectedProject.panelCount, contractValue: selectedProject.contractValue, annualSavings: selectedProject.annualSavings, roi: selectedProject.roiProjectedYears, totalLifetimeSavings: selectedProject.totalLifetimeSavings, generatedAt: new Date().toISOString() });
      await apiFetch("/api/admin/proposals", { method: "POST", body: JSON.stringify({ projectId: selectedProject.id, templateStyle: style, snapshotJson: snapshot, totalValue: selectedProject.contractValue, isPublished: 0 }) });
      toast({ title: "✅ Proposal generated and saved" }); setGenerated(true);
    } catch { toast({ title: "Error generating proposal", variant: "destructive" }); }
    finally { setGenerating(false); }
  };
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl p-6 space-y-4">
        <h2 className="font-black text-white text-lg">Proposal Generator</h2>
        <p className="text-sm text-white/40">Select a project to generate a professional, client-ready PDF proposal.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-white/40 uppercase font-black tracking-widest block mb-1.5">Select Project</label>
            <select value={selectedProject?.id || ""} onChange={e => { setSelectedProject(projects.find((p: any) => p.id === +e.target.value) || null); setGenerated(false); }} className="w-full bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white text-sm rounded-xl px-3 py-2.5">
              <option value="">— Choose a project —</option>
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.clientName}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-white/40 uppercase font-black tracking-widest block mb-1.5">Template Style</label>
            <select value={style} onChange={e => setStyle(e.target.value)} className="w-full bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white text-sm rounded-xl px-3 py-2.5">
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={generateProposal} disabled={!selectedProject || generating} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold gap-2">
            {generating ? <><RefreshCw size={14} className="animate-spin" />Generating...</> : <><FileText size={14} />Generate Proposal</>}
          </Button>
          {generated && <Button onClick={() => window.print()} variant="outline" className="border-[hsl(220_18%_22%)] text-white gap-2"><Download size={14} />Print / Save PDF</Button>}
        </div>
      </div>
      {selectedProject && (
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-[hsl(220_28%_12%)] to-[hsl(220_28%_20%)] p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="8" fill="#fbbf24"/><circle cx="16" cy="16" r="4" fill="white" opacity="0.95"/></svg>
              <div><span className="font-black text-xl">Solar<span className="text-[#fbbf24]">IQ</span></span><div className="text-[10px] text-white/40 uppercase tracking-widest">Solar Energy Solutions</div></div>
            </div>
            <h1 className="text-3xl font-black mb-1">Solar Installation Proposal</h1>
            <p className="text-white/60 text-sm">Prepared for {selectedProject.clientName}</p>
            <p className="text-white/40 text-xs mt-1">{selectedProject.address}</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "System Size", value: `${selectedProject.systemKw} kWp` },
                { label: "Solar Panels", value: `${selectedProject.panelCount} units` },
                { label: "Contract Value", value: `₱${(selectedProject.contractValue || 0).toLocaleString()}` },
                { label: "ROI Period", value: `${selectedProject.roiProjectedYears || 5} years` },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-1">{item.label}</p>
                  <p className="text-xl font-black text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 mb-3">Financial Summary</h2>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                {[
                  { label: "Annual Energy Savings", value: `₱${(selectedProject.annualSavings || 0).toLocaleString()}` },
                  { label: "25-Year Lifetime Savings", value: `₱${(selectedProject.totalLifetimeSavings || 0).toLocaleString()}`, highlight: true },
                  { label: "Total Investment", value: `₱${(selectedProject.contractValue || 0).toLocaleString()}` },
                ].map((row, i) => (
                  <div key={i} className={`flex justify-between px-4 py-3 ${row.highlight ? "bg-amber-50" : i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                    <span className="text-sm text-gray-600">{row.label}</span>
                    <span className={`text-sm font-black ${row.highlight ? "text-amber-600" : "text-gray-900"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 text-[10px] text-gray-300 text-center">
              Generated by SolarIQ ERP · {new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ERP Admin ──
export default function AdminPage() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('solariq_admin_token') || "");
  const [adminName, setAdminName] = useState(localStorage.getItem('solariq_admin_name') || "");
  const [tab, setTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin = (token: string, name: string) => { 
    localStorage.setItem('solariq_admin_token', token);
    localStorage.setItem('solariq_admin_name', name);
    setAuthToken(token); 
    setAdminName(name); 
  };
  const handleLogout = () => { 
    localStorage.removeItem('solariq_admin_token');
    localStorage.removeItem('solariq_admin_name');
    setAuthToken(""); 
    setAdminName(""); 
  };

  const { data: projects = [] } = useQuery<any[]>({ queryKey: ["/api/admin/projects"], queryFn: () => apiFetch("/api/admin/projects"), enabled: !!authToken });

  if (!authToken) return <LoginScreen onLogin={handleLogin} />;

  const modules = [
    {
      group: "EXECUTIVE",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "analytics", label: "Analytics & BI", icon: TrendingUp },
      ]
    },
    {
      group: "CRM & SALES",
      items: [
        { id: "leads", label: "Leads CRM", icon: Target },
        { id: "referrals", label: "Referrals", icon: Users },
        { id: "proposals", label: "Proposals", icon: FileText },
      ]
    },
    {
      group: "PROJECTS",
      items: [
        { id: "designer", label: "AI Designer", icon: Cpu },
        { id: "projects", label: "Active Builds", icon: ClipboardList },
        { id: "scheduling", label: "Crew Scheduling", icon: MapPin },
        { id: "service", label: "After-Sales Service", icon: RefreshCw },
      ]
    },
    {
      group: "SUPPLY CHAIN",
      items: [
        { id: "inventory", label: "Inventory", icon: Package },
        { id: "bom", label: "Bill of Materials", icon: Receipt },
        { id: "procurement", label: "Procurement", icon: ShoppingCart },
        { id: "logistics", label: "Logistics & Fleet", icon: Truck },
      ]
    },
    {
      group: "HR & PEOPLE",
      items: [
        { id: "hr", label: "Employees", icon: Users },
      ]
    },
    {
      group: "FINANCE",
      items: [
        { id: "finance", label: "Accounting", icon: DollarSign },
        { id: "compliance", label: "Compliance", icon: CheckCircle2 },
      ]
    },
    {
      group: "PLATFORM",
      items: [
        { id: "tenants", label: "Tenants", icon: Building2 },
        { id: "pricing", label: "SaaS Plans", icon: Star },
        { id: "faqs", label: "FAQ / Help", icon: Info },
      ]
    },
  ];

  const tabLabels: Record<string, string> = {
    dashboard: "Executive Dashboard", analytics: "Analytics & Business Intelligence",
    leads: "Leads CRM", referrals: "Referral Engine", proposals: "Proposals",
    designer: "AI Solar Designer", projects: "Active Project Builds", service: "After-Sales Service",
    inventory: "Inventory Management", bom: "Bill of Materials", procurement: "Procurement",
    scheduling: "Crew Scheduling & Gantt",
    logistics: "Logistics & Fleet", hr: "HR & Payroll", finance: "Finance & Accounting",
    compliance: "Compliance Calendar", tenants: "Multi-Tenant Accounts", pricing: "SaaS Pricing", faqs: "FAQ Manager",
  };

  return (
    <div className="min-h-screen bg-[hsl(220_28%_6%)] flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col w-64 bg-[hsl(220_24%_9%)] border-r border-[hsl(220_18%_14%)] transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} overflow-y-auto`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[hsl(220_18%_14%)] shrink-0">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="8" fill="#fbbf24"/><circle cx="16" cy="16" r="4" fill="white" opacity="0.95"/></svg>
          <div>
            <span className="font-black text-base text-white tracking-tighter">Solar<span className="text-[#fbbf24]">IQ</span></span>
            <div className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-black">ERP Platform</div>
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-5">
          {modules.map(({ group, items }) => (
            <div key={group}>
              <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] px-3 mb-1.5">{group}</div>
              <div className="space-y-0.5">
                {items.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => { setTab(id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all text-left ${tab === id ? "bg-[#fbbf24] text-[hsl(220_28%_6%)] font-black shadow-lg shadow-[#fbbf24]/10" : "text-white/40 hover:text-white hover:bg-[hsl(220_20%_14%)]"}`}>
                    <Icon size={14} />{label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        {/* User Footer */}
        <div className="px-4 py-4 border-t border-[hsl(220_18%_14%)] shrink-0">
          <div className="flex items-center gap-2.5 px-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#fbbf24]/10 flex items-center justify-center text-[#fbbf24] font-black text-[10px]">{adminName[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-white truncate">{adminName}</p>
              <p className="text-[8px] text-white/25 uppercase tracking-widest">Super Admin</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] text-red-400/50 hover:text-red-400 hover:bg-red-400/5 transition-colors"><LogOut size={12} />Sign Out</button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/70 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header className="flex lg:hidden items-center gap-3 px-4 py-3.5 border-b border-[hsl(220_18%_14%)] bg-[hsl(220_24%_9%)] sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-white/50 hover:text-white"><Menu size={20} /></button>
          <span className="font-black text-sm text-white">SolarIQ <span className="text-[#fbbf24] text-[10px] font-bold">ERP</span></span>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Page header */}
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[9px] font-black text-[#fbbf24]/60 uppercase tracking-[0.3em] mb-1">Solar ERP · Enterprise Resource Planning</p>
                <h1 className="text-2xl font-black text-white">{tabLabels[tab] || tab}</h1>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[9px] text-white/25 uppercase font-black tracking-widest">{new Date().toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" })}</p>
                  <Badge variant="outline" className="bg-green-500/5 text-green-400 border-green-500/15 text-[8px] h-4 mt-0.5">● SYSTEMS ONLINE</Badge>
                </div>
              </div>
            </div>

            {/* Tab content */}
            {tab === "dashboard" && <DashboardTab projects={projects} />}
            {tab === "analytics" && <AnalyticsTab projects={projects} />}
            {tab === "leads" && <LeadsTab />}
            {tab === "referrals" && <ReferralTab />}
            {tab === "proposals" && <div className="text-white/40 text-sm p-8 text-center bg-[hsl(220_24%_9%)] rounded-2xl border border-dashed border-[hsl(220_18%_22%)]">📄 Proposals module — Select a project from <button onClick={() => setTab("projects")} className="text-[#fbbf24] underline">Active Builds</button> and open the Finance/ROI tab to generate proposals.</div>}
            {tab === "designer" && <DesignerTab />}
            {tab === "projects" && <ProjectsTab adminName={adminName} />}
            {tab === "service" && <ServiceTab />}
            {tab === "scheduling" && <SchedulingTab />}
            {tab === "inventory" && <InventoryTab />}
            {tab === "bom" && <BOMTab />}
            {tab === "procurement" && <ProcurementTab />}
            {tab === "logistics" && <LogisticsTab />}
            {tab === "hr" && <HRTab />}
            {tab === "finance" && <FinanceTab />}
            {tab === "compliance" && <ComplianceTab />}
            {tab === "tenants" && <TenantsTab />}
            {tab === "pricing" && <PricingTab />}
            {tab === "faqs" && <FaqTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

