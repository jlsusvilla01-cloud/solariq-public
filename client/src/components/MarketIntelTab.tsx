import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Competitor, InsertCompetitor } from "@shared/schema";
import { Plus, Trash2, Edit2, Crosshair, ExternalLink, Megaphone, Download, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MARKET_PACKS, type MarketPack } from "@/lib/marketPacks";

type ApiFetch = (url: string, opts?: any) => Promise<any>;

const SETTINGS_KEY = "solariq_market_intel_settings";

// Payback model assumptions, shown to the user next to the result.
const KWH_PER_KW_MONTH = 120; // about 4 peak sun hours a day
const SELF_USE_SHARE = 0.6;
const EXPORT_CREDIT = 6; // PHP per kWh credited for exported energy

type Settings = { rate: string; myGridTie: string; myHybrid: string };
const DEFAULT_SETTINGS: Settings = { rate: "", myGridTie: "", myHybrid: "" };

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
function saveSettings(s: Settings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
}

type FormState = {
  name: string; baseLocation: string; region: string; segment: string; systemTypes: string;
  gridTiePricePerKw: string; hybridPricePerKw: string; warrantyYears: string;
  offersFinancing: boolean; publishesPrices: boolean; netMeteringService: boolean;
  strengths: string; weaknesses: string; website: string; sourceUrl: string; threatLevel: string;
};
const EMPTY_FORM: FormState = {
  name: "", baseLocation: "", region: "", segment: "residential", systemTypes: "",
  gridTiePricePerKw: "", hybridPricePerKw: "", warrantyYears: "",
  offersFinancing: false, publishesPrices: false, netMeteringService: false,
  strengths: "", weaknesses: "", website: "", sourceUrl: "", threatLevel: "medium",
};

const num = (v: string): number | null => {
  const n = Number(String(v).replace(/,/g, ""));
  return v.trim() !== "" && Number.isFinite(n) && n > 0 ? n : null;
};
const peso = (n: number) => `₱${Math.round(n).toLocaleString("en-PH")}`;
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const safeUrl = (u?: string | null) => (u && /^https?:\/\//i.test(u) ? u : null);

function toPayload(f: FormState): InsertCompetitor {
  return {
    name: f.name.trim(),
    baseLocation: f.baseLocation.trim() || null,
    region: f.region.trim(),
    segment: f.segment as InsertCompetitor["segment"],
    systemTypes: f.systemTypes.trim() || null,
    gridTiePricePerKw: num(f.gridTiePricePerKw),
    hybridPricePerKw: num(f.hybridPricePerKw),
    warrantyYears: num(f.warrantyYears) === null ? null : Math.round(num(f.warrantyYears) as number),
    offersFinancing: f.offersFinancing ? 1 : 0,
    publishesPrices: f.publishesPrices ? 1 : 0,
    netMeteringService: f.netMeteringService ? 1 : 0,
    strengths: f.strengths.trim() || null,
    weaknesses: f.weaknesses.trim() || null,
    website: f.website.trim() || null,
    sourceUrl: f.sourceUrl.trim() || null,
    threatLevel: f.threatLevel as InsertCompetitor["threatLevel"],
    lastChecked: new Date().toISOString().slice(0, 10),
  };
}
function toForm(c: Competitor): FormState {
  return {
    name: c.name, baseLocation: c.baseLocation || "", region: c.region || "", segment: c.segment,
    systemTypes: c.systemTypes || "",
    gridTiePricePerKw: c.gridTiePricePerKw ? String(c.gridTiePricePerKw) : "",
    hybridPricePerKw: c.hybridPricePerKw ? String(c.hybridPricePerKw) : "",
    warrantyYears: c.warrantyYears != null ? String(c.warrantyYears) : "",
    offersFinancing: !!c.offersFinancing, publishesPrices: !!c.publishesPrices, netMeteringService: !!c.netMeteringService,
    strengths: c.strengths || "", weaknesses: c.weaknesses || "", website: c.website || "", sourceUrl: c.sourceUrl || "",
    threatLevel: c.threatLevel,
  };
}

/** Simple payback in years for a grid-tie system at a given price per kW and utility rate. */
function paybackYears(pricePerKw: number, rate: number): number {
  const monthlySavingPerKw = KWH_PER_KW_MONTH * (SELF_USE_SHARE * rate + (1 - SELF_USE_SHARE) * EXPORT_CREDIT);
  return pricePerKw / (monthlySavingPerKw * 12);
}

const inputCls = "bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white text-xs";
const selectCls = "bg-[hsl(220_20%_13%)] border border-[hsl(220_18%_22%)] text-white text-xs rounded-lg px-3 py-2";
const panelCls = "bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_16%)] rounded-2xl";
const threatColor: Record<string, string> = {
  high: "text-red-400 bg-red-400/10 border-red-400/20",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  low: "text-green-400 bg-green-400/10 border-green-400/20",
};

function PriceBars({ title, rows, mine }: { title: string; rows: { name: string; price: number }[]; mine: number | null }) {
  const all = [...rows, ...(mine ? [{ name: "Your price", price: mine }] : [])].sort((a, b) => a.price - b.price);
  const max = Math.max(...all.map(r => r.price), 1);
  return (
    <div className={`${panelCls} p-5`}>
      <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-4">{title} · ₱ per kW</div>
      {all.length === 0 ? (
        <p className="text-xs text-white/30">No published prices recorded yet.</p>
      ) : (
        <div className="space-y-2.5">
          {all.map(r => {
            const isMine = r.name === "Your price";
            return (
              <div key={r.name} className="flex items-center gap-3">
                <div className={`w-32 shrink-0 truncate text-[11px] ${isMine ? "text-[#fbbf24] font-black" : "text-white/60"}`}>{r.name}</div>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${isMine ? "bg-[#fbbf24]" : "bg-sky-400/70"}`} style={{ width: `${(r.price / max) * 100}%` }} />
                </div>
                <div className={`w-20 text-right text-[11px] tabular-nums ${isMine ? "text-[#fbbf24] font-black" : "text-white/70"}`}>{peso(r.price)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MarketIntelTab({ apiFetch, base = "/api/admin" }: { apiFetch: ApiFetch; base?: string }) {
  const API = `${base}/competitors`;
  const { toast } = useToast();
  const { data: competitors = [], refetch, isLoading, isError } = useQuery<Competitor[]>({ queryKey: [API], queryFn: () => apiFetch(API) });
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [regionFilter, setRegionFilter] = useState("all");
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [importing, setImporting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // The form sits above the list, so bring it into view when it opens from a card further down.
  useEffect(() => {
    if (editingId !== null) formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [editingId]);

  const updateSettings = (patch: Partial<Settings>) => {
    setSettings(prev => { const next = { ...prev, ...patch }; saveSettings(next); return next; });
  };

  const saveMut = useMutation({
    mutationFn: (payload: InsertCompetitor) =>
      editingId === "new"
        ? apiFetch(API, { method: "POST", body: JSON.stringify(payload) })
        : apiFetch(`${API}/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: () => { refetch(); setEditingId(null); setForm(EMPTY_FORM); toast({ title: "Competitor saved" }); },
    onError: () => toast({ title: "Could not save competitor", description: "Check the name, prices and that links start with https://", variant: "destructive" }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => apiFetch(`${API}/${id}`, { method: "DELETE" }),
    onSuccess: () => { refetch(); toast({ title: "Competitor removed" }); },
    onError: () => toast({ title: "Could not remove competitor", variant: "destructive" }),
  });

  const importPack = async (pack: MarketPack) => {
    const existing = new Set(competitors.map(c => c.name.toLowerCase()));
    const fresh = pack.competitors.filter(c => !existing.has(c.name.toLowerCase()));
    if (fresh.length === 0) { toast({ title: `${pack.label} is already loaded` }); return; }
    setImporting(true);
    let added = 0;
    try {
      for (const c of fresh) {
        await apiFetch(API, { method: "POST", body: JSON.stringify({ ...c, lastChecked: pack.asOf }) });
        added++;
      }
      if (!settings.rate) updateSettings({ rate: String(pack.utilityRate) });
      setRegionFilter(pack.region);
      toast({ title: `Loaded ${added} competitors`, description: `${pack.label}, data as of ${pack.asOf}. Verify before quoting.` });
    } catch {
      toast({ title: "Import stopped early", description: `${added} of ${fresh.length} competitors were added.`, variant: "destructive" });
    } finally {
      setImporting(false);
      refetch();
    }
  };

  const regions = useMemo(() => Array.from(new Set(competitors.map(c => c.region).filter(Boolean))).sort(), [competitors]);
  const shown = useMemo(
    () => (regionFilter === "all" ? competitors : competitors.filter(c => c.region === regionFilter)),
    [competitors, regionFilter],
  );

  const stats = useMemo(() => {
    const grid = shown.filter(c => c.gridTiePricePerKw).map(c => ({ name: c.name, price: c.gridTiePricePerKw as number }));
    const hybrid = shown.filter(c => c.hybridPricePerKw).map(c => ({ name: c.name, price: c.hybridPricePerKw as number }));
    return {
      grid, hybrid,
      avgGrid: avg(grid.map(r => r.price)),
      avgHybrid: avg(hybrid.map(r => r.price)),
      noFinancing: shown.filter(c => !c.offersFinancing).length,
      noPrices: shown.filter(c => !c.publishesPrices).length,
      noNetMetering: shown.filter(c => !c.netMeteringService).length,
      shortWarranty: shown.filter(c => c.warrantyYears != null && c.warrantyYears < 25).length,
    };
  }, [shown]);

  const rate = num(settings.rate);
  const myGrid = num(settings.myGridTie);
  const myHybrid = num(settings.myHybrid);

  // Openings are derived from what competitors do not offer. A gap is listed when most tracked rivals lack it.
  const openings = useMemo(() => {
    const n = shown.length;
    if (n === 0) return [];
    const most = (count: number) => count / n >= 0.6;
    const list: { title: string; detail: string }[] = [];
    if (most(stats.noFinancing)) list.push({ title: "Lead with financing", detail: `${stats.noFinancing} of ${n} tracked competitors do not advertise financing. Quote a monthly payment next to the customer's current bill.` });
    if (most(stats.noNetMetering)) list.push({ title: "Sell done-for-you net metering", detail: `${stats.noNetMetering} of ${n} do not promote a net-metering service. Offer paperwork handling as a fixed-fee add-on.` });
    if (most(stats.noPrices)) list.push({ title: "Publish fixed packages", detail: `${stats.noPrices} of ${n} do not publish prices. A clear price list wins comparison shoppers and search traffic.` });
    if (stats.shortWarranty > 0) list.push({ title: "Compete on warranty", detail: `${stats.shortWarranty} ${stats.shortWarranty > 1 ? "competitors quote" : "competitor quotes"} a panel warranty under 25 years. Put a written workmanship warranty in every proposal.` });
    if (myGrid && stats.avgGrid) {
      const diff = ((myGrid - stats.avgGrid) / stats.avgGrid) * 100;
      list.push(diff <= 0
        ? { title: "You are priced below the grid-tie average", detail: `Your ${peso(myGrid)} per kW is ${Math.abs(diff).toFixed(0)}% under the ${peso(stats.avgGrid)} average. There may be room to raise price or add services.` }
        : { title: "You are priced above the grid-tie average", detail: `Your ${peso(myGrid)} per kW is ${diff.toFixed(0)}% over the ${peso(stats.avgGrid)} average. Justify it with warranty, brands and after-sales, or review costs.` });
    }
    return list;
  }, [shown, stats, myGrid]);

  const startAdd = () => { setForm({ ...EMPTY_FORM, region: regionFilter === "all" ? "" : regionFilter }); setEditingId("new"); };
  const startEdit = (c: Competitor) => { setForm(toForm(c)); setEditingId(c.id); };
  const submit = () => {
    if (!form.name.trim()) { toast({ title: "Competitor name is required", variant: "destructive" }); return; }
    saveMut.mutate(toPayload(form));
  };
  const set = (patch: Partial<FormState>) => setForm(f => ({ ...f, ...patch }));

  const adLibraryUrl = (name: string) =>
    `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=PH&search_type=keyword_unordered&q=${encodeURIComponent(name)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-4 justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Crosshair size={24} className="text-[#fbbf24]" /> Market Intel
          </h2>
          <p className="text-white/40 text-sm mt-1">Track competitors, compare pricing and find openings in your market.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {MARKET_PACKS.map(pack => (
            <Button key={pack.region} variant="outline" disabled={importing} onClick={() => importPack(pack)} className="border-[hsl(220_18%_22%)] text-white/70 text-xs h-9 gap-1.5">
              <Download size={13} /> {importing ? "Loading…" : `Load ${pack.label}`}
            </Button>
          ))}
          <Button onClick={startAdd} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs h-9 gap-1.5"><Plus size={14} />Add Competitor</Button>
        </div>
      </div>

      {/* Your position */}
      <div className={`${panelCls} p-5`}>
        <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-3">Your position</div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <label className="text-[10px] text-white/40 space-y-1">Utility rate (₱/kWh)
            <Input inputMode="decimal" placeholder="e.g. 15.68" value={settings.rate} onChange={e => updateSettings({ rate: e.target.value })} className={inputCls} />
          </label>
          <label className="text-[10px] text-white/40 space-y-1">Your grid-tie price (₱/kW)
            <Input inputMode="numeric" placeholder="e.g. 42000" value={settings.myGridTie} onChange={e => updateSettings({ myGridTie: e.target.value })} className={inputCls} />
          </label>
          <label className="text-[10px] text-white/40 space-y-1">Your hybrid price (₱/kW)
            <Input inputMode="numeric" placeholder="e.g. 58000" value={settings.myHybrid} onChange={e => updateSettings({ myHybrid: e.target.value })} className={inputCls} />
          </label>
          <label className="text-[10px] text-white/40 space-y-1">Market
            <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className={`${selectCls} w-full block`}>
              <option value="all">All markets</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
        </div>
        {rate && (myGrid || stats.avgGrid) ? (
          <p className="text-[11px] text-white/50 mt-3">
            Estimated grid-tie payback at ₱{rate}/kWh:
            {myGrid ? <> yours <span className="text-[#fbbf24] font-black">{paybackYears(myGrid, rate).toFixed(1)} yrs</span></> : null}
            {myGrid && stats.avgGrid ? " ·" : ""}
            {stats.avgGrid ? <> competitor average <span className="text-white font-bold">{paybackYears(stats.avgGrid, rate).toFixed(1)} yrs</span></> : null}
            <span className="text-white/30"> — assumes {KWH_PER_KW_MONTH} kWh per kW each month, {SELF_USE_SHARE * 100}% used on site, exports credited at ₱{EXPORT_CREDIT}/kWh.</span>
          </p>
        ) : null}
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Competitors tracked", val: String(shown.length) },
          { label: "Avg grid-tie ₱/kW", val: stats.avgGrid ? peso(stats.avgGrid) : "—" },
          { label: "Avg hybrid ₱/kW", val: stats.avgHybrid ? peso(stats.avgHybrid) : "—" },
          { label: "Offer financing", val: shown.length ? `${shown.length - stats.noFinancing} of ${shown.length}` : "—" },
        ].map(t => (
          <div key={t.label} className={`${panelCls} p-4 text-center`}>
            <div className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">{t.label}</div>
            <div className="text-xl font-black text-white tabular-nums">{t.val}</div>
          </div>
        ))}
      </div>

      {/* Add / edit form */}
      {editingId !== null && (
        <div ref={formRef} className={`${panelCls} p-5 space-y-3`}>
          <div className="text-sm font-black text-white">{editingId === "new" ? "Add competitor" : "Edit competitor"}</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="Company name *" value={form.name} onChange={e => set({ name: e.target.value })} className={inputCls} />
            <Input placeholder="Based in (city)" value={form.baseLocation} onChange={e => set({ baseLocation: e.target.value })} className={inputCls} />
            <Input placeholder="Market / region (e.g. Iloilo)" value={form.region} onChange={e => set({ region: e.target.value })} className={inputCls} />
            <select value={form.segment} onChange={e => set({ segment: e.target.value })} className={selectCls}>
              {["residential", "commercial", "mixed", "government"].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
            <Input placeholder="System types (grid-tie, hybrid…)" value={form.systemTypes} onChange={e => set({ systemTypes: e.target.value })} className={inputCls} />
            <select value={form.threatLevel} onChange={e => set({ threatLevel: e.target.value })} className={selectCls}>
              {["low", "medium", "high"].map(s => <option key={s} value={s}>{s.toUpperCase()} THREAT</option>)}
            </select>
            <Input inputMode="numeric" placeholder="Grid-tie ₱ per kW" value={form.gridTiePricePerKw} onChange={e => set({ gridTiePricePerKw: e.target.value })} className={inputCls} />
            <Input inputMode="numeric" placeholder="Hybrid ₱ per kW" value={form.hybridPricePerKw} onChange={e => set({ hybridPricePerKw: e.target.value })} className={inputCls} />
            <Input inputMode="numeric" placeholder="Panel warranty (years)" value={form.warrantyYears} onChange={e => set({ warrantyYears: e.target.value })} className={inputCls} />
            <Input placeholder="Website (https://…)" value={form.website} onChange={e => set({ website: e.target.value })} className={inputCls} />
            <Input placeholder="Source of this data (https://…)" value={form.sourceUrl} onChange={e => set({ sourceUrl: e.target.value })} className={`${inputCls} sm:col-span-2`} />
            <Input placeholder="Strengths" value={form.strengths} onChange={e => set({ strengths: e.target.value })} className={`${inputCls} sm:col-span-3`} />
            <Input placeholder="Weak spots / notes" value={form.weaknesses} onChange={e => set({ weaknesses: e.target.value })} className={`${inputCls} sm:col-span-3`} />
          </div>
          <div className="flex flex-wrap gap-4 text-[11px] text-white/60">
            {([["offersFinancing", "Offers financing"], ["publishesPrices", "Publishes prices"], ["netMeteringService", "Net-metering service"]] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[key]} onChange={e => set({ [key]: e.target.checked } as Partial<FormState>)} className="accent-[#fbbf24]" /> {label}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={submit} disabled={saveMut.isPending} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold text-xs h-8">{saveMut.isPending ? "Saving…" : "Save"}</Button>
            <Button variant="outline" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }} className="border-[hsl(220_18%_22%)] text-white/60 text-xs h-8">Cancel</Button>
          </div>
        </div>
      )}

      {/* Price positioning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PriceBars title="Grid-tie" rows={stats.grid} mine={myGrid} />
        <PriceBars title="Hybrid with battery" rows={stats.hybrid} mine={myHybrid} />
      </div>

      {/* Openings */}
      {openings.length > 0 && (
        <div className={`${panelCls} p-5`}>
          <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-3 flex items-center gap-2"><Lightbulb size={12} className="text-[#fbbf24]" /> Openings in this market</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {openings.map(o => (
              <div key={o.title} className="border border-[#fbbf24]/15 bg-[#fbbf24]/5 rounded-xl p-3">
                <div className="text-xs font-black text-white mb-1">{o.title}</div>
                <p className="text-[11px] text-white/50 leading-relaxed">{o.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitor list */}
      <div className="space-y-3">
        {isLoading && <div className="text-xs text-white/30 p-4">Loading competitors…</div>}
        {isError && <div className="text-xs text-red-400 border border-red-500/20 bg-red-500/5 rounded-xl p-4">Could not load competitors. Sign out and back in, then try again.</div>}
        {!isLoading && !isError && shown.length === 0 && (
          <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-sm text-white/40">No competitors tracked yet.</p>
            <p className="text-[11px] text-white/25 mt-1">Add one, or load a market pack to start from researched data.</p>
          </div>
        )}
        {shown.map(c => {
          const site = safeUrl(c.website);
          const source = safeUrl(c.sourceUrl);
          return (
            <div key={c.id} className={`${panelCls} p-4`}>
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm">{c.name}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-black uppercase ${threatColor[c.threatLevel] || threatColor.medium}`}>{c.threatLevel} threat</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/50 uppercase font-bold">{c.segment}</span>
                  </div>
                  <div className="text-[10px] text-white/40 mt-1">
                    {[c.baseLocation, c.region && `Market: ${c.region}`, c.systemTypes, c.lastChecked && `Checked ${c.lastChecked}`].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <div className="flex gap-6 text-right">
                  <div><div className="text-[9px] text-white/30 uppercase font-black">Grid-tie</div><div className="text-xs font-bold text-white tabular-nums">{c.gridTiePricePerKw ? `${peso(c.gridTiePricePerKw)}/kW` : "—"}</div></div>
                  <div><div className="text-[9px] text-white/30 uppercase font-black">Hybrid</div><div className="text-xs font-bold text-white tabular-nums">{c.hybridPricePerKw ? `${peso(c.hybridPricePerKw)}/kW` : "—"}</div></div>
                  <div><div className="text-[9px] text-white/30 uppercase font-black">Warranty</div><div className="text-xs font-bold text-white tabular-nums">{c.warrantyYears != null ? `${c.warrantyYears} yrs` : "—"}</div></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[["Financing", c.offersFinancing], ["Published prices", c.publishesPrices], ["Net-metering service", c.netMeteringService]].map(([label, on]) => (
                  <span key={label as string} className={`text-[9px] px-2 py-0.5 rounded border font-bold ${on ? "text-green-400 border-green-400/20 bg-green-400/5" : "text-white/30 border-white/10"}`}>{on ? "✓" : "✗"} {label}</span>
                ))}
              </div>
              {(c.strengths || c.weaknesses) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-[11px] leading-relaxed">
                  {c.strengths && <p className="text-white/60"><span className="text-white/30 font-black uppercase text-[9px] mr-1">Strengths</span>{c.strengths}</p>}
                  {c.weaknesses && <p className="text-white/60"><span className="text-white/30 font-black uppercase text-[9px] mr-1">Weak spots</span>{c.weaknesses}</p>}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5">
                {site && <a href={site} target="_blank" rel="noopener noreferrer" className="text-[10px] text-sky-400 hover:underline flex items-center gap-1"><ExternalLink size={10} />Website</a>}
                {source && <a href={source} target="_blank" rel="noopener noreferrer" className="text-[10px] text-sky-400 hover:underline flex items-center gap-1"><ExternalLink size={10} />Source</a>}
                <a href={adLibraryUrl(c.name)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-sky-400 hover:underline flex items-center gap-1"><Megaphone size={10} />See their Facebook ads</a>
                <div className="flex-1" />
                <Button variant="outline" onClick={() => startEdit(c)} className="border-[hsl(220_18%_22%)] text-white/60 text-[10px] h-7 px-2 gap-1"><Edit2 size={11} />Edit</Button>
                <Button variant="outline" disabled={deleteMut.isPending} onClick={() => { if (window.confirm(`Remove ${c.name} from Market Intel?`)) deleteMut.mutate(c.id); }} className="border-red-500/20 text-red-400 text-[10px] h-7 px-2 gap-1"><Trash2 size={11} />Remove</Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
