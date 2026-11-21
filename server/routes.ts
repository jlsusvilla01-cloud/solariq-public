import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage.js";
import QRCode from "qrcode";
import { insertCompetitorSchema } from "../shared/schema.js";
import { storageStatus } from "./storage.js";
import {
  hashPassword, verifyPassword, signSession, verifySession, bearerToken, randomToken,
  rateLimited, clientIp, publicUser, MIN_PASSWORD_LENGTH, DEFAULT_ADMIN_PASSWORD, sessionSecretSource,
} from "./auth.js";
import { sendEmail, emailHtml, emailConfigured, smsConfigured } from "./messaging.js";
import { registerWorkspaceRoutes } from "./workspace-routes.js";
import { registerBillingRoutes } from "./billing-routes.js";

function genToken() {
  return randomToken(12);
}

/** Public base URL for links in emails and redirects. */
export function appUrl(req: any): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] as string)?.split(",")[0] || req.protocol;
  return `${proto}://${req.get("host")}`;
}

async function sendNotificationEmail(to: string, clientName: string, message: string, trackingUrl: string, projectId: number, userId: number | null) {
  return sendEmail(
    to,
    `Solar installation update for ${clientName}`,
    emailHtml(`Hi ${clientName},`, ["Your solar installation has a new update:", message], { label: "View full progress", url: trackingUrl }),
    { purpose: "project_update", projectId, userId },
  );
}

/** Fields that must never reach the public tracking page. */
function publicProject<T extends Record<string, any>>(p: T) {
  const { clientPortalPin: _pin, contractorNotes: _notes, ...rest } = p;
  return rest;
}

export async function registerRoutes(httpServer: Server, app: Express) {
  // ── Health Check (for Vercel debugging) ──
  app.get("/api/health", (_req, res) => res.json({
    status: "ok",
    storage: storageStatus.mode,
    persistent: storageStatus.persistent,
  }));

  // ── Public: Landing data ──
  app.get("/api/public/faqs", async (_req, res) => res.json(await storage.getPublishedFaqs()));
  app.get("/api/public/testimonials", async (_req, res) => res.json(await storage.getPublishedTestimonials()));
  app.get("/api/public/pricing", async (_req, res) => res.json(await storage.getPublishedPlans()));

  // ── Public: Client progress tracker ──
  app.get("/api/track/:token", async (req, res) => {
    const project = await storage.getProjectByToken(req.params.token);
    if (!project) return res.status(404).json({ error: "Project not found. Check your link." });
    const ms = await storage.getMilestonesByProject(project.id);
    const upd = await storage.getUpdatesByProject(project.id);
    const photos = await storage.getPhotosByProject(project.id);
    const sigs = await storage.getSignaturesByProject(project.id);
    const qts = await storage.getQuotationsByProject(project.id);
    const docs = await storage.getDocumentsByProject(project.id);
    const pays = await storage.getPaymentsByProject(project.id);
    const trackers = await storage.docList("net_metering_trackers");
    const tracker = trackers.find((t: any) => t.projectId === project.id);
    res.json({
      project: publicProject(project),
      netMeteringSteps: tracker ? JSON.parse(tracker.stepsJson) : null,
      milestones: ms.sort((a, b) => a.sortOrder - b.sortOrder),
      updates: upd.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      photos,
      signatures: sigs,
      quotations: qts,
      documents: docs,
      payments: pays,
    });
  });

  // ── Public: QR Code ──
  app.get("/api/qr/:token", async (req, res) => {
    const project = await storage.getProjectByToken(req.params.token);
    if (!project) return res.status(404).json({ error: "Not found" });
    const host = appUrl(req);
    const trackUrl = `${host}/#/track/${req.params.token}`;
    const qrDataUrl = await QRCode.toDataURL(trackUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#0f1117", light: "#fbbf24" },
    });
    res.json({ qrDataUrl, trackUrl, clientName: project.clientName, projectName: project.clientName });
  });

  // ── Public: Client e-signature ──
  app.post("/api/track/:token/sign", async (req, res) => {
    const project = await storage.getProjectByToken(req.params.token);
    if (!project) return res.status(404).json({ error: "Not found" });
    const sig = await storage.createSignature({
      projectId: project.id,
      signerName: req.body.signerName,
      signerRole: "Client",
      signatureDataUrl: req.body.signatureDataUrl,
      agreementText: req.body.agreementText,
      ipAddress: req.ip,
    });
    // Post a milestone update
    await storage.createUpdate({
      projectId: project.id,
      message: `✅ Commissioning certificate signed by ${req.body.signerName} on ${new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}.`,
      type: "milestone",
      postedBy: "SolarIQ",
    });
    res.status(201).json(sig);
  });

  // ── Admin Auth ──
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";

  async function findAdmin(username: string) {
    const all = await storage.docList("admins");
    return all.find((a: any) => a.username === username) ?? null;
  }

  // On the live site the old published default password is refused; ADMIN_PASSWORD is the way in.
  const isLive = !!process.env.VERCEL || process.env.NODE_ENV === "production";

  /** Creates the first admin account on an empty database (from ADMIN_PASSWORD on the live site). */
  async function ensureFirstAdmin() {
    const all = await storage.docList("admins");
    if (all.length > 0) return;
    if (isLive && !process.env.ADMIN_PASSWORD) return;
    await storage.docInsert("admins", {
      username: ADMIN_USERNAME,
      password: hashPassword(process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD),
      name: "SolarIQ Admin",
      email: null,
      googleId: null,
    });
  }

  app.post("/api/admin/login", async (req, res) => {
    const ip = clientIp(req);
    if (rateLimited(`admin-login:${ip}`, 10, 15 * 60_000)) {
      return res.status(429).json({ error: "Too many attempts. Wait 15 minutes and try again." });
    }
    const username = String(req.body?.username ?? "").trim();
    const password = String(req.body?.password ?? "");
    if (!username || !password) return res.status(400).json({ error: "Username and password are required." });
    if (isLive && password === DEFAULT_ADMIN_PASSWORD) {
      return res.status(403).json({ error: "The old default admin password is disabled on the live site. Set ADMIN_PASSWORD in Vercel's environment variables, redeploy, and sign in with that." });
    }
    await ensureFirstAdmin();
    const admin: any = await findAdmin(username);

    // ADMIN_PASSWORD in the environment always works for the main admin, so a lost password can be recovered.
    const envPassword = process.env.ADMIN_PASSWORD;
    const envMatch = !!envPassword && username === ADMIN_USERNAME && verifyPassword(password, envPassword).ok;
    const check = admin ? verifyPassword(password, admin.password) : { ok: false, needsRehash: false };
    if (!admin || (!check.ok && !envMatch)) return res.status(401).json({ error: "Invalid credentials" });

    if (check.needsRehash || envMatch) await storage.docUpdate("admins", admin.id, { password: hashPassword(password) });
    res.json({
      ok: true,
      name: admin.name,
      token: signSession(admin.id, "admin"),
      usingDefaultPassword: password === DEFAULT_ADMIN_PASSWORD,
    });
  });

  const requireAuth = async (req: any, res: any, next: any) => {
    try {
      const session = verifySession(bearerToken(req), "admin");
      if (!session) return res.status(401).json({ error: "Unauthorized" });
      const admin = await storage.docGet("admins", session.sub);
      if (!admin) return res.status(401).json({ error: "Unauthorized" });
      req.adminId = session.sub;
      next();
    } catch (e) {
      console.error("Auth middleware error:", e);
      res.status(401).json({ error: "Unauthorized" });
    }
  };

  app.post("/api/admin/password", requireAuth, async (req: any, res) => {
    const current = String(req.body?.currentPassword ?? "");
    const next = String(req.body?.newPassword ?? "");
    if (next.length < MIN_PASSWORD_LENGTH) return res.status(400).json({ error: `Use at least ${MIN_PASSWORD_LENGTH} characters.` });
    if (next === DEFAULT_ADMIN_PASSWORD) return res.status(400).json({ error: "Choose a password other than the old default." });
    const admin: any = await storage.docGet("admins", req.adminId);
    if (!admin || !verifyPassword(current, admin.password).ok) return res.status(401).json({ error: "Current password is wrong." });
    await storage.docUpdate("admins", admin.id, { password: hashPassword(next) });
    res.json({ ok: true });
  });

  // What still needs setting up, shown as a checklist in the admin portal.
  app.get("/api/admin/system-status", requireAuth, async (req: any, res) => {
    const admin: any = await storage.docGet("admins", req.adminId);
    res.json({
      storage: storageStatus,
      defaultAdminPassword: admin ? verifyPassword(DEFAULT_ADMIN_PASSWORD, admin.password).ok : false,
      sessionSecret: sessionSecretSource,
      adminPasswordSet: !!process.env.ADMIN_PASSWORD,
      payments: !!process.env.PAYMONGO_SECRET_KEY && !!process.env.PAYMONGO_WEBHOOK_SECRET,
      email: emailConfigured(),
      sms: smsConfigured(),
      appUrl: !!process.env.APP_URL,
    });
  });

  // ── Admin: Projects ──
  app.get("/api/admin/projects", requireAuth, async (_req, res) => res.json(await storage.getAllProjects()));
  app.post("/api/admin/projects", requireAuth, async (req, res) => {
    const data = { ...req.body, shareToken: genToken() };
    const proj = await storage.createProject(data);
    const defaults = [
      ["Site Survey & Assessment", "Roof assessment, shading analysis, structural review", "survey", 1],
      ["System Design", "Panel layout, inverter selection, electrical design", "design", 2],
      ["Permit Submission", "Building and electrical permits submitted", "permitting", 3],
      ["Permit Approval", "All permits and utility interconnection approved", "permitting", 4],
      ["Material Procurement", "Panels, inverter, racking, and wiring delivered", "procurement", 5],
      ["Racking Installation", "Roof mounts and racking system installed", "installation", 6],
      ["Panel Installation", "Solar panels mounted and connected", "installation", 7],
      ["Inverter & Electrical Work", "Inverter, wiring, conduit, and electrical connections", "installation", 8],
      ["Final Inspection", "Local authority and utility final inspection", "inspection", 9],
      ["Commissioning & Handover", "System testing, monitoring setup, client walkthrough", "commissioned", 10],
    ];
    for (const [t, d, p, o] of defaults) {
      await storage.createMilestone({ projectId: proj.id, title: t as string, description: d as string, phase: p as string, sortOrder: o as number, status: "pending" });
    }
    await storage.createUpdate({ projectId: proj.id, message: `Welcome ${proj.clientName}! Your solar installation project has been started. We'll keep you updated every step of the way.`, type: "update", postedBy: "SolarIQ" });
    // Set up notif prefs from project email
    if (proj.clientEmail) {
      await storage.upsertNotifPref(proj.id, { projectId: proj.id, email: proj.clientEmail, phone: proj.clientPhone || "", emailEnabled: 1, smsEnabled: 0, notifyOnMilestone: 1, notifyOnUpdate: 1 });
    }
    res.status(201).json(proj);
  });
  app.patch("/api/admin/projects/:id", requireAuth, async (req, res) => res.json(await storage.updateProject(+req.params.id, req.body)));
  app.delete("/api/admin/projects/:id", requireAuth, async (req, res) => { await storage.deleteProject(+req.params.id); res.json({ ok: true }); });
  
  app.post("/api/admin/projects/:id/monitoring-config", requireAuth, async (req, res) => {
    const proj = await storage.updateProject(+req.params.id, req.body);
    res.json(proj);
  });
  app.post("/api/admin/projects/:id/generate-readings", requireAuth, async (req, res) => {
    await storage.generateMockReadings(+req.params.id);
    await storage.updateProject(+req.params.id, { monitoringStatus: "online", inverterModel: "Huawei SUN2000-5KTL-M1", inverterSerial: "SN-"+Math.random().toString(36).slice(2, 10).toUpperCase() });
    res.json({ ok: true });
  });

  // ── Admin: Weather Risk ──
  app.post("/api/admin/weather/sync", requireAuth, async (_req, res) => {
    const projects = await storage.getAllProjects();
    const risks = ["low", "medium", "high"];
    const alerts: Record<string, string> = {
      high: "CRITICAL: Severe weather alert in region. Structural mounting halted.",
      medium: "CAUTION: Intermittent rain/wind. Proceed with electrical work only.",
      low: "NOMINAL: Clear skies. Optimal for all installation phases."
    };
    
    for (const p of projects) {
        if (p.status !== "commissioned") {
            const risk = (p.address?.toLowerCase().includes("cebu")) ? "high" : risks[Math.floor(Math.random() * risks.length)];
            await storage.updateProjectWeather(p.id, risk, alerts[risk]);
        }
    }
    res.json({ ok: true });
  });

  // ── Admin: Milestones ──
  app.get("/api/admin/projects/:id/milestones", requireAuth, async (req, res) => res.json(await storage.getMilestonesByProject(+req.params.id)));
  app.patch("/api/admin/milestones/:id", requireAuth, async (req, res) => {
    const data = { ...req.body };
    if (data.status === "completed" && !data.completedAt) data.completedAt = new Date().toISOString();
    const updated = await storage.updateMilestone(+req.params.id, data);
    // Recalculate progress
    const allMs = await storage.getMilestonesByProject(updated!.projectId);
    const done = allMs.filter(m => m.status === "completed").length;
    const pct = allMs.length ? Math.round((done / allMs.length) * 100) : 0;
    await storage.updateProject(updated!.projectId, { overallProgress: pct, status: updated!.phase });
    // Send notification if milestone completed
    if (data.status === "completed") {
      const notif = await storage.getNotifPref(updated!.projectId);
      const project = await storage.getProject(updated!.projectId);
      if (notif?.emailEnabled && notif.email && project) {
        const host = appUrl(req);
        const trackUrl = `${host}/#/track/${project.shareToken}`;
        sendNotificationEmail(notif.email, project.clientName, `Milestone completed: "${updated!.title}". Your installation is now ${pct}% complete.`, trackUrl, project.id, (project as any).userId ?? null);
      }
    }
    res.json(updated);
  });

  // ── Admin: Updates/Posts ──
  app.get("/api/admin/projects/:id/updates", requireAuth, async (req, res) => res.json(await storage.getUpdatesByProject(+req.params.id)));
  app.post("/api/admin/projects/:id/updates", requireAuth, async (req, res) => {
    const update = await storage.createUpdate({ ...req.body, projectId: +req.params.id });
    const ms = await storage.getMilestonesByProject(+req.params.id);
    const done = ms.filter(m => m.status === "completed").length;
    const pct = ms.length ? Math.round((done / ms.length) * 100) : 0;
    await storage.updateProject(+req.params.id, { overallProgress: pct });
    // Send email notification
    const notif = await storage.getNotifPref(+req.params.id);
    const project = await storage.getProject(+req.params.id);
    if (notif?.emailEnabled && notif.email && project) {
      const host = appUrl(req);
      const trackUrl = `${host}/#/track/${project.shareToken}`;
      const result = await sendNotificationEmail(notif.email, project.clientName, update.message, trackUrl, project.id, (project as any).userId ?? null);
      return res.status(201).json({ update, emailResult: result });
    }
    res.status(201).json({ update });
  });
  app.delete("/api/admin/updates/:id", requireAuth, async (req, res) => { await storage.deleteUpdate(+req.params.id); res.json({ ok: true }); });

  // ── Admin: Photos ──
  app.get("/api/admin/projects/:id/photos", requireAuth, async (req, res) => res.json(await storage.getPhotosByProject(+req.params.id)));
  app.post("/api/admin/projects/:id/photos", requireAuth, async (req, res) => {
    const photo = await storage.createPhoto({ ...req.body, projectId: +req.params.id });
    // Auto-post update when photo added
    const project = await storage.getProject(+req.params.id);
    if (project) {
      await storage.createUpdate({ projectId: +req.params.id, message: `📷 New ${req.body.photoType === "before" ? "before" : req.body.photoType === "after" ? "after" : "progress"} photo added${req.body.caption ? `: ${req.body.caption}` : ""}`, type: "photo", postedBy: req.body.postedBy || "Contractor" });
    }
    res.status(201).json(photo);
  });
  app.delete("/api/admin/photos/:id", requireAuth, async (req, res) => { await storage.deletePhoto(+req.params.id); res.json({ ok: true }); });

  // ── Admin: Notification prefs ──
  app.get("/api/admin/projects/:id/notif", requireAuth, async (req, res) => res.json(await storage.getNotifPref(+req.params.id) || null));
  app.post("/api/admin/projects/:id/notif", requireAuth, async (req, res) => res.json(await storage.upsertNotifPref(+req.params.id, req.body)));

  // ── Admin: Signatures ──
  app.get("/api/admin/projects/:id/signatures", requireAuth, async (req, res) => res.json(await storage.getSignaturesByProject(+req.params.id)));

  // ── Admin: QR Code (admin version with white background) ──
  app.get("/api/admin/qr/:token", requireAuth, async (req, res) => {
    const project = await storage.getProjectByToken(req.params.token);
    if (!project) return res.status(404).json({ error: "Not found" });
    const host = appUrl(req);
    const trackUrl = `${host}/#/track/${req.params.token}`;
    const qrDataUrl = await QRCode.toDataURL(trackUrl, { width: 400, margin: 2, color: { dark: "#000000", light: "#ffffff" } });
    res.json({ qrDataUrl, trackUrl, clientName: project.clientName });
  });

  // ── Admin: FAQs ──
  app.get("/api/admin/faqs", requireAuth, async (_req, res) => res.json(await storage.getAllFaqs()));
  app.post("/api/admin/faqs", requireAuth, async (req, res) => res.status(201).json(await storage.createFaq(req.body)));
  app.patch("/api/admin/faqs/:id", requireAuth, async (req, res) => res.json(await storage.updateFaq(+req.params.id, req.body)));
  app.delete("/api/admin/faqs/:id", requireAuth, async (req, res) => { await storage.deleteFaq(+req.params.id); res.json({ ok: true }); });

  // ── Admin: Testimonials ──
  app.get("/api/admin/testimonials", requireAuth, async (_req, res) => res.json(await storage.getAllTestimonials()));
  app.post("/api/admin/testimonials", requireAuth, async (req, res) => res.status(201).json(await storage.createTestimonial(req.body)));
  app.patch("/api/admin/testimonials/:id", requireAuth, async (req, res) => res.json(await storage.updateTestimonial(+req.params.id, req.body)));
  app.delete("/api/admin/testimonials/:id", requireAuth, async (req, res) => { await storage.deleteTestimonial(+req.params.id); res.json({ ok: true }); });

  // ── Admin: Pricing ──
  app.get("/api/admin/pricing", requireAuth, async (_req, res) => res.json(await storage.getAllPlans()));
  app.post("/api/admin/pricing", requireAuth, async (req, res) => res.status(201).json(await storage.createPlan(req.body)));
  app.patch("/api/admin/pricing/:id", requireAuth, async (req, res) => res.json(await storage.updatePlan(+req.params.id, req.body)));
  app.delete("/api/admin/pricing/:id", requireAuth, async (req, res) => { await storage.deletePlan(+req.params.id); res.json({ ok: true }); });

  // ── Admin: Quotations (NEW) ──
  app.get("/api/admin/projects/:id/quotations", requireAuth, async (req, res) => res.json(await storage.getQuotationsByProject(+req.params.id)));
  app.post("/api/admin/projects/:id/quotations", requireAuth, async (req, res) => res.status(201).json(await storage.createQuotation({ ...req.body, projectId: +req.params.id })));
  app.patch("/api/admin/quotations/:id", requireAuth, async (req, res) => res.json(await storage.updateQuotation(+req.params.id, req.body)));

  // ── Admin: Document Center (NEW) ──
  app.get("/api/admin/projects/:id/documents", requireAuth, async (req, res) => res.json(await storage.getDocumentsByProject(+req.params.id)));
  app.post("/api/admin/projects/:id/documents", requireAuth, async (req, res) => res.status(201).json(await storage.createDocument({ ...req.body, projectId: +req.params.id })));
  app.patch("/api/admin/documents/:id", requireAuth, async (req, res) => res.json(await storage.updateDocument(+req.params.id, req.body)));

  // ── Admin: Payments (NEW) ──
  app.get("/api/admin/projects/:id/payments", requireAuth, async (req, res) => res.json(await storage.getPaymentsByProject(+req.params.id)));
  app.post("/api/admin/projects/:id/payments", requireAuth, async (req, res) => res.status(201).json(await storage.createPayment({ ...req.body, projectId: +req.params.id })));
  app.patch("/api/admin/payments/:id", requireAuth, async (req, res) => res.json(await storage.updatePayment(+req.params.id, req.body)));

  // ── Admin: Inventory (NEW) ──
  app.get("/api/admin/inventory", requireAuth, async (_req, res) => res.json(await storage.getAllInventory()));
  app.patch("/api/admin/inventory/:id", requireAuth, async (req, res) => res.json(await storage.updateInventory(+req.params.id, req.body)));

  // ── Admin: Referrals (NEW) ──
  // ── Admin: Market Intelligence (Competitors) ──
  app.get("/api/admin/competitors", requireAuth, async (_req, res) => res.json((await storage.getAllCompetitors()).filter((c: any) => (c.userId ?? null) === null)));
  app.post("/api/admin/competitors", requireAuth, async (req, res) => {
    const parsed = insertCompetitorSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid competitor", issues: parsed.error.issues });
    res.status(201).json(await storage.createCompetitor({ ...parsed.data, userId: null } as any));
  });
  app.patch("/api/admin/competitors/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });
    const parsed = insertCompetitorSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid competitor", issues: parsed.error.issues });
    const existing = (await storage.getAllCompetitors()).find((c: any) => c.id === id);
    if (!existing || ((existing as any).userId ?? null) !== null) return res.status(404).json({ error: "Competitor not found" });
    const updated = await storage.updateCompetitor(id, parsed.data);
    if (!updated) return res.status(404).json({ error: "Competitor not found" });
    res.json(updated);
  });
  app.delete("/api/admin/competitors/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });
    const existing = (await storage.getAllCompetitors()).find((c: any) => c.id === id);
    if (!existing || ((existing as any).userId ?? null) !== null) return res.status(404).json({ error: "Competitor not found" });
    await storage.deleteCompetitor(id);
    res.json({ ok: true });
  });

  app.get("/api/admin/referrals", requireAuth, async (_req, res) => res.json(await storage.getAllReferrals()));

  // ── Admin: Logistics/Crews (NEW) ──
  app.get("/api/admin/crews", requireAuth, async (_req, res) => res.json(await storage.getAllCrews()));

  // ── Admin: AI Designs (NEW) ──
  app.get("/api/admin/designs", requireAuth, async (_req, res) => res.json(await storage.getAllDesigns()));
  app.get("/api/admin/projects/:id/designs", requireAuth, async (req, res) => res.json(await storage.getDesignsByProject(+req.params.id)));
  app.post("/api/admin/designs", requireAuth, async (req, res) => res.status(201).json(await storage.createDesign(req.body)));

  // ── Admin: Leads ──
  // Admin leads now live in the shared workspace routes (see workspace-routes.ts).

  // ── Admin: Referrals ──
  app.get("/api/admin/referrals", requireAuth, async (_req, res) => res.json(await storage.getAllReferrals()));

  // ── Admin: Procurement ──
  app.get("/api/admin/vendors", requireAuth, async (_req, res) => res.json(await storage.getAllVendors()));
  app.get("/api/admin/pos", requireAuth, async (_req, res) => res.json(await storage.getAllPOs()));

  // ── Admin: Proposals (Feature 1) ──
  app.get("/api/admin/proposals", requireAuth, async (_req, res) => res.json(await storage.getAllProposals()));
  app.get("/api/admin/projects/:id/proposals", requireAuth, async (req, res) => res.json(await storage.getProposalsByProject(+req.params.id)));
  app.post("/api/admin/proposals", requireAuth, async (req, res) => res.status(201).json(await storage.createProposal(req.body)));
  app.patch("/api/admin/proposals/:id", requireAuth, async (req, res) => res.json(await storage.updateProposal(+req.params.id, req.body)));

  // ── Admin: Service Jobs (Feature 2) ──
  app.get("/api/admin/service", requireAuth, async (_req, res) => res.json(await storage.getAllServiceJobs()));
  app.get("/api/admin/projects/:id/service", requireAuth, async (req, res) => res.json(await storage.getServiceJobsByProject(+req.params.id)));
  app.post("/api/admin/service", requireAuth, async (req, res) => res.status(201).json(await storage.createServiceJob(req.body)));
  app.patch("/api/admin/service/:id", requireAuth, async (req, res) => res.json(await storage.updateServiceJob(+req.params.id, req.body)));

  // ── Client Portal Auth (Feature 3) ──
  app.post("/api/client/login", async (req, res) => {
    const { token, pin } = req.body;
    if (rateLimited(`client-pin:${clientIp(req)}:${token}`, 8, 15 * 60_000)) {
      return res.status(429).json({ error: "Too many attempts. Wait 15 minutes and try again." });
    }
    const found = await storage.getProjectByTokenAndPin(token, pin);
    if (!found) return res.status(401).json({ error: "Invalid PIN or link." });
    const project = publicProject(found) as typeof found;
    const ms = await storage.getMilestonesByProject(project.id);
    const docs = await storage.getDocumentsByProject(project.id);
    const pays = await storage.getPaymentsByProject(project.id);
    res.json({ project, milestones: ms, documents: docs, payments: pays });
  });
  app.get("/api/admin/projects/:id/messages", requireAuth, async (req, res) => res.json(await storage.getClientMessages(+req.params.id)));
  app.post("/api/admin/projects/:id/messages", requireAuth, async (req, res) => {
    res.status(201).json(await storage.createClientMessage({ ...req.body, projectId: +req.params.id, sender: "contractor" }));
  });
  app.post("/api/client/messages", async (req, res) => {
    const { token, message } = req.body;
    const project = await storage.getProjectByToken(token);
    if (!project) return res.status(404).json({ error: "Project not found." });
    res.status(201).json(await storage.createClientMessage({ projectId: project.id, message, sender: "client", createdAt: new Date().toISOString() }));
  });
  app.patch("/api/admin/projects/:id/portal-pin", requireAuth, async (req, res) => {
    await storage.setClientPortalPin(+req.params.id, req.body.pin);
    res.json({ ok: true });
  });

  // ── Admin: Tenants (Feature 5) ──
  app.get("/api/admin/tenants", requireAuth, async (_req, res) => res.json(await storage.getAllTenants()));
  app.post("/api/admin/tenants", requireAuth, async (req, res) => res.status(201).json(await storage.createTenant(req.body)));
  app.patch("/api/admin/tenants/:id", requireAuth, async (req, res) => res.json(await storage.updateTenant(+req.params.id, req.body)));

  // ── ERP: HR & Payroll ──
  app.get("/api/admin/employees", requireAuth, async (_req, res) => res.json(await storage.getAllEmployees()));
  app.post("/api/admin/employees", requireAuth, async (req, res) => res.status(201).json(await storage.createEmployee(req.body)));
  app.patch("/api/admin/employees/:id", requireAuth, async (req, res) => res.json(await storage.updateEmployee(+req.params.id, req.body)));
  app.get("/api/admin/timesheets", requireAuth, async (_req, res) => res.json(await storage.getAllTimesheets()));
  app.post("/api/admin/timesheets", requireAuth, async (req, res) => res.status(201).json(await storage.createTimesheet(req.body)));
  app.patch("/api/admin/timesheets/:id", requireAuth, async (req, res) => res.json(await storage.updateTimesheet(+req.params.id, req.body)));

  // ── ERP: Finance & Accounting ──
  app.get("/api/admin/accounts", requireAuth, async (_req, res) => res.json(await storage.getChartOfAccounts()));
  app.get("/api/admin/journal", requireAuth, async (_req, res) => res.json(await storage.getAllJournalEntries()));
  app.post("/api/admin/journal", requireAuth, async (req, res) => res.status(201).json(await storage.createJournalEntry(req.body)));

  // ── ERP: Compliance ──
  app.get("/api/admin/compliance", requireAuth, async (_req, res) => res.json(await storage.getAllComplianceItems()));
  app.post("/api/admin/compliance", requireAuth, async (req, res) => res.status(201).json(await storage.createComplianceItem(req.body)));
  app.patch("/api/admin/compliance/:id", requireAuth, async (req, res) => res.json(await storage.updateComplianceItem(+req.params.id, req.body)));

  // ── ERP: BOM Templates ──
  app.get("/api/admin/bom", requireAuth, async (_req, res) => res.json(await storage.getAllBomTemplates()));
  app.post("/api/admin/bom", requireAuth, async (req, res) => res.status(201).json(await storage.createBomTemplate(req.body)));

  // ── Elite ERP: Inventory Ledger ──
  app.get("/api/admin/stock-transactions", requireAuth, async (req, res) => {
    const inventoryId = req.query.inventoryId ? +req.query.inventoryId : undefined;
    res.json(await storage.getStockTransactions(inventoryId));
  });
  app.post("/api/admin/stock-transactions", requireAuth, async (req, res) => res.status(201).json(await storage.createStockTransaction(req.body)));

  // ── Elite ERP: Scheduling ──
  app.get("/api/admin/schedules", requireAuth, async (_req, res) => res.json(await storage.getAllSchedules()));
  app.post("/api/admin/schedules", requireAuth, async (req, res) => res.status(201).json(await storage.createSchedule(req.body)));
  app.patch("/api/admin/schedules/:id", requireAuth, async (req, res) => res.json(await storage.updateSchedule(+req.params.id, req.body)));
  app.delete("/api/admin/schedules/:id", requireAuth, async (req, res) => { await storage.deleteSchedule(+req.params.id); res.status(204).send(); });

  // ── Elite ERP: Notifications ──
  app.get("/api/admin/notifications", requireAuth, async (_req, res) => res.json(await storage.getAllNotifications()));
  app.post("/api/admin/notifications", requireAuth, async (req, res) => res.status(201).json(await storage.createNotification(req.body)));
  app.patch("/api/admin/notifications/:id/read", requireAuth, async (req, res) => res.json(await storage.markNotificationRead(+req.params.id)));

  // ── IoT Solar Monitoring ──
  // Public: client tracker monitoring feed
  app.get("/api/track/:token/monitoring", async (req, res) => {
    try {
      const project = await storage.getProjectByToken(req.params.token);
      if (!project) return res.status(404).json({ error: "Project not found" });
      const data = await storage.getMonitoringData(project.id);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Admin: configure inverter for a project
  app.patch("/api/admin/projects/:id/inverter", requireAuth, async (req, res) => {
    try {
      const { inverterModel, inverterSerial, monitoringStatus } = req.body;
      const updated = await storage.updateInverterConfig(
        +req.params.id,
        inverterModel || "Huawei SUN2000-8KTL",
        inverterSerial || "",
        monitoringStatus || "offline"
      );
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  // Admin: generate 24h mock data for a project
  app.post("/api/admin/projects/:id/monitoring/generate", requireAuth, async (req, res) => {
    try {
      const count = await storage.generateMockReadings(+req.params.id);
      res.json({ ok: true, readingsGenerated: count });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Admin: Site Survey (NEW Phase 2) ──
  app.get("/api/admin/projects/:id/survey", requireAuth, async (req, res) => {
    res.json(await storage.getSiteSurveyByProject(+req.params.id));
  });

  app.get("/api/admin/users", requireAuth, async (_req, res) => {
    res.json((await storage.getAllUsers()).map(publicUser));
  });

  app.post("/api/admin/projects/:id/survey", requireAuth, async (req, res) => {
    const existing = await storage.getSiteSurveyByProject(+req.params.id);
    if (existing) {
      return res.json(await storage.updateSiteSurvey(existing.id, req.body));
    }
    res.status(201).json(await storage.createSiteSurvey({ ...req.body, projectId: +req.params.id }));
  });

  // ══════════════════════════════════════════════════════════════
  // ── USER SELF-SERVICE AUTH & ROUTES ──
  // ══════════════════════════════════════════════════════════════

  // ── User Registration ──
  const userView = (u: any) => ({
    id: u.id, name: u.name, email: u.email, company: u.company,
    trialStartDate: u.trialStartDate, trialEndDate: u.trialEndDate,
    subscriptionStatus: u.subscriptionStatus, subscriptionPlan: u.subscriptionPlan,
    billingCycle: u.billingCycle, paidUntil: u.paidUntil ?? null,
  });

  /** Trial ends after 15 days; a paid plan ends at paidUntil unless renewed. */
  async function refreshAccess(user: any) {
    const now = Date.now();
    let status = user.subscriptionStatus;
    if (status === "trial" && new Date(user.trialEndDate).getTime() < now) status = "expired";
    if (status === "active" && (!user.paidUntil || new Date(user.paidUntil).getTime() < now)) status = "expired";
    if (status !== user.subscriptionStatus) {
      await storage.updateUserSubscription(user.id, { subscriptionStatus: status });
      user.subscriptionStatus = status;
    }
    return user;
  }

  app.post("/api/user/register", async (req, res) => {
    try {
      if (rateLimited(`register:${clientIp(req)}`, 10, 60 * 60_000)) {
        return res.status(429).json({ error: "Too many sign-ups from this connection. Try again later." });
      }
      const email = String(req.body?.email ?? "").trim().toLowerCase();
      const password = String(req.body?.password ?? "");
      const name = String(req.body?.name ?? "").trim().slice(0, 120);
      const company = String(req.body?.company ?? "").trim().slice(0, 120) || null;
      const phone = String(req.body?.phone ?? "").trim().slice(0, 40) || null;
      if (!email || !password || !name) return res.status(400).json({ error: "Name, email, and password are required." });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Enter a valid email address." });
      if (password.length < MIN_PASSWORD_LENGTH) return res.status(400).json({ error: `Use a password of at least ${MIN_PASSWORD_LENGTH} characters.` });
      const existing = await storage.getUserByEmail(email);
      if (existing) return res.status(409).json({ error: "An account with this email already exists." });
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days
      const user = await storage.createUser({
        email,
        password: hashPassword(password),
        name,
        company,
        phone,
        googleId: null,
        trialStartDate: now.toISOString(),
        trialEndDate: trialEnd.toISOString(),
        subscriptionStatus: "trial",
        subscriptionPlan: null,
        billingCycle: null,
        subscriptionStartDate: null,
        paidUntil: null,
        createdAt: now.toISOString(),
      });
      res.status(201).json({ ok: true, token: signSession(user.id, "user"), user: userView(user) });
    } catch (e: any) {
      console.error("Registration error:", e);
      res.status(500).json({ error: "Registration failed. Please try again." });
    }
  });

  // ── User Login ──
  app.post("/api/user/login", async (req, res) => {
    try {
      const email = String(req.body?.email ?? "").trim().toLowerCase();
      const password = String(req.body?.password ?? "");
      if (rateLimited(`user-login:${clientIp(req)}`, 15, 15 * 60_000) || rateLimited(`user-login-acct:${email}`, 10, 15 * 60_000)) {
        return res.status(429).json({ error: "Too many attempts. Wait 15 minutes and try again." });
      }
      const user: any = await storage.getUserByEmail(email);
      const check = user ? verifyPassword(password, user.password) : { ok: false, needsRehash: false };
      if (!user || !check.ok) return res.status(401).json({ error: "Invalid email or password." });
      if (check.needsRehash) await storage.updateUserSubscription(user.id, { password: hashPassword(password) } as any);
      await refreshAccess(user);
      res.json({ ok: true, token: signSession(user.id, "user"), user: userView(user) });
    } catch (e: any) {
      res.status(500).json({ error: "Login failed." });
    }
  });

  // ── User Auth Middleware ──
  const requireUser = async (req: any, res: any, next: any) => {
    try {
      const session = verifySession(bearerToken(req), "user");
      if (!session) return res.status(401).json({ error: "Please sign in again." });
      const user = await storage.getUserById(session.sub);
      if (!user) return res.status(401).json({ error: "Please sign in again." });
      await refreshAccess(user);
      req.userId = user.id;
      req.user = user;
      next();
    } catch (e) {
      res.status(401).json({ error: "Please sign in again." });
    }
  };

  // ── Get Current User Profile ──
  app.get("/api/user/me", requireUser, async (req: any, res) => {
    res.json(userView(req.user));
  });

  app.post("/api/user/password", requireUser, async (req: any, res) => {
    const current = String(req.body?.currentPassword ?? "");
    const next = String(req.body?.newPassword ?? "");
    if (next.length < MIN_PASSWORD_LENGTH) return res.status(400).json({ error: `Use at least ${MIN_PASSWORD_LENGTH} characters.` });
    if (!verifyPassword(current, req.user.password).ok) return res.status(401).json({ error: "Current password is wrong." });
    await storage.updateUserSubscription(req.userId, { password: hashPassword(next) } as any);
    res.json({ ok: true });
  });

  // ── Write access requires an active trial or paid plan ──
  const requireActiveUser = async (req: any, res: any, next: any) => {
    await requireUser(req, res, () => {
      if (req.user?.subscriptionStatus === "expired" || req.user?.subscriptionStatus === "cancelled") {
        return res.status(402).json({ error: "Your trial or plan has ended. Choose a plan to continue.", subscriptionStatus: "expired" });
      }
      next();
    });
  };

  async function ownedProject(req: any, id: number) {
    const project = await storage.getProject(id);
    return project && (project as any).userId === req.userId ? project : null;
  }

  app.get("/api/user/projects", requireUser, async (req: any, res) => {
    // Viewing stays open after expiry so the contractor can still see their work behind the paywall.
    res.json(await storage.getProjectsByUserId(req.userId));
  });

  app.post("/api/user/projects", requireActiveUser, async (req: any, res) => {
    const b = req.body ?? {};
    const clientName = String(b.clientName ?? "").trim().slice(0, 120);
    const address = String(b.address ?? "").trim().slice(0, 300);
    if (!clientName || !address) return res.status(400).json({ error: "Client name and address are required." });
    const num = (v: any, d: number) => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : d);
    const data: any = {
      clientName,
      clientEmail: String(b.clientEmail ?? "").trim().slice(0, 200) || null,
      clientPhone: String(b.clientPhone ?? "").trim().slice(0, 40) || null,
      address,
      systemKw: num(b.systemKw, 6),
      panelCount: Math.round(num(b.panelCount, 0)),
      contractValue: num(b.contractValue, 0),
      status: "survey",
      overallProgress: 0,
      shareToken: genToken(),
      userId: req.userId,
      createdAt: new Date().toISOString(),
    };
    const proj = await storage.createProject(data);
    const defaults = [
      ["Site Survey & Assessment", "Roof assessment, shading analysis, structural review", "survey", 1],
      ["System Design", "Panel layout, inverter selection, electrical design", "design", 2],
      ["Permit Submission", "Building and electrical permits submitted", "permitting", 3],
      ["Permit Approval", "All permits and utility interconnection approved", "permitting", 4],
      ["Material Procurement", "Panels, inverter, racking, and wiring delivered", "procurement", 5],
      ["Racking Installation", "Roof mounts and racking system installed", "installation", 6],
      ["Panel Installation", "Solar panels mounted and connected", "installation", 7],
      ["Inverter & Electrical Work", "Inverter, wiring, conduit, and electrical connections", "installation", 8],
      ["Final Inspection", "Local authority and utility final inspection", "inspection", 9],
      ["Commissioning & Handover", "System testing, monitoring setup, client walkthrough", "commissioned", 10],
    ];
    for (const [t, d, p, o] of defaults) {
      await storage.createMilestone({ projectId: proj.id, title: t as string, description: d as string, phase: p as string, sortOrder: o as number, status: "pending" });
    }
    await storage.createUpdate({ projectId: proj.id, message: `Welcome ${proj.clientName}! Your solar installation project has been started.`, type: "update", postedBy: "SolarIQ" });
    res.status(201).json(proj);
  });

  app.get("/api/user/projects/:id", requireUser, async (req: any, res) => {
    const project = await ownedProject(req, +req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found." });
    const ms = await storage.getMilestonesByProject(project.id);
    const upd = await storage.getUpdatesByProject(project.id);
    res.json({ project, milestones: ms.sort((a, b) => a.sortOrder - b.sortOrder), updates: upd });
  });

  // Contractors can update milestones only on their own projects.
  app.patch("/api/user/milestones/:id", requireActiveUser, async (req: any, res) => {
    const id = +req.params.id;
    const projects = await storage.getProjectsByUserId(req.userId);
    let target: any = null;
    for (const p of projects) {
      const ms = await storage.getMilestonesByProject(p.id);
      target = ms.find(m => m.id === id);
      if (target) break;
    }
    if (!target) return res.status(404).json({ error: "Milestone not found." });
    const status = req.body?.status;
    if (!["pending", "in_progress", "completed", "blocked"].includes(status)) return res.status(400).json({ error: "Invalid status." });
    const data: any = { status };
    if (status === "completed") data.completedAt = new Date().toISOString();
    if (typeof req.body?.note === "string") data.note = req.body.note.slice(0, 1000);
    const updated = await storage.updateMilestone(id, data);
    const allMs = await storage.getMilestonesByProject(updated!.projectId);
    const done = allMs.filter(m => m.status === "completed").length;
    const pct = allMs.length ? Math.round((done / allMs.length) * 100) : 0;
    await storage.updateProject(updated!.projectId, { overallProgress: pct, status: updated!.phase });
    res.json(updated);
  });

  registerWorkspaceRoutes(app, { requireAuth, requireUser, requireActiveUser, appUrl });
  registerBillingRoutes(app, { requireAuth, requireUser, appUrl });

  // Unknown API paths get a JSON 404 instead of falling through to the web app.
  app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));
}

