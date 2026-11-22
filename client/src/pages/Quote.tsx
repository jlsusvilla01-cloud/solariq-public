import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Sun, CheckCircle2, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { publicFetch } from "@/lib/api";
import { peso } from "@shared/solarMath";

type Contractor = { companyName: string; serviceArea: string | null; contactPhone: string | null; messengerUrl: string | null; utilityRate: number; hasPrices: boolean };

const field = "bg-white border-slate-300 text-slate-900 h-11 text-sm";

/** Public page a contractor shares on Facebook: collects the enquiry and shows an instant estimate. */
export default function QuotePage() {
  const { slug } = useParams<{ slug: string }>();
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", monthlyBill: "", systemInterest: "grid", message: "", website: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ estimate: any } | null>(null);

  useEffect(() => {
    publicFetch(`/api/public/contractors/${encodeURIComponent(slug)}`).then(setContractor).catch(() => setNotFound(true));
  }, [slug]);
  useEffect(() => { if (contractor) document.title = `Free solar quote · ${contractor.companyName}`; }, [contractor]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.phone.trim()) { setError("Please enter your name and mobile number."); return; }
    setSending(true);
    try {
      const bill = Number(form.monthlyBill.replace(/[,₱\s]/g, ""));
      const r = await publicFetch(`/api/public/quote/${encodeURIComponent(slug)}`, {
        method: "POST",
        body: JSON.stringify({ ...form, monthlyBill: Number.isFinite(bill) && bill > 0 ? bill : null }),
      });
      setDone({ estimate: r.estimate });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  if (notFound) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center text-slate-600">This quote page is not available. Please check the link with your installer.</div>;
  }
  if (!contractor) return <div className="min-h-screen bg-slate-50" />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-xl mx-auto px-5 py-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100"><Sun className="text-amber-500" size={24} /></div>
          <h1 className="text-2xl font-black">{contractor.companyName}</h1>
          <p className="text-slate-600 text-sm">Get a free solar estimate in one minute.{contractor.serviceArea ? ` Serving ${contractor.serviceArea}.` : ""}</p>
        </div>

        {done ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-green-700 font-bold"><CheckCircle2 size={18} />Thank you! We received your request.</div>
            <p className="text-sm text-slate-600">{contractor.companyName} will contact you shortly on {form.phone}.</p>
            {done.estimate && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Your rough estimate</div>
                <ul className="text-sm text-slate-800 space-y-1">
                  <li>Suggested system: <b>{done.estimate.systemKw} kW {done.estimate.systemType === "hybrid" ? "hybrid with battery" : "grid-tie"}</b></li>
                  <li>Estimated savings: <b>about {peso(done.estimate.monthlySavings)} a month</b></li>
                  {done.estimate.priceLow && <li>Typical price range: <b>{peso(done.estimate.priceLow)} – {peso(done.estimate.priceHigh)}</b></li>}
                  {done.estimate.paybackYears && <li>Pays for itself in about <b>{done.estimate.paybackYears.toFixed(1)} years</b></li>}
                </ul>
                <p className="text-[11px] text-slate-500">Based on ₱{done.estimate.utilityRate}/kWh and typical sun hours. Your final quote depends on a site visit.</p>
              </div>
            )}
            {contractor.messengerUrl && <a href={contractor.messengerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-[#0084ff] text-white font-bold text-sm"><MessageCircle size={16} />Chat with us on Messenger</a>}
          </div>
        ) : (
          <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="grid gap-3">
              <label className="text-xs font-semibold text-slate-700 space-y-1 block">Your name *<Input value={form.name} onChange={set("name")} autoComplete="name" className={field} /></label>
              <label className="text-xs font-semibold text-slate-700 space-y-1 block">Mobile number *<Input value={form.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" placeholder="0917 123 4567" className={field} /></label>
              <label className="text-xs font-semibold text-slate-700 space-y-1 block">Average monthly electric bill (₱)<Input value={form.monthlyBill} onChange={set("monthlyBill")} inputMode="numeric" placeholder="e.g. 6000" className={field} /></label>
              <label className="text-xs font-semibold text-slate-700 space-y-1 block">What do you want?
                <select value={form.systemInterest} onChange={set("systemInterest")} className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 text-sm">
                  <option value="grid">Lower my bill (grid-tie)</option>
                  <option value="hybrid">Lower my bill and keep power during brownouts (with battery)</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-700 space-y-1 block">Barangay / town<Input value={form.address} onChange={set("address")} autoComplete="address-level2" className={field} /></label>
              <label className="text-xs font-semibold text-slate-700 space-y-1 block">Email (optional)<Input value={form.email} onChange={set("email")} type="email" autoComplete="email" className={field} /></label>
              <label className="text-xs font-semibold text-slate-700 space-y-1 block">Anything else? (optional)<textarea value={form.message} onChange={set("message")} rows={2} className="w-full rounded-md border border-slate-300 p-3 text-sm" /></label>
              {/* Hidden from people; bots tend to fill it in. */}
              <input type="text" name="website" value={form.website} onChange={set("website")} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={sending} className="w-full h-12 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-base">{sending ? "Sending…" : "Get my free estimate"}</Button>
            <p className="text-[11px] text-slate-500 text-center">Your details go only to {contractor.companyName}, to prepare your quote.</p>
          </form>
        )}

        {(contractor.contactPhone || contractor.messengerUrl) && !done && (
          <div className="flex justify-center gap-4 text-sm">
            {contractor.contactPhone && <a href={`tel:${contractor.contactPhone}`} className="flex items-center gap-1.5 text-slate-600"><Phone size={14} />{contractor.contactPhone}</a>}
            {contractor.messengerUrl && <a href={contractor.messengerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#0084ff]"><MessageCircle size={14} />Messenger</a>}
          </div>
        )}
        <p className="text-center text-[10px] text-slate-400">Powered by SolarIQ</p>
      </div>
    </div>
  );
}
