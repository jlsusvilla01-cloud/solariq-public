import type { InsertCompetitor } from "@shared/schema";

/**
 * Market packs are starter datasets a contractor can load into Market Intel.
 * Every figure comes from public web pages on the date in `asOf`; prices are the
 * midpoint of each published range. Treat them as a starting point and verify
 * before quoting against them.
 */
export type MarketPack = {
  region: string;
  label: string;
  asOf: string; // YYYY-MM-DD
  utilityRate: number; // PHP per kWh, residential
  utilityRateNote: string;
  competitors: Omit<InsertCompetitor, "lastChecked">[];
};

const base = { region: "Iloilo", offersFinancing: 0, publishesPrices: 0, netMeteringService: 0 } as const;

export const MARKET_PACKS: MarketPack[] = [
  {
    region: "Iloilo",
    label: "Iloilo market pack",
    asOf: "2026-11-22",
    utilityRate: 15.68,
    utilityRateNote: "MORE Power residential rate, November 2026",
    competitors: [
      {
        ...base,
        name: "Peak Power",
        baseLocation: "Iloilo",
        segment: "mixed",
        systemTypes: "Grid-tie, battery",
        gridTiePricePerKw: 45000,
        hybridPricePerKw: 63000,
        warrantyYears: 10,
        strengths: "Operating since 2009; mostly residential customers plus local government projects.",
        weaknesses: "Prices come from a news interview, not a public price list. Quoted 2–3 year warranty on non-panel parts.",
        website: null,
        sourceUrl: "https://dailyguardian.com.ph/?p=394003",
        threatLevel: "high",
      },
      {
        ...base,
        name: "Apoleon Solar",
        baseLocation: "Jaro, Iloilo City",
        segment: "mixed",
        systemTypes: "Hybrid, grid-tie, solar pumps",
        gridTiePricePerKw: null,
        hybridPricePerKw: null,
        warrantyYears: null,
        strengths: "Reports 300+ projects and 2,231 kWp installed; offices in Iloilo and Bacolod; active on social media.",
        weaknesses: "No prices, brands, warranty or financing shown on its website.",
        website: "https://www.apoleonsolar.com",
        sourceUrl: "https://www.apoleonsolar.com",
        threatLevel: "high",
      },
      {
        ...base,
        name: "PA Energy",
        baseLocation: "Jaro, Iloilo City",
        segment: "mixed",
        systemTypes: "Grid-tie",
        gridTiePricePerKw: null,
        hybridPricePerKw: null,
        warrantyYears: null,
        offersFinancing: 1,
        strengths: "Advertises 0% down monthly plans; Trina panels; free on-site assessment.",
        weaknesses: "No published prices.",
        website: "https://www.paenergy.ph",
        sourceUrl: "https://www.paenergy.ph",
        threatLevel: "high",
      },
      {
        ...base,
        name: "Brightsky Solar Experts",
        baseLocation: "Iloilo City",
        segment: "residential",
        systemTypes: "Hybrid, grid-tie, off-grid",
        gridTiePricePerKw: 60000,
        hybridPricePerKw: 80000,
        warrantyYears: null,
        publishesPrices: 1,
        strengths: "Steady stream of residential hybrid installs across Iloilo province; Deye inverters with lithium batteries.",
        weaknesses: "Listed 3 kW prices sit above other published prices in this market.",
        website: "https://sites.google.com/view/brightskysolar/home",
        sourceUrl: "https://smartenergyph.com/solar/compare-solar-companies/",
        threatLevel: "medium",
      },
      {
        ...base,
        name: "SolarStream",
        baseLocation: "Tuburan, Cebu",
        segment: "mixed",
        systemTypes: "Hybrid",
        gridTiePricePerKw: null,
        hybridPricePerKw: 61500,
        warrantyYears: 25,
        publishesPrices: 1,
        netMeteringService: 1,
        strengths: "Full public price list for Iloilo; includes permit and net-metering guidance.",
        weaknesses: "No Iloilo office listed; reports 20+ installs in Western Visayas since 2024.",
        website: "https://solarstreamph.com/solar-iloilo/",
        sourceUrl: "https://solarstreamph.com/solar-iloilo/",
        threatLevel: "medium",
      },
      {
        ...base,
        name: "VYA Solar Engineering",
        baseLocation: "Western Visayas",
        segment: "mixed",
        systemTypes: "Huawei systems",
        gridTiePricePerKw: null,
        hybridPricePerKw: null,
        warrantyYears: null,
        strengths: "Named Huawei Digital Power partner for Western Visayas in April 2026.",
        weaknesses: "Recent entrant; no public pricing found.",
        website: null,
        sourceUrl: "https://mb.com.ph/2026/04/12/tech-giant-to-bring-ai-powered-solar-energy-to-western-visayas",
        threatLevel: "low",
      },
      {
        ...base,
        name: "Buskowitz Energy",
        baseLocation: "Metro Manila",
        segment: "commercial",
        systemTypes: "Commercial rooftop",
        gridTiePricePerKw: null,
        hybridPricePerKw: null,
        warrantyYears: null,
        strengths: "Large commercial projects, including a condominium system in Iloilo City in 2026.",
        weaknesses: "Focused on large commercial sites rather than homes and small businesses.",
        website: null,
        sourceUrl: "https://mb.com.ph/2026/04/25/smdc-launches-first-solar-energy-system-in-visayas",
        threatLevel: "low",
      },
    ],
  },
];
