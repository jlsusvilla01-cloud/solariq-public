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
        name: "Solana4U (Solana4Iloilo)",
        baseLocation: "La Paz, Iloilo City",
        segment: "mixed",
        systemTypes: "Grid-tie net metering, hybrid",
        gridTiePricePerKw: null,
        hybridPricePerKw: null,
        warrantyYears: null,
        netMeteringService: 1,
        strengths: "Founded 2015 in Iloilo; franchise network across the Visayas; 4.8 Google rating from 55 reviews; free assessment and calamity insurance; known for net-metering installs.",
        weaknesses: "No public prices. One detailed negative review describes a dispute after a hybrid upgrade.",
        website: "https://www.solana4u.com/iloilo",
        sourceUrl: "https://www.solana4u.com/branches",
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
        offersFinancing: 1,
        netMeteringService: 1,
        strengths: "5.0 Google rating from 38 reviews; about 9 active Facebook ads; 24-month credit card instalments; offices in Iloilo and Bacolod; reviews mention help with net metering.",
        weaknesses: "No prices, brands or warranty published on its website.",
        website: "https://www.apoleonsolar.com",
        sourceUrl: "https://www.apoleonsolar.com",
        threatLevel: "high",
      },
      {
        ...base,
        name: "SkyBright New Energy",
        baseLocation: "Mandurriao, Iloilo City",
        segment: "mixed",
        systemTypes: "Grid-tie, hybrid, off-grid, EV charging",
        gridTiePricePerKw: null,
        hybridPricePerKw: null,
        warrantyYears: null,
        strengths: "Operating since 2017; 4.9 Google rating from 47 reviews; reported as a DOE-registered installer; over 1 MW installed by January 2023; also sells EV charging stations.",
        weaknesses: "No public prices; little paid advertising found.",
        website: "https://sbne.energy",
        sourceUrl: "https://sbne.energy/contact-us/",
        threatLevel: "high",
      },
      {
        ...base,
        name: "Solar Bear Energy PH",
        baseLocation: "Jaro, Iloilo City",
        segment: "residential",
        systemTypes: "Grid-tie, hybrid",
        gridTiePricePerKw: null,
        hybridPricePerKw: null,
        warrantyYears: null,
        strengths: "4.8 Google rating from 32 reviews; positions on honest consultation; reviews cite large bill cuts and battery backup.",
        weaknesses: "No prices, brands or warranty on its website; one Facebook ad running.",
        website: "https://solarbearenergyph.com",
        sourceUrl: "https://solarbearenergyph.com/",
        threatLevel: "medium",
      },
      {
        ...base,
        name: "Peak Power",
        baseLocation: "Iloilo",
        segment: "mixed",
        systemTypes: "Grid-tie, battery",
        gridTiePricePerKw: 45000,
        hybridPricePerKw: 63000,
        warrantyYears: 10,
        strengths: "Operating since 2009; local government, hospital and university projects; owner quoted in local press.",
        weaknesses: "Prices come from news interviews, not a price list. No Google listing found. Owner says he is still looking for a financier to offer payment terms.",
        website: null,
        sourceUrl: "https://www.dailyguardian.com.ph/blog/now-is-the-time-for-solar-power",
        threatLevel: "medium",
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
        strengths: "Cacho Group backing; 0% down monthly plans; Trina panels; free on-site assessment.",
        weaknesses: "Only 3 Google reviews; no published prices; no ads seen.",
        website: "https://www.paenergy.ph",
        sourceUrl: "https://www.paenergy.ph",
        threatLevel: "medium",
      },
      {
        ...base,
        name: "Brightsky Solar Experts",
        baseLocation: "Oton, Iloilo",
        segment: "residential",
        systemTypes: "Hybrid, grid-tie, off-grid",
        gridTiePricePerKw: 46667,
        hybridPricePerKw: 56667,
        warrantyYears: 1,
        offersFinancing: 1,
        publishesPrices: 1,
        strengths: "Full public price list from 3 kW to solar farms; 5% cash discount; GSIS loans accepted for hybrid packages.",
        weaknesses: "One-year warranty on components; only 3 Google reviews; no ads. Prices shown are its 6 kW packages.",
        website: "https://sites.google.com/view/brightskysolar/home",
        sourceUrl: "https://sites.google.com/view/brightskysolar/packages",
        threatLevel: "medium",
      },
      {
        ...base,
        name: "SolarStream",
        baseLocation: "Tuburan, Cebu",
        segment: "mixed",
        systemTypes: "Hybrid",
        gridTiePricePerKw: null,
        hybridPricePerKw: 65000,
        warrantyYears: 25,
        publishesPrices: 1,
        netMeteringService: 1,
        strengths: "Public Iloilo price list; includes permit and net-metering guidance.",
        weaknesses: "No Iloilo office listed; reports 20+ installs in Western Visayas since 2024. Price shown is the midpoint of its 6 kW hybrid range.",
        website: "https://solarstreamph.com/solar-iloilo/",
        sourceUrl: "https://solarstreamph.com/solar-iloilo/",
        threatLevel: "low",
      },
    ],
  },
];
