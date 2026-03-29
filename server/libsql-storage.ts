import { projects, milestones, updates, faqs, testimonials, pricingPlans, admins, milestonePhotos, signatures, notificationPrefs, quotations, documents, payments, inventory, designs, leads, referrals, vendors, purchaseOrders, crews, proposals, serviceJobs, clientMessages, tenants, employees, timesheets, chartOfAccounts, journalEntries, complianceItems, bomTemplates, stockTransactions, schedules, notifications, solarReadings, siteSurveys } from "@shared/schema";
import type { InsertProject, Project, InsertMilestone, Milestone, InsertUpdate, Update, InsertFaq, Faq, InsertTestimonial, Testimonial, InsertPricing, PricingPlan, InsertMilestonePhoto, MilestonePhoto, InsertSignature, Signature, InsertNotif, NotificationPref, InsertQuotation, Quotation, InsertDocument, Document, InsertPayment, Payment, InsertInventory, Inventory, InsertDesign, Design, Lead, InsertLead, Referral, Vendor, PurchaseOrder, Crew, InsertCrew, Proposal, InsertProposal, ServiceJob, InsertServiceJob, ClientMessage, InsertClientMessage, Tenant, InsertTenant, Employee, InsertEmployee, Timesheet, InsertTimesheet, ChartOfAccount, JournalEntry, ComplianceItem, BomTemplate, StockTransaction, InsertStockTransaction, Schedule, InsertSchedule, Notification, InsertNotification, Admin, InsertAdmin, SolarReading, InsertReading, SiteSurvey, InsertSiteSurvey } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import { IStorage } from "./storage-interface.js";

let db: any;
let client: any;

export class LibSQLStorage implements IStorage {
  constructor() {
    client = createClient({
      url: process.env.DATABASE_URL || "file:local.db"
    });
    db = drizzle(client);
  }

  // Projects
  async getAllProjects() { return await db.select().from(projects).all(); }
  async getProject(id: number) { 
    const res = await db.select().from(projects).where(eq(projects.id, id)).all();
    return res[0] || null;
  }
  async getProjectByToken(token: string) { 
    const res = await db.select().from(projects).where(eq(projects.shareToken, token)).all();
    return res[0] || null;
  }
  async createProject(data: InsertProject): Promise<Project> { 
    const res = await db.insert(projects).values({ ...data, createdAt: new Date().toISOString() }).returning().all();
    return res[0];
  }
  async updateProject(id: number, data: Partial<Project>) { 
    const res = await db.update(projects).set(data).where(eq(projects.id, id)).returning().all();
    return res[0];
  }
  async deleteProject(id: number) { await db.delete(projects).where(eq(projects.id, id)).run(); }

  // Milestones
  async getMilestonesByProject(pid: number) { return await db.select().from(milestones).where(eq(milestones.projectId, pid)).all(); }
  async createMilestone(data: InsertMilestone): Promise<Milestone> { 
    const res = await db.insert(milestones).values(data).returning().all();
    return res[0];
  }
  async updateMilestone(id: number, data: Partial<Milestone>) { 
    const res = await db.update(milestones).set(data).where(eq(milestones.id, id)).returning().all();
    return res[0];
  }
  async deleteMilestone(id: number) { await db.delete(milestones).where(eq(milestones.id, id)).run(); }

  // Updates
  async getUpdatesByProject(pid: number) { return await db.select().from(updates).where(eq(updates.projectId, pid)).all(); }
  async createUpdate(data: InsertUpdate): Promise<Update> { 
    const res = await db.insert(updates).values({ ...data, createdAt: new Date().toISOString() }).returning().all();
    return res[0];
  }
  async deleteUpdate(id: number) { await db.delete(updates).where(eq(updates.id, id)).run(); }

  // FAQs
  async getAllFaqs() { return await db.select().from(faqs).all(); }
  async getPublishedFaqs() { 
    return await db.select().from(faqs).where(eq(faqs.published, 1)).all();
  }
  async createFaq(data: InsertFaq): Promise<Faq> { 
    const res = await db.insert(faqs).values(data).returning().all();
    return res[0];
  }
  async updateFaq(id: number, data: Partial<Faq>) { 
    const res = await db.update(faqs).set(data).where(eq(faqs.id, id)).returning().all();
    return res[0];
  }
  async deleteFaq(id: number) { await db.delete(faqs).where(eq(faqs.id, id)).run(); }

  // Testimonials
  async getAllTestimonials() { return await db.select().from(testimonials).all(); }
  async getPublishedTestimonials() { 
    return await db.select().from(testimonials).where(eq(testimonials.published, 1)).all();
  }
  async createTestimonial(data: InsertTestimonial): Promise<Testimonial> { 
    const res = await db.insert(testimonials).values({ ...data, createdAt: new Date().toISOString() }).returning().all();
    return res[0];
  }
  async updateTestimonial(id: number, data: Partial<Testimonial>) { 
    const res = await db.update(testimonials).set(data).where(eq(testimonials.id, id)).returning().all();
    return res[0];
  }
  async deleteTestimonial(id: number) { await db.delete(testimonials).where(eq(testimonials.id, id)).run(); }

  // Pricing
  async getAllPlans() { return await db.select().from(pricingPlans).all(); }
  async getPublishedPlans() { 
    return await db.select().from(pricingPlans).where(eq(pricingPlans.published, 1)).all();
  }
  async createPlan(data: InsertPricing): Promise<PricingPlan> { 
    const res = await db.insert(pricingPlans).values(data).returning().all();
    return res[0];
  }
  async updatePlan(id: number, data: Partial<PricingPlan>) { 
    const res = await db.update(pricingPlans).set(data).where(eq(pricingPlans.id, id)).returning().all();
    return res[0];
  }
  async deletePlan(id: number) { await db.delete(pricingPlans).where(eq(pricingPlans.id, id)).run(); }

  // Photos
  async getPhotosByProject(pid: number) { return await db.select().from(milestonePhotos).where(eq(milestonePhotos.projectId, pid)).all(); }
  async getPhotosByMilestone(mid: number) { return await db.select().from(milestonePhotos).where(eq(milestonePhotos.milestoneId, mid)).all(); }
  async createPhoto(data: InsertMilestonePhoto): Promise<MilestonePhoto> { 
    const res = await db.insert(milestonePhotos).values({ ...data, createdAt: new Date().toISOString() }).returning().all();
    return res[0];
  }
  async deletePhoto(id: number) { await db.delete(milestonePhotos).where(eq(milestonePhotos.id, id)).run(); }

  // Signatures
  async getSignaturesByProject(pid: number) { return await db.select().from(signatures).where(eq(signatures.projectId, pid)).all(); }
  async createSignature(data: InsertSignature): Promise<Signature> { 
    const res = await db.insert(signatures).values({ ...data, signedAt: new Date().toISOString() }).returning().all();
    return res[0];
  }

  // Notification Prefs
  async getNotifPref(pid: number) { 
    const res = await db.select().from(notificationPrefs).where(eq(notificationPrefs.projectId, pid)).all();
    return res[0] || null;
  }
  async upsertNotifPref(pid: number, data: Partial<InsertNotif>): Promise<NotificationPref> {
    const existing = await this.getNotifPref(pid);
    if (existing) {
      const res = await db.update(notificationPrefs).set(data).where(eq(notificationPrefs.id, existing.id)).returning().all();
      return res[0];
    }
    const res = await db.insert(notificationPrefs).values({ projectId: pid, ...data } as InsertNotif).returning().all();
    return res[0];
  }

  // Admin
  async getAdmin(username: string, password: string) { 
    const res = await client.execute({ sql: "SELECT * FROM admins WHERE username=? AND password=?", args: [username, password] });
    return res.rows[0] || null;
  }

  // Quotations
  async getQuotationsByProject(pid: number) { return await db.select().from(quotations).where(eq(quotations.projectId, pid)).all(); }
  async createQuotation(data: InsertQuotation): Promise<Quotation> {
    const res = await db.insert(quotations).values({ ...data, createdAt: new Date().toISOString() }).returning().all();
    return res[0];
  }
  async updateQuotation(id: number, data: Partial<Quotation>) {
    const res = await db.update(quotations).set(data).where(eq(quotations.id, id)).returning().all();
    return res[0];
  }

  // Documents
  async getDocumentsByProject(pid: number) { return await db.select().from(documents).where(eq(documents.projectId, pid)).all(); }
  async createDocument(data: InsertDocument): Promise<Document> {
    const res = await db.insert(documents).values({ ...data, uploadedAt: new Date().toISOString() }).returning().all();
    return res[0];
  }
  async updateDocument(id: number, data: Partial<Document>) {
    const res = await db.update(documents).set(data).where(eq(documents.id, id)).returning().all();
    return res[0];
  }

  // Payments
  async getPaymentsByProject(pid: number) { return await db.select().from(payments).where(eq(payments.projectId, pid)).all(); }
  async createPayment(data: InsertPayment): Promise<Payment> {
    const res = await db.insert(payments).values({ ...data, createdAt: new Date().toISOString() }).returning().all();
    return res[0];
  }
  async updatePayment(id: number, data: Partial<Payment>) {
    const res = await db.update(payments).set(data).where(eq(payments.id, id)).returning().all();
    return res[0];
  }

  // Inventory
  async getAllInventory() { return await db.select().from(inventory).all(); }
  async updateInventory(id: number, data: Partial<Inventory>) {
    const res = await db.update(inventory).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(inventory.id, id)).returning().all();
    return res[0];
  }

  // AI Designs
  async getAllDesigns() { return await db.select().from(designs).all(); }
  async getDesignsByProject(pid: number) { return await db.select().from(designs).where(eq(designs.projectId, pid)).all(); }
  async createDesign(data: InsertDesign): Promise<Design> {
    const res = await db.insert(designs).values({ ...data, createdAt: new Date().toISOString() }).returning().all();
    return res[0];
  }

  // Leads
  async getAllLeads() { return await db.select().from(leads).all(); }
  async createLead(data: InsertLead): Promise<Lead> {
    const res = await db.insert(leads).values({ ...data, createdAt: new Date().toISOString() }).returning().all();
    return res[0];
  }
  async updateLead(id: number, data: Partial<Lead>) {
    const res = await db.update(leads).set(data).where(eq(leads.id, id)).returning().all();
    return res[0];
  }

  // Referrals
  async getAllReferrals() { return await db.select().from(referrals).all(); }
  async getReferralsByProject(pid: number) { return await db.select().from(referrals).where(eq(referrals.referrerProjectId, pid)).all(); }

  // Procurement
  async getAllVendors() { return await db.select().from(vendors).all(); }
  async getAllPOs() { return await db.select().from(purchaseOrders).all(); }

  // Logistics
  async getAllCrews() { return await db.select().from(crews).all(); }
  async createCrew(data: InsertCrew): Promise<Crew> {
    const res = await db.insert(crews).values(data).returning().all();
    return res[0];
  }

  // Feature 1: Proposals
  async getAllProposals() { return await db.select().from(proposals).all(); }
  async getProposalsByProject(pid: number) { return await db.select().from(proposals).where(eq(proposals.projectId, pid)).all(); }
  async createProposal(data: InsertProposal): Promise<Proposal> {
    const res = await db.insert(proposals).values({ ...data, createdAt: new Date().toISOString() }).returning().all();
    return res[0];
  }
  async updateProposal(id: number, data: Partial<Proposal>) {
    const res = await db.update(proposals).set(data).where(eq(proposals.id, id)).returning().all();
    return res[0];
  }

  // Feature 2: Service Jobs
  async getAllServiceJobs() { return await db.select().from(serviceJobs).all(); }
  async getServiceJobsByProject(pid: number) { return await db.select().from(serviceJobs).where(eq(serviceJobs.projectId, pid)).all(); }
  async createServiceJob(data: InsertServiceJob): Promise<ServiceJob> {
    const res = await db.insert(serviceJobs).values({ ...data, createdAt: new Date().toISOString() }).returning().all();
    return res[0];
  }
  async updateServiceJob(id: number, data: Partial<ServiceJob>) {
    const res = await db.update(serviceJobs).set(data).where(eq(serviceJobs.id, id)).returning().all();
    return res[0];
  }

  // Auth
  async createAdmin(data: any): Promise<Admin> {
    const res = await db.insert(admins).values(data).returning().all();
    return res[0];
  }
  async findAdminByGoogleId(googleId: string): Promise<Admin | undefined> {
    const res = await db.select().from(admins).where(eq(admins.googleId, googleId)).all();
    return res[0];
  }
  async findAdminByEmail(email: string): Promise<Admin | undefined> {
    const res = await db.select().from(admins).where(eq(admins.email, email)).all();
    return res[0];
  }

  // Feature 3: Client Messages
  async getClientMessages(pid: number) { return await db.select().from(clientMessages).where(eq(clientMessages.projectId, pid)).all(); }
  async createClientMessage(data: InsertClientMessage): Promise<ClientMessage> {
    const res = await db.insert(clientMessages).values({ ...data, createdAt: new Date().toISOString() }).returning().all();
    return res[0];
  }

  // Feature 3: Client Portal Auth
  async getProjectByTokenAndPin(token: string, pin: string) {
    const res = await db.select().from(projects).all();
    return (res as any[]).find((p: any) => p.shareToken === token && p.clientPortalPin === pin) || null;
  }
  async setClientPortalPin(projectId: number, pin: string) {
    await db.update(projects).set({ clientPortalPin: pin }).where(eq(projects.id, projectId));
  }

  // Feature 5: Tenants
  async getAllTenants() { return await db.select().from(tenants).all(); }
  async createTenant(data: InsertTenant): Promise<Tenant> {
    const res = await db.insert(tenants).values({ ...data, createdAt: new Date().toISOString() }).returning().all();
    return res[0];
  }
  async updateTenant(id: number, data: Partial<Tenant>) {
    const res = await db.update(tenants).set(data).where(eq(tenants.id, id)).returning().all();
    return res[0];
  }

  // ERP: HR & Payroll
  async getAllEmployees() { return await db.select().from(employees).all(); }
  async createEmployee(data: InsertEmployee): Promise<Employee> {
    const res = await db.insert(employees).values({ ...data, createdAt: new Date().toISOString() }).returning().all();
    return res[0];
  }
  async updateEmployee(id: number, data: Partial<Employee>) {
    const res = await db.update(employees).set(data).where(eq(employees.id, id)).returning().all();
    return res[0];
  }
  async getAllTimesheets() { return await db.select().from(timesheets).all(); }
  async createTimesheet(data: InsertTimesheet): Promise<Timesheet> {
    const res = await db.insert(timesheets).values({ ...data, createdAt: new Date().toISOString() }).returning().all();
    return res[0];
  }
  async updateTimesheet(id: number, data: Partial<Timesheet>) {
    const res = await db.update(timesheets).set(data).where(eq(timesheets.id, id)).returning().all();
    return res[0];
  }

  // ERP: Finance & Accounting
  async getChartOfAccounts() { return await db.select().from(chartOfAccounts).all(); }
  async getAllJournalEntries() { return await db.select().from(journalEntries).all(); }
  async createJournalEntry(data: Omit<JournalEntry, "id">) {
    const res = await db.insert(journalEntries).values({ ...data, createdAt: new Date().toISOString() }).returning().all();
    return res[0];
  }

  // ERP: Compliance
  async getAllComplianceItems() { return await db.select().from(complianceItems).all(); }
  async createComplianceItem(data: Omit<ComplianceItem, "id">) {
    const res = await db.insert(complianceItems).values({ ...data, createdAt: new Date().toISOString() }).returning().all();
    return res[0];
  }
  async updateComplianceItem(id: number, data: Partial<ComplianceItem>) {
    const res = await db.update(complianceItems).set(data).where(eq(complianceItems.id, id)).returning().all();
    return res[0];
  }

  // ERP: BOM Templates
  async getAllBomTemplates() { return await db.select().from(bomTemplates).all(); }
  async createBomTemplate(data: Omit<BomTemplate, "id">) {
    const res = await db.insert(bomTemplates).values({ ...data, createdAt: new Date().toISOString() }).returning().all();
    return res[0];
  }

  // Elite ERP: Inventory Ledger / Stock Transactions
  async getStockTransactions(inventoryId?: number): Promise<StockTransaction[]> {
    if (inventoryId) return await db.select().from(stockTransactions).where(eq(stockTransactions.inventoryId, inventoryId)).all();
    return await db.select().from(stockTransactions).all();
  }
  async createStockTransaction(data: InsertStockTransaction): Promise<StockTransaction> {
    const res = await db.insert(stockTransactions).values({ ...data, createdAt: new Date().toISOString() }).returning().all();
    // Atomically adjust inventory quantity
    const inv = await db.select().from(inventory).where(eq(inventory.id, data.inventoryId)).all();
    if (inv.length > 0) {
      const delta = data.type === 'in' ? data.quantity : -data.quantity;
      await db.update(inventory).set({ quantity: inv[0].quantity + delta, updatedAt: new Date().toISOString() }).where(eq(inventory.id, data.inventoryId));
    }
    return res[0];
  }

  // Elite ERP: Visual Scheduling (Gantt)
  async getAllSchedules(): Promise<Schedule[]> { return await db.select().from(schedules).all(); }
  async getSchedulesByProject(projectId: number): Promise<Schedule[]> { return await db.select().from(schedules).where(eq(schedules.projectId, projectId)).all(); }
  async createSchedule(data: InsertSchedule): Promise<Schedule> {
    const res = await db.insert(schedules).values(data).returning().all();
    return res[0];
  }
  async updateSchedule(id: number, data: Partial<Schedule>) {
    const res = await db.update(schedules).set(data).where(eq(schedules.id, id)).returning().all();
    return res[0];
  }
  async deleteSchedule(id: number) { await db.delete(schedules).where(eq(schedules.id, id)); }

  // Elite ERP: Smart Notifications
  async getAllNotifications(): Promise<Notification[]> { return await db.select().from(notifications).all(); }
  async createNotification(data: InsertNotification): Promise<Notification> {
    const res = await db.insert(notifications).values({ ...data, createdAt: new Date().toISOString() }).returning().all();
    return res[0];
  }
  async markNotificationRead(id: number) {
    const res = await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, id)).returning().all();
    return res[0];
  }

  // ── Solar Monitoring (IoT) ──
  async getMonitoringData(projectId: number) {
    const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
    const readings = await db.select().from(solarReadings)
      .where(eq(solarReadings.projectId, projectId))
      .orderBy(solarReadings.timestamp)
      .limit(96) // 48h of 30-min readings
      .all();
    return {
      readings,
      inverterModel: project?.inverterModel || "Huawei SUN2000-8KTL",
      inverterSerial: project?.inverterSerial || "",
      status: project?.monitoringStatus || "offline",
    };
  }

  async createReading(data: InsertReading) {
    const res = await db.insert(solarReadings).values(data).returning().all();
    return res[0];
  }

  async generateMockReadings(pid: number) {
    // Clear old readings for this project first
    await client.execute({ sql: "DELETE FROM solar_readings WHERE project_id = ?", args: [pid] });

    const readings: InsertReading[] = [];
    const now = new Date();
    const systemKwResult = await db.select().from(projects).where(eq(projects.id, pid)).get();
    const peakKw = systemKwResult?.systemKw ?? 6;
    let runningTodayKwh = 0;
    const baseTotalKwh = 1200 + Math.random() * 500; // lifetime baseline

    // Generate 48 readings: one every 30 minutes over the past 24 hours
    for (let i = 0; i < 48; i++) {
      const time = new Date(now.getTime() - (47 - i) * 30 * 60 * 1000);
      const hour = time.getHours() + time.getMinutes() / 60;
      // Solar bell curve: generates power between 6am and 7pm
      let wattage = 0;
      if (hour >= 6 && hour <= 19) {
        const normalized = (hour - 6) / 13; // 0 to 1 over solar day
        wattage = peakKw * Math.sin(normalized * Math.PI) * (0.85 + Math.random() * 0.3);
        if (wattage < 0) wattage = 0;
        // Add weather noise (occasional cloud dips)
        if (Math.random() < 0.15) wattage *= 0.3 + Math.random() * 0.4;
      }
      wattage = Math.max(0, wattage);
      // Accumulate today's energy in kWh (30-min intervals = 0.5h)
      runningTodayKwh += wattage * 0.5;
      readings.push({
        projectId: pid,
        wattageKw: Number(wattage.toFixed(2)),
        energyTodayKwh: Number(runningTodayKwh.toFixed(2)),
        energyTotalKwh: Number((baseTotalKwh + runningTodayKwh).toFixed(2)),
        timestamp: time.toISOString(),
      });
    }
    for (const r of readings) {
      await this.createReading(r);
    }
    // Set project status to online
    await db.update(projects).set({ monitoringStatus: "online" }).where(eq(projects.id, pid));
    return readings.length;
  }

  async updateInverterConfig(id: number, model: string, serial: string, status: string) {
    const res = await db.update(projects)
      .set({ inverterModel: model, inverterSerial: serial, monitoringStatus: status })
      .where(eq(projects.id, id))
      .returning().all();
    return res[0];
  }

  async updateProjectWeather(id: number, risk: string, alert?: string) {
    const res = await db.update(projects).set({ lastWeatherRisk: risk, weatherAlert: alert }).where(eq(projects.id, id)).returning().all();
    return res[0];
  }

  // Site Survey
  async getSiteSurveyByProject(pid: number) {
    const res = await db.select().from(siteSurveys).where(eq(siteSurveys.projectId, pid)).all();
    return res[0] || null;
  }
  async createSiteSurvey(data: InsertSiteSurvey): Promise<SiteSurvey> {
    const res = await db.insert(siteSurveys).values(data).returning().all();
    return res[0];
  }
  async updateSiteSurvey(id: number, data: Partial<SiteSurvey>) {
    const res = await db.update(siteSurveys).set(data).where(eq(siteSurveys.id, id)).returning().all();
    return res[0];
  }
}

export function getLibSQLDb() {
  return { db, client };
}
