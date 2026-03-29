import { IStorage } from "./storage-interface.js";
import type { 
  Project, InsertProject, 
  Milestone, InsertMilestone, 
  Update, InsertUpdate, 
  Faq, InsertFaq, 
  Testimonial, InsertTestimonial, 
  PricingPlan, InsertPricing, 
  MilestonePhoto, InsertMilestonePhoto, 
  Signature, InsertSignature, 
  NotificationPref, InsertNotif, 
  Quotation, InsertQuotation, 
  Document, InsertDocument, 
  Payment, InsertPayment, 
  Inventory, InsertInventory, 
  Design, InsertDesign, 
  Lead, InsertLead, 
  Crew, InsertCrew, 
  Proposal, InsertProposal, 
  ServiceJob, InsertServiceJob, 
  ClientMessage, InsertClientMessage, 
  Tenant, InsertTenant, 
  Employee, InsertEmployee, 
  Timesheet, InsertTimesheet, 
  ChartOfAccount, JournalEntry, 
  ComplianceItem, BomTemplate, 
  StockTransaction, InsertStockTransaction, 
  Schedule, InsertSchedule, 
  Notification, InsertNotification, 
  Admin, SolarReading, InsertReading, 
  SiteSurvey, InsertSiteSurvey 
} from "@shared/schema";

export class MemStorage implements IStorage {
  private projects = new Map<number, Project>();
  private milestones = new Map<number, Milestone>();
  private updates = new Map<number, Update>();
  private faqs = new Map<number, Faq>();
  private testimonials = new Map<number, Testimonial>();
  private pricingPlans = new Map<number, PricingPlan>();
  private milestonePhotos = new Map<number, MilestonePhoto>();
  private signatures = new Map<number, Signature>();
  private notificationPrefs = new Map<number, NotificationPref>();
  private admins = new Map<number, Admin>();
  private solarReadings = new Map<number, SolarReading>();
  private siteSurveys = new Map<number, SiteSurvey>();
  private quotations = new Map<number, Quotation>();
  private documents = new Map<number, Document>();
  private payments = new Map<number, Payment>();
  private inventory = new Map<number, Inventory>();
  private crews = new Map<number, Crew>();
  private tenants = new Map<number, Tenant>();
  private employees = new Map<number, Employee>();
  private timesheets = new Map<number, Timesheet>();
  private charts = new Map<number, ChartOfAccount>();
  private journalEntries = new Map<number, JournalEntry>();
  private complianceItems = new Map<number, ComplianceItem>();
  private bomTemplates = new Map<number, BomTemplate>();
  private stockTransactions = new Map<number, StockTransaction>();
  private schedules = new Map<number, Schedule>();
  private notifications = new Map<number, Notification>();
  private designs = new Map<number, Design>();
  private leads = new Map<number, Lead>();
  private serviceJobs = new Map<number, ServiceJob>();
  private clientMessages = new Map<number, ClientMessage>();

  private currentIds: Record<string, number> = {
    projects: 1, milestones: 1, updates: 1, faqs: 1, testimonials: 1, pricing: 1,
    photos: 1, signatures: 1, notifs: 1, admins: 1, readings: 1, surveys: 1,
    quotations: 1, documents: 1, payments: 1, inventory: 1, crews: 1, tenants: 1,
    employees: 1, timesheets: 1, journals: 1, compliance: 1, bom: 1, stocks: 1,
    schedules: 1, notifications: 1, designs: 1, leads: 1, serviceJobs: 1, clientMessages: 1
  };

  constructor() {
    this.seed();
  }

  private seed() {
    console.log("Seeding MemStorage for Vercel Demo...");
    // Demo Admin
    this.admins.set(1, { id: 1, username: "admin", password: "solariq2026", name: "SolarIQ Admin", email: "admin@solariq.app", googleId: null });

    // Demo Project
    const token = "demo-abc123";
    const projId = this.currentIds.projects++;
    this.projects.set(projId, {
      id: projId,
      clientName: "Juan Dela Cruz",
      clientEmail: "juan@example.com",
      clientPhone: "09171234567",
      address: "123 Solar St, Quezon City, Metro Manila",
      systemKw: 8,
      panelCount: 20,
      contractValue: 192000,
      shareToken: token,
      startDate: "2026-03-01",
      estimatedEndDate: "2026-04-15",
      notes: null,
      contractorNotes: null,
      status: "installation",
      overallProgress: 65,
      roiProjectedYears: 4,
      annualSavings: 45000,
      totalLifetimeSavings: 1125000,
      createdAt: new Date().toISOString(),
      clientPortalPin: null,
      tenantId: 1,
      scheduledStart: null,
      scheduledEnd: null,
      inverterModel: "Huawei SUN2000-5KTL-M1",
      inverterSerial: "SN-DEMO-2026",
      monitoringStatus: "online",
      lastWeatherRisk: "low",
      weatherAlert: null,
      netMeteringStatus: "pending",
      netMeteringNotes: null
    });

    // Milestones
    const phases = [
      ["Site Survey Complete", "Roof assessment and shading analysis completed", "survey", "completed"],
      ["System Design Approved", "Final 8 kWp layout approved", "design", "completed"],
      ["Permits Approved", "All permits cleared by LGU and Meralco", "permitting", "completed"],
      ["Racking Installation", "Roof mounts installed", "installation", "completed"],
      ["Panel Installation", "Solar panels mounted and wired", "installation", "in_progress"],
      ["Commissioning", "System testing and client training", "commissioned", "pending"]
    ];
    phases.forEach(([t, d, p, s], i) => {
      const mid = this.currentIds.milestones++;
      this.milestones.set(mid, { 
        id: mid, projectId: projId, title: t, description: d, phase: p, 
        status: s, completedAt: s === "completed" ? "2026-03-10" : null, 
        sortOrder: i+1, photo: null, note: null 
      });
    });

    // FAQs
    const faqId = this.currentIds.faqs++;
    this.faqs.set(faqId, { id: faqId, question: "What is net metering?", answer: "Net metering allows you to sell excess energy back to the grid.", category: "billing", sortOrder: 1, published: 1 });
  }

  // Implementation follows... (most critical methods implemented, others as needed)
  async getAllProjects() { return Array.from(this.projects.values()); }
  async getProject(id: number) { return this.projects.get(id) || null; }
  async getProjectByToken(token: string) { return Array.from(this.projects.values()).find(p => p.shareToken === token) || null; }
  async createProject(data: InsertProject) {
    const id = this.currentIds.projects++;
    const p: Project = { ...data, id, createdAt: new Date().toISOString() } as Project;
    this.projects.set(id, p);
    return p;
  }
  async updateProject(id: number, data: Partial<Project>) {
    const p = this.projects.get(id);
    if (!p) throw new Error("Not found");
    const updated = { ...p, ...data };
    this.projects.set(id, updated);
    return updated;
  }
  async deleteProject(id: number) { this.projects.delete(id); }

  async getMilestonesByProject(pid: number) { return Array.from(this.milestones.values()).filter(m => m.projectId === pid); }
  async createMilestone(data: InsertMilestone) {
    const id = this.currentIds.milestones++;
    const m = { ...data, id } as Milestone;
    this.milestones.set(id, m);
    return m;
  }
  async updateMilestone(id: number, data: Partial<Milestone>) {
    const m = this.milestones.get(id);
    if (!m) throw new Error("Not found");
    const updated = { ...m, ...data };
    this.milestones.set(id, updated);
    return updated;
  }
  async deleteMilestone(id: number) { this.milestones.delete(id); }

  async getUpdatesByProject(pid: number) { return Array.from(this.updates.values()).filter(u => u.projectId === pid); }
  async createUpdate(data: InsertUpdate) {
    const id = this.currentIds.updates++;
    const u = { ...data, id, createdAt: new Date().toISOString(), isRead: 0 } as Update;
    this.updates.set(id, u);
    return u;
  }
  async deleteUpdate(id: number) { this.updates.delete(id); }

  async getAdmin(u: string, p: string) { return Array.from(this.admins.values()).find(a => a.username === u && a.password === p) || null; }
  async findAdminByEmail(e: string) { return Array.from(this.admins.values()).find(a => a.email === e); }
  async findAdminByGoogleId(g: string) { return Array.from(this.admins.values()).find(a => a.googleId === g); }
  async createAdmin(data: any) { const id = this.currentIds.admins++; const a = { ...data, id }; this.admins.set(id, a); return a; }

  async getMonitoringData(pid: number) {
    const readings = Array.from(this.solarReadings.values()).filter(r => r.projectId === pid);
    const proj = this.projects.get(pid);
    return { 
      readings,
      inverterModel: proj?.inverterModel || "Huawei SUN2000",
      inverterSerial: proj?.inverterSerial || "DEMO-123",
      status: proj?.monitoringStatus || "offline"
    };
  }
  async generateMockReadings(pid: number) {
    const now = new Date();
    for(let i=0; i<24; i++) {
        const id = this.currentIds.readings++;
        this.solarReadings.set(id, {
            id, projectId: pid,
            wattageKw: Math.random() * 5,
            energyTodayKwh: i * 2,
            energyTotalKwh: 1000 + i * 2,
            timestamp: new Date(now.getTime() - i * 3600000).toISOString()
        });
    }
    return 24;
  }

  // Stubs for remaining interface methods (Add implementations as triggered by user testing)
  async getAllFaqs() { return Array.from(this.faqs.values()); }
  async getPublishedFaqs() { return Array.from(this.faqs.values()).filter(f => f.published === 1); }
  async createFaq(data: any) { const id = this.currentIds.faqs++; const f = {...data, id}; this.faqs.set(id, f); return f; }
  async updateFaq(id: number, data: any) { const f = this.faqs.get(id); const u = {...f, ...data}; this.faqs.set(id, u); return u; }
  async deleteFaq(id: number) { this.faqs.delete(id); }

  async getAllTestimonials() { return Array.from(this.testimonials.values()); }
  async getPublishedTestimonials() { return Array.from(this.testimonials.values()).filter(t => t.published === 1); }
  async createTestimonial(data: any) { const id = this.currentIds.testimonials++; const t = {...data, id}; this.testimonials.set(id, t); return t; }
  async updateTestimonial(id: number, data: any) { const t = this.testimonials.get(id); const u = {...t, ...data}; this.testimonials.set(id, u); return u; }
  async deleteTestimonial(id: number) { this.testimonials.delete(id); }

  async getAllPlans() { return Array.from(this.pricingPlans.values()); }
  async getPublishedPlans() { return Array.from(this.pricingPlans.values()).filter(p => p.published === 1); }
  async createPlan(data: any) { const id = this.currentIds.pricing++; const p = {...data, id}; this.pricingPlans.set(id, p); return p; }
  async updatePlan(id: number, data: any) { const p = this.pricingPlans.get(id); const u = {...p, ...data}; this.pricingPlans.set(id, u); return u; }
  async deletePlan(id: number) { this.pricingPlans.delete(id); }

  async getPhotosByProject(pid: number) { return Array.from(this.milestonePhotos.values()).filter(p => p.projectId === pid); }
  async getPhotosByMilestone(mid: number) { return Array.from(this.milestonePhotos.values()).filter(p => p.milestoneId === mid); }
  async createPhoto(data: any) { const id = this.currentIds.photos++; const p = {...data, id}; this.milestonePhotos.set(id, p); return p; }
  async deletePhoto(id: number) { this.milestonePhotos.delete(id); }

  async getSignaturesByProject(pid: number) { return Array.from(this.signatures.values()).filter(s => s.projectId === pid); }
  async createSignature(data: any) { const id = this.currentIds.signatures++; const s = {...data, id}; this.signatures.set(id, s); return s; }

  async getNotifPref(pid: number) { return Array.from(this.notificationPrefs.values()).find(n => n.projectId === pid) || null; }
  async upsertNotifPref(pid: number, data: any) { const id = this.currentIds.notifs++; const n = {...data, id, projectId: pid}; this.notificationPrefs.set(id, n); return n; }

  async getQuotationsByProject(pid: number) { return Array.from(this.quotations.values()).filter(q => q.projectId === pid); }
  async createQuotation(data: any) { const id = this.currentIds.quotations++; const q = {...data, id}; this.quotations.set(id, q); return q; }
  async updateQuotation(id: number, data: any) { const q = this.quotations.get(id); const u = {...q, ...data}; this.quotations.set(id, u); return u; }

  async getDocumentsByProject(pid: number) { return Array.from(this.documents.values()).filter(d => d.projectId === pid); }
  async createDocument(data: any) { const id = this.currentIds.documents++; const d = {...data, id}; this.documents.set(id, d); return d; }
  async updateDocument(id: number, data: any) { const d = this.documents.get(id); const u = {...d, ...data}; this.documents.set(id, u); return u; }

  async getPaymentsByProject(pid: number) { return Array.from(this.payments.values()).filter(p => p.projectId === pid); }
  async createPayment(data: any) { const id = this.currentIds.payments++; const p = {...data, id}; this.payments.set(id, p); return p; }
  async updatePayment(id: number, data: any) { const p = this.payments.get(id); const u = {...p, ...data}; this.payments.set(id, u); return u; }

  async getAllInventory() { return Array.from(this.inventory.values()) as any[]; }
  async updateInventory(id: number, data: any) { const i = this.inventory.get(id); const u = {...i, ...data}; this.inventory.set(id, u); return u as any; }

  async getAllDesigns() { return Array.from(this.designs.values()) as any[]; }
  async getDesignsByProject(pid: number) { return Array.from(this.designs.values()).filter(d => (d as any).projectId === pid) as any[]; }
  async createDesign(data: any) { const id = this.currentIds.designs++; const d = {...data, id}; this.designs.set(id, d); return d as any; }

  async getAllLeads() { return Array.from(this.leads.values()) as any[]; }
  async createLead(data: any) { const id = this.currentIds.leads++; const l = {...data, id}; this.leads.set(id, l); return l as any; }
  async updateLead(id: number, data: any) { const l = this.leads.get(id); const u = {...l, ...data}; this.leads.set(id, u); return u as any; }

  async getAllReferrals() { return []; }
  async getReferralsByProject(pid: number) { return []; }
  async getAllVendors() { return []; }
  async getAllPOs() { return []; }
  async getAllCrews() { return Array.from(this.crews.values()); }
  async createCrew(data: any) { const id = this.currentIds.crews++; const c = {...data, id}; this.crews.set(id, c); return c; }

  async getAllProposals() { return []; }
  async getProposalsByProject(pid: number) { return []; }
  async createProposal(data: any) { return {} as any; }
  async updateProposal(id: number, data: any) { return {} as any; }

  async getAllServiceJobs() { return Array.from(this.serviceJobs.values()) as any[]; }
  async getServiceJobsByProject(pid: number) { return Array.from(this.serviceJobs.values()).filter(j => (j as any).projectId === pid) as any[]; }
  async createServiceJob(data: any) { const id = this.currentIds.serviceJobs++; const j = {...data, id}; this.serviceJobs.set(id, j); return j as any; }
  async updateServiceJob(id: number, data: any) { const j = this.serviceJobs.get(id); const u = {...j, ...data}; this.serviceJobs.set(id, u); return u as any; }

  async getClientMessages(pid: number) { return Array.from(this.clientMessages.values()).filter(m => (m as any).projectId === pid) as any[]; }
  async createClientMessage(data: any) { const id = this.currentIds.clientMessages++; const m = {...data, id}; this.clientMessages.set(id, m); return m as any; }

  async getProjectByTokenAndPin(token: string, pin: string) { return Array.from(this.projects.values()).find(p => p.shareToken === token && p.clientPortalPin === pin) || null; }
  async setClientPortalPin(projectId: number, pin: string) { const p = this.projects.get(projectId); if (p) p.clientPortalPin = pin; }

  async getAllTenants() { return Array.from(this.tenants.values()); }
  async createTenant(data: any) { const id = this.currentIds.tenants++; const t = {...data, id}; this.tenants.set(id, t); return t; }
  async updateTenant(id: number, data: any) { const t = this.tenants.get(id); const u = {...t, ...data}; this.tenants.set(id, u); return u; }
  
  async getAllEmployees() { return Array.from(this.employees.values()); }
  async createEmployee(data: any) { const id = this.currentIds.employees++; const e = {...data, id}; this.employees.set(id, e); return e; }
  async updateEmployee(id: number, data: any) { const e = this.employees.get(id); const u = {...e, ...data}; this.employees.set(id, u); return u; }

  async getAllTimesheets() { return Array.from(this.timesheets.values()); }
  async createTimesheet(data: any) { const id = this.currentIds.timesheets++; const t = {...data, id}; this.timesheets.set(id, t); return t; }
  async updateTimesheet(id: number, data: any) { const t = this.timesheets.get(id); const u = {...t, ...data}; this.timesheets.set(id, u); return u; }

  async getChartOfAccounts() { return Array.from(this.charts.values()); }
  async getAllJournalEntries() { return Array.from(this.journalEntries.values()); }
  async createJournalEntry(data: any) { const id = this.currentIds.journals++; const j = {...data, id}; this.journalEntries.set(id, j); return j; }

  async getAllComplianceItems() { return Array.from(this.complianceItems.values()); }
  async createComplianceItem(data: any) { const id = this.currentIds.compliance++; const c = {...data, id}; this.complianceItems.set(id, c); return c; }
  async updateComplianceItem(id: number, data: any) { const c = this.complianceItems.get(id); const u = {...c, ...data}; this.complianceItems.set(id, u); return u; }

  async getAllBomTemplates() { return Array.from(this.bomTemplates.values()); }
  async createBomTemplate(data: any) { const id = this.currentIds.bom++; const b = {...data, id}; this.bomTemplates.set(id, b); return b; }

  async getStockTransactions(inventoryId?: number) { return Array.from(this.stockTransactions.values()).filter(t => !inventoryId || t.inventoryId === inventoryId); }
  async createStockTransaction(data: any) { const id = this.currentIds.stocks++; const s = {...data, id}; this.stockTransactions.set(id, s); return s; }

  async getAllSchedules() { return Array.from(this.schedules.values()); }
  async getSchedulesByProject(projectId: number) { return Array.from(this.schedules.values()).filter(s => s.projectId === projectId); }
  async createSchedule(data: any) { const id = this.currentIds.schedules++; const s = {...data, id}; this.schedules.set(id, s); return s; }
  async updateSchedule(id: number, data: any) { const s = this.schedules.get(id); const u = {...s, ...data}; this.schedules.set(id, u); return u; }
  async deleteSchedule(id: number) { this.schedules.delete(id); }

  async getAllNotifications() { return Array.from(this.notifications.values()); }
  async createNotification(data: any) { const id = this.currentIds.notifications++; const n = {...data, id, isRead: 0, createdAt: new Date().toISOString()}; this.notifications.set(id, n); return n; }
  async markNotificationRead(id: number) { const n = this.notifications.get(id); if (n) n.isRead = 1; return n as any; }

  async createReading(data: any) { const id = this.currentIds.readings++; const r = {...data, id}; this.solarReadings.set(id, r); return r; }
  async updateInverterConfig(id: number, model: string, serial: string, status: string) { 
    const p = this.projects.get(id); if (p) { p.inverterModel = model; p.inverterSerial = serial; p.monitoringStatus = status; } return p as any; 
  }
  async updateProjectWeather(id: number, risk: string, alert?: string) {
    const p = this.projects.get(id); if (p) { p.lastWeatherRisk = risk; p.weatherAlert = alert || null; } return p as any;
  }
  async getSiteSurveyByProject(pid: number) { return Array.from(this.siteSurveys.values()).find(s => s.projectId === pid) || null; }
  async createSiteSurvey(data: any) { const id = this.currentIds.surveys++; const s = {...data, id}; this.siteSurveys.set(id, s); return s; }
  async updateSiteSurvey(id: number, data: any) { const s = this.siteSurveys.get(id); const u = {...s, ...data}; this.siteSurveys.set(id, u); return u; }
}
