/**
 * Subscription plans. The server charges from this table only, never from a
 * price sent by the browser. Features list only what a contractor account can use.
 */
export type PlanId = "starter" | "professional" | "enterprise";
export type BillingCycle = "month" | "year";

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number; // PHP
  yearlyPrice: number; // PHP
  highlighted?: boolean;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For solo contractors",
    monthlyPrice: 1999,
    yearlyPrice: 19190,
    features: [
      "Client progress tracker with share link",
      "Leads pipeline and quote-request page",
      "Proposal and payback generator",
      "Net-metering checklist per project",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing teams",
    monthlyPrice: 4999,
    yearlyPrice: 47990,
    highlighted: true,
    features: [
      "Everything in Starter",
      "Market Intel competitor tracker",
      "SMS and email lead alerts",
      "Google review requests after handover",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large operations",
    monthlyPrice: 9999,
    yearlyPrice: 95990,
    features: [
      "Everything in Professional",
      "Priority support",
      "Help setting up your account and data",
    ],
  },
];

export function planPrice(planId: string, cycle: string): number | null {
  const plan = PLANS.find(p => p.id === planId);
  if (!plan || (cycle !== "month" && cycle !== "year")) return null;
  return cycle === "month" ? plan.monthlyPrice : plan.yearlyPrice;
}

export function addBillingPeriod(from: Date, cycle: BillingCycle): Date {
  const d = new Date(from);
  if (cycle === "year") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}
