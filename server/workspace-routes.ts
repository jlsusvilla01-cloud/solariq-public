import type { Express } from "express";
import { storage } from "./storage.js";
import {
  contractorProfileInputSchema, proposalInputSchema, leadInputSchema, insertCompetitorSchema,
} from "../shared/schema.js";
import { calculateProposal, peso, type ProposalInputs } from "../shared/solarMath.js";
import { defaultSteps, legacyStatus, normalizeSteps, type NetMeteringStep } from "../shared/netMetering.js";
import { randomToken, rateLimited, clientIp } from "./auth.js";
import { sendEmail, sendSms, emailHtml } from "./messaging.js";

/**
 * One set of workspace features (leads, proposals, profile, net metering, reviews,
 * Market Intel) served to two audiences:
 *   /api/admin/...  the SolarIQ owner's own workspace (records with userId = null)
 *   /api/user/...   each contractor's private workspace (records with userId = their id)
 * Public routes under /api/public serve the quote page and shared proposals.
 */

type Mw = (req: any, res: any, next: any) => any;
interface Deps { requireAuth: Mw; requireUser: Mw; requireActiveUser: Mw; appUrl: (req: any) => string }

export const DEFAULT_UTILITY_RATE = 15.68; // MORE Power residential rate, November 2026; editable per contractor

const ownerOf = (req: any): number | null => (req.userId ? req.userId : null);
const profileKey = (owner: number | null) => owner ?? 0;
const sameOwner = (doc: any, owner: number | null) => !!doc && (doc.userId ?? null) === owner;
const now = () => new Date().toISOString();

function slugify(text: string): string {
  const s = text.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return (s || "solar").slice(0, 40).replace(/-$/, "");
}

async function uniqueSlug(base: string, exceptId?: number): Promise<string> {
  const taken = new Set((await storage.docList("contractor_profiles")).filter((p: any) => p.id !== exceptId).map((p: any) => p.slug));
  let slug = base.length >= 3 ? base : `${base}-solar`;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  return slug;
}

export async function getOrCreateProfile(owner: number | null): Promise<any> {
  const key = profileKey(owner);
  const existing = (await storage.docList("contractor_profiles")).find((p: any) => p.userId === key);
  if (existing) return existing;
  let companyName = "SolarIQ";
  let contactEmail: string | null = null;
  let contactPhone: string | null = null;
  if (owner) {
    const user: any = await storage.getUserById(owner);
    companyName = user?.company || user?.name || "My Solar Company";
    contactEmail = user?.email ?? null;
    contactPhone = user?.phone ?? null;
  }
  return storage.docInsert("contractor_profiles", {
    userId: key,
    slug: await uniqueSlug(slugify(companyName)),
    companyName,
    contactPhone,
    contactEmail,
    notifyEmail: contactEmail,
    notifyPhone: contactPhone,
    messengerUrl: null,
    reviewUrl: null,
    serviceArea: null,
    gridPricePerKw: null,
    hybridPricePerKw: null,
    utilityRate: DEFAULT_UTILITY_RATE,
    financeMonths: 0,
    financeAprPct: null,
    downPaymentPct: null,
    proposalValidDays: 30,
    updatedAt: now(),
  });
}

function proposalView(p: any) {
  return { ...p, inputs: JSON.parse(p.inputsJson), result: JSON.parse(p.resultJson) };
}

async function alertContractor(owner: number | null, lead: any, profile: any) {
  const lines = [
    `Name: ${lead.clientName}`,
    `Phone: ${lead.clientPhone || "not given"}`,
    `Email: ${lead.clientEmail || "not given"}`,
    `Monthly bill: ${lead.monthlyBill ? peso(lead.monthlyBill) : "not given"}`,
    `Address: ${lead.address || "not given"}`,
    lead.notes ? `Message: ${lead.notes}` : "",
  ].filter(Boolean);
  const ctx = { purpose: "lead_alert" as const, userId: owner, leadId: lead.id };
  const jobs: Promise<unknown>[] = [];
  if (profile.notifyEmail) {
    jobs.push(sendEmail(profile.notifyEmail, `New solar lead: ${lead.clientName}`, emailHtml("New quote request", [...lines, "Leads contacted within minutes close far more often. Call now."]), ctx));
  }
  if (profile.notifyPhone) {
    jobs.push(sendSms(profile.notifyPhone, `New solar lead: ${lead.clientName}, ${lead.clientPhone || "no phone"}, bill ${lead.monthlyBill ? peso(lead.monthlyBill) : "n/a"}. Call them now.`, ctx));
  }
  await Promise.allSettled(jobs);
}

export function registerWorkspaceRoutes(app: Express, deps: Deps) {
  const { requireAuth, requireUser, requireActiveUser, appUrl } = deps;

  // Mount each feature twice: admin workspace and contractor workspace.
  const scopes: { base: string; read: Mw; write: Mw }[] = [
    { base: "/api/admin", read: requireAuth, write: requireAuth },
    { base: "/api/user", read: requireUser, write: requireActiveUser },
  ];

  for (const { base, read, write } of scopes) {
    const isUser = base === "/api/user";

    // ── Profile and settings ──
    app.get(`${base}/profile`, read, async (req: any, res) => {
      const profile = await getOrCreateProfile(ownerOf(req));
      res.json({ ...profile, quoteUrl: `${appUrl(req)}/#/quote/${profile.slug}` });
    });

    app.put(`${base}/profile`, write, async (req: any, res) => {
      const parsed = contractorProfileInputSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid settings", issues: parsed.error.issues });
      const profile = await getOrCreateProfile(ownerOf(req));
      const data: any = { ...parsed.data, updatedAt: now() };
      if (data.slug && data.slug !== profile.slug) {
        const clash = (await storage.docList("contractor_profiles")).some((p: any) => p.slug === data.slug && p.id !== profile.id);
        if (clash) return res.status(409).json({ error: "That quote-page address is taken. Try another." });
      } else {
        delete data.slug;
      }
      const updated = await storage.docUpdate("contractor_profiles", profile.id, data);
      res.json({ ...updated, quoteUrl: `${appUrl(req)}/#/quote/${updated.slug}` });
    });

    // ── Leads ──
    app.get(`${base}/leads`, read, async (req: any, res) => {
      const owner = ownerOf(req);
      const leads = (await storage.docList("leads")).filter((l: any) => sameOwner(l, owner));
      leads.sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)));
      res.json(leads);
    });

    app.post(`${base}/leads`, write, async (req: any, res) => {
      const parsed = leadInputSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid lead", issues: parsed.error.issues });
      const lead = await storage.docInsert("leads", { ...parsed.data, score: parsed.data.score ?? 0, userId: ownerOf(req), createdAt: now() });
      res.status(201).json(lead);
    });

    app.patch(`${base}/leads/:id`, write, async (req: any, res) => {
      const existing = await storage.docGet("leads", +req.params.id);
      if (!sameOwner(existing, ownerOf(req))) return res.status(404).json({ error: "Lead not found." });
      const parsed = leadInputSchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid lead", issues: parsed.error.issues });
      const changes = Object.fromEntries(Object.entries(parsed.data).filter(([k]) => k in (req.body ?? {})));
      res.json(await storage.docUpdate("leads", existing.id, changes));
    });

    app.delete(`${base}/leads/:id`, write, async (req: any, res) => {
      const existing = await storage.docGet("leads", +req.params.id);
      if (!sameOwner(existing, ownerOf(req))) return res.status(404).json({ error: "Lead not found." });
      await storage.docDelete("leads", existing.id);
      res.json({ ok: true });
    });

    // ── Proposals ──
    app.get(`${base}/proposals`, read, async (req: any, res) => {
      const owner = ownerOf(req);
      const list = (await storage.docList("sales_proposals")).filter((p: any) => sameOwner(p, owner)).map(proposalView);
      list.sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)));
      res.json(list);
    });

    const saveProposal = async (req: any, res: any, existing?: any) => {
      const parsed = proposalInputSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid proposal", issues: parsed.error.issues });
      const d = parsed.data;
      const owner = ownerOf(req);
      if (d.leadId) {
        const lead = await storage.docGet("leads", d.leadId);
        if (!sameOwner(lead, owner)) return res.status(400).json({ error: "That lead is not in your workspace." });
      }
      const inputs: ProposalInputs = {
        monthlyBill: d.monthlyBill, utilityRate: d.utilityRate, systemType: d.systemType, pricePerKw: d.pricePerKw,
        systemKw: d.systemKw ?? null, batteryKwh: d.systemType === "hybrid" ? d.batteryKwh ?? null : null,
        extrasAmount: d.extrasAmount ?? null, discountAmount: d.discountAmount ?? null,
        financeMonths: d.financeMonths ?? 0, financeAprPct: d.financeAprPct ?? 0, downPaymentPct: d.downPaymentPct ?? 0,
      };
      const result = calculateProposal(inputs); // computed here so a shared proposal cannot be tampered with
      const profile = await getOrCreateProfile(owner);
      const validDays = profile.proposalValidDays || 30;
      const record = {
        userId: owner, leadId: d.leadId ?? null,
        clientName: d.clientName, clientPhone: d.clientPhone ?? null, clientEmail: d.clientEmail ?? null,
        address: d.address ?? null, notes: d.notes ?? null,
        inputsJson: JSON.stringify(inputs), resultJson: JSON.stringify(result),
        validUntil: new Date(Date.now() + validDays * 86_400_000).toISOString().slice(0, 10),
        updatedAt: now(),
      };
      if (existing) return res.json(proposalView(await storage.docUpdate("sales_proposals", existing.id, record)));
      const created = await storage.docInsert("sales_proposals", { ...record, shareToken: randomToken(12), status: "draft", acceptedAt: null, createdAt: now() });
      if (d.leadId) {
        const lead: any = await storage.docGet("leads", d.leadId);
        if (lead && ["new", "contacted", "survey_scheduled"].includes(lead.status)) await storage.docUpdate("leads", lead.id, { status: "quoted" });
      }
      res.status(201).json(proposalView(created));
    };

    app.post(`${base}/proposals`, write, (req: any, res) => saveProposal(req, res));

    app.put(`${base}/proposals/:id`, write, async (req: any, res) => {
      const existing: any = await storage.docGet("sales_proposals", +req.params.id);
      if (!sameOwner(existing, ownerOf(req))) return res.status(404).json({ error: "Proposal not found." });
      if (existing.status === "accepted") return res.status(409).json({ error: "This proposal was accepted by the client and can no longer be changed. Create a new one instead." });
      return saveProposal(req, res, existing);
    });

    app.patch(`${base}/proposals/:id/status`, write, async (req: any, res) => {
      const existing: any = await storage.docGet("sales_proposals", +req.params.id);
      if (!sameOwner(existing, ownerOf(req))) return res.status(404).json({ error: "Proposal not found." });
      const status = req.body?.status;
      if (!["draft", "sent", "accepted", "declined"].includes(status)) return res.status(400).json({ error: "Invalid status." });
      res.json(proposalView(await storage.docUpdate("sales_proposals", existing.id, { status, updatedAt: now() })));
    });

    app.delete(`${base}/proposals/:id`, write, async (req: any, res) => {
      const existing: any = await storage.docGet("sales_proposals", +req.params.id);
      if (!sameOwner(existing, ownerOf(req))) return res.status(404).json({ error: "Proposal not found." });
      await storage.docDelete("sales_proposals", existing.id);
      res.json({ ok: true });
    });

    // Sends the proposal link to the client by email and/or SMS.
    app.post(`${base}/proposals/:id/send`, write, async (req: any, res) => {
      const owner = ownerOf(req);
      const p: any = await storage.docGet("sales_proposals", +req.params.id);
      if (!sameOwner(p, owner)) return res.status(404).json({ error: "Proposal not found." });
      const profile = await getOrCreateProfile(owner);
      const link = `${appUrl(req)}/#/p/${p.shareToken}`;
      const result = JSON.parse(p.resultJson);
      const ctx = { purpose: "proposal" as const, userId: owner, leadId: p.leadId };
      const channels: string[] = Array.isArray(req.body?.channels) ? req.body.channels : ["email", "sms"];
      const out: Record<string, any> = {};
      if (channels.includes("email") && p.clientEmail) {
        out.email = await sendEmail(p.clientEmail, `Your solar proposal from ${profile.companyName}`, emailHtml(`Hi ${p.clientName},`, [
          `Here is your solar proposal from ${profile.companyName}: a ${result.systemKw} kW system for ${peso(result.totalPrice)}, saving about ${peso(result.monthlySavings)} a month.`,
          `The proposal is valid until ${p.validUntil}.`,
        ], { label: "View your proposal", url: link }), ctx);
      }
      if (channels.includes("sms") && p.clientPhone) {
        out.sms = await sendSms(p.clientPhone, `Hi ${p.clientName}, your solar proposal from ${profile.companyName} is ready: ${link}`, ctx);
      }
      if (Object.values(out).some((r: any) => r?.ok) && p.status === "draft") await storage.docUpdate("sales_proposals", p.id, { status: "sent", updatedAt: now() });
      res.json({ link, results: out });
    });

    // ── Net-metering checklist ──
    const projectFor = async (req: any, id: number) => {
      const project: any = await storage.getProject(id);
      if (!project) return null;
      if (isUser && project.userId !== req.userId) return null;
      return project;
    };
    const trackerFor = async (projectId: number) =>
      (await storage.docList("net_metering_trackers")).find((t: any) => t.projectId === projectId) ?? null;

    app.get(`${base}/projects/:id/net-metering`, read, async (req: any, res) => {
      const project = await projectFor(req, +req.params.id);
      if (!project) return res.status(404).json({ error: "Project not found." });
      const tracker: any = await trackerFor(project.id);
      res.json({ steps: tracker ? JSON.parse(tracker.stepsJson) : defaultSteps(), saved: !!tracker, updatedAt: tracker?.updatedAt ?? null });
    });

    app.put(`${base}/projects/:id/net-metering`, write, async (req: any, res) => {
      const project = await projectFor(req, +req.params.id);
      if (!project) return res.status(404).json({ error: "Project not found." });
      const tracker: any = await trackerFor(project.id);
      const previous: NetMeteringStep[] = tracker ? JSON.parse(tracker.stepsJson) : [];
      const steps = normalizeSteps(req.body?.steps, previous);
      if (!steps) return res.status(400).json({ error: "Each step needs a name and a valid status." });
      const record = { projectId: project.id, stepsJson: JSON.stringify(steps), updatedAt: now() };
      if (tracker) await storage.docUpdate("net_metering_trackers", tracker.id, record);
      else await storage.docInsert("net_metering_trackers", record);
      await storage.updateProject(project.id, { netMeteringStatus: legacyStatus(steps) } as any);
      res.json({ steps, saved: true, updatedAt: record.updatedAt });
    });

    // ── Google review request after handover ──
    app.post(`${base}/projects/:id/request-review`, write, async (req: any, res) => {
      const project = await projectFor(req, +req.params.id);
      if (!project) return res.status(404).json({ error: "Project not found." });
      const owner = ownerOf(req);
      const profile = await getOrCreateProfile(owner);
      if (!profile.reviewUrl) return res.status(400).json({ error: "Add your Google review link in Settings first." });
      if (!project.clientPhone && !project.clientEmail) return res.status(400).json({ error: "This client has no phone number or email on file." });
      const recent = (await storage.docList("message_log")).some((m: any) =>
        m.projectId === project.id && m.purpose === "review_request" && m.status === "sent" &&
        Date.now() - new Date(m.createdAt).getTime() < 7 * 86_400_000);
      if (recent && !req.body?.force) return res.status(409).json({ error: "A review request already went to this client in the last 7 days." });
      const text = `Hi ${project.clientName}, thank you for choosing ${profile.companyName} for your solar installation! If you are happy with our work, would you leave us a quick Google review? It helps other families find us: ${profile.reviewUrl}`;
      const ctx = { purpose: "review_request" as const, userId: owner, projectId: project.id };
      const out: Record<string, any> = {};
      if (project.clientPhone) out.sms = await sendSms(project.clientPhone, text, ctx);
      if (project.clientEmail) out.email = await sendEmail(project.clientEmail, `Thank you from ${profile.companyName}`, emailHtml(`Hi ${project.clientName},`, [
        `Thank you for choosing ${profile.companyName} for your solar installation.`,
        "If you are happy with our work, a quick Google review helps other families find us.",
      ], { label: "Leave a review", url: profile.reviewUrl }), ctx);
      res.json({ results: out });
    });

    // ── Message log ──
    app.get(`${base}/messages`, read, async (req: any, res) => {
      const owner = ownerOf(req);
      const list = (await storage.docList("message_log")).filter((m: any) => (m.userId ?? null) === owner);
      list.sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)));
      res.json(list.slice(0, 100));
    });
  }

  // ── Contractor Market Intel (the admin version lives in routes.ts) ──
  app.get("/api/user/competitors", requireUser, async (req: any, res) => {
    res.json((await storage.getAllCompetitors()).filter((c: any) => c.userId === req.userId));
  });
  app.post("/api/user/competitors", requireActiveUser, async (req: any, res) => {
    const parsed = insertCompetitorSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid competitor", issues: parsed.error.issues });
    res.status(201).json(await storage.createCompetitor({ ...parsed.data, userId: req.userId } as any));
  });
  app.patch("/api/user/competitors/:id", requireActiveUser, async (req: any, res) => {
    const existing: any = (await storage.getAllCompetitors()).find((c: any) => c.id === +req.params.id);
    if (!existing || existing.userId !== req.userId) return res.status(404).json({ error: "Competitor not found" });
    const parsed = insertCompetitorSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid competitor", issues: parsed.error.issues });
    res.json(await storage.updateCompetitor(existing.id, parsed.data));
  });
  app.delete("/api/user/competitors/:id", requireActiveUser, async (req: any, res) => {
    const existing: any = (await storage.getAllCompetitors()).find((c: any) => c.id === +req.params.id);
    if (!existing || existing.userId !== req.userId) return res.status(404).json({ error: "Competitor not found" });
    await storage.deleteCompetitor(existing.id);
    res.json({ ok: true });
  });

  // ── Public quote page ──
  const findBySlug = async (slug: string) =>
    (await storage.docList("contractor_profiles")).find((p: any) => p.slug === String(slug).toLowerCase()) ?? null;

  /** A contractor's quote page works only while their trial or plan is active. */
  const ownerActive = async (profile: any) => {
    if (profile.userId === 0) return true;
    const user: any = await storage.getUserById(profile.userId);
    if (!user) return false;
    const t = Date.now();
    if (user.subscriptionStatus === "trial") return new Date(user.trialEndDate).getTime() > t;
    if (user.subscriptionStatus === "active") return !!user.paidUntil && new Date(user.paidUntil).getTime() > t;
    return false;
  };

  app.get("/api/public/contractors/:slug", async (req, res) => {
    const profile: any = await findBySlug(req.params.slug);
    if (!profile || !(await ownerActive(profile))) return res.status(404).json({ error: "This quote page is not available." });
    res.json({
      companyName: profile.companyName,
      serviceArea: profile.serviceArea,
      contactPhone: profile.contactPhone,
      messengerUrl: profile.messengerUrl,
      utilityRate: profile.utilityRate || DEFAULT_UTILITY_RATE,
      hasPrices: !!(profile.gridPricePerKw || profile.hybridPricePerKw),
    });
  });

  app.post("/api/public/quote/:slug", async (req, res) => {
    const ip = clientIp(req);
    if (rateLimited(`quote-ip:${ip}`, 5, 60 * 60_000) || rateLimited(`quote-slug:${req.params.slug}`, 60, 60 * 60_000)) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
    const profile: any = await findBySlug(req.params.slug);
    if (!profile || !(await ownerActive(profile))) return res.status(404).json({ error: "This quote page is not available." });
    const b = req.body ?? {};
    if (b.website) return res.status(201).json({ ok: true }); // hidden field filled = bot; pretend success
    const name = String(b.name ?? "").trim().slice(0, 120);
    const phone = String(b.phone ?? "").trim().slice(0, 40);
    const email = String(b.email ?? "").trim().slice(0, 200);
    const address = String(b.address ?? "").trim().slice(0, 300);
    const message = String(b.message ?? "").trim().slice(0, 1000);
    const bill = Number(b.monthlyBill);
    const interest = ["grid", "hybrid"].includes(b.systemInterest) ? b.systemInterest : null;
    if (!name || !phone) return res.status(400).json({ error: "Please enter your name and mobile number." });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Please enter a valid email address or leave it blank." });
    const monthlyBill = Number.isFinite(bill) && bill > 0 && bill < 10_000_000 ? bill : null;

    const owner = profile.userId === 0 ? null : profile.userId;
    const lead = await storage.docInsert("leads", {
      clientName: name, clientPhone: phone, clientEmail: email || null, address: address || null,
      monthlyBill, source: "quote_form", status: "new", score: monthlyBill && monthlyBill >= 5000 ? 8 : 5,
      notes: [interest ? `Interested in: ${interest === "hybrid" ? "hybrid with battery" : "grid-tie"}` : "", message].filter(Boolean).join("\n") || null,
      userId: owner, createdAt: now(),
    });
    await alertContractor(owner, lead, profile);

    // Instant estimate for the visitor, using the contractor's own prices when set.
    let estimate: any = null;
    if (monthlyBill) {
      const type = interest === "hybrid" ? "hybrid" : "grid";
      const price = type === "hybrid" ? profile.hybridPricePerKw : profile.gridPricePerKw;
      const r = calculateProposal({ monthlyBill, utilityRate: profile.utilityRate || DEFAULT_UTILITY_RATE, systemType: type, pricePerKw: price || 0 });
      estimate = {
        systemType: type,
        systemKw: r.systemKw,
        monthlySavings: r.monthlySavings,
        priceLow: price ? Math.round(r.totalPrice * 0.9) : null,
        priceHigh: price ? Math.round(r.totalPrice * 1.1) : null,
        paybackYears: price ? r.paybackYears : null,
        utilityRate: profile.utilityRate || DEFAULT_UTILITY_RATE,
      };
    }
    res.status(201).json({ ok: true, estimate });
  });

  // ── Demo requests from the SolarIQ landing page → SolarIQ's own (admin) lead pipeline ──
  app.post("/api/public/demo-request", async (req, res) => {
    const ip = clientIp(req);
    if (rateLimited(`demo-ip:${ip}`, 5, 60 * 60_000) || rateLimited("demo-all", 200, 60 * 60_000)) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
    const b = req.body ?? {};
    if (b.website) return res.status(201).json({ ok: true }); // hidden field filled = bot; pretend success
    const name = String(b.name ?? "").trim().slice(0, 120);
    const company = String(b.company ?? "").trim().slice(0, 160);
    const email = String(b.email ?? "").trim().slice(0, 200);
    const phone = String(b.phone ?? "").trim().slice(0, 40);
    const installs = String(b.installs ?? "").trim().slice(0, 40);
    if (!name || !company) return res.status(400).json({ error: "Please enter your name and company." });
    if (!phone && !email) return res.status(400).json({ error: "Please give a mobile number or email so we can reach you." });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Please enter a valid email address." });

    const lead = await storage.docInsert("leads", {
      clientName: name, clientPhone: phone || null, clientEmail: email || null, address: null, monthlyBill: null,
      source: "web", status: "new", score: 7,
      notes: [`SolarIQ demo request`, `Company: ${company}`, installs ? `Installs per month: ${installs}` : ""].filter(Boolean).join("\n"),
      userId: null, createdAt: now(),
    });
    await alertContractor(null, lead, await getOrCreateProfile(null));
    res.status(201).json({ ok: true });
  });

  // ── Public proposal view ──
  app.get("/api/public/proposals/:token", async (req, res) => {
    const p: any = (await storage.docList("sales_proposals")).find((x: any) => x.shareToken === req.params.token);
    if (!p) return res.status(404).json({ error: "Proposal not found. Check your link." });
    const profile = await getOrCreateProfile(p.userId ?? null);
    const v = proposalView(p);
    res.json({
      proposal: {
        clientName: v.clientName, address: v.address, notes: v.notes, status: v.status,
        validUntil: v.validUntil, createdAt: v.createdAt, acceptedAt: v.acceptedAt,
        inputs: v.inputs, result: v.result,
      },
      contractor: {
        companyName: profile.companyName, contactPhone: profile.contactPhone, contactEmail: profile.contactEmail,
        messengerUrl: profile.messengerUrl, serviceArea: profile.serviceArea,
      },
    });
  });

  app.post("/api/public/proposals/:token/accept", async (req, res) => {
    if (rateLimited(`accept:${clientIp(req)}`, 10, 60 * 60_000)) return res.status(429).json({ error: "Too many requests." });
    const p: any = (await storage.docList("sales_proposals")).find((x: any) => x.shareToken === req.params.token);
    if (!p) return res.status(404).json({ error: "Proposal not found." });
    if (p.status === "accepted") return res.json({ ok: true, alreadyAccepted: true });
    if (p.status === "declined") return res.status(409).json({ error: "This proposal is closed. Please contact the installer." });
    if (p.validUntil && new Date(p.validUntil + "T23:59:59") < new Date()) return res.status(409).json({ error: "This proposal has expired. Please ask the installer for an updated one." });
    await storage.docUpdate("sales_proposals", p.id, { status: "accepted", acceptedAt: now(), updatedAt: now() });
    if (p.leadId) {
      const lead: any = await storage.docGet("leads", p.leadId);
      if (lead) await storage.docUpdate("leads", lead.id, { status: "closed_won" });
    }
    const profile = await getOrCreateProfile(p.userId ?? null);
    const ctx = { purpose: "proposal_accepted" as const, userId: p.userId ?? null, leadId: p.leadId };
    const r = JSON.parse(p.resultJson);
    if (profile.notifyEmail) await sendEmail(profile.notifyEmail, `Proposal accepted: ${p.clientName}`, emailHtml("A client accepted your proposal", [
      `${p.clientName} accepted the ${r.systemKw} kW proposal for ${peso(r.totalPrice)}.`, "Contact them to schedule the site survey.",
    ]), ctx);
    if (profile.notifyPhone) await sendSms(profile.notifyPhone, `${p.clientName} accepted your ${r.systemKw} kW solar proposal (${peso(r.totalPrice)}). Call them to schedule the survey.`, ctx);
    res.json({ ok: true });
  });
}
