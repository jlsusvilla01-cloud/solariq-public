import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Project, Milestone, Update, MilestonePhoto, Signature, Quotation, Document, Payment } from "@shared/schema";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  CheckCircle2, Clock, AlertTriangle, Circle, Sun, MapPin, Zap, Calendar,
  MessageSquare, Phone, Mail, Languages, Star, PenLine, Image, X, ChevronLeft, ChevronRight,
  Download, QrCode, CheckCheck, FileText, CreditCard, Receipt, DollarSign, TrendingUp
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// ── Translation dictionary ──
const T: Record<string, Record<string, string>> = {
  en: {
    welcome: "Welcome",
    overallProgress: "Overall Progress",
    systemSize: "System Size",
    panels: "Panels",
    milestonesDone: "Milestones Done",
    estCompletion: "Est. Completion",
    currentlyInProgress: "Currently In Progress",
    installationMilestones: "Installation Milestones",
    latestUpdates: "Latest Updates",
    noUpdates: "No updates yet.",
    haveAQuestion: "Have a question?",
    contactContractor: "Contact your installation team directly.",
    callContractor: "Call Contractor",
    emailContractor: "Email Contractor",
    signCertificate: "Sign Commissioning Certificate",
    signNow: "Sign Certificate",
    alreadySigned: "Certificate Signed",
    beforeAfter: "Before & After",
    photos: "Site Photos",
    survey: "Survey",
    complete: "Complete",
    done: "Done",
    inProgress: "In Progress",
    blocked: "Blocked",
    pending: "Pending",
    switchToFilipino: "Filipino",
    switchToEnglish: "English",
    poweredBy: "Powered by SolarIQ",
    updatesEvery: "Updates every 30s",
    financials: "Project Financials",
    documents: "Document Center",
    amount: "Amount",
    status: "Status",
    date: "Date",
    viewDocument: "Open Document",
    noFinancials: "No financial records available yet.",
    noDocuments: "No project documents available yet.",
    paymentStatus: "Payment Status",
    annualSavings: "Annual Savings",
    roiYears: "ROI Estimate",
    lifetimeSavings: "25-Year Savings",
    liveMonitoring: "Live Monitoring",
    currentPower: "Current Power",
    dailyYield: "Daily Yield",
    totalYield: "Lifetime Total",
    systemHealth: "System Health",
    generationHistory: "Generation History",
    environmentalImpact: "Enviro-Impact",
    treesPlanted: "Trees Equivalent",
    co2Saved: "CO2 Offset",
    monitoringOffline: "Monitoring is currently offline.",
    noData: "No generation data yet.",
  },
  tl: {
    welcome: "Maligayang pagdating",
    overallProgress: "Kabuuang Progreso",
    systemSize: "Laki ng Sistema",
    panels: "Mga Panel",
    milestonesDone: "Mga Natapos",
    estCompletion: "Est. Tapusin",
    currentlyInProgress: "Kasalukuyang Ginagawa",
    installationMilestones: "Mga Hakbang sa Pag-install",
    latestUpdates: "Pinakabagong Update",
    noUpdates: "Wala pang update.",
    haveAQuestion: "May tanong ka ba?",
    contactContractor: "Makipag-ugnayan sa iyong koponan ng pag-install.",
    callContractor: "Tawagan ang Kontratista",
    emailContractor: "Mag-email sa Kontratista",
    signCertificate: "Lagdaan ang Sertipiko ng Pagkumpleto",
    signNow: "Lagdaan",
    alreadySigned: "Naka-sign na ang Sertipiko",
    beforeAfter: "Bago at Pagkatapos",
    photos: "Mga Larawan sa Site",
    survey: "Survey",
    complete: "Kumpleto",
    done: "Tapos",
    inProgress: "Ginagawa",
    blocked: "Naharang",
    pending: "Naghihintay",
    switchToFilipino: "Filipino",
    switchToEnglish: "English",
    poweredBy: "Pinapatakbo ng SolarIQ",
    updatesEvery: "Ina-update bawat 30s",
  },
};

const PHASE_LABELS: Record<string, Record<string, string>> = {
  en: { survey: "Site Survey", design: "System Design", permitting: "Permits", procurement: "Materials", installation: "Installation", inspection: "Inspection", commissioned: "Commissioned" },
  tl: { survey: "Site Survey", design: "Disenyo", permitting: "Mga Permit", procurement: "Mga Materyales", installation: "Pag-install", inspection: "Inspeksyon", commissioned: "Kumpleto" },
};

const STATUS_CONFIG = {
  completed: { icon: CheckCircle2, color: "text-green-400", ring: "ring-green-400/30", bg: "bg-green-400/10", border: "border-green-500/20" },
  in_progress: { icon: Clock, color: "text-[#fbbf24]", ring: "ring-[#fbbf24]/30", bg: "bg-[#fbbf24]/10", border: "border-[#fbbf24]/20" },
  blocked: { icon: AlertTriangle, color: "text-red-400", ring: "ring-red-400/30", bg: "bg-red-400/10", border: "border-red-500/20" },
  pending: { icon: Circle, color: "text-white/20", ring: "ring-white/10", bg: "bg-white/5", border: "border-transparent" },
};

// ── Before/After Slider ──
function BeforeAfterSlider({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    setPos(pct);
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => { if (dragging.current) update(e.clientX); }, [update]);
  const onTouchMove = useCallback((e: TouchEvent) => { if (dragging.current) update(e.touches[0].clientX); }, [update]);
  const stop = useCallback(() => { dragging.current = false; }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", stop);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stop);
    };
  }, [onMouseMove, onTouchMove, stop]);

  return (
    <div ref={containerRef} className="relative rounded-xl overflow-hidden select-none cursor-col-resize" style={{ touchAction: "none" }}>
      {/* After (full) */}
      <img src={after} alt="After" className="w-full h-48 object-cover block" />
      {/* Before (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={before} alt="Before" className="w-full h-full object-cover" style={{ minWidth: `${10000 / pos}%` }} />
      </div>
      {/* Divider */}
      <div className="absolute inset-y-0 w-0.5 bg-white shadow-lg" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center cursor-col-resize"
          onMouseDown={() => { dragging.current = true; }}
          onTouchStart={() => { dragging.current = true; }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex gap-0.5"><ChevronLeft size={12} className="text-gray-700" /><ChevronRight size={12} className="text-gray-700" /></div>
        </div>
      </div>
      {/* Labels */}
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur">Before</div>
      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur">After</div>
    </div>
  );
}

// ── E-Signature Canvas ──
function SignatureCanvas({ onSigned, clientName, lang }: { onSigned: (dataUrl: string) => void; clientName: string; lang: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasSig, setHasSig] = useState(false);
  const t = T[lang];

  const getPos = (e: any, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (canvas.width / rect.width), y: (e.clientY - rect.top) * (canvas.height / rect.height) };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#1f2937"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.lineJoin = "round";
  }, []);

  const startDraw = (x: number, y: number) => {
    const ctx = canvasRef.current?.getContext("2d")!;
    drawing.current = true; ctx.beginPath(); ctx.moveTo(x, y);
  };
  const draw = (x: number, y: number) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d")!;
    ctx.lineTo(x, y); ctx.stroke(); setHasSig(true);
  };
  const stopDraw = () => { drawing.current = false; };
  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#1f2937"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
  };
  const confirm = () => { if (canvasRef.current && hasSig) onSigned(canvasRef.current.toDataURL()); };

  return (
    <div className="space-y-3">
      <div className="text-xs text-white/50 mb-1">Draw your signature below:</div>
      <canvas
        ref={canvasRef} width={500} height={150}
        className="w-full rounded-xl border border-[#fbbf24]/20 cursor-crosshair touch-none"
        onMouseDown={e => { const p = getPos(e, e.currentTarget); startDraw(p.x, p.y); }}
        onMouseMove={e => { const p = getPos(e, e.currentTarget); draw(p.x, p.y); }}
        onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={e => { e.preventDefault(); const p = getPos(e.touches[0], e.currentTarget); startDraw(p.x, p.y); }}
        onTouchMove={e => { e.preventDefault(); const p = getPos(e.touches[0], e.currentTarget); draw(p.x, p.y); }}
        onTouchEnd={stopDraw}
      />
      <div className="flex gap-2">
        <Button onClick={clear} variant="outline" className="border-[hsl(220_18%_22%)] text-white text-xs h-8">Clear</Button>
        <Button onClick={confirm} disabled={!hasSig} className="flex-1 bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs h-8">
          {t.signNow} ✓
        </Button>
      </div>
    </div>
  );
}

// ── Photo Gallery ──
function PhotoGallery({ photos, lang }: { photos: MilestonePhoto[]; lang: string }) {
  const [selected, setSelected] = useState<MilestonePhoto | null>(null);
  const t = T[lang];

  const before = photos.filter(p => p.photoType === "before");
  const after = photos.filter(p => p.photoType === "after");
  const progress = photos.filter(p => p.photoType === "progress");

  if (photos.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Before / After slider */}
      {before.length > 0 && after.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Image size={14} className="text-[#fbbf24]" /> {t.beforeAfter}
          </h3>
          <BeforeAfterSlider before={before[0].dataUrl} after={after[0].dataUrl} />
        </div>
      )}

      {/* Progress photos grid */}
      {progress.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Image size={14} className="text-[#fbbf24]" /> {t.photos} ({progress.length})
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {progress.map(p => (
              <button key={p.id} onClick={() => setSelected(p)} className="relative rounded-lg overflow-hidden aspect-square hover:opacity-90 transition-opacity">
                <img src={p.dataUrl} alt={p.caption || "Photo"} className="w-full h-full object-cover" />
                {p.caption && <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-1.5 py-1 truncate">{p.caption}</div>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <img src={selected.dataUrl} alt={selected.caption || ""} className="w-full rounded-xl" />
            {selected.caption && <p className="text-white/70 text-sm text-center mt-3">{selected.caption}</p>}
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-white/70 hover:text-white"><X size={24} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Monitoring Dashboard (NEW) ──
function MonitoringDashboard({ token, lang }: { token: string; lang: string }) {
  const t = T[lang];
  const { data, isLoading } = useQuery<{ readings: any[], inverterModel: string, status: string }>({
    queryKey: ["/api/track", token, "monitoring"],
    queryFn: async () => (await fetch(`/api/track/${token}/monitoring`)).json(),
    refetchInterval: 60000,
  });

  if (isLoading) return (
    <div className="space-y-4">
      <div className="animate-pulse bg-white/5 h-32 rounded-2xl" />
      <div className="animate-pulse bg-white/5 h-64 rounded-2xl" />
    </div>
  );

  if (!data?.readings?.length) return (
    <div className="bg-[hsl(220_24%_9%)] border border-dashed border-[hsl(220_18%_16%)] rounded-2xl p-8 text-center">
      <Zap size={32} className="text-white/20 mx-auto mb-3" />
      <p className="text-white/40 text-sm">{t.noData}</p>
    </div>
  );

  const readings = [...data.readings].reverse();
  const latest = readings[readings.length - 1];
  const isOnline = data.status === "online";

  // Impacts: 1MWh = ~0.7 tons CO2 = ~35 trees
  const totalMWh = latest.energyTotalKwh / 1000;
  const trees = Math.round(totalMWh * 35);
  const co2 = (totalMWh * 0.7).toFixed(2);

  return (
    <div className="space-y-5">
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[hsl(220_20%_12%)] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-[#fbbf24]" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t.currentPower}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">{latest.wattageKw}</span>
              <span className="text-sm font-bold text-white/30">kW</span>
            </div>
            <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
          </div>

          <div className="bg-[hsl(220_20%_12%)] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sun size={14} className="text-[#fbbf24]" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t.dailyYield}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">{latest.energyTodayKwh}</span>
              <span className="text-sm font-bold text-white/30">kWh</span>
            </div>
          </div>

          <div className="bg-[hsl(220_20%_12%)] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-[#fbbf24]" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t.totalYield}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">{(latest.energyTotalKwh / 1000).toFixed(1)}</span>
              <span className="text-sm font-bold text-white/30">MWh</span>
            </div>
          </div>
       </div>

       <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_18%)] rounded-2xl p-5">
          <h3 className="text-xs font-bold text-white/50 mb-4 uppercase tracking-widest">{t.generationHistory} (24h)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={readings}>
                <defs>
                  <linearGradient id="colorKw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="timestamp" hide={true} />
                <YAxis hide={true} domain={[0, 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
                  labelFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  formatter={(v) => [`${v} kW`, 'Power']}
                  itemStyle={{ color: '#fbbf24' }}
                />
                <Area type="monotone" dataKey="wattageKw" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorKw)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-[#fbbf24]/5 to-transparent border border-[#fbbf24]/10 rounded-2xl p-5 relative overflow-hidden group">
            <div className="text-[10px] font-black text-[#fbbf24] uppercase mb-3 tracking-widest">{t.environmentalImpact}</div>
            <div className="flex items-center gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌳</span>
                  <span className="text-xl font-black text-white">{trees}</span>
                </div>
                <p className="text-[9px] text-white/30 uppercase font-bold tracking-tighter">{t.treesPlanted}</p>
              </div>
              <div className="w-px h-10 bg-white/5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌍</span>
                  <span className="text-xl font-black text-white">{co2}</span>
                </div>
                <p className="text-[9px] text-white/30 uppercase font-bold tracking-tighter">{t.co2Saved}</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
               <Zap size={60} />
            </div>
          </div>
          <div className="bg-[hsl(220_20%_12%)] border border-white/5 rounded-2xl p-5 flex flex-col justify-center">
             <p className="text-[10px] text-white/40 uppercase mb-1 font-bold tracking-widest">Inverter Details</p>
             <p className="text-sm font-bold text-white mb-2">{data.inverterModel || 'Huawei SUN2000'}</p>
             <div className="flex items-center gap-2">
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isOnline ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {isOnline ? 'System Online' : 'System Offline'}
                </div>
                <span className="text-[10px] text-white/20">Ref: {token.slice(0, 8).toUpperCase()}</span>
             </div>
          </div>
       </div>
    </div>
  );
}

// ── Main Track Page ──
export default function TrackPage() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [lang, setLang] = useState<"en" | "tl">("en");
  const [showSignModal, setShowSignModal] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [activeTab, setActiveTab] = useState<"progress" | "monitoring">("progress");
  const t = T[lang];
  const phaseLabels = PHASE_LABELS[lang];

  const { data, isLoading, error } = useQuery<{
    project: Project;
    milestones: Milestone[];
    updates: Update[];
    photos: MilestonePhoto[];
    signatures: Signature[];
    quotations: Quotation[];
    documents: Document[];
    payments: Payment[];
  }>({
    queryKey: ["/api/track", token],
    queryFn: async () => {
      const r = await fetch(`/api/track/${token}`);
      if (!r.ok) throw new Error("Not found");
      return r.json();
    },
    refetchInterval: 30000, // refresh every 30s
  });

  const { data: qrData } = useQuery<{ qrDataUrl: string; trackUrl: string }>({
    queryKey: ["/api/qr", token],
    queryFn: async () => (await fetch(`/api/qr/${token}`)).json(),
    enabled: showQR,
  });

  const signMutation = useMutation({
    mutationFn: (payload: any) =>
      fetch(`/api/track/${token}/sign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/track", token] });
      setShowSignModal(false);
      toast({ title: lang === "tl" ? "Naka-sign na ang sertipiko!" : "Certificate signed successfully!" });
    },
  });

  if (isLoading) return (
    <div className="min-h-screen bg-[hsl(220_28%_6%)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-[#fbbf24] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/50 text-sm">{lang === "tl" ? "Naglo-load..." : "Loading your project..."}</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-[hsl(220_28%_6%)] flex items-center justify-center">
      <div className="text-center max-w-sm mx-auto px-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Project Not Found</h1>
        <p className="text-white/50 text-sm">This tracking link is invalid or expired. Contact your contractor.</p>
      </div>
    </div>
  );

  const { project, milestones, updates, photos, signatures, quotations, documents, payments } = data;
  const progress = project.overallProgress;
  const completedCount = milestones.filter(m => m.status === "completed").length;
  const currentMilestone = milestones.find(m => m.status === "in_progress") || milestones.find(m => m.status === "pending");
  const isCommissioned = project.status === "commissioned";
  const alreadySigned = signatures.some(s => s.signerRole === "Client");

  const UPDATE_ICONS: Record<string, any> = { milestone: CheckCircle2, alert: AlertTriangle, photo: Sun, update: MessageSquare };
  const UPDATE_COLORS: Record<string, string> = { milestone: "text-green-400", alert: "text-red-400", photo: "text-[#fbbf24]", update: "text-blue-400" };

  return (
    <div className="min-h-screen bg-[hsl(220_28%_6%)] text-white">
      {/* Header */}
      <header className="bg-[hsl(220_24%_8%)] border-b border-[hsl(220_18%_14%)] px-4 py-3.5 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="8" fill="#fbbf24" opacity="0.9"/><circle cx="16" cy="16" r="4" fill="white" opacity="0.95"/></svg>
            <span className="font-bold text-sm">Solar<span className="text-[#fbbf24]">IQ</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30 hidden sm:inline">{t.updatesEvery}</span>
            {/* Language toggle */}
            <button
              onClick={() => setLang(l => l === "en" ? "tl" : "en")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[hsl(220_18%_22%)] text-xs text-white/60 hover:text-white hover:border-[#fbbf24]/40 transition-colors"
              title={lang === "en" ? "Switch to Filipino" : "Switch to English"}
            >
              <Languages size={12} />
              {lang === "en" ? "🇵🇭 Filipino" : "🇺🇸 English"}
            </button>
            {/* QR code */}
            <button
              onClick={() => setShowQR(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[hsl(220_18%_22%)] text-xs text-white/60 hover:text-white hover:border-[#fbbf24]/40 transition-colors"
            >
              <QrCode size={12} /> QR
            </button>
          </div>
        </div>
      </header>

      {/* QR Modal */}
      {showQR && qrData && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
          <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_18%)] rounded-2xl p-6 text-center max-w-xs w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-white mb-1">{lang === "tl" ? "QR Code ng Tracker" : "Project Tracker QR Code"}</h3>
            <p className="text-xs text-white/50 mb-4">{lang === "tl" ? "I-scan para tingnan ang progreso" : "Scan to view progress anytime"}</p>
            <img src={qrData.qrDataUrl} alt="QR Code" className="mx-auto rounded-xl w-48 h-48" />
            <p className="text-[10px] text-white/30 mt-3 break-all">{qrData.trackUrl}</p>
            <a href={qrData.qrDataUrl} download="solariq-tracker-qr.png" className="mt-3 flex items-center gap-1.5 justify-center text-xs text-[#fbbf24] hover:underline">
              <Download size={12} /> {lang === "tl" ? "I-download ang QR" : "Download QR Code"}
            </a>
            <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={18} /></button>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Tab Switcher (Optional) */}
        {project.status === 'commissioned' && (
          <div className="flex p-1 bg-[hsl(220_24%_8%)] rounded-xl border border-[hsl(220_18%_14%)] w-fit mx-auto mb-2">
            <button 
              onClick={() => setActiveTab('progress')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'progress' ? 'bg-[#fbbf24] text-[hsl(220_28%_6%)]' : 'text-white/40 hover:text-white'}`}
            >
              {lang === 'tl' ? 'Progreso' : 'Progress'}
            </button>
            <button 
              onClick={() => setActiveTab('monitoring')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'monitoring' ? 'bg-[#fbbf24] text-[hsl(220_28%_6%)]' : 'text-white/40 hover:text-white'}`}
            >
              {t.liveMonitoring}
            </button>
          </div>
        )}

        {activeTab === 'monitoring' ? (
          <MonitoringDashboard token={token!} lang={lang} />
        ) : (
          <>
        {/* Project hero card */}
        <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_18%)] rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-lg font-black text-white">{t.welcome}, {project.clientName}</h1>
              <div className="flex items-center gap-1.5 text-white/50 text-xs mt-1">
                <MapPin size={11} />{project.address}
              </div>
            </div>
            <Badge className={`shrink-0 ${isCommissioned ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/30"} border text-xs`}>
              {isCommissioned ? "✅ " + (lang === "tl" ? "Kumpleto" : "Commissioned") : `⚡ ${phaseLabels[project.status] || project.status}`}
            </Badge>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs text-white/50 mb-1.5">
              <span>{t.overallProgress}</span>
              <span className="font-bold text-[#fbbf24]">{progress}%</span>
            </div>
            <div className="h-3 rounded-full bg-[hsl(220_18%_16%)] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #f59e0b, #fbbf24, #fde68a)" }} />
            </div>
            <div className="flex justify-between text-[10px] text-white/25 mt-1">
              <span>{t.survey}</span><span>{lang === "tl" ? "Pag-install" : "Installation"}</span><span>{t.complete}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { label: t.systemSize, value: `${project.systemKw} kWp`, icon: Zap },
              { label: t.panels, value: `${project.panelCount}`, icon: Sun },
              { label: t.milestonesDone, value: `${completedCount}/${milestones.length}`, icon: CheckCircle2 },
              { label: t.estCompletion, value: project.estimatedEndDate || "TBD", icon: Calendar },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-[hsl(220_20%_12%)] rounded-xl p-3">
                <div className="flex items-center gap-1 mb-1"><Icon size={10} className="text-[#fbbf24]" /><span className="text-[9px] text-white/40 uppercase tracking-wide">{label}</span></div>
                <div className="text-sm font-semibold text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Financials / Savings Card (NEW) */}
        {(project.annualSavings ?? 0) > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/10 rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><DollarSign size={80} /></div>
              <p className="text-[10px] text-green-400/60 font-black uppercase tracking-widest mb-1">{t.annualSavings}</p>
              <h3 className="text-2xl font-black text-white">₱{(project.annualSavings || 0).toLocaleString()}</h3>
              <p className="text-[10px] text-white/30 mt-1">ESTIMATED YEAR 1 OFFSET</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/10 rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><TrendingUp size={80} /></div>
              <p className="text-[10px] text-blue-400/60 font-black uppercase tracking-widest mb-1">{t.lifetimeSavings}</p>
              <h3 className="text-2xl font-black text-white">₱{(project.totalLifetimeSavings || ((project.annualSavings ?? 0) * 25)).toLocaleString()}</h3>
              <p className="text-[10px] text-white/30 mt-1">PROJECTED 25-YEAR BENEFIT</p>
            </div>
          </div>
        )}

        {/* Currently in progress */}
        {currentMilestone && !isCommissioned && (
          <div className="bg-[#fbbf24]/8 border border-[#fbbf24]/25 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-9 h-9 bg-[#fbbf24]/15 rounded-xl flex items-center justify-center shrink-0">
              <Clock size={16} className="text-[#fbbf24]" />
            </div>
            <div>
              <div className="text-xs text-[#fbbf24] font-semibold mb-0.5">{t.currentlyInProgress}</div>
              <div className="font-bold text-white text-sm">{currentMilestone.title}</div>
              {currentMilestone.description && <div className="text-white/50 text-xs mt-0.5">{currentMilestone.description}</div>}
            </div>
          </div>
        )}

        {/* E-signature — only show on commissioned projects */}
        {isCommissioned && (
          <div className={`border rounded-2xl p-5 ${alreadySigned ? "bg-green-500/5 border-green-500/30" : "bg-[hsl(220_24%_9%)] border-[#fbbf24]/30"}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 ${alreadySigned ? "bg-green-500/15" : "bg-[#fbbf24]/15"} rounded-xl flex items-center justify-center shrink-0`}>
                {alreadySigned ? <CheckCheck size={18} className="text-green-400" /> : <PenLine size={18} className="text-[#fbbf24]" />}
              </div>
              <div>
                <div className="font-bold text-white">{alreadySigned ? t.alreadySigned : t.signCertificate}</div>
                {alreadySigned
                  ? <div className="text-xs text-green-400 mt-0.5">
                      {lang === "tl" ? "Nilagdaan ni " : "Signed by "}{signatures.find(s => s.signerRole === "Client")?.signerName} · {new Date(signatures.find(s => s.signerRole === "Client")!.signedAt).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
                    </div>
                  : <div className="text-xs text-white/50 mt-0.5">{lang === "tl" ? "Kumpirmahin na natanggap mo ang iyong solar system." : "Confirm you have received and accepted your solar system."}</div>
                }
              </div>
            </div>
            {!alreadySigned && !showSignModal && (
              <Button onClick={() => setShowSignModal(true)} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-sm mt-2 w-full">
                <PenLine size={14} className="mr-2" /> {t.signNow}
              </Button>
            )}
            {showSignModal && !alreadySigned && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs text-white/50">{lang === "tl" ? "Iyong Pangalan" : "Your Full Name"}</label>
                  <input value={signerName} onChange={e => setSignerName(e.target.value)} placeholder={project.clientName} className="w-full bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
                <SignatureCanvas lang={lang} clientName={project.clientName} onSigned={dataUrl => {
                  if (!signerName.trim()) { toast({ title: lang === "tl" ? "Ilagay ang iyong pangalan" : "Please enter your name", variant: "destructive" }); return; }
                  signMutation.mutate({
                    signerName: signerName || project.clientName,
                    signatureDataUrl: dataUrl,
                    agreementText: lang === "tl"
                      ? `Kinukumpirma ko, ${signerName}, na natanggap ko ang solar system na nakainstall sa ${project.address} at nasiyahan ako sa trabaho.`
                      : `I, ${signerName}, confirm that I have received and accepted the solar system installed at ${project.address} and am satisfied with the installation.`,
                  });
                }} />
                <button onClick={() => setShowSignModal(false)} className="text-xs text-white/40 hover:text-white/70">Cancel</button>
              </div>
            )}
          </div>
        )}

        {/* Before/After Photos & Gallery */}
        {photos.length > 0 && <PhotoGallery photos={photos} lang={lang} />}

        <div className="grid lg:grid-cols-5 gap-5">
          {/* Milestones */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-sm font-bold text-white">{t.installationMilestones}</h2>
            <div className="space-y-2">
              {milestones.map((m, i) => {
                const sc = STATUS_CONFIG[m.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                const StatusIcon = sc.icon;
                const mPhotos = photos.filter(p => p.milestoneId === m.id);
                return (
                  <div key={m.id} className={`flex gap-3.5 p-4 rounded-xl border transition-colors ${sc.border} ${m.status === "in_progress" ? "bg-[#fbbf24]/4" : m.status === "completed" ? "bg-green-500/3" : "bg-[hsl(220_24%_9%)]"}`}>
                    <div className="flex flex-col items-center gap-1 pt-0.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ring-2 ${sc.ring} ${sc.bg}`}>
                        <StatusIcon size={13} className={sc.color} />
                      </div>
                      {i < milestones.length - 1 && <div className="w-0.5 flex-1 min-h-3 bg-[hsl(220_18%_16%)]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-semibold text-sm ${m.status === "pending" ? "text-white/40" : "text-white"}`}>{m.title}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${m.status === "completed" ? "bg-green-500/15 text-green-400" : m.status === "in_progress" ? "bg-[#fbbf24]/15 text-[#fbbf24]" : "bg-white/5 text-white/30"}`}>
                          {t[m.status as keyof typeof t] || m.status}
                        </span>
                      </div>
                      {m.description && <p className={`text-xs mt-0.5 ${m.status === "pending" ? "text-white/25" : "text-white/50"}`}>{m.description}</p>}
                      {m.completedAt && <p className="text-[10px] text-green-400/60 mt-1">✓ {new Date(m.completedAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</p>}
                      {m.note && <p className="text-xs text-[#fbbf24]/70 mt-1 italic">📝 {m.note}</p>}
                      {/* Milestone thumbnail photos */}
                      {mPhotos.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                          {mPhotos.slice(0, 3).map(p => (
                            <img key={p.id} src={p.dataUrl} alt="" className="w-12 h-12 rounded-lg object-cover border border-[hsl(220_18%_22%)]" />
                          ))}
                          {mPhotos.length > 3 && <div className="w-12 h-12 rounded-lg bg-[hsl(220_18%_18%)] flex items-center justify-center text-xs text-white/40">+{mPhotos.length - 3}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Updates feed */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-bold text-white">{t.latestUpdates}</h2>
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {updates.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-sm">{t.noUpdates}</div>
              ) : (
                updates.map(upd => {
                  const Icon = UPDATE_ICONS[upd.type] || MessageSquare;
                  const color = UPDATE_COLORS[upd.type] || "text-blue-400";
                  return (
                    <div key={upd.id} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-xl p-3.5">
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 bg-white/5 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                          <Icon size={12} className={color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-xs leading-relaxed">{upd.message}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-white/30">
                            <span>{upd.postedBy}</span><span>·</span>
                            <span>{new Date(upd.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>


        {/* ── NEW: Financials, Documents, and Payments ── */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Detailed Financials (Quotations & Payments) */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard size={14} className="text-[#fbbf24]" /> {t.financials}
            </h2>
            <div className="space-y-2.5">
              {/* Quotations / BOQ */}
              {quotations.length > 0 ? quotations.map(q => (
                <div key={q.id} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Quote / BOQ</p>
                      <p className="text-sm font-semibold text-white">System Quote - {project.systemKw}kWp</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${q.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/20'}`}>
                      {q.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-end justify-between mt-4">
                    <p className="text-xs text-white/40 italic">Valid until: {q.validUntil}</p>
                    <p className="text-lg font-bold text-white">₱{q.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <div className="bg-[hsl(220_24%_9%)] border border-dashed border-[hsl(220_18%_16%)] rounded-xl p-6 text-center text-white/30 text-xs">
                  {t.noFinancials}
                </div>
              )}

              {/* Transaction History (Payments) */}
              {payments.length > 0 && (
                <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-xl overflow-hidden">
                  <div className="px-4 py-2 bg-white/5 border-b border-[hsl(220_18%_16%)]">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t.paymentStatus}</p>
                  </div>
                  <div className="divide-y divide-[hsl(220_18%_16%)]">
                    {payments.map(p => (
                      <div key={p.id} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.status === 'paid' ? 'bg-green-500/10' : 'bg-[#fbbf24]/10'}`}>
                            {p.status === 'paid' ? <CheckCheck size={14} className="text-green-400" /> : <Clock size={14} className="text-[#fbbf24]" />}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">Project Payment</p>
                            <p className="text-[10px] text-white/30">{p.paidAt || 'Pending'}</p>
                          </div>
                        </div>
                        <p className={`text-xs font-bold ${p.status === 'paid' ? 'text-green-400' : 'text-white'}`}>₱{p.amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Document Center (Permits, Contracts, Net Metering) */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText size={14} className="text-[#fbbf24]" /> {t.documents}
            </h2>
            <div className="space-y-2.5">
              {documents.length > 0 ? documents.map(d => (
                <div key={d.id} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[hsl(220_18%_14%)] rounded-xl flex items-center justify-center border border-[hsl(220_18%_18%)]">
                      <FileText size={18} className="text-white/60" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{d.title}</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-tighter">{d.type.replace('_', ' ')} · {d.status}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-[10px] border border-white/5 hover:bg-white/5 gap-1.5" asChild>
                    <a href={d.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download size={12} /> {t.viewDocument}
                    </a>
                  </Button>
                </div>
              )) : (
                <div className="bg-[hsl(220_24%_9%)] border border-dashed border-[hsl(220_18%_16%)] rounded-xl p-6 text-center text-white/30 text-xs">
                  {t.noDocuments}
                </div>
              )}
            </div>
          </div>
        </div>
          </>
        )}

        {/* Contact */}
        <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_18%)] rounded-2xl p-5 text-center">
          <h3 className="font-bold text-white mb-1 text-sm">{t.haveAQuestion}</h3>
          <p className="text-white/50 text-xs mb-3">{t.contactContractor}</p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            {project.clientPhone && (
              <a href={`tel:${project.clientPhone}`} className="flex items-center gap-2 justify-center bg-[hsl(220_20%_14%)] hover:bg-[hsl(220_20%_18%)] text-white text-sm px-4 py-2.5 rounded-xl transition-colors">
                <Phone size={13} /> {t.callContractor}
              </a>
            )}
            {project.clientEmail && (
              <a href={`mailto:${project.clientEmail}`} className="flex items-center gap-2 justify-center bg-[#fbbf24] text-[hsl(220_28%_6%)] font-semibold text-sm px-4 py-2.5 rounded-xl hover:brightness-110 transition-all">
                <Mail size={13} /> {t.emailContractor}
              </a>
            )}
          </div>
        </div>

        <p className="text-center text-white/20 text-xs pb-4">
          {t.poweredBy} · <a href="https://www.perplexity.ai/computer" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 transition-colors">Created with Perplexity Computer</a>
        </p>
      </main>
    </div>
  );
}
