/**
 * Proposal and payback math shared by the server (which stores the result)
 * and the browser (which previews it). Every assumption is an input so a
 * contractor can see and change it; the defaults are deliberately simple.
 */

export type SystemType = "grid" | "hybrid";

export interface ProposalInputs {
  monthlyBill: number; // PHP the customer pays per month today
  utilityRate: number; // PHP per kWh
  systemType: SystemType;
  pricePerKw: number; // PHP per kW, all-in (hybrid prices include the battery)
  systemKw?: number | null; // leave empty to size automatically
  batteryKwh?: number | null; // shown on the proposal, already in the hybrid price
  extrasAmount?: number | null; // optional add-ons in PHP
  discountAmount?: number | null; // optional discount in PHP
  financeMonths?: number | null; // 0 or empty = cash only
  financeAprPct?: number | null; // annual interest rate in percent
  downPaymentPct?: number | null; // percent of total paid up front when financed
}

export const ASSUMPTIONS = {
  kwhPerKwMonth: 120, // about 4 peak sun hours a day
  targetOffset: 0.75, // size the system to cover about 75% of current use
  selfUseShare: { grid: 0.6, hybrid: 0.85 } as Record<SystemType, number>,
  exportCreditPerKwh: 6, // PHP credited per exported kWh under net metering
  degradationPerYear: 0.005,
  minKw: 1,
  maxKw: 100,
};

export interface ProposalResult {
  monthlyKwh: number;
  systemKw: number;
  monthlyProductionKwh: number;
  selfUsedKwh: number;
  exportedKwh: number;
  monthlySavings: number;
  newMonthlyBill: number;
  totalPrice: number;
  paybackYears: number | null;
  tenYearSavings: number;
  financed: boolean;
  downPayment: number;
  monthlyPayment: number;
  financeMonths: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const roundHalf = (n: number) => Math.round(n * 2) / 2;

export function recommendedKw(monthlyBill: number, utilityRate: number): number {
  if (!(monthlyBill > 0) || !(utilityRate > 0)) return ASSUMPTIONS.minKw;
  const monthlyKwh = monthlyBill / utilityRate;
  const kw = roundHalf((monthlyKwh * ASSUMPTIONS.targetOffset) / ASSUMPTIONS.kwhPerKwMonth);
  return Math.min(ASSUMPTIONS.maxKw, Math.max(ASSUMPTIONS.minKw, kw));
}

/** Standard amortised loan payment; a 0% rate splits the balance evenly. */
export function monthlyLoanPayment(principal: number, aprPct: number, months: number): number {
  if (months <= 0 || principal <= 0) return 0;
  const r = aprPct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

export function calculateProposal(input: ProposalInputs): ProposalResult {
  const rate = Math.max(0, input.utilityRate || 0);
  const bill = Math.max(0, input.monthlyBill || 0);
  const monthlyKwh = rate > 0 ? bill / rate : 0;
  const systemKw = input.systemKw && input.systemKw > 0
    ? Math.min(ASSUMPTIONS.maxKw, input.systemKw)
    : recommendedKw(bill, rate);

  const production = systemKw * ASSUMPTIONS.kwhPerKwMonth;
  const selfUseShare = ASSUMPTIONS.selfUseShare[input.systemType] ?? ASSUMPTIONS.selfUseShare.grid;
  const selfUsed = Math.min(production * selfUseShare, monthlyKwh);
  const exported = Math.max(0, production - selfUsed);
  const rawSavings = selfUsed * rate + exported * ASSUMPTIONS.exportCreditPerKwh;
  const monthlySavings = Math.min(rawSavings, bill); // never promise more than the bill

  const totalPrice = Math.max(
    0,
    systemKw * Math.max(0, input.pricePerKw || 0) + Math.max(0, input.extrasAmount || 0) - Math.max(0, input.discountAmount || 0),
  );
  const paybackYears = monthlySavings > 0 ? totalPrice / (monthlySavings * 12) : null;

  let tenYearSavings = 0;
  for (let y = 0; y < 10; y++) tenYearSavings += monthlySavings * 12 * Math.pow(1 - ASSUMPTIONS.degradationPerYear, y);

  const months = Math.max(0, Math.round(input.financeMonths || 0));
  const financed = months > 0;
  const downPayment = financed ? totalPrice * Math.min(100, Math.max(0, input.downPaymentPct || 0)) / 100 : totalPrice;
  const monthlyPayment = financed ? monthlyLoanPayment(totalPrice - downPayment, Math.max(0, input.financeAprPct || 0), months) : 0;

  return {
    monthlyKwh: round2(monthlyKwh),
    systemKw: round2(systemKw),
    monthlyProductionKwh: round2(production),
    selfUsedKwh: round2(selfUsed),
    exportedKwh: round2(exported),
    monthlySavings: round2(monthlySavings),
    newMonthlyBill: round2(Math.max(0, bill - monthlySavings)),
    totalPrice: round2(totalPrice),
    paybackYears: paybackYears === null ? null : round2(paybackYears),
    tenYearSavings: round2(tenYearSavings),
    financed,
    downPayment: round2(downPayment),
    monthlyPayment: round2(monthlyPayment),
    financeMonths: months,
  };
}

export const peso = (n: number | null | undefined) =>
  n == null || !Number.isFinite(n) ? "—" : `₱${Math.round(n).toLocaleString("en-PH")}`;
