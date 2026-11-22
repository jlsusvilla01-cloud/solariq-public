import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  Sun, Play, ArrowRight, ChevronDown, MessageCircle, FileSpreadsheet, PhoneCall, Hourglass,
  Inbox, Ruler, FileText, Wrench, Gauge, Star, Zap, BellRing, Share2, Printer, CreditCard,
  CheckCircle2, Smartphone, Camera, Lock, AlertTriangle, TrendingUp, Eye, Target, Wallet,
  MessageSquare, ClipboardCheck, Banknote, Check, Phone, Mail, UserPlus, Globe, Sparkles, Send,
} from "lucide-react";
import { calculateProposal, peso } from "@shared/solarMath";
import { PLANS } from "@shared/plans";
import "./landing.css";

/* Sample numbers on the page come from the same calculator contractors use, so they stay honest. */
const SAMPLE = calculateProposal({
  monthlyBill: 8000, utilityRate: 15.68, systemType: "grid", pricePerKw: 45000,
  financeMonths: 24, financeAprPct: 12, downPaymentPct: 20,
});

const MAKER = "https://balay-erp.vercel.app/site/maker";

const SLIDES = [
  "Home", "Sound familiar", "The fix", "Leads", "Proposals", "Client tracker", "Net metering",
  "Reviews", "Market intel", "Built for the Philippines", "Pricing", "Next step", "Made by",
];
const DARK = new Set([0, 2, 4, 6, 8, 11, 12]);

function Title({ children, accent, dot = true, h1 = false }: { children: React.ReactNode; accent?: React.ReactNode; dot?: boolean; h1?: boolean }) {
  const Tag = h1 ? "h1" : "h2";
  return (
    <Tag className={`${h1 ? "sl-h1" : "sl-h2"} sl-anim`}>
      {children}
      {accent && <> <span className="sl-grad">{accent}</span></>}
      {dot && <span className="sl-dot">.</span>}
    </Tag>
  );
}

function Chips({ items }: { items: [React.ComponentType<any>, string][] }) {
  return (
    <div className="sl-chips sl-anim d2">
      {items.map(([Icon, t]) => <span key={t} className="sl-chip"><Icon size={15} />{t}</span>)}
    </div>
  );
}

/* ── 01 Hero ── */
function Hero({ go }: { go: (i: number) => void }) {
  return (
    <div className="sl-wrap sl-split">
      <div>
        <div className="sl-eyebrow sl-anim">For Philippine solar contractors</div>
        <Title h1 dot={false}>Close more solar deals.<br /><span className="sl-grad">Hand over on time</span><span className="sl-dot">.</span></Title>
        <p className="sl-lead sl-anim d2">One system for your leads, proposals, installs and net metering, with a live tracker your clients can open on their phone.</p>
        <div className="sl-ctas sl-anim d3">
          <Link href="/signup" className="sl-btn sl-btn-primary"><Play size={16} fill="currentColor" />Start 15-day free trial</Link>
          <button className="sl-btn sl-btn-ghost" onClick={() => go(11)}>Book a demo <ArrowRight size={16} /></button>
        </div>
      </div>
      <div className="sl-anim d2" style={{ position: "relative", padding: "30px 10px" }}>
        <div className="sl-float" style={{ top: 0, right: 0 }}>
          <div className="sl-k">New lead · 2 min ago</div>
          <div style={{ fontWeight: 800, marginTop: 3 }}>Ana Reyes, Jaro</div>
          <div style={{ fontSize: 12.5, color: "#64748b" }}>Bill {peso(8000)}/mo · SMS sent to you</div>
        </div>
        <div className="sl-mock">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Solar proposal</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>Ana Reyes · Jaro, Iloilo City</div>
            </div>
            <span className="sl-pill green"><CheckCircle2 size={12} />ACCEPTED</span>
          </div>
          <div className="sl-row"><span>System</span><b>{SAMPLE.systemKw} kW grid-tie</b></div>
          <div className="sl-row"><span>Total price</span><b>{peso(SAMPLE.totalPrice)}</b></div>
          <div className="sl-row"><span>Monthly savings</span><b style={{ color: "#059669" }}>{peso(SAMPLE.monthlySavings)}</b></div>
          <div className="sl-row"><span>Payback</span><b>{SAMPLE.paybackYears?.toFixed(1)} years</b></div>
          <div className="sl-row"><span>24 months at 12%</span><b>{peso(SAMPLE.monthlyPayment)}/mo</b></div>
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#64748b", marginBottom: 6 }}>
              <span>Net metering · step 5 of 7</span><span>71%</span>
            </div>
            <div className="sl-bar"><i style={{ width: "71%" }} /></div>
          </div>
        </div>
        <div className="sl-float" style={{ bottom: 0, left: -6 }}>
          <div className="sl-k">Payback</div>
          <div className="sl-mono" style={{ fontWeight: 700, fontSize: 22 }}>{SAMPLE.paybackYears?.toFixed(1)} yrs</div>
          <div style={{ fontSize: 12, color: "#059669", fontWeight: 700 }}>Bill {peso(8000)} → {peso(SAMPLE.newMonthlyBill)}</div>
        </div>
      </div>
    </div>
  );
}

/* ── 02 Pain ── */
function Pain() {
  const cards: [React.ComponentType<any>, string, string, string, string][] = [
    [MessageCircle, "Leads buried in Messenger", "Replied to the next day, if at all", "#e0f2fe", "#0369a1"],
    [FileSpreadsheet, "Quotes take three days", "By then they asked two other installers", "#dcfce7", "#15803d"],
    [PhoneCall, "“Ano na po status?”", "Clients call for every update", "#ede9fe", "#6d28d9"],
    [Hourglass, "Net metering stuck for months", "Nobody knows which step stalled", "#fef3c7", "#b45309"],
  ];
  return (
    <div className="sl-wrap sl-center">
      <div className="sl-eyebrow sl-anim">Sound familiar?</div>
      <Title>Your sales run on<br /><span className="sl-grad">Messenger and Excel</span></Title>
      <div className="sl-grid4">
        {cards.map(([Icon, t, s, bg, fg], i) => (
          <div key={t} className={`sl-card sl-prob sl-anim ${i > 1 ? "d3" : "d2"}`}>
            <div className="sl-ico" style={{ background: bg, color: fg }}><Icon size={20} /></div>
            <h3>{t}</h3><p>{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 03 Pipeline ── */
function Fix() {
  const steps: [React.ComponentType<any>, string, string][] = [
    [Inbox, "Inquiry", "Instant estimate"], [Ruler, "Survey", "Scheduled and logged"],
    [FileText, "Proposal", "Savings and payback"], [Wrench, "Install", "Client tracker"],
    [Gauge, "Net metering", "7 steps tracked"], [Star, "Review", "Google review ask"],
  ];
  return (
    <div className="sl-wrap sl-center">
      <div className="sl-eyebrow sl-anim">The fix</div>
      <Title>One record, from <span className="sl-grad">inquiry to meter</span></Title>
      <div className="sl-pipe sl-anim d2">
        {steps.map(([Icon, t, s]) => (
          <div key={t} className="sl-step"><div className="sl-step-ico"><Icon size={26} /></div><b>{t}</b><span>{s}</span></div>
        ))}
      </div>
    </div>
  );
}

/* ── 04 Leads ── */
function Leads() {
  const lowHigh = [SAMPLE.totalPrice * 0.9, SAMPLE.totalPrice * 1.1].map(v => peso(Math.round(v / 1000) * 1000));
  return (
    <div className="sl-wrap sl-split">
      <div>
        <div className="sl-eyebrow sl-anim">Leads</div>
        <Title>Every inquiry,<br /><span className="sl-grad">answered in minutes</span></Title>
        <p className="sl-lead sl-anim d2">Share your quote page on Facebook. Visitors type their electric bill and get an estimate on the spot. You get an SMS and email, and the lead lands in your pipeline.</p>
        <Chips items={[[Zap, "Instant estimate"], [BellRing, "SMS and email alert"], [Share2, "Facebook-ready link"]]} />
      </div>
      <div className="sl-anim d2">
        <div className="sl-phone"><div className="sl-phone-in">
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>Bright Solar Iloilo</div>
          <div style={{ fontSize: 19, fontWeight: 800, margin: "2px 0 12px", letterSpacing: -.3 }}>Get a free solar estimate</div>
          <div className="sl-field"><small>Monthly electric bill</small>{peso(8000)}</div>
          <div className="sl-field"><small>Mobile</small>0917 123 4567</div>
          <div style={{ borderRadius: 14, padding: 14, background: "linear-gradient(135deg,#fffbeb,#ecfdf5)", border: "1px solid #fde68a", marginTop: 6 }}>
            <div className="sl-k" style={{ color: "#b45309" }}>Your estimate</div>
            <div style={{ fontSize: 22, fontWeight: 800, margin: "4px 0" }}>{SAMPLE.systemKw} kW grid-tie</div>
            <div className="sl-row"><span>Save about</span><b style={{ color: "#059669" }}>{peso(SAMPLE.monthlySavings)}/mo</b></div>
            <div className="sl-row"><span>Price range</span><b>{lowHigh[0]}–{lowHigh[1]}</b></div>
          </div>
          <div className="sl-btn sl-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 12, height: 44 }}>Request a site visit</div>
        </div></div>
      </div>
    </div>
  );
}

/* ── 05 Proposals ── */
function Proposals() {
  return (
    <div className="sl-wrap sl-split rev">
      <div>
        <div className="sl-eyebrow sl-anim">Proposals</div>
        <Title>Proposals in five minutes,<br /><span className="sl-grad">not five days</span></Title>
        <p className="sl-lead sl-anim d2">Enter the bill and your price per kW. SolarIQ sizes the system, works out savings, payback and instalments, and gives you a link the client can print or accept online.</p>
        <Chips items={[[Printer, "Printable link"], [CreditCard, "Instalment plans"], [CheckCircle2, "Accept online"]]} />
      </div>
      <div className="sl-anim d2">
        <div className="sl-mock">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div><div className="sl-k">Proposal · Ana Reyes</div><div style={{ fontWeight: 800, fontSize: 20, marginTop: 2 }}>{SAMPLE.systemKw} kW grid-tie system</div></div>
            <span className="sl-pill amber" style={{ alignSelf: "flex-start" }}>SENT</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            {[["Today’s bill", peso(8000)], ["New bill", peso(SAMPLE.newMonthlyBill)], ["Savings / month", peso(SAMPLE.monthlySavings)], ["10-year savings", peso(SAMPLE.tenYearSavings)]].map(([k, v]) => (
              <div key={k} style={{ background: "#f8fafc", borderRadius: 12, padding: "10px 12px" }}><div className="sl-k">{k}</div><div style={{ fontWeight: 800, fontSize: 17, marginTop: 2 }}>{v}</div></div>
            ))}
          </div>
          <div className="sl-row"><span>Total price</span><b>{peso(SAMPLE.totalPrice)}</b></div>
          <div className="sl-row"><span>Down payment (20%)</span><b>{peso(SAMPLE.downPayment)}</b></div>
          <div className="sl-row"><span>24 monthly payments</span><b>{peso(SAMPLE.monthlyPayment)}</b></div>
          <div className="sl-row"><span>Payback</span><b>{SAMPLE.paybackYears?.toFixed(1)} years</b></div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <div className="sl-btn sl-btn-primary sl-btn-sm" style={{ flex: 1, justifyContent: "center" }}><Check size={15} />Accept proposal</div>
            <div className="sl-btn sl-btn-outline sl-btn-sm"><Printer size={15} />Print</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 06 Tracker ── */
function Tracker() {
  const ms: [string, "done" | "now" | "todo"][] = [
    ["Site survey", "done"], ["Design and permit", "done"], ["Panels delivered", "done"],
    ["Installation", "now"], ["Net metering", "todo"], ["Handover", "todo"],
  ];
  return (
    <div className="sl-wrap sl-split">
      <div>
        <div className="sl-eyebrow sl-anim">Client tracker</div>
        <Title>Clients see progress<br /><span className="sl-grad">without calling you</span></Title>
        <p className="sl-lead sl-anim d2">Every project gets its own link. Clients open it on their phone to see milestones, photos and notes. Fewer calls, more trust, more referrals.</p>
        <Chips items={[[Smartphone, "No app to install"], [Camera, "Photos and notes"], [Lock, "PIN for private details"]]} />
        <div className="sl-anim d3" style={{ marginTop: 22 }}>
          <a href="#/track/demo-abc123" className="sl-btn sl-btn-outline sl-btn-sm"><Eye size={15} />Open a sample tracker</a>
        </div>
      </div>
      <div className="sl-anim d2">
        <div className="sl-card" style={{ padding: 24, maxWidth: 440, margin: "0 auto" }}>
          <div className="sl-k">Reyes residence · 3 kW</div>
          <div style={{ fontWeight: 800, fontSize: 20, margin: "3px 0 12px" }}>Your solar installation</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b", marginBottom: 6 }}><span>Overall</span><span>62%</span></div>
          <div className="sl-bar" style={{ marginBottom: 18 }}><i style={{ width: "62%" }} /></div>
          {ms.map(([t, s]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
              <span style={{ width: 26, height: 26, borderRadius: 99, display: "grid", placeItems: "center", flex: "none",
                background: s === "done" ? "#059669" : s === "now" ? "#fef3c7" : "#f1f5f9", color: s === "done" ? "#fff" : s === "now" ? "#b45309" : "#94a3b8",
                border: s === "now" ? "2px solid #f59e0b" : "none" }}>
                {s === "done" ? <Check size={14} strokeWidth={3} /> : s === "now" ? <Wrench size={13} /> : null}
              </span>
              <span style={{ flex: 1, fontWeight: s === "todo" ? 500 : 700, color: s === "todo" ? "#94a3b8" : "#0f172a" }}>{t}</span>
              {s === "now" && <span className="sl-pill amber">IN PROGRESS</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 07 Net metering ── */
function NetMetering() {
  const steps: [string, "done" | "now" | "stalled" | "todo", string][] = [
    ["Requirements gathered", "done", "Oct 2"], ["Application filed", "done", "Oct 6"],
    ["Technical evaluation", "stalled", "23 days"], ["Site inspection", "todo", "Due Nov 30"],
    ["Net-Metering Agreement", "todo", ""], ["Bi-directional meter", "todo", ""], ["Certificate of Compliance", "todo", ""],
  ];
  return (
    <div className="sl-wrap sl-split rev">
      <div>
        <div className="sl-eyebrow sl-anim">Net metering</div>
        <Title>Every utility step,<br /><span className="sl-grad">on one board</span></Title>
        <p className="sl-lead sl-anim d2">Seven steps from requirements to the Certificate of Compliance, with dates, due dates and a warning when a step sits too long. Your notes show on the client’s tracker.</p>
        <Chips items={[[ClipboardCheck, "7-step checklist"], [AlertTriangle, "Stalled-step alerts"], [Eye, "Client sees progress"]]} />
      </div>
      <div className="sl-anim d2">
        <div className="sl-mock">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div><div className="sl-k">Net metering</div><div style={{ fontWeight: 800, fontSize: 18 }}>Reyes residence</div></div>
            <span className="sl-pill red"><AlertTriangle size={12} />1 STALLED</span>
          </div>
          {steps.map(([t, s, d], i) => (
            <div key={t} className="sl-row" style={{ alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10, color: s === "todo" ? "#94a3b8" : "#0f172a", fontWeight: s === "todo" ? 500 : 700 }}>
                <span className="sl-mono" style={{ fontSize: 11, color: "#94a3b8", width: 16 }}>{i + 1}</span>{t}
              </span>
              {s === "done" && <span className="sl-pill green">DONE {d}</span>}
              {s === "stalled" && <span className="sl-pill red">WAITING {d}</span>}
              {s === "todo" && d && <span className="sl-pill gray">{d}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 08 Reviews ── */
function Reviews() {
  return (
    <div className="sl-wrap sl-split">
      <div>
        <div className="sl-eyebrow sl-anim">Reviews</div>
        <Title>Every handover,<br /><span className="sl-grad">a Google review</span></Title>
        <p className="sl-lead sl-anim d2">One tap after handover sends your client a thank-you with your Google review link, by SMS and email. More reviews means more people pick you on Google Maps.</p>
        <Chips items={[[MessageSquare, "SMS and email"], [Send, "One tap"], [Star, "Your Google link"]]} />
      </div>
      <div className="sl-anim d2">
        <div className="sl-phone"><div className="sl-phone-in" style={{ minHeight: 440 }}>
          <div style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", fontWeight: 700, marginBottom: 14 }}>BrightSolar · Text message</div>
          <div style={{ background: "#e2e8f0", borderRadius: "18px 18px 18px 6px", padding: "12px 14px", fontSize: 14, lineHeight: 1.45, maxWidth: "92%" }}>
            Hi Ana! Salamat for choosing Bright Solar. Your system is live. Could you leave us a quick review? It helps a lot: g.page/r/brightsolar
          </div>
          <div style={{ background: "#0ea5e9", color: "#fff", borderRadius: "18px 18px 6px 18px", padding: "10px 14px", fontSize: 14, marginLeft: "auto", marginTop: 10, maxWidth: "70%" }}>Done po! 5 stars ☀️</div>
          <div className="sl-card" style={{ marginTop: 22, padding: 14 }}>
            <div style={{ display: "flex", gap: 2, color: "#f59e0b" }}>{[0, 1, 2, 3, 4].map(i => <Star key={i} size={16} fill="currentColor" />)}</div>
            <div style={{ fontSize: 13, marginTop: 6, color: "#334155" }}>“Clear proposal, fast install, and I could follow every step on my phone.”</div>
            <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 6 }}>Sample review</div>
          </div>
        </div></div>
      </div>
    </div>
  );
}

/* ── 09 Market intel ── */
function MarketIntel() {
  const rows: [string, number, string][] = [["Your price", 45000, "you"], ["Competitor A", 52000, ""], ["Competitor B", 47500, ""], ["Competitor C", 41000, ""]];
  const max = 55000;
  return (
    <div className="sl-wrap sl-split rev">
      <div>
        <div className="sl-eyebrow sl-anim">Market intel</div>
        <Title>Know your rivals’<br /><span className="sl-grad">prices and pitch</span></Title>
        <p className="sl-lead sl-anim d2">Track competitors’ price per kW, packages, financing and reviews. See where you sit in the market before you quote, and why you win or lose.</p>
        <Chips items={[[TrendingUp, "Price positioning"], [Target, "Win/loss reasons"], [Eye, "Iloilo market pack"]]} />
      </div>
      <div className="sl-anim d2">
        <div className="sl-mock">
          <div className="sl-k">Grid-tie price per kW · Iloilo</div>
          <div style={{ fontWeight: 800, fontSize: 18, margin: "2px 0 16px" }}>You are 3rd of 4 on price</div>
          {rows.map(([n, v, t]) => (
            <div key={n} style={{ marginBottom: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 5 }}>
                <b style={{ color: t ? "#b45309" : "#0f172a" }}>{n}</b><span className="sl-mono">{peso(v)}</span>
              </div>
              <div className="sl-bar" style={{ height: 10 }}><i style={{ width: `${(v / max) * 100}%`, background: t ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : "#cbd5e1" }} /></div>
            </div>
          ))}
          <div style={{ marginTop: 6, fontSize: 13, color: "#64748b" }}>Sample data. Add the rivals you meet in the field.</div>
        </div>
      </div>
    </div>
  );
}

/* ── 10 Local ── */
function Local() {
  const f: [React.ComponentType<any>, string, string][] = [
    [Banknote, "Peso prices and instalments", "Your price per kW, down payment, months and interest, worked out for each client."],
    [Wallet, "Pay by GCash, Maya or card", "Subscribe through PayMongo, the checkout Filipinos already trust."],
    [MessageSquare, "SMS that reaches local phones", "Lead alerts and review requests go out over Philippine SMS."],
    [ClipboardCheck, "Net-metering checklist", "The utility steps your team follows, from requirements to the Certificate of Compliance."],
    [Zap, "Your utility’s rate", "Estimates use your area’s rate per kWh, so the savings make sense to clients."],
    [Smartphone, "Works on any phone", "Your team and your clients need a browser, not an app."],
  ];
  return (
    <div className="sl-wrap sl-center">
      <div className="sl-eyebrow sl-anim">Local</div>
      <Title>Built for the <span className="sl-grad">Philippines</span></Title>
      <div className="sl-grid3">
        {f.map(([Icon, t, s], i) => (
          <div key={t} className={`sl-card sl-feat sl-anim ${i > 2 ? "d3" : "d2"}`}>
            <div className="sl-ico" style={{ background: "#fef3c7", color: "#b45309" }}><Icon size={20} /></div>
            <h3>{t}</h3><p>{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 11 Pricing ── */
function Pricing() {
  const [yearly, setYearly] = useState(false);
  return (
    <div className="sl-wrap sl-center">
      <div className="sl-eyebrow sl-anim">Pricing</div>
      <Title>Simple <span className="sl-grad">monthly plans</span></Title>
      <div className="sl-toggle sl-anim d2">
        <button className={!yearly ? "on" : ""} onClick={() => setYearly(false)}>Monthly</button>
        <button className={yearly ? "on" : ""} onClick={() => setYearly(true)}>Yearly · save 20%</button>
      </div>
      <div className="sl-plans">
        {PLANS.map(p => (
          <div key={p.id} className={`sl-card sl-plan sl-anim d3 ${p.highlighted ? "hot" : ""}`}>
            {p.highlighted && <div className="sl-plan-tag">MOST POPULAR</div>}
            <h3>{p.name}</h3>
            <div className="sub">{p.description}</div>
            <div className="sl-price">{peso(yearly ? p.yearlyPrice : p.monthlyPrice)}<small>/{yearly ? "year" : "month"}</small></div>
            <ul>{p.features.map(f => <li key={f}><CheckCircle2 size={16} />{f}</li>)}</ul>
            <Link href="/signup" className={`sl-btn ${p.highlighted ? "sl-btn-primary" : "sl-btn-outline"}`} style={{ justifyContent: "center" }}>Start free trial</Link>
          </div>
        ))}
      </div>
      <p className="sl-note sl-anim d3">Every plan starts with a 15-day free trial, no card needed. Pay by GCash, Maya or card when you’re ready.</p>
    </div>
  );
}

/* ── 12 Next step + demo form ── */
function NextStep() {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", installs: "", website: "" });
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.company.trim()) return setError("Please enter your name and company.");
    if (!form.phone.trim() && !form.email.trim()) return setError("Please give a mobile number or email.");
    setState("sending");
    try {
      const r = await fetch("/api/public/demo-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "Something went wrong. Please call us instead.");
      setState("done");
    } catch (err: any) {
      setError(err.message);
      setState("idle");
    }
  }

  const steps: [string, string][] = [
    ["Send your prices", "Price per kW for grid-tie and hybrid, and your service area."],
    ["We set up your account", "Company details, quote page and alert contacts."],
    ["Train your team", "One short session on leads, proposals and trackers."],
    ["Go live", "Share your quote link on Facebook and start closing."],
  ];
  return (
    <div className="sl-wrap sl-split">
      <div>
        <div className="sl-eyebrow sl-anim">Next step</div>
        <Title>See your business<br /><span className="sl-grad">in SolarIQ</span></Title>
        <div className="sl-steps4 sl-anim d2">
          {steps.map(([t, s], i) => (
            <div key={t} className="sl-s4"><em>0{i + 1}</em><div><b>{t}</b><span>{s}</span></div></div>
          ))}
        </div>
      </div>
      <div className="sl-anim d2">
        <div className="sl-mock" style={{ padding: 0 }}>
          {state === "done" ? (
            <div className="sl-ok">
              <div className="sl-ico" style={{ background: "#dcfce7", color: "#15803d", margin: "0 auto 14px", width: 54, height: 54 }}><CheckCircle2 size={26} /></div>
              <div style={{ fontWeight: 800, fontSize: 22 }}>Thanks, {form.name.split(" ")[0]}!</div>
              <p style={{ color: "#475569", margin: "8px 0 18px" }}>We’ll contact you soon to set up your demo.</p>
              <Link href="/signup" className="sl-btn sl-btn-primary" style={{ justifyContent: "center" }}>Or start your free trial now</Link>
            </div>
          ) : (
            <form className="sl-form" onSubmit={submit} noValidate>
              <div style={{ fontWeight: 800, fontSize: 20 }}>Book a demo</div>
              <div className="two">
                <label>Your name<input value={form.name} onChange={set("name")} autoComplete="name" /></label>
                <label>Company<input value={form.company} onChange={set("company")} autoComplete="organization" /></label>
              </div>
              <div className="two">
                <label>Mobile<input value={form.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" placeholder="09XX XXX XXXX" /></label>
                <label>Email<input value={form.email} onChange={set("email")} type="email" autoComplete="email" /></label>
              </div>
              <label>Installs per month
                <select value={form.installs} onChange={set("installs")}>
                  <option value="">Choose one</option><option>1–3</option><option>4–10</option><option>11–25</option><option>More than 25</option>
                </select>
              </label>
              <div className="sl-hp" aria-hidden="true"><input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} /></div>
              {error && <div className="sl-err">{error}</div>}
              <button className="sl-btn sl-btn-primary" style={{ justifyContent: "center" }} disabled={state === "sending"}>
                {state === "sending" ? "Sending…" : <>Request a demo <ArrowRight size={16} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── 13 Made by ── */
function Maker() {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="sl-wrap sl-split">
      <div>
        <div className="sl-eyebrow sl-anim">Made by</div>
        <div className="sl-maker-id sl-anim">
          <img src={`${MAKER}/j1-digital-cut.webp`} alt="J1 Digital Marketing and AI Agency logo" />
          <div><b>J1 Digital Marketing<br />&amp; AI Agency</b><span>Iloilo City, Philippines</span></div>
        </div>
        <Title>Let’s grow yours<br /><span className="sl-grad">together</span></Title>
        <div className="sl-ctas sl-anim d2">
          <a href="tel:+639480442196" className="sl-btn sl-btn-primary sl-btn-sm"><Phone size={15} />Call Juone</a>
          <a href="mailto:jlsusvilla01@gmail.com" className="sl-btn sl-btn-ghost sl-btn-sm"><Mail size={15} />Email</a>
          <a href={`${MAKER}/juone-susvilla.vcf`} className="sl-btn sl-btn-ghost sl-btn-sm"><UserPlus size={15} />Save contact</a>
        </div>
        <div className="sl-ctas sl-anim d3" style={{ marginTop: 12 }}>
          <a href="https://engineerjsusvilla.vercel.app/" target="_blank" rel="noopener noreferrer" className="sl-btn sl-btn-ghost sl-btn-sm"><Globe size={15} />engineerjsusvilla.vercel.app</a>
          <a href="https://j1-digital-marketing.vercel.app/" target="_blank" rel="noopener noreferrer" className="sl-btn sl-btn-ghost sl-btn-sm"><Sparkles size={15} />J1 Agency</a>
        </div>
      </div>
      <div className="sl-anim d2">
        <div className={`sl-flip ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(f => !f)}>
          <div className="sl-flip-in">
            <img src={`${MAKER}/calling-card-front.webp`} alt="Calling card: Engr. Juone Lenard S. Susvilla, founder of J1 Digital Marketing & AI Agency. Call 0948 044 2196, jlsusvilla01@gmail.com" />
            <img className="back" src={`${MAKER}/calling-card-back.webp`} alt="Calling card back with a QR code to engineerjsusvilla.vercel.app" />
          </div>
        </div>
        <div className="sl-hint">Hover or tap the card to flip it</div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0]));
  const [progress, setProgress] = useState(0);

  const go = (i: number) => refs.current[Math.max(0, Math.min(SLIDES.length - 1, i))]?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const i = Number((e.target as HTMLElement).dataset.i);
        if (e.isIntersecting) {
          setSeen(s => (s.has(i) ? s : new Set(s).add(i)));
          if (e.intersectionRatio >= 0.5) setActive(i);
        }
      });
    }, { threshold: [0.15, 0.5] });
    refs.current.forEach(el => el && io.observe(el));
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  // Keyboard: arrows, Page Up/Down and space move one slide, unless the visitor is typing.
  const activeRef = useRef(active);
  activeRef.current = active;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (["INPUT", "SELECT", "TEXTAREA"].includes(t.tagName) || t.isContentEditable || e.metaKey || e.ctrlKey || e.altKey) return;
      if (["ArrowDown", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(activeRef.current + 1); }
      if (["ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); go(activeRef.current - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const prev = document.title;
    document.title = "SolarIQ — Sales and project system for solar contractors";
    return () => { document.title = prev; };
  }, []);

  const body = useMemo(() => [
    <Hero go={go} />, <Pain />, <Fix />, <Leads />, <Proposals />, <Tracker />, <NetMetering />,
    <Reviews />, <MarketIntel />, <Local />, <Pricing />, <NextStep />, <Maker />,
  ], []);
  const onLight = !DARK.has(active);

  return (
    <div className="sl">
      <div className="sl-progress" style={{ width: `${progress}%` }} />
      <nav className={`sl-nav ${onLight ? "on-light" : ""}`}>
        <div className="sl-nav-in">
          <button className="sl-brand" style={{ background: "none", border: 0, padding: 0 }} onClick={() => go(0)} aria-label="SolarIQ, back to top">
            <span className="sl-logo"><Sun size={18} strokeWidth={2.5} /></span>SolarIQ
          </button>
          <div className="sl-nav-sp" />
          <span className="sl-count" aria-hidden="true"><b>{String(active + 1).padStart(2, "0")}</b> / {SLIDES.length}</span>
          <button className="sl-nav-link hide-sm" style={{ background: "none", border: 0 }} onClick={() => go(10)}>Pricing</button>
          <Link href="/signin" className="sl-nav-link">Sign in</Link>
          <Link href="/signup" className="sl-btn sl-btn-primary sl-btn-sm">Free trial</Link>
        </div>
      </nav>

      <div className="sl-dots" role="navigation" aria-label="Sections">
        {SLIDES.map((s, i) => <button key={s} className={i === active ? "on" : ""} onClick={() => go(i)} aria-label={`Go to ${s}`} title={s} />)}
      </div>

      {body.map((content, i) => (
        <section
          key={SLIDES[i]}
          id={`s${i + 1}`}
          data-i={i}
          ref={el => { refs.current[i] = el; }}
          className={`sl-slide ${DARK.has(i) ? "sl-dark" : ""} ${seen.has(i) ? "in" : ""}`}
          aria-label={SLIDES[i]}
        >
          {content}
          {i === 0 && (
            <button className="sl-scroll" style={{ background: "none", border: 0 }} onClick={() => go(1)}>
              <ChevronDown size={18} style={{ display: "block", margin: "0 auto 4px" }} />SCROLL OR PRESS ↓
            </button>
          )}
        </section>
      ))}

      <footer className="sl-foot">
        <div className="sl-wrap">
          <span>© {new Date().getFullYear()} SolarIQ · Iloilo City</span>
          <span style={{ flex: 1 }} />
          <Link href="/signup">Create a contractor account</Link>
          <Link href="/signin">Sign in</Link>
          <Link href="/admin" style={{ opacity: .5 }}>Admin</Link>
        </div>
      </footer>
    </div>
  );
}
