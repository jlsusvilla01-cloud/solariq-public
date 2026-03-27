import { useQuery } from "@tanstack/react-query";
import type { Faq, Testimonial, PricingPlan } from "@shared/schema";
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import {
  Sun, Zap, ShieldCheck, BarChart3, MessageSquare, FileText,
  CheckCircle2, Star, ChevronDown, ChevronUp, ArrowRight, Menu, X,
  MapPin, Package, ClipboardCheck, TreePine, Clock, Users, TrendingUp,
  Globe, Smartphone, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ── Navbar ──
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setOpen(false); };
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "bg-[hsl(220_28%_6%/0.95)] backdrop-blur border-b border-border" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="8" fill="#fbbf24" opacity="0.9"/>
            <path d="M16 2v4M16 26v4M2 16h4M26 16h4M5.5 5.5l2.8 2.8M23.7 23.7l2.8 2.8M23.7 8.3l2.8-2.8M5.5 26.5l2.8-2.8" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="16" cy="16" r="4" fill="white" opacity="0.95"/>
          </svg>
          <span className="font-bold text-base text-white">Solar<span className="text-[#fbbf24]">IQ</span></span>
        </div>
        <nav className="hidden md:flex items-center gap-7 text-sm text-white/70">
          {[["Features","features"],["How It Works","how"],["Testimonials","testimonials"],["FAQ","faq"],["Pricing","pricing"]].map(([l,id]) => (
            <button key={id} onClick={() => scrollTo(id)} className="hover:text-white transition-colors">{l}</button>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/admin"><a className="text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5">Admin Login</a></Link>
          <button onClick={() => scrollTo("pricing")} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] text-sm font-semibold px-4 py-2 rounded-lg hover:brightness-110 transition-all solar-glow-sm">
            Get Started
          </button>
        </div>
        <button onClick={() => setOpen(v => !v)} className="md:hidden text-white/70 hover:text-white">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-[hsl(220_24%_9%)] border-b border-border px-4 py-4 space-y-3">
          {[["Features","features"],["How It Works","how"],["Testimonials","testimonials"],["FAQ","faq"],["Pricing","pricing"]].map(([l,id]) => (
            <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left text-sm text-white/70 hover:text-white py-1">{l}</button>
          ))}
          <Link href="/admin"><a className="block text-sm text-white/70 py-1">Admin Login</a></Link>
        </div>
      )}
    </header>
  );
}

// ── Hero ──
function Hero() {
  return (
    <section className="relative min-h-screen aurora-bg sun-rays flex items-center justify-center pt-20 overflow-hidden">
      {/* Decorative sun */}
      <div className="absolute top-16 right-[15%] w-64 h-64 rounded-full bg-[#fbbf24] opacity-5 blur-3xl pointer-events-none" />
      <div className="absolute top-24 right-[18%] w-40 h-40 rounded-full bg-[#fbbf24] opacity-8 blur-2xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 text-center z-10">
        <Badge className="mb-6 bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/25 text-xs px-4 py-1.5 fade-in fade-in-1">
          <Sun size={12} className="mr-1.5" /> The #1 Solar Installation Management Platform
        </Badge>

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 leading-[1.05] tracking-tight fade-in fade-in-2">
          Solar installs that{" "}
          <span className="gradient-text">clients trust</span>
          {" "}from day one
        </h1>

        <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed fade-in fade-in-3">
          Give every client a live progress tracker. Manage permits, materials, safety, and milestones — all from one platform built for solar contractors in the Philippines and Southeast Asia.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in fade-in-4">
          <button onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold px-8 py-4 rounded-xl text-base hover:brightness-110 transition-all solar-glow flex items-center gap-2">
            Start Free Trial <ArrowRight size={18} />
          </button>
          <Link href="/track/demo-abc123">
            <a className="border border-white/20 text-white/80 hover:text-white hover:border-white/40 px-8 py-4 rounded-xl text-base transition-all flex items-center gap-2">
              See Live Demo <Zap size={16} />
            </a>
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-white/40 text-sm fade-in fade-in-4">
          {[["500+","Solar Projects Tracked"],["98%","Client Satisfaction"],["40%","Faster Installations"],["₱0","Setup Cost"]].map(([v,l]) => (
            <div key={l} className="text-center">
              <div className="text-2xl font-bold text-[#fbbf24]">{v}</div>
              <div>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/30">
        <ChevronDown size={24} />
      </div>
    </section>
  );
}


// ── Dashboard Preview ──
function DashboardPreview() {
  return (
    <section className="py-20 bg-[hsl(220_28%_6%)] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[#fbbf24] opacity-[0.03] blur-[120px] pointer-events-none rounded-full" />
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/25 text-xs">Contractor ERP</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Elite ERP Tools for Elite Contractors</h2>
          <p className="text-white/50 max-w-xl mx-auto">From stock management to crew scheduling — run your entire solar operation from a single unified panel.</p>
        </div>
        <div className="relative group p-1 bg-gradient-to-br from-[#fbbf24]/20 to-transparent rounded-3xl overflow-hidden shadow-2xl">
          <img 
            src="/erp-preview.png" 
            alt="SolarIQ ERP Dashboard" 
            className="w-full h-auto rounded-3xl object-cover hover:scale-[1.01] transition-transform duration-700"
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[hsl(220_28%_6%)] to-transparent" />
        </div>
      </div>
    </section>
  );
}

// ── Features ──
function Features() {
  const features = [
    { icon: TrendingUp, title: "Executive Analytics", desc: "Monitor multi-project revenue, progress averages, and deal close rates from a high-fidelity visual dashboard.", color: "text-[#fbbf24]", bg: "bg-[#fbbf24]/10" },
    { icon: Package, title: "Live Inventory Ledger", desc: "Track panel and inverter stock levels atomically across warehouse locations with automatic low-stock alerts.", color: "text-blue-400", bg: "bg-blue-400/10" },
    { icon: Clock, title: "Crew Gantt Scheduling", desc: "Visual project timelines to assign crews and track task completion over 30-day horizons.", color: "text-green-400", bg: "bg-green-400/10" },
    { icon: FileText, title: "Proposal PDF Engine", desc: "Generate professional, investor-grade PDF proposals with localized financial projections in one click.", color: "text-purple-400", bg: "bg-purple-400/10" },
    { icon: MapPin, title: "Live Progress Tracker", desc: "Each client gets a unique tracker link to see milestones, photos, and updates in real-time — zero app install needed.", color: "text-orange-400", bg: "bg-orange-400/10" },
    { icon: ShieldCheck, title: "Roof Structural Check", desc: "Verify roof structural feasibility before installation using integrated ASCE load calculations.", color: "text-teal-400", bg: "bg-teal-400/10" },
    { icon: Star, title: "Automated Referrals", desc: "Incentivize your existing clients to refer new neighbors with a tracked, payout-ready referral engine.", color: "text-amber-400", bg: "bg-amber-400/10" },
  ];

  return (
    <section id="features" className="py-24 bg-[hsl(220_28%_6%)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/25 text-xs">Everything in One Platform</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Built for solar contractors,<br/><span className="gradient-text">by people who understand the job</span></h2>
          <p className="text-white/50 max-w-xl mx-auto">Every feature was designed around the real problems contractors face on-site — from permit chaos to client WhatsApp flooding.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_18%)] rounded-2xl p-6 hover:border-[#fbbf24]/30 transition-colors group">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={18} className={color} />
              </div>
              <h3 className="font-bold text-white mb-2 text-sm">{title}</h3>
              <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──
function HowItWorks() {
  const steps = [
    { n: "01", title: "Create a Project", desc: "Enter client details, address, and system specs. SolarIQ auto-generates your milestone checklist and a unique client tracking link.", icon: Users },
    { n: "02", title: "Share the Link", desc: "Send your client their personal tracking URL. They can monitor progress, read updates, and see photos — from any device, no login required.", icon: Globe },
    { n: "03", title: "Update Milestones", desc: "As each phase completes, mark it done in your admin dashboard. Clients see the progress bar update in real time with photos and notes.", icon: CheckCircle2 },
    { n: "04", title: "Commissioned & Reviewed", desc: "On completion, generate the investor PDF report. Clients can leave a review — boosting your credibility for future contracts.", icon: Star },
  ];
  return (
    <section id="how" className="py-24 bg-[hsl(220_24%_8%)]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/25 text-xs">Simple Workflow</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">From survey to handover —<br/><span className="gradient-text">completely tracked</span></h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {steps.map(({ n, title, desc, icon: Icon }) => (
            <div key={n} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_18%)] rounded-2xl p-7 flex gap-5">
              <div className="w-12 h-12 bg-[#fbbf24]/10 rounded-2xl flex items-center justify-center shrink-0">
                <Icon size={20} className="text-[#fbbf24]" />
              </div>
              <div>
                <div className="text-[#fbbf24] text-xs font-bold mb-1 font-mono">{n}</div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──
function Testimonials() {
  const { data: items = [] } = useQuery<Testimonial[]>({ queryKey: ["/api/public/testimonials"] });
  if (items.length === 0) return null;
  const colors = ["bg-[#fbbf24]","bg-blue-500","bg-green-500","bg-purple-500","bg-rose-500","bg-teal-500"];
  return (
    <section id="testimonials" className="py-24 bg-[hsl(220_28%_6%)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/25 text-xs">Real Results</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Trusted by contractors<br/><span className="gradient-text">and their clients</span></h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <div key={t.id} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_18%)] rounded-2xl p-6 flex flex-col gap-4 hover:border-[#fbbf24]/25 transition-colors">
              <div className="flex items-center gap-1">
                {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={14} fill="#fbbf24" className="text-[#fbbf24]" />)}
              </div>
              <p className="text-white/70 text-sm leading-relaxed flex-1">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${colors[i % colors.length]} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {t.avatarInitials || t.name.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-white/40 text-xs">{t.role}{t.location ? ` · ${t.location}` : ""}{t.systemSize ? ` · ${t.systemSize}` : ""}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ──
function FAQ() {
  const { data: faqs = [] } = useQuery<Faq[]>({ queryKey: ["/api/public/faqs"] });
  const [open, setOpen] = useState<number | null>(null);
  const categories = Array.from(new Set(faqs.map(f => f.category)));
  const [activecat, setActiveCat] = useState("all");
  const shown = activecat === "all" ? faqs : faqs.filter(f => f.category === activecat);
  const catLabels: Record<string,string> = { all: "All", general: "General", installation: "Installation", billing: "Billing", permits: "Permits", technical: "Technical", monitoring: "Monitoring", maintenance: "Maintenance", structural: "Structural" };
  return (
    <section id="faq" className="py-24 bg-[hsl(220_24%_8%)]">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/25 text-xs">Know Before You Go Solar</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Frequently asked <span className="gradient-text">questions</span></h2>
          <p className="text-white/50 text-sm">Everything you need to know about going solar in the Philippines.</p>
        </div>
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {["all", ...categories].map(c => (
            <button key={c} onClick={() => setActiveCat(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${activecat === c ? "bg-[#fbbf24] text-[hsl(220_28%_6%)] border-[#fbbf24]" : "border-[hsl(220_18%_18%)] text-white/50 hover:text-white hover:border-white/20"}`}>
              {catLabels[c] || c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {shown.map(faq => (
            <div key={faq.id} className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_18%)] rounded-xl overflow-hidden">
              <button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpen(open === faq.id ? null : faq.id)}>
                <span className="font-medium text-white text-sm pr-4">{faq.question}</span>
                {open === faq.id ? <ChevronUp size={16} className="text-[#fbbf24] shrink-0" /> : <ChevronDown size={16} className="text-white/40 shrink-0" />}
              </button>
              {open === faq.id && (
                <div className="px-5 pb-5">
                  <p className="text-white/60 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ──
function Pricing() {
  const { data: plans = [] } = useQuery<PricingPlan[]>({ queryKey: ["/api/public/pricing"] });
  return (
    <section id="pricing" className="py-24 bg-[hsl(220_28%_6%)]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/25 text-xs">Simple Pricing</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Start free, scale as<br/><span className="gradient-text">your business grows</span></h2>
          <p className="text-white/50 text-sm">All plans include a 14-day free trial. No credit card required.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5 items-start">
          {plans.map(plan => {
            const feats: string[] = JSON.parse(plan.features || "[]");
            return (
              <div key={plan.id} className={`relative bg-[hsl(220_24%_9%)] rounded-2xl p-7 flex flex-col border transition-all ${plan.highlighted ? "border-[#fbbf24]/60 card-glow" : "border-[hsl(220_18%_18%)] hover:border-[#fbbf24]/25"}`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#fbbf24] text-[hsl(220_28%_6%)] text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                  </div>
                )}
                <div className="mb-6">
                  <div className="font-bold text-white text-base mb-1">{plan.name}</div>
                  <div className="text-white/50 text-xs mb-5 leading-relaxed">{plan.description}</div>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-white">₱{plan.price.toLocaleString()}</span>
                    <span className="text-white/40 text-sm mb-1">/{plan.billingCycle}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {feats.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                      <CheckCircle2 size={14} className="text-[#fbbf24] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${plan.highlighted ? "bg-[#fbbf24] text-[hsl(220_28%_6%)] hover:brightness-110 solar-glow-sm" : "border border-[hsl(220_18%_28%)] text-white hover:border-[#fbbf24]/40 hover:text-[#fbbf24]"}`}>
                  {plan.ctaLabel}
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-center text-white/30 text-xs mt-8">All prices in Philippine Peso (₱). Annual plans available at 20% discount. Contact us for custom enterprise pricing.</p>
      </div>
    </section>
  );
}

// ── Footer ──
function Footer() {
  return (
    <footer className="bg-[hsl(220_28%_4%)] border-t border-[hsl(220_18%_12%)] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid sm:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="8" fill="#fbbf24" opacity="0.9"/><circle cx="16" cy="16" r="4" fill="white" opacity="0.95"/></svg>
              <span className="font-bold text-white">Solar<span className="text-[#fbbf24]">IQ</span></span>
            </div>
            <p className="text-white/40 text-xs leading-relaxed">The solar contractor platform built for the Philippines and Southeast Asia.</p>
          </div>
          {[
            ["Product", ["Features","Pricing","How It Works","Demo Tracker"]],
            ["Resources", ["FAQ","Blog","Help Center","API Docs"]],
            ["Company", ["About","Contact","Privacy Policy","Terms of Service"]],
          ].map(([heading, links]) => (
            <div key={heading as string}>
              <div className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">{heading}</div>
              <ul className="space-y-2">
                {(links as string[]).map(l => <li key={l}><a href="#" className="text-white/40 text-xs hover:text-white/70 transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-[hsl(220_18%_12%)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs">© 2026 SolarIQ. All rights reserved. Built for Filipino solar contractors.</p>
          <a href="https://www.perplexity.ai/computer" target="_blank" rel="noopener noreferrer" className="text-white/25 text-xs hover:text-white/50 transition-colors">
            Created with Perplexity Computer
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(220_28%_6%)]">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <Pricing />
      <Footer />
    </div>
  );
}
