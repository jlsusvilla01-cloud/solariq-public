import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, ClipboardList, Plus, LogOut, Menu, X, Zap, Clock,
  CheckCircle2, AlertTriangle, Circle, ChevronRight, Sun, MapPin, Edit2, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Paywall from "./Paywall";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  company: string | null;
  trialStartDate: string;
  trialEndDate: string;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  billingCycle: string | null;
}

const userFetch = async (url: string, opts: any = {}) => {
  const token = localStorage.getItem("solariq_user_token");
  const r = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
  if (r.status === 402) {
    const data = await r.json();
    throw { status: 402, ...data };
  }
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};

function TrialBanner({ user }: { user: UserProfile }) {
  const now = new Date();
  const trialEnd = new Date(user.trialEndDate);
  const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  if (user.subscriptionStatus === "active") {
    return (
      <div className="bg-green-500/5 border border-green-500/15 rounded-xl px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={14} className="text-green-400" />
          <span className="text-xs text-green-400 font-bold">{user.subscriptionPlan?.charAt(0).toUpperCase()}{user.subscriptionPlan?.slice(1)} Plan Active</span>
        </div>
        <Badge variant="outline" className="text-green-400 border-green-500/20 text-[10px]">
          {user.billingCycle === "year" ? "Annual" : "Monthly"}
        </Badge>
      </div>
    );
  }

  if (user.subscriptionStatus === "expired" || daysLeft === 0) {
    return (
      <div className="bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-400" />
          <span className="text-xs text-red-400 font-bold">Trial expired — subscribe to continue</span>
        </div>
        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">Expired</Badge>
      </div>
    );
  }

  return (
    <div className={`${daysLeft <= 3 ? "bg-orange-500/5 border-orange-500/15" : "bg-[#fbbf24]/5 border-[#fbbf24]/15"} border rounded-xl px-4 py-2.5 flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <Clock size={14} className={daysLeft <= 3 ? "text-orange-400" : "text-[#fbbf24]"} />
        <span className={`text-xs font-bold ${daysLeft <= 3 ? "text-orange-400" : "text-[#fbbf24]"}`}>
          {daysLeft} day{daysLeft !== 1 ? "s" : ""} left in your free trial
        </span>
      </div>
      <Badge variant="outline" className={`${daysLeft <= 3 ? "text-orange-400 border-orange-500/20" : "text-[#fbbf24] border-[#fbbf24]/20"} text-[10px]`}>
        Trial
      </Badge>
    </div>
  );
}

export default function UserDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    clientName: "", clientEmail: "", clientPhone: "", address: "",
    systemKw: "8", panelCount: "20", contractValue: "192000",
  });

  // Load user profile and projects
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("solariq_user_token");
        if (!token) { navigate("/signin"); return; }

        const userData = await userFetch("/api/user/me");
        setUser(userData);

        // Check if trial expired
        if (userData.subscriptionStatus === "expired") {
          setShowPaywall(true);
        }

        const projectsData = await userFetch("/api/user/projects");
        setProjects(projectsData);
      } catch (e: any) {
        if (e?.status === 402) {
          setShowPaywall(true);
        } else {
          navigate("/signin");
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("solariq_user_token");
    localStorage.removeItem("solariq_user");
    navigate("/signin");
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const proj = await userFetch("/api/user/projects", {
        method: "POST",
        body: JSON.stringify({
          clientName: form.clientName,
          clientEmail: form.clientEmail,
          clientPhone: form.clientPhone,
          address: form.address,
          systemKw: parseFloat(form.systemKw),
          panelCount: parseInt(form.panelCount),
          contractValue: parseFloat(form.contractValue),
          status: "survey",
          overallProgress: 0,
        }),
      });
      setProjects([...projects, proj]);
      setAdding(false);
      setForm({ clientName: "", clientEmail: "", clientPhone: "", address: "", systemKw: "8", panelCount: "20", contractValue: "192000" });
      toast({ title: "Project created!", description: `${proj.clientName}'s project has been started.` });
    } catch (e: any) {
      if (e?.status === 402) {
        setShowPaywall(true);
      } else {
        toast({ title: "Error", description: "Failed to create project.", variant: "destructive" });
      }
    }
  };

  const handleSubscribe = async (plan: string, billingCycle: string) => {
    const token = localStorage.getItem("solariq_user_token");
    const res = await fetch("/api/user/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ plan, billingCycle }),
    });
    if (!res.ok) throw new Error("Subscription failed");
    const data = await res.json();
    setUser(prev => prev ? { ...prev, ...data.user } : prev);
    localStorage.setItem("solariq_user", JSON.stringify({ ...user, ...data.user }));
    setShowPaywall(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(220_28%_6%)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#fbbf24] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const statusIcon = (s: string) => {
    switch (s) {
      case "completed": return <CheckCircle2 size={14} className="text-green-400" />;
      case "in_progress": return <Clock size={14} className="text-[#fbbf24]" />;
      case "blocked": return <AlertTriangle size={14} className="text-red-400" />;
      default: return <Circle size={14} className="text-white/20" />;
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(220_28%_6%)] flex">
      {/* Paywall overlay */}
      {showPaywall && <Paywall onSubscribe={handleSubscribe} onDismiss={user.subscriptionStatus !== "expired" ? () => setShowPaywall(false) : undefined} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col w-56 bg-[hsl(220_24%_9%)] border-r border-[hsl(220_18%_14%)] transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[hsl(220_18%_14%)] shrink-0">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="8" fill="#fbbf24"/><circle cx="16" cy="16" r="4" fill="white" opacity="0.95"/></svg>
          <div>
            <span className="font-black text-sm text-white tracking-tighter">Solar<span className="text-[#fbbf24]">IQ</span></span>
            <div className="text-[7px] text-white/20 uppercase tracking-[0.15em] font-black">Dashboard</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-left bg-[#fbbf24] text-[hsl(220_28%_6%)] font-black shadow-lg shadow-[#fbbf24]/10">
            <LayoutDashboard size={14} /> My Projects
          </button>
        </nav>

        <div className="px-4 py-4 border-t border-[hsl(220_18%_14%)] shrink-0">
          <div className="flex items-center gap-2.5 px-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#fbbf24]/10 flex items-center justify-center text-[#fbbf24] font-black text-[10px]">{user.name[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-white truncate">{user.name}</p>
              <p className="text-[8px] text-white/25 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] text-red-400/50 hover:text-red-400 hover:bg-red-400/5 transition-colors">
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/70 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex lg:hidden items-center gap-3 px-4 py-3.5 border-b border-[hsl(220_18%_14%)] bg-[hsl(220_24%_9%)] sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-white/50 hover:text-white"><Menu size={20} /></button>
          <span className="font-black text-sm text-white">SolarIQ</span>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Trial/Subscription banner */}
            <TrialBanner user={user} />

            {/* Header */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] font-black text-[#fbbf24]/60 uppercase tracking-[0.3em] mb-1">Welcome back</p>
                <h1 className="text-2xl font-black text-white">{user.company || user.name}'s Projects</h1>
              </div>
              <Button
                onClick={() => setAdding(true)}
                className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold h-9 text-xs hover:brightness-110 solar-glow-sm"
              >
                <Plus size={14} className="mr-1.5" /> New Project
              </Button>
            </div>

            {/* Add project form */}
            {adding && (
              <Card className="bg-[hsl(220_24%_9%)] border-[hsl(220_18%_18%)]">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center justify-between">
                    New Solar Project
                    <button onClick={() => setAdding(false)} className="text-white/30 hover:text-white"><X size={16} /></button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateProject} className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Client Name *</label>
                      <Input value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white h-9 text-xs" required />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Client Email</label>
                      <Input value={form.clientEmail} onChange={e => setForm({...form, clientEmail: e.target.value})} type="email" className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white h-9 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Phone</label>
                      <Input value={form.clientPhone} onChange={e => setForm({...form, clientPhone: e.target.value})} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white h-9 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Address *</label>
                      <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white h-9 text-xs" required />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">System kW</label>
                      <Input value={form.systemKw} onChange={e => setForm({...form, systemKw: e.target.value})} type="number" className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white h-9 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Panel Count</label>
                      <Input value={form.panelCount} onChange={e => setForm({...form, panelCount: e.target.value})} type="number" className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white h-9 text-xs" />
                    </div>
                    <div className="sm:col-span-2 flex gap-3">
                      <Button type="submit" className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold h-9 text-xs hover:brightness-110">Create Project</Button>
                      <Button type="button" variant="outline" onClick={() => setAdding(false)} className="border-[hsl(220_18%_22%)] text-white/50 h-9 text-xs">Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Projects list */}
            {projects.length === 0 && !adding ? (
              <div className="bg-[hsl(220_24%_9%)] border border-dashed border-[hsl(220_18%_22%)] rounded-2xl p-12 text-center">
                <Sun size={40} className="text-[#fbbf24]/20 mx-auto mb-4" />
                <h3 className="text-white font-bold mb-2">No projects yet</h3>
                <p className="text-white/40 text-sm mb-6">Create your first solar project to get started with SolarIQ</p>
                <Button onClick={() => setAdding(true)} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs hover:brightness-110 solar-glow-sm">
                  <Plus size={14} className="mr-1.5" /> Create First Project
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {projects.map((proj: any) => (
                  <div key={proj.id} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_18%)] rounded-2xl p-5 hover:border-[#fbbf24]/20 transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-white text-sm">{proj.clientName}</h3>
                          <Badge variant="outline" className="text-[10px] border-[#fbbf24]/20 text-[#fbbf24]">
                            {proj.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-white/40 mb-3">
                          <MapPin size={11} /> {proj.address}
                        </div>
                        <div className="flex items-center gap-6 text-[11px]">
                          <span className="text-white/50"><Zap size={11} className="inline text-[#fbbf24] mr-1" />{proj.systemKw} kWp</span>
                          <span className="text-white/50"><Sun size={11} className="inline text-[#fbbf24] mr-1" />{proj.panelCount} panels</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-white">{proj.overallProgress || 0}%</div>
                        <div className="text-[10px] text-white/30 uppercase tracking-wider">Progress</div>
                        <div className="w-24 h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-[#fbbf24] rounded-full transition-all" style={{ width: `${proj.overallProgress || 0}%` }} />
                        </div>
                      </div>
                    </div>
                    {proj.shareToken && (
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-white/20">Token: {proj.shareToken}</span>
                        <Link href={`/track/${proj.shareToken}`}>
                          <a className="text-[10px] text-[#fbbf24] font-bold hover:underline flex items-center gap-1">
                            View Client Tracker <ChevronRight size={10} />
                          </a>
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
