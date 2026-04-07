import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, Eye, EyeOff, Zap, CheckCircle2, Building2, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UserAuth({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const [tab, setTab] = useState<"signin" | "signup">(mode);
  const [, navigate] = useLocation();

  // Sign Up state
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showP, setShowP] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, company }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Registration failed"); return; }
      localStorage.setItem("solariq_user_token", data.token);
      localStorage.setItem("solariq_user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch { setErr("Server error. Please try again."); }
    finally { setLoading(false); }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Invalid credentials"); return; }
      localStorage.setItem("solariq_user_token", data.token);
      localStorage.setItem("solariq_user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch { setErr("Server error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[hsl(220_28%_6%)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#fbbf24]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-[#fbbf24]/3 rounded-full blur-3xl pointer-events-none" />

      {/* Back button */}
      <Link href="/">
        <a className="absolute top-6 left-6 w-10 h-10 rounded-xl border border-[hsl(220_18%_22%)] flex items-center justify-center text-white/50 hover:text-white hover:border-[#fbbf24]/40 transition-all hover:bg-white/5 group z-10">
          <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
        </a>
      </Link>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="8" fill="#fbbf24"/><circle cx="16" cy="16" r="4" fill="white" opacity="0.95"/></svg>
          <span className="font-black text-2xl text-white">Solar<span className="text-[#fbbf24]">IQ</span></span>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_18%)] rounded-xl p-1 mb-6">
          <button
            onClick={() => { setTab("signin"); setErr(""); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${tab === "signin" ? "bg-[#fbbf24] text-[hsl(220_28%_6%)]" : "text-white/40 hover:text-white"}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab("signup"); setErr(""); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${tab === "signup" ? "bg-[#fbbf24] text-[hsl(220_28%_6%)]" : "text-white/40 hover:text-white"}`}
          >
            Sign Up
          </button>
        </div>

        <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_18%)] rounded-2xl p-8 shadow-2xl">
          {tab === "signup" ? (
            <>
              <h2 className="font-bold text-white mb-1 text-center text-lg">Start your free trial</h2>
              <p className="text-white/40 text-xs text-center mb-2">Full access for 15 days — no credit card required</p>

              <div className="flex items-center justify-center gap-4 mb-6">
                {["Projects", "IoT Monitoring", "Invoicing"].map(f => (
                  <div key={f} className="flex items-center gap-1">
                    <CheckCircle2 size={10} className="text-[#fbbf24]" />
                    <span className="text-[10px] text-white/40">{f}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Maria Santos" className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white h-10 pl-9" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Company Name <span className="text-white/20">(optional)</span></label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Solar PH Corp" className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white h-10 pl-9" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@company.com" className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white h-10 pl-9" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <Input value={password} onChange={e => setPassword(e.target.value)} type={showP ? "text" : "password"} placeholder="Min 6 characters" className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white h-10 pl-9 pr-10" required minLength={6} />
                    <button type="button" onClick={() => setShowP(!showP)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                      {showP ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {err && <p className="text-red-400 text-xs">{err}</p>}
                <Button type="submit" disabled={loading} className="w-full bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold h-11 hover:brightness-110 solar-glow-sm transition-all text-sm">
                  {loading ? "Creating account..." : (
                    <span className="flex items-center gap-2"><Zap size={16} /> Start 15-Day Free Trial</span>
                  )}
                </Button>
              </form>
              <p className="text-center text-white/25 text-[10px] mt-4 leading-relaxed">
                By signing up you agree to our Terms of Service and Privacy Policy
              </p>
            </>
          ) : (
            <>
              <h2 className="font-bold text-white mb-1 text-center text-lg">Welcome back</h2>
              <p className="text-white/40 text-xs text-center mb-6">Sign in to your SolarIQ dashboard</p>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@company.com" className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white h-10 pl-9" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <Input value={password} onChange={e => setPassword(e.target.value)} type={showP ? "text" : "password"} placeholder="Your password" className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white h-10 pl-9 pr-10" required />
                    <button type="button" onClick={() => setShowP(!showP)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                      {showP ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {err && <p className="text-red-400 text-xs">{err}</p>}
                <Button type="submit" disabled={loading} className="w-full bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold h-11 hover:brightness-110 solar-glow-sm transition-all text-sm">
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Footer links */}
        <div className="text-center mt-6 space-y-2">
          {tab === "signin" ? (
            <p className="text-white/30 text-xs">Don't have an account? <button onClick={() => setTab("signup")} className="text-[#fbbf24] font-bold hover:underline">Start free trial</button></p>
          ) : (
            <p className="text-white/30 text-xs">Already have an account? <button onClick={() => setTab("signin")} className="text-[#fbbf24] font-bold hover:underline">Sign in</button></p>
          )}
          <Link href="/admin">
            <a className="text-white/15 text-[10px] hover:text-white/30 transition-colors block">Admin Portal →</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
