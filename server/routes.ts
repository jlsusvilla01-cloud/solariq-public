import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import nodemailer from "nodemailer";
import QRCode from "qrcode";

function genToken() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

// Email transporter — uses ethereal (test) if no SMTP env vars set
async function getTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  // Create ethereal test account for demo
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

async function sendNotificationEmail(to: string, clientName: string, projectName: string, message: string, trackingUrl: string) {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: '"SolarIQ" <noreply@solariq.app>',
      to,
      subject: `Solar Installation Update — ${projectName}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f1117;color:#e5e7eb;padding:32px;border-radius:12px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
            <div style="width:36px;height:36px;background:#fbbf24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px">☀️</div>
            <span style="font-weight:700;font-size:18px;color:#fff">Solar<span style="color:#fbbf24">IQ</span></span>
          </div>
          <h2 style="color:#fff;margin:0 0 8px">Hi ${clientName},</h2>
          <p style="color:#9ca3af;margin:0 0 20px">Your solar installation has a new update:</p>
          <div style="background:#1f2937;border:1px solid #374151;border-radius:8px;padding:16px;margin-bottom:24px">
            <p style="color:#e5e7eb;margin:0;line-height:1.6">${message}</p>
          </div>
          <a href="${trackingUrl}" style="background:#fbbf24;color:#0f1117;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">
            View Full Progress →
          </a>
          <p style="color:#6b7280;font-size:12px;margin-top:24px">
            You're receiving this because you have a solar installation project tracked by SolarIQ.<br/>
            <a href="${trackingUrl}" style="color:#fbbf24">${trackingUrl}</a>
          </p>
        </div>
      `,
    });
    console.log("Email sent:", nodemailer.getTestMessageUrl(info));
    return { ok: true, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (e: any) {
    console.error("Email error:", e.message);
    return { ok: false, error: e.message };
  }
}

export async function registerRoutes(httpServer: Server, app: Express) {
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
    res.json({
      project,
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
    const host = `${req.protocol}://${req.get("host")}`;
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
  app.post("/api/admin/login", async (req, res) => {
    const { username, password } = req.body;
    const admin = await storage.getAdmin(username, password);
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ ok: true, name: admin.name, token: Buffer.from(`${username}:${password}`).toString("base64") });
  });

  // ── Google OAuth (Mocked for Demo) ──
  // In a real app, you'd use Passport with GoogleStrategy and real Client IDs.
  // We're providing the infrastructure here so you can easily swap it.
  app.get("/api/auth/google", (req, res) => {
    // Redirect to a mock Google consent screen
    const callbackUrl = `${req.protocol}://${req.get("host")}/api/auth/google/callback?code=mock_code`;
    res.send(`
      <div style="font-family:sans-serif;text-align:center;padding:100px;background:#0f1117;color:white;height:100vh">
        <h1 style="color:#fbbf24">Mock Google Login</h1>
        <p>In production, this would be accounts.google.com</p>
        <a href="${callbackUrl}" style="background:#fbbf24;color:#0f1117;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">
          Continue as demo@solariq.app
        </a>
      </div>
    `);
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    // Mock user info from "Google"
    const mockUser = {
      googleId: "google-12345",
      email: "demo@solariq.app",
      displayName: "Solar Champion",
    };

    let admin = await storage.findAdminByGoogleId(mockUser.googleId);
    if (!admin) {
      // Automatic Sign-up: Create new admin if not exists
      admin = await storage.createAdmin({
        username: mockUser.email,
        password: "oauth-user", // placeholder
        name: mockUser.displayName,
        email: mockUser.email,
        googleId: mockUser.googleId,
      });
    }

    // Generate token (using our simple Basic Auth compat for now)
    const token = Buffer.from(`${admin.username}:oauth-user`).toString("base64");
    
    // Redirect back to Admin with session info
    res.send(`
      <script>
        localStorage.setItem('solariq_admin_name', '${admin.name}');
        localStorage.setItem('solariq_admin_token', '${token}');
        window.location.href = '/#/admin';
      </script>
    `);
  });

  const requireAuth = async (req: any, res: any, next: any) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Basic ")) return res.status(401).json({ error: "Unauthorized" });
    const [u, p] = Buffer.from(auth.slice(6), "base64").toString().split(":");
    // For OAuth users, we accept our placeholder password
    if (p === "oauth-user") {
        const admin = await storage.findAdminByEmail(u);
        if (admin) {
            next();
            return;
        }
    }
    if (!(await storage.getAdmin(u, p))) return res.status(401).json({ error: "Unauthorized" });
    next();
  };

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
        const host = `${req.protocol}://${req.get("host")}`;
        const trackUrl = `${host}/#/track/${project.shareToken}`;
        sendNotificationEmail(notif.email, project.clientName, project.clientName, `Milestone completed: "${updated!.title}". Your installation is now ${pct}% complete.`, trackUrl);
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
      const host = `${req.protocol}://${req.get("host")}`;
      const trackUrl = `${host}/#/track/${project.shareToken}`;
      const result = await sendNotificationEmail(notif.email, project.clientName, project.clientName, update.message, trackUrl);
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
    const host = `${req.protocol}://${req.get("host")}`;
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
  app.get("/api/admin/referrals", requireAuth, async (_req, res) => res.json(await storage.getAllReferrals()));

  // ── Admin: Logistics/Crews (NEW) ──
  app.get("/api/admin/crews", requireAuth, async (_req, res) => res.json(await storage.getAllCrews()));

  // ── Admin: AI Designs (NEW) ──
  app.get("/api/admin/designs", requireAuth, async (_req, res) => res.json(await storage.getAllDesigns()));
  app.get("/api/admin/projects/:id/designs", requireAuth, async (req, res) => res.json(await storage.getDesignsByProject(+req.params.id)));
  app.post("/api/admin/designs", requireAuth, async (req, res) => res.status(201).json(await storage.createDesign(req.body)));

  // ── Admin: Leads ──
  app.get("/api/admin/leads", requireAuth, async (_req, res) => res.json(await storage.getAllLeads()));
  app.post("/api/admin/leads", requireAuth, async (req, res) => res.status(201).json(await storage.createLead(req.body)));
  app.patch("/api/admin/leads/:id", requireAuth, async (req, res) => res.json(await storage.updateLead(+req.params.id, req.body)));

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
    const project = await storage.getProjectByTokenAndPin(token, pin);
    if (!project) return res.status(401).json({ error: "Invalid PIN or link." });
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
}

