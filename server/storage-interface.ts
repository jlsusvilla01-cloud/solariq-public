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
  SiteSurvey, InsertSiteSurvey,
  Referral, Vendor
} from "@shared/schema";

export interface IStorage {
  // Projects
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | null>;
  getProjectByToken(token: string): Promise<Project | null>;
  createProject(data: InsertProject): Promise<Project>;
  updateProject(id: number, data: Partial<Project>): Promise<Project>;
  deleteProject(id: number): Promise<void>;

  // Milestones
  getMilestonesByProject(pid: number): Promise<Milestone[]>;
  createMilestone(data: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: number, data: Partial<Milestone>): Promise<Milestone>;
  deleteMilestone(id: number): Promise<void>;

  // Updates
  getUpdatesByProject(pid: number): Promise<Update[]>;
  createUpdate(data: InsertUpdate): Promise<Update>;
  deleteUpdate(id: number): Promise<void>;

  // FAQs
  getAllFaqs(): Promise<Faq[]>;
  getPublishedFaqs(): Promise<Faq[]>;
  createFaq(data: InsertFaq): Promise<Faq>;
  updateFaq(id: number, data: Partial<Faq>): Promise<Faq>;
  deleteFaq(id: number): Promise<void>;

  // Testimonials
  getAllTestimonials(): Promise<Testimonial[]>;
  getPublishedTestimonials(): Promise<Testimonial[]>;
  createTestimonial(data: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, data: Partial<Testimonial>): Promise<Testimonial>;
  deleteTestimonial(id: number): Promise<void>;

  // Pricing
  getAllPlans(): Promise<PricingPlan[]>;
  getPublishedPlans(): Promise<PricingPlan[]>;
  createPlan(data: InsertPricing): Promise<PricingPlan>;
  updatePlan(id: number, data: Partial<PricingPlan>): Promise<PricingPlan>;
  deletePlan(id: number): Promise<void>;

  // Photos
  getPhotosByProject(pid: number): Promise<MilestonePhoto[]>;
  getPhotosByMilestone(mid: number): Promise<MilestonePhoto[]>;
  createPhoto(data: InsertMilestonePhoto): Promise<MilestonePhoto>;
  deletePhoto(id: number): Promise<void>;

  // Signatures
  getSignaturesByProject(pid: number): Promise<Signature[]>;
  createSignature(data: InsertSignature): Promise<Signature>;

  // Notification Prefs
  getNotifPref(pid: number): Promise<NotificationPref | null>;
  upsertNotifPref(pid: number, data: Partial<InsertNotif>): Promise<NotificationPref>;

  // Admin
  getAdmin(username: string, password: string): Promise<any>;
  createAdmin(data: any): Promise<Admin>;
  findAdminByGoogleId(googleId: string): Promise<Admin | undefined>;
  findAdminByEmail(email: string): Promise<Admin | undefined>;

  // Quotations
  getQuotationsByProject(pid: number): Promise<Quotation[]>;
  createQuotation(data: InsertQuotation): Promise<Quotation>;
  updateQuotation(id: number, data: Partial<Quotation>): Promise<Quotation>;

  // Documents
  getDocumentsByProject(pid: number): Promise<Document[]>;
  createDocument(data: InsertDocument): Promise<Document>;
  updateDocument(id: number, data: Partial<Document>): Promise<Document>;

  // Payments
  getPaymentsByProject(pid: number): Promise<Payment[]>;
  createPayment(data: InsertPayment): Promise<Payment>;
  updatePayment(id: number, data: Partial<Payment>): Promise<Payment>;

  // Inventory
  getAllInventory(): Promise<Inventory[]>;
  updateInventory(id: number, data: Partial<Inventory>): Promise<Inventory>;

  // AI Designs
  getAllDesigns(): Promise<Design[]>;
  getDesignsByProject(pid: number): Promise<Design[]>;
  createDesign(data: InsertDesign): Promise<Design>;

  // Leads
  getAllLeads(): Promise<Lead[]>;
  createLead(data: InsertLead): Promise<Lead>;
  updateLead(id: number, data: Partial<Lead>): Promise<Lead>;

  // Referrals
  getAllReferrals(): Promise<Referral[]>;
  getReferralsByProject(pid: number): Promise<Referral[]>;

  // Procurement
  getAllVendors(): Promise<Vendor[]>;
  getAllPOs(): Promise<any[]>;

  // Logistics
  getAllCrews(): Promise<Crew[]>;
  createCrew(data: InsertCrew): Promise<Crew>;

  // Proposals
  getAllProposals(): Promise<Proposal[]>;
  getProposalsByProject(pid: number): Promise<Proposal[]>;
  createProposal(data: InsertProposal): Promise<Proposal>;
  updateProposal(id: number, data: Partial<Proposal>): Promise<Proposal>;

  // Service Jobs
  getAllServiceJobs(): Promise<ServiceJob[]>;
  getServiceJobsByProject(pid: number): Promise<ServiceJob[]>;
  createServiceJob(data: InsertServiceJob): Promise<ServiceJob>;
  updateServiceJob(id: number, data: Partial<ServiceJob>): Promise<ServiceJob>;

  // Client Messages
  getClientMessages(pid: number): Promise<ClientMessage[]>;
  createClientMessage(data: InsertClientMessage): Promise<ClientMessage>;

  // Client Portal Auth
  getProjectByTokenAndPin(token: string, pin: string): Promise<Project | null>;
  setClientPortalPin(projectId: number, pin: string): Promise<void>;

  // Tenants
  getAllTenants(): Promise<Tenant[]>;
  createTenant(data: InsertTenant): Promise<Tenant>;
  updateTenant(id: number, data: Partial<Tenant>): Promise<Tenant>;

  // ERP: HR & Payroll
  getAllEmployees(): Promise<Employee[]>;
  createEmployee(data: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, data: Partial<Employee>): Promise<Employee>;
  getAllTimesheets(): Promise<Timesheet[]>;
  createTimesheet(data: InsertTimesheet): Promise<Timesheet>;
  updateTimesheet(id: number, data: Partial<Timesheet>): Promise<Timesheet>;

  // ERP: Finance & Accounting
  getChartOfAccounts(): Promise<ChartOfAccount[]>;
  getAllJournalEntries(): Promise<JournalEntry[]>;
  createJournalEntry(data: Omit<JournalEntry, "id">): Promise<JournalEntry>;

  // ERP: Compliance
  getAllComplianceItems(): Promise<ComplianceItem[]>;
  createComplianceItem(data: Omit<ComplianceItem, "id">): Promise<ComplianceItem>;
  updateComplianceItem(id: number, data: Partial<ComplianceItem>): Promise<ComplianceItem>;

  // ERP: BOM Templates
  getAllBomTemplates(): Promise<BomTemplate[]>;
  createBomTemplate(data: Omit<BomTemplate, "id">): Promise<BomTemplate>;

  // Elite ERP: Inventory Ledger
  getStockTransactions(inventoryId?: number): Promise<StockTransaction[]>;
  createStockTransaction(data: InsertStockTransaction): Promise<StockTransaction>;

  // Elite ERP: Scheduling
  getAllSchedules(): Promise<Schedule[]>;
  getSchedulesByProject(projectId: number): Promise<Schedule[]>;
  createSchedule(data: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, data: Partial<Schedule>): Promise<Schedule>;
  deleteSchedule(id: number): Promise<void>;

  // Elite ERP: Notifications
  getAllNotifications(): Promise<Notification[]>;
  createNotification(data: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<Notification>;

  // IoT Solar Monitoring
  getMonitoringData(projectId: number): Promise<any>;
  createReading(data: InsertReading): Promise<SolarReading>;
  generateMockReadings(pid: number): Promise<number>;
  updateInverterConfig(id: number, model: string, serial: string, status: string): Promise<Project>;
  updateProjectWeather(id: number, risk: string, alert?: string): Promise<Project>;

  // Site Survey
  getSiteSurveyByProject(pid: number): Promise<SiteSurvey | null>;
  createSiteSurvey(data: InsertSiteSurvey): Promise<SiteSurvey>;
  updateSiteSurvey(id: number, data: Partial<SiteSurvey>): Promise<SiteSurvey>;
}
