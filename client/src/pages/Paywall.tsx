import { useState } from "react";
import { CheckCircle2, Zap, Shield, Crown, CreditCard, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaywallProps {
  onSubscribe: (plan: string, billingCycle: string) => Promise<void>;
  onDismiss?: () => void;
  isOverlay?: boolean;
}

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    monthlyPrice: 1999,
    yearlyPrice: 19190,
    description: "For solo contractors",
    features: [
      "Up to 10 active projects",
      "Client progress tracker",
      "Basic IoT monitoring",
      "Email notifications",
      "QR code sharing",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    icon: Shield,
    monthlyPrice: 4999,
    yearlyPrice: 47990,
    description: "For growing teams",
    highlighted: true,
    features: [
      "Unlimited projects",
      "Full ERP modules",
      "AI Solar Designer",
      "Inventory management",
      "Client portal with messaging",
      "Crew scheduling",
      "Financial reports",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Crown,
    monthlyPrice: 9999,
    yearlyPrice: 95990,
    description: "For large operations",
    features: [
      "Everything in Professional",
      "Multi-tenant white-label",
      "HR & payroll module",
      "Compliance calendar",
      "Priority support",
      "Custom integrations",
      "Dedicated account manager",
    ],
  },
];

export default function Paywall({ onSubscribe, onDismiss, isOverlay = true }: PaywallProps) {
  const [billingCycle, setBillingCycle] = useState<"month" | "year">("month");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [step, setStep] = useState<"plans" | "checkout" | "success">("plans");
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const handleCheckout = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      await onSubscribe(selectedPlan, billingCycle);
      setStep("success");
    } catch (e) {
      console.error("Subscription failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className={`${isOverlay ? "fixed inset-0 z-50 flex items-center justify-center p-4" : ""}`}>
      {isOverlay && <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />}

      <div className={`relative bg-[hsl(220_28%_6%)] ${isOverlay ? "max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-[hsl(220_18%_18%)] shadow-2xl" : "w-full"}`}>
        {/* Close button */}
        {onDismiss && isOverlay && (
          <button onClick={onDismiss} className="absolute top-4 right-4 text-white/30 hover:text-white z-10">
            <X size={20} />
          </button>
        )}

        {step === "plans" && (
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                <Zap size={12} /> Your free trial has ended
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Choose your plan to continue</h2>
              <p className="text-white/40 text-sm">Unlock the full power of SolarIQ for your solar business</p>
            </div>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm ${billingCycle === "month" ? "text-white font-bold" : "text-white/40"}`}>Monthly</span>
              <button
                onClick={() => setBillingCycle(c => c === "month" ? "year" : "month")}
                className="w-12 h-6 bg-[hsl(220_18%_18%)] rounded-full relative p-1 transition-colors hover:bg-[hsl(220_18%_24%)]"
              >
                <div className={`w-4 h-4 bg-[#fbbf24] rounded-full transition-transform duration-300 ${billingCycle === "year" ? "translate-x-6" : "translate-x-0"}`} />
              </button>
              <span className={`text-sm ${billingCycle === "year" ? "text-white font-bold" : "text-white/40"}`}>
                Annually <span className="text-[#fbbf24] text-xs font-bold ml-1">Save 20%</span>
              </span>
            </div>

            {/* Plans grid */}
            <div className="grid sm:grid-cols-3 gap-4">
              {PLANS.map(plan => {
                const price = billingCycle === "month" ? plan.monthlyPrice : plan.yearlyPrice;
                const Icon = plan.icon;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative bg-[hsl(220_24%_9%)] rounded-2xl p-6 flex flex-col border transition-all cursor-pointer ${
                      selectedPlan === plan.id
                        ? "border-[#fbbf24] ring-2 ring-[#fbbf24]/20"
                        : plan.highlighted
                        ? "border-[#fbbf24]/40 hover:border-[#fbbf24]"
                        : "border-[hsl(220_18%_18%)] hover:border-[#fbbf24]/30"
                    }`}
                  >
                    {plan.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-[#fbbf24] text-[hsl(220_28%_6%)] text-[10px] font-bold px-3 py-1 rounded-full">Most Popular</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${plan.highlighted ? "bg-[#fbbf24]/15 text-[#fbbf24]" : "bg-white/5 text-white/50"}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{plan.name}</div>
                        <div className="text-[10px] text-white/30">{plan.description}</div>
                      </div>
                    </div>
                    <div className="flex items-end gap-1 mb-4">
                      <span className="text-3xl font-black text-white">₱{price.toLocaleString()}</span>
                      <span className="text-white/40 text-xs mb-1">/{billingCycle === "month" ? "mo" : "yr"}</span>
                    </div>
                    <ul className="space-y-2 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-xs text-white/60">
                          <CheckCircle2 size={12} className="text-[#fbbf24] shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {selectedPlan === plan.id && (
                      <div className="mt-4 text-center">
                        <span className="text-[#fbbf24] text-xs font-bold">✓ Selected</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-center">
              <Button
                onClick={() => selectedPlan && setStep("checkout")}
                disabled={!selectedPlan}
                className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold px-8 h-11 hover:brightness-110 solar-glow-sm transition-all disabled:opacity-30"
              >
                Continue to Payment →
              </Button>
              <p className="text-white/20 text-[10px] mt-3">All prices in Philippine Peso (₱). Cancel anytime.</p>
            </div>
          </div>
        )}

        {step === "checkout" && (
          <div className="p-8 max-w-md mx-auto">
            <button onClick={() => setStep("plans")} className="text-white/30 text-xs mb-4 hover:text-white transition-colors">← Back to plans</button>
            <h2 className="text-xl font-black text-white mb-1">Complete your subscription</h2>
            <p className="text-white/40 text-xs mb-6">
              {PLANS.find(p => p.id === selectedPlan)?.name} — ₱{(billingCycle === "month"
                ? PLANS.find(p => p.id === selectedPlan)?.monthlyPrice
                : PLANS.find(p => p.id === selectedPlan)?.yearlyPrice
              )?.toLocaleString()}/{billingCycle === "month" ? "month" : "year"}
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Card Number</label>
                <div className="relative">
                  <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <Input
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                    placeholder="4242 4242 4242 4242"
                    className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white h-10 pl-9"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Expiry</label>
                  <Input
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value.slice(0, 5))}
                    placeholder="MM/YY"
                    className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white h-10"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">CVC</label>
                  <Input
                    value={cardCvc}
                    onChange={e => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123"
                    className="bg-[hsl(220_20%_13%)] border-[hsl(220_18%_22%)] text-white h-10"
                    type="password"
                  />
                </div>
              </div>

              <div className="bg-[hsl(220_24%_9%)] border border-[hsl(220_18%_18%)] rounded-xl p-4">
                <div className="flex justify-between text-xs text-white/50 mb-2">
                  <span>{PLANS.find(p => p.id === selectedPlan)?.name} Plan</span>
                  <span className="text-white font-bold">
                    ₱{(billingCycle === "month"
                      ? PLANS.find(p => p.id === selectedPlan)?.monthlyPrice
                      : PLANS.find(p => p.id === selectedPlan)?.yearlyPrice
                    )?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-white/50">
                  <span>Billing</span>
                  <span className="text-white/60">{billingCycle === "month" ? "Monthly" : "Annual (20% off)"}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold h-11 hover:brightness-110 solar-glow-sm transition-all"
              >
                {loading ? "Processing..." : "Subscribe Now"}
              </Button>
              <p className="text-white/15 text-[10px] text-center">This is a demo payment. No real charges will be made.</p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-[#fbbf24]/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Sparkles size={36} className="text-[#fbbf24]" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Welcome aboard! 🎉</h2>
            <p className="text-white/50 text-sm mb-6">
              Your <span className="text-[#fbbf24] font-bold">{PLANS.find(p => p.id === selectedPlan)?.name}</span> subscription is now active.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold px-8 h-11 hover:brightness-110 solar-glow-sm"
            >
              Go to Dashboard →
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return content;
}
