import { useState } from "react";
import { CheckCircle2, Zap, Shield, Crown, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS, type BillingCycle } from "@shared/plans";

interface PaywallProps {
  /** Starts PayMongo checkout; resolves after redirecting, rejects with a message to show. */
  onCheckout: (plan: string, billingCycle: BillingCycle) => Promise<void>;
  onDismiss?: () => void;
  expired?: boolean;
}

const ICONS = { starter: Zap, professional: Shield, enterprise: Crown } as const;

export default function Paywall({ onCheckout, onDismiss, expired = true }: PaywallProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("month");
  const [selectedPlan, setSelectedPlan] = useState<string>("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    setError("");
    setLoading(true);
    try {
      await onCheckout(selectedPlan, billingCycle);
    } catch (e: any) {
      setError(e?.message || "The payment page could not be opened.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative bg-[hsl(220_28%_6%)] max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-[hsl(220_18%_18%)] shadow-2xl p-8">
        {onDismiss && (
          <button onClick={onDismiss} className="absolute top-4 right-4 text-white/30 hover:text-white" aria-label="Close"><X size={20} /></button>
        )}
        <div className="text-center mb-8">
          {expired && (
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Zap size={12} /> Your free trial has ended
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">{expired ? "Choose your plan to continue" : "Choose your plan"}</h2>
          <p className="text-white/40 text-sm">Your projects, leads and proposals stay saved.</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm ${billingCycle === "month" ? "text-white font-bold" : "text-white/40"}`}>Monthly</span>
          <button onClick={() => setBillingCycle(c => (c === "month" ? "year" : "month"))} className="w-12 h-6 bg-[hsl(220_18%_18%)] rounded-full relative p-1" aria-label="Switch billing period">
            <div className={`w-4 h-4 bg-[#fbbf24] rounded-full transition-transform duration-300 ${billingCycle === "year" ? "translate-x-6" : "translate-x-0"}`} />
          </button>
          <span className={`text-sm ${billingCycle === "year" ? "text-white font-bold" : "text-white/40"}`}>Annually <span className="text-[#fbbf24] text-xs font-bold ml-1">Save 20%</span></span>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {PLANS.map(plan => {
            const price = billingCycle === "month" ? plan.monthlyPrice : plan.yearlyPrice;
            const Icon = ICONS[plan.id];
            const selected = selectedPlan === plan.id;
            return (
              <button key={plan.id} onClick={() => setSelectedPlan(plan.id)} className={`text-left h-full flex flex-col justify-start rounded-2xl border p-5 transition-all ${selected ? "border-[#fbbf24] bg-[#fbbf24]/5" : "border-[hsl(220_18%_18%)] hover:border-white/20"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className="text-[#fbbf24]" />
                  <span className="font-black text-white">{plan.name}</span>
                  {plan.highlighted && <span className="text-[9px] bg-[#fbbf24] text-black font-black px-1.5 py-0.5 rounded">POPULAR</span>}
                </div>
                <div className="text-white/40 text-xs mb-3">{plan.description}</div>
                <div className="text-2xl font-black text-white">₱{price.toLocaleString("en-PH")}<span className="text-xs text-white/40 font-bold">/{billingCycle === "month" ? "mo" : "yr"}</span></div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map(f => <li key={f} className="flex gap-2 text-[11px] text-white/60"><CheckCircle2 size={12} className="text-green-400 shrink-0 mt-0.5" />{f}</li>)}
                </ul>
              </button>
            );
          })}
        </div>

        {error && <p className="text-center text-sm text-orange-300 mt-6">{error}</p>}
        <div className="flex flex-col items-center gap-2 mt-8">
          <Button onClick={handleCheckout} disabled={loading} className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-black h-11 px-8">
            {loading ? "Opening secure payment…" : "Continue to payment"}
          </Button>
          <p className="text-[11px] text-white/35 flex items-center gap-1.5"><Lock size={11} />Pay with GCash, Maya or card on PayMongo's secure page.</p>
        </div>
      </div>
    </div>
  );
}
