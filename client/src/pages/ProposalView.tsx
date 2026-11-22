import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Sun, CheckCircle2, Printer, MessageCircle, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publicFetch } from "@/lib/api";
import { peso, ASSUMPTIONS } from "@shared/solarMath";

const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) : "");

/** Printable proposal the client opens from a link. Light theme so it prints cleanly. */
export default function ProposalView() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(false);

  const load = () => publicFetch(`/api/public/proposals/${encodeURIComponent(token)}`).then(setData).catch(e => setError(e.message));
  useEffect(() => { load(); }, [token]);
  useEffect(() => { if (data) document.title = `Solar proposal for ${data.proposal.clientName} · ${data.contractor.companyName}`; }, [data]);

  const accept = async () => {
    if (!window.confirm("Accept this proposal? The installer will contact you to schedule the site survey.")) return;
    setAccepting(true);
    try {
      await publicFetch(`/api/public/proposals/${encodeURIComponent(token)}/accept`, { method: "POST" });
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAccepting(false);
    }
  };

  if (error && !data) return <div className="min-h-screen flex items-center justify-center p-6 text-slate-600 bg-slate-50">{error}</div>;
  if (!data) return <div className="min-h-screen bg-slate-50" />;
  const { proposal: p, contractor: c } = data;
  const r = p.result, i = p.inputs;
  const expired = p.validUntil && new Date(p.validUntil + "T23:59:59") < new Date();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white">
      <div className="max-w-3xl mx-auto p-5 sm:p-10 space-y-6">
        <div className="flex justify-end gap-2 print:hidden">
          <Button variant="outline" onClick={() => window.print()} className="gap-1.5 text-xs"><Printer size={14} />Print or save as PDF</Button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 space-y-8 print:shadow-none print:border-0 print:p-0">
          <header className="flex flex-wrap justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center"><Sun className="text-amber-500" size={22} /></div>
              <div>
                <div className="text-lg font-black">{c.companyName}</div>
                {c.serviceArea && <div className="text-xs text-slate-500">{c.serviceArea}</div>}
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div className="font-bold text-slate-700 text-sm">Solar proposal</div>
              <div>Prepared {fmt(p.createdAt)}</div>
              <div>Valid until {fmt(p.validUntil)}</div>
            </div>
          </header>

          <section>
            <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">Prepared for</div>
            <div className="text-xl font-black">{p.clientName}</div>
            {p.address && <div className="text-sm text-slate-600">{p.address}</div>}
          </section>

          <section className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
              <div className="text-[11px] uppercase tracking-wider text-amber-700 font-bold">You save about</div>
              <div className="text-2xl font-black">{peso(r.monthlySavings)}<span className="text-sm font-bold text-slate-500">/month</span></div>
              <div className="text-xs text-slate-600 mt-1">Bill goes from {peso(i.monthlyBill)} to about {peso(r.newMonthlyBill)}</div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Total investment</div>
              <div className="text-2xl font-black">{peso(r.totalPrice)}</div>
              <div className="text-xs text-slate-600 mt-1">{r.systemKw} kW {i.systemType === "hybrid" ? `hybrid${i.batteryKwh ? ` with ${i.batteryKwh} kWh battery` : " with battery"}` : "grid-tie"}</div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Pays for itself in</div>
              <div className="text-2xl font-black">{r.paybackYears ? `${r.paybackYears.toFixed(1)} years` : "—"}</div>
              <div className="text-xs text-slate-600 mt-1">About {peso(r.tenYearSavings)} saved over 10 years</div>
            </div>
          </section>

          {r.financed && (
            <section className="rounded-xl border-2 border-amber-300 p-5">
              <div className="text-sm font-black">Instalment option</div>
              <p className="text-sm text-slate-700 mt-1">
                {r.downPayment > 0 ? `${peso(r.downPayment)} down payment, then ` : ""}<b>{peso(r.monthlyPayment)} a month for {r.financeMonths} months</b>
                {i.financeAprPct ? ` (${i.financeAprPct}% interest per year)` : " (no interest)"}.
                {r.monthlyPayment <= r.monthlySavings ? " Your monthly savings cover the payment." : ""}
              </p>
            </section>
          )}

          <section>
            <div className="text-sm font-black mb-2">System details</div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {[
                  ["System size", `${r.systemKw} kW`],
                  ["Type", i.systemType === "hybrid" ? "Hybrid (solar + battery backup during brownouts)" : "Grid-tie with net metering"],
                  ...(i.systemType === "hybrid" && i.batteryKwh ? [["Battery", `${i.batteryKwh} kWh`]] : []),
                  ["Estimated production", `about ${Math.round(r.monthlyProductionKwh)} kWh a month`],
                  ["Your current use", `about ${Math.round(r.monthlyKwh)} kWh a month (₱${i.utilityRate}/kWh)`],
                ].map(([k, v]) => <tr key={k}><td className="py-2 text-slate-500 w-48">{k}</td><td className="py-2 font-medium">{v}</td></tr>)}
              </tbody>
            </table>
            {p.notes && <p className="text-sm text-slate-700 mt-3 whitespace-pre-line">{p.notes}</p>}
          </section>

          <section className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-200 pt-4">
            Estimates assume about {ASSUMPTIONS.kwhPerKwMonth} kWh per kW each month, that you use {Math.round(ASSUMPTIONS.selfUseShare[i.systemType as "grid" | "hybrid"] * 100)}% of the solar power directly,
            and that exported power is credited at about ₱{ASSUMPTIONS.exportCreditPerKwh}/kWh under net metering. Actual savings depend on weather, your usage and future electricity rates. Final price is confirmed after a site survey.
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
            <div className="text-sm text-slate-600 space-y-1">
              {c.contactPhone && <div className="flex items-center gap-2"><Phone size={14} />{c.contactPhone}</div>}
              {c.contactEmail && <div className="flex items-center gap-2"><Mail size={14} />{c.contactEmail}</div>}
              {c.messengerUrl && <a href={c.messengerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#0084ff] print:hidden"><MessageCircle size={14} />Message us on Messenger</a>}
            </div>
            <div className="print:hidden">
              {p.status === "accepted" ? (
                <div className="flex items-center gap-2 text-green-700 font-bold"><CheckCircle2 size={18} />Accepted {fmt(p.acceptedAt)}</div>
              ) : p.status === "declined" ? (
                <div className="text-slate-500 text-sm">This proposal is closed.</div>
              ) : expired ? (
                <div className="text-slate-500 text-sm">This proposal has expired. Ask {c.companyName} for an updated one.</div>
              ) : (
                <Button onClick={accept} disabled={accepting} className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-black h-11 px-6">{accepting ? "Sending…" : "Accept proposal"}</Button>
              )}
              {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
            </div>
          </footer>
        </div>
        <p className="text-center text-[10px] text-slate-400 print:hidden">Powered by SolarIQ</p>
      </div>
    </div>
  );
}
