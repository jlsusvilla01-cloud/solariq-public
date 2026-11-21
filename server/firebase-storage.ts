import admin from "firebase-admin";
import { IStorage } from "./storage-interface.js";
import { 
  Project, InsertProject, Milestone, InsertMilestone, Update, InsertUpdate, 
  Faq, InsertFaq, Testimonial, InsertTestimonial, PricingPlan, InsertPricing, 
  MilestonePhoto, InsertMilestonePhoto, Signature, InsertSignature, 
  NotificationPref, InsertNotif, Quotation, InsertQuotation, Document, InsertDocument, 
  Payment, InsertPayment, Inventory, Design, InsertDesign, Lead, InsertLead, Competitor, InsertCompetitor, 
  Referral, Vendor, Crew, InsertCrew, Proposal, InsertProposal, ServiceJob, InsertServiceJob, 
  ClientMessage, InsertClientMessage, Tenant, InsertTenant, Employee, InsertEmployee, 
  Timesheet, InsertTimesheet, ChartOfAccount, JournalEntry, ComplianceItem, BomTemplate, 
  StockTransaction, InsertStockTransaction, Schedule, InsertSchedule, Notification, 
  InsertNotification, Admin, SolarReading, InsertReading, SiteSurvey, InsertSiteSurvey, User, InsertUser 
} from "@shared/schema";

/**
 * Firebase Firestore Implementation of IStorage.
 * Uses atomic counters to maintain numeric ID compatibility with Drizzle schemas.
 */
export class FirebaseStorage implements IStorage {
  private db: admin.firestore.Firestore;

  constructor() {
    if (!admin.apps.length) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    }
    this.db = admin.firestore();
  }

  // ── Helper: Atomic Counters for Numeric IDs ──
  private async getNextId(collection: string): Promise<number> {
    const counterRef = this.db.collection("_counters").doc(collection);
    return await this.db.runTransaction(async (t) => {
      const doc = await t.get(counterRef);
      const newId = (doc.data()?.current || 0) + 1;
      t.set(counterRef, { current: newId });
      return newId;
    });
  }

  // ── Generic CRUD Helpers ──
  private async getAll<T>(col: string): Promise<T[]> {
    const snap = await this.db.collection(col).get();
    return snap.docs.map(doc => doc.data() as T);
  }

  private async getById<T>(col: string, id: number): Promise<T | null> {
    const snap = await this.db.collection(col).where("id", "==", id).limit(1).get();
    return snap.empty ? null : (snap.docs[0].data() as T);
  }

  private async create<T>(col: string, data: any): Promise<T> {
    const id = await this.getNextId(col);
    const doc = { ...data, id };
    await this.db.collection(col).doc(id.toString()).set(doc);
    return doc as T;
  }

  private async update<T>(col: string, id: number, data: any): Promise<T> {
    const docRef = this.db.collection(col).doc(id.toString());
    await docRef.update(data);
    const updated = await docRef.get();
    return updated.data() as T;
  }

  private async delete(col: string, id: number): Promise<void> {
    await this.db.collection(col).doc(id.toString()).delete();
  }

  // ── Projects ──
  async getAllProjects() { return this.getAll<Project>("projects"); }
  async getProject(id: number) { return this.getById<Project>("projects", id); }
  async getProjectByToken(token: string) {
    const snap = await this.db.collection("projects").where("shareToken", "==", token).limit(1).get();
    return snap.empty ? null : (snap.docs[0].data() as Project);
  }
  async createProject(data: InsertProject) {
    return this.create<Project>("projects", { ...data, createdAt: new Date().toISOString() });
  }
  async updateProject(id: number, data: Partial<Project>) { return this.update<Project>("projects", id, data); }
  async deleteProject(id: number) { return this.delete("projects", id); }

  // ── Milestones ──
  async getMilestonesByProject(pid: number) {
    const snap = await this.db.collection("milestones").where("projectId", "==", pid).get();
    return snap.docs.map(doc => doc.data() as Milestone);
  }
  async createMilestone(data: InsertMilestone) { return this.create<Milestone>("milestones", data); }
  async updateMilestone(id: number, data: Partial<Milestone>) { return this.update<Milestone>("milestones", id, data); }
  async deleteMilestone(id: number) { return this.delete("milestones", id); }

  // ── Updates ──
  async getUpdatesByProject(pid: number) {
    const snap = await this.db.collection("updates").where("projectId", "==", pid).get();
    return snap.docs.map(doc => doc.data() as Update);
  }
  async createUpdate(data: InsertUpdate) {
    return this.create<Update>("updates", { ...data, createdAt: new Date().toISOString() });
  }
  async deleteUpdate(id: number) { return this.delete("updates", id); }

  // ── FAQs ──
  async getAllFaqs() { return this.getAll<Faq>("faqs"); }
  async getPublishedFaqs() {
    const snap = await this.db.collection("faqs").where("published", "==", 1).get();
    return snap.docs.map(doc => doc.data() as Faq);
  }
  async createFaq(data: InsertFaq) { return this.create<Faq>("faqs", data); }
  async updateFaq(id: number, data: Partial<Faq>) { return this.update<Faq>("faqs", id, data); }
  async deleteFaq(id: number) { return this.delete("faqs", id); }

  // ── Testimonials ──
  async getAllTestimonials() { return this.getAll<Testimonial>("testimonials"); }
  async getPublishedTestimonials() {
    const snap = await this.db.collection("testimonials").where("published", "==", 1).get();
    return snap.docs.map(doc => doc.data() as Testimonial);
  }
  async createTestimonial(data: InsertTestimonial) {
    return this.create<Testimonial>("testimonials", { ...data, createdAt: new Date().toISOString() });
  }
  async updateTestimonial(id: number, data: Partial<Testimonial>) { return this.update<Testimonial>("testimonials", id, data); }
  async deleteTestimonial(id: number) { return this.delete("testimonials", id); }

  // ── Pricing ──
  async getAllPlans() { return this.getAll<PricingPlan>("pricingPlans"); }
  async getPublishedPlans() {
    const snap = await this.db.collection("pricingPlans").where("published", "==", 1).get();
    return snap.docs.map(doc => doc.data() as PricingPlan);
  }
  async createPlan(data: InsertPricing) { return this.create<PricingPlan>("pricingPlans", data); }
  async updatePlan(id: number, data: Partial<PricingPlan>) { return this.update<PricingPlan>("pricingPlans", id, data); }
  async deletePlan(id: number) { return this.delete("pricingPlans", id); }

  // ── Photos ──
  async getPhotosByProject(pid: number) {
    const snap = await this.db.collection("milestonePhotos").where("projectId", "==", pid).get();
    return snap.docs.map(doc => doc.data() as MilestonePhoto);
  }
  async getPhotosByMilestone(mid: number) {
    const snap = await this.db.collection("milestonePhotos").where("milestoneId", "==", mid).get();
    return snap.docs.map(doc => doc.data() as MilestonePhoto);
  }
  async createPhoto(data: InsertMilestonePhoto) {
    return this.create<MilestonePhoto>("milestonePhotos", { ...data, createdAt: new Date().toISOString() });
  }
  async deletePhoto(id: number) { return this.delete("milestonePhotos", id); }

  // ── Signatures ──
  async getSignaturesByProject(pid: number) {
    const snap = await this.db.collection("signatures").where("projectId", "==", pid).get();
    return snap.docs.map(doc => doc.data() as Signature);
  }
  async createSignature(data: InsertSignature) {
    return this.create<Signature>("signatures", { ...data, signedAt: new Date().toISOString() });
  }

  // ── Notification Prefs ──
  async getNotifPref(pid: number) {
    const snap = await this.db.collection("notificationPrefs").where("projectId", "==", pid).limit(1).get();
    return snap.empty ? null : (snap.docs[0].data() as NotificationPref);
  }
  async upsertNotifPref(pid: number, data: Partial<InsertNotif>) {
    const existing = await this.getNotifPref(pid);
    if (existing) return this.update<NotificationPref>("notificationPrefs", existing.id, data);
    return this.create<NotificationPref>("notificationPrefs", { ...data, projectId: pid });
  }

  // ── Admin ──
  async getAdmin(username: string, password: string) {
    const snap = await this.db.collection("admins")
      .where("username", "==", username)
      .where("password", "==", password)
      .limit(1).get();
    return snap.empty ? null : snap.docs[0].data();
  }
  async createAdmin(data: any) { return this.create<Admin>("admins", data); }
  async findAdminByGoogleId(googleId: string) {
    const snap = await this.db.collection("admins").where("googleId", "==", googleId).limit(1).get();
    return snap.empty ? undefined : (snap.docs[0].data() as Admin);
  }
  async findAdminByEmail(email: string) {
    const snap = await this.db.collection("admins").where("email", "==", email).limit(1).get();
    return snap.empty ? undefined : (snap.docs[0].data() as Admin);
  }

  // ── Quotations ──
  async getQuotationsByProject(pid: number) {
    const snap = await this.db.collection("quotations").where("projectId", "==", pid).get();
    return snap.docs.map(doc => doc.data() as Quotation);
  }
  async createQuotation(data: InsertQuotation) {
    return this.create<Quotation>("quotations", { ...data, createdAt: new Date().toISOString() });
  }
  async updateQuotation(id: number, data: Partial<Quotation>) { return this.update<Quotation>("quotations", id, data); }

  // ── Documents ──
  async getDocumentsByProject(pid: number) {
    const snap = await this.db.collection("documents").where("projectId", "==", pid).get();
    return snap.docs.map(doc => doc.data() as Document);
  }
  async createDocument(data: InsertDocument) {
    return this.create<Document>("documents", { ...data, uploadedAt: new Date().toISOString() });
  }
  async updateDocument(id: number, data: Partial<Document>) { return this.update<Document>("documents", id, data); }

  // ── Payments ──
  async getPaymentsByProject(pid: number) {
    const snap = await this.db.collection("payments").where("projectId", "==", pid).get();
    return snap.docs.map(doc => doc.data() as Payment);
  }
  async createPayment(data: InsertPayment) {
    return this.create<Payment>("payments", { ...data, createdAt: new Date().toISOString() });
  }
  async updatePayment(id: number, data: Partial<Payment>) { return this.update<Payment>("payments", id, data); }

  // ── Inventory ──
  async getAllInventory() { return this.getAll<Inventory>("inventory"); }
  async updateInventory(id: number, data: Partial<Inventory>) {
    return this.update<Inventory>("inventory", id, { ...data, updatedAt: new Date().toISOString() });
  }

  // ── AI Designs ──
  async getAllDesigns() { return this.getAll<Design>("designs"); }
  async getDesignsByProject(pid: number) {
    const snap = await this.db.collection("designs").where("projectId", "==", pid).get();
    return snap.docs.map(doc => doc.data() as Design);
  }
  async createDesign(data: InsertDesign) {
    return this.create<Design>("designs", { ...data, createdAt: new Date().toISOString() });
  }

  // ── Leads ──
  async getAllLeads() { return this.getAll<Lead>("leads"); }
  async createLead(data: InsertLead) {
    return this.create<Lead>("leads", { ...data, createdAt: new Date().toISOString() });
  }
  async updateLead(id: number, data: Partial<Lead>) { return this.update<Lead>("leads", id, data); }

  // ── Market Intelligence (Competitors) ──
  async getAllCompetitors() { return this.getAll<Competitor>("competitors"); }
  async createCompetitor(data: InsertCompetitor) {
    return this.create<Competitor>("competitors", { ...data, createdAt: new Date().toISOString() });
  }
  async updateCompetitor(id: number, data: Partial<InsertCompetitor>) {
    const existing = await this.getById<Competitor>("competitors", id);
    if (!existing) return null;
    return this.update<Competitor>("competitors", id, data);
  }
  async deleteCompetitor(id: number) { return this.delete("competitors", id); }

  // ── Referrals ──
  async getAllReferrals() { return this.getAll<Referral>("referrals"); }
  async getReferralsByProject(pid: number) {
    const snap = await this.db.collection("referrals").where("referrerProjectId", "==", pid).get();
    return snap.docs.map(doc => doc.data() as Referral);
  }

  // ── Procurement ──
  async getAllVendors() { return this.getAll<Vendor>("vendors"); }
  async getAllPOs() { return this.getAll<any>("purchaseOrders"); }

  // ── Logistics ──
  async getAllCrews() { return this.getAll<Crew>("crews"); }
  async createCrew(data: InsertCrew) { return this.create<Crew>("crews", data); }

  // ── Proposals ──
  async getAllProposals() { return this.getAll<Proposal>("proposals"); }
  async getProposalsByProject(pid: number) {
    const snap = await this.db.collection("proposals").where("projectId", "==", pid).get();
    return snap.docs.map(doc => doc.data() as Proposal);
  }
  async createProposal(data: InsertProposal) {
    return this.create<Proposal>("proposals", { ...data, createdAt: new Date().toISOString() });
  }
  async updateProposal(id: number, data: Partial<Proposal>) { return this.update<Proposal>("proposals", id, data); }

  // ── Service Jobs ──
  async getAllServiceJobs() { return this.getAll<ServiceJob>("serviceJobs"); }
  async getServiceJobsByProject(pid: number) {
    const snap = await this.db.collection("serviceJobs").where("projectId", "==", pid).get();
    return snap.docs.map(doc => doc.data() as ServiceJob);
  }
  async createServiceJob(data: InsertServiceJob) {
    return this.create<ServiceJob>("serviceJobs", { ...data, createdAt: new Date().toISOString() });
  }
  async updateServiceJob(id: number, data: Partial<ServiceJob>) { return this.update<ServiceJob>("serviceJobs", id, data); }

  // ── Client Messages ──
  async getClientMessages(pid: number) {
    const snap = await this.db.collection("clientMessages").where("projectId", "==", pid).get();
    return snap.docs.map(doc => doc.data() as ClientMessage);
  }
  async createClientMessage(data: InsertClientMessage) {
    return this.create<ClientMessage>("clientMessages", { ...data, createdAt: new Date().toISOString() });
  }

  // ── Client Portal Auth ──
  async getProjectByTokenAndPin(token: string, pin: string) {
    const snap = await this.db.collection("projects")
      .where("shareToken", "==", token)
      .where("clientPortalPin", "==", pin)
      .limit(1).get();
    return snap.empty ? null : (snap.docs[0].data() as Project);
  }
  async setClientPortalPin(projectId: number, pin: string) {
    await this.db.collection("projects").doc(projectId.toString()).update({ clientPortalPin: pin });
  }

  // ── Tenants ──
  async getAllTenants() { return this.getAll<Tenant>("tenants"); }
  async createTenant(data: InsertTenant) {
    return this.create<Tenant>("tenants", { ...data, createdAt: new Date().toISOString() });
  }
  async updateTenant(id: number, data: Partial<Tenant>) { return this.update<Tenant>("tenants", id, data); }

  // ── HR ──
  async getAllEmployees() { return this.getAll<Employee>("employees"); }
  async createEmployee(data: InsertEmployee) {
    return this.create<Employee>("employees", { ...data, createdAt: new Date().toISOString() });
  }
  async updateEmployee(id: number, data: Partial<Employee>) { return this.update<Employee>("employees", id, data); }
  async getAllTimesheets() { return this.getAll<Timesheet>("timesheets"); }
  async createTimesheet(data: InsertTimesheet) {
    return this.create<Timesheet>("timesheets", { ...data, createdAt: new Date().toISOString() });
  }
  async updateTimesheet(id: number, data: Partial<Timesheet>) { return this.update<Timesheet>("timesheets", id, data); }

  // ── Finance ──
  async getChartOfAccounts() { return this.getAll<ChartOfAccount>("chartOfAccounts"); }
  async getAllJournalEntries() { return this.getAll<JournalEntry>("journalEntries"); }
  async createJournalEntry(data: any) {
    return this.create<JournalEntry>("journalEntries", { ...data, createdAt: new Date().toISOString() });
  }

  // ── Compliance ──
  async getAllComplianceItems() { return this.getAll<ComplianceItem>("complianceItems"); }
  async createComplianceItem(data: any) {
    return this.create<ComplianceItem>("complianceItems", { ...data, createdAt: new Date().toISOString() });
  }
  async updateComplianceItem(id: number, data: Partial<ComplianceItem>) { return this.update<ComplianceItem>("complianceItems", id, data); }

  // ── BOM ──
  async getAllBomTemplates() { return this.getAll<BomTemplate>("bomTemplates"); }
  async createBomTemplate(data: any) {
    return this.create<BomTemplate>("bomTemplates", { ...data, createdAt: new Date().toISOString() });
  }

  // ── Stock Trans ──
  async getStockTransactions(inventoryId?: number) {
    let q = this.db.collection("stockTransactions");
    if (inventoryId) {
      const snap = await q.where("inventoryId", "==", inventoryId).get();
      return snap.docs.map(doc => doc.data() as StockTransaction);
    }
    return this.getAll<StockTransaction>("stockTransactions");
  }
  async createStockTransaction(data: InsertStockTransaction) {
    const res = await this.create<StockTransaction>("stockTransactions", { ...data, createdAt: new Date().toISOString() });
    // Synchronize inventory quantity
    const invRef = this.db.collection("inventory").doc(data.inventoryId.toString());
    await this.db.runTransaction(async (t) => {
      const invDoc = await t.get(invRef);
      if (invDoc.exists) {
        const currentQty = invDoc.data()?.quantity || 0;
        const delta = data.type === 'in' ? data.quantity : -data.quantity;
        t.update(invRef, { quantity: currentQty + delta, updatedAt: new Date().toISOString() });
      }
    });
    return res;
  }

  // ── Scheduling ──
  async getAllSchedules() { return this.getAll<Schedule>("schedules"); }
  async getSchedulesByProject(projectId: number) {
    const snap = await this.db.collection("schedules").where("projectId", "==", projectId).get();
    return snap.docs.map(doc => doc.data() as Schedule);
  }
  async createSchedule(data: InsertSchedule) { return this.create<Schedule>("schedules", data); }
  async updateSchedule(id: number, data: Partial<Schedule>) { return this.update<Schedule>("schedules", id, data); }
  async deleteSchedule(id: number) { return this.delete("schedules", id); }

  // ── Notifications ──
  async getAllNotifications() { return this.getAll<Notification>("notifications"); }
  async createNotification(data: InsertNotification) {
    return this.create<Notification>("notifications", { ...data, createdAt: new Date().toISOString() });
  }
  async markNotificationRead(id: number) {
    return this.update<Notification>("notifications", id, { isRead: 1 });
  }

  // ── IoT Monitoring ──
  async getMonitoringData(projectId: number) {
    const project = await this.getProject(projectId);
    const snap = await this.db.collection("solarReadings")
      .where("projectId", "==", projectId)
      .orderBy("timestamp", "asc")
      .limit(96).get();
    return {
      readings: snap.docs.map(doc => doc.data()),
      inverterModel: project?.inverterModel || "Huawei SUN2000-8KTL",
      inverterSerial: project?.inverterSerial || "",
      status: project?.monitoringStatus || "offline",
    };
  }
  async createReading(data: InsertReading) { return this.create<SolarReading>("solarReadings", data); }
  async generateMockReadings(pid: number) {
    // Basic mock generator for Firestore
    const batch = this.db.batch();
    const now = new Date();
    for (let i = 0; i < 48; i++) {
      const id = await this.getNextId("solarReadings");
      const ref = this.db.collection("solarReadings").doc(id.toString());
      batch.set(ref, { id, projectId: pid, wattageKw: Math.random() * 5, timestamp: new Date(now.getTime() - i * 30 * 60 * 1000).toISOString() });
    }
    await batch.commit();
    return 48;
  }
  async updateInverterConfig(id: number, model: string, serial: string, status: string) {
    return this.update<Project>("projects", id, { inverterModel: model, inverterSerial: serial, monitoringStatus: status });
  }
  async updateProjectWeather(id: number, risk: string, alert?: string) {
    return this.update<Project>("projects", id, { lastWeatherRisk: risk, weatherAlert: alert });
  }

  // ── Site Survey ──
  async getSiteSurveyByProject(pid: number) {
    const snap = await this.db.collection("siteSurveys").where("projectId", "==", pid).limit(1).get();
    return snap.empty ? null : (snap.docs[0].data() as SiteSurvey);
  }
  async createSiteSurvey(data: InsertSiteSurvey) { return this.create<SiteSurvey>("siteSurveys", data); }
  async updateSiteSurvey(id: number, data: Partial<SiteSurvey>) { return this.update<SiteSurvey>("siteSurveys", id, data); }

  // ── Users ──
  async createUser(data: InsertUser) {
    return this.create<User>("users", { ...data, createdAt: new Date().toISOString() });
  }
  async getUserByEmail(email: string) {
    const snap = await this.db.collection("users").where("email", "==", email).limit(1).get();
    return snap.empty ? undefined : (snap.docs[0].data() as User);
  }
  async getUserById(id: number) { return this.getById<User>("users", id); }
  async getUserByEmailAndPassword(email: string, password: string) {
    const snap = await this.db.collection("users").where("email", "==", email).where("password", "==", password).limit(1).get();
    return snap.empty ? undefined : (snap.docs[0].data() as User);
  }
  async updateUserSubscription(id: number, data: Partial<User>) { return this.update<User>("users", id, data); }
  async findUserByGoogleId(googleId: string) {
    const snap = await this.db.collection("users").where("googleId", "==", googleId).limit(1).get();
    return snap.empty ? undefined : (snap.docs[0].data() as User);
  }
  async getProjectsByUserId(userId: number) {
    const snap = await this.db.collection("projects").where("userId", "==", userId).get();
    return snap.docs.map(doc => doc.data() as Project);
  }
  async getAllUsers() { return this.getAll<User>("users"); }
}
