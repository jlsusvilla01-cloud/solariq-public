import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Solar Projects (client-facing) ──
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email"),
  clientPhone: text("client_phone"),
  address: text("address").notNull(),
  systemKw: real("system_kw").notNull().default(6),
  panelCount: integer("panel_count").notNull().default(15),
  contractValue: real("contract_value").notNull().default(0),
  shareToken: text("share_token").notNull(), // unique token for client link
  startDate: text("start_date"),
  estimatedEndDate: text("estimated_end_date"),
  notes: text("notes"),
  contractorNotes: text("contractor_notes"),
  status: text("status").notNull().default("survey"), // survey|design|permitting|procurement|installation|inspection|commissioned
  overallProgress: integer("overall_progress").notNull().default(0),
  // Financial & ROI (NEW)
  roiProjectedYears: integer("roi_projected_years").default(5),
  annualSavings: integer("annual_savings").default(0),
  totalLifetimeSavings: integer("total_lifetime_savings").default(0),
  // Client Portal & Multi-Tenant
  clientPortalPin: text("client_portal_pin"),
  tenantId: integer("tenant_id").default(1),
  scheduledStart: text("scheduled_start"),
  scheduledEnd: text("scheduled_end"),
  createdAt: text("created_at").notNull().default(""),
  // Monitoring (IoT)
  inverterModel: text("inverter_model"),
  inverterSerial: text("inverter_serial"),
  monitoringStatus: text("monitoring_status").default("offline"), // online, offline, faulted
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// ── Milestones / Progress Steps ──
export const milestones = sqliteTable("milestones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  phase: text("phase").notNull(),
  status: text("status").notNull().default("pending"), // pending|in_progress|completed|blocked
  completedAt: text("completed_at"),
  sortOrder: integer("sort_order").notNull().default(0),
  photo: text("photo"), // URL/base64
  note: text("note"),
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({ id: true });
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Milestone = typeof milestones.$inferSelect;

// ── Client Messages / Updates ──
export const updates = sqliteTable("updates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("update"), // update|milestone|alert|photo
  postedBy: text("posted_by").notNull().default("Contractor"),
  createdAt: text("created_at").notNull().default(""),
  isRead: integer("is_read").notNull().default(0),
});

export const insertUpdateSchema = createInsertSchema(updates).omit({ id: true, createdAt: true });
export type InsertUpdate = z.infer<typeof insertUpdateSchema>;
export type Update = typeof updates.$inferSelect;

// ── FAQ ──
export const faqs = sqliteTable("faqs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull().default("general"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: integer("published").notNull().default(1),
});

export const insertFaqSchema = createInsertSchema(faqs).omit({ id: true });
export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type Faq = typeof faqs.$inferSelect;

// ── Testimonials ──
export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  location: text("location"),
  role: text("role").notNull().default("Homeowner"),
  quote: text("quote").notNull(),
  rating: integer("rating").notNull().default(5),
  systemSize: text("system_size"),
  published: integer("published").notNull().default(1),
  avatarInitials: text("avatar_initials"),
  createdAt: text("created_at").notNull().default(""),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true, createdAt: true });
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// ── Pricing Plans ──
export const pricingPlans = sqliteTable("pricing_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  price: real("price").notNull(),
  billingCycle: text("billing_cycle").notNull().default("month"),
  description: text("description"),
  features: text("features").notNull().default("[]"), // JSON array
  highlighted: integer("highlighted").notNull().default(0),
  ctaLabel: text("cta_label").notNull().default("Get Started"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: integer("published").notNull().default(1),
});

export const insertPricingSchema = createInsertSchema(pricingPlans).omit({ id: true });
export type InsertPricing = z.infer<typeof insertPricingSchema>;
export type PricingPlan = typeof pricingPlans.$inferSelect;

// ── Milestone Photos ──
export const milestonePhotos = sqliteTable("milestone_photos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  milestoneId: integer("milestone_id").notNull(),
  projectId: integer("project_id").notNull(),
  dataUrl: text("data_url").notNull(), // base64 encoded
  caption: text("caption"),
  photoType: text("photo_type").notNull().default("progress"), // before|progress|after
  createdAt: text("created_at").notNull().default(""),
});
export const insertMilestonePhotoSchema = createInsertSchema(milestonePhotos).omit({ id: true, createdAt: true });
export type InsertMilestonePhoto = z.infer<typeof insertMilestonePhotoSchema>;
export type MilestonePhoto = typeof milestonePhotos.$inferSelect;

// ── E-Signatures ──
export const signatures = sqliteTable("signatures", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  signerName: text("signer_name").notNull(),
  signerRole: text("signer_role").notNull().default("Client"), // Client|Contractor
  signatureDataUrl: text("signature_data_url").notNull(),
  signedAt: text("signed_at").notNull().default(""),
  ipAddress: text("ip_address"),
  agreementText: text("agreement_text"),
});
export const insertSignatureSchema = createInsertSchema(signatures).omit({ id: true, signedAt: true });
export type InsertSignature = z.infer<typeof insertSignatureSchema>;
export type Signature = typeof signatures.$inferSelect;

// ── Notification Preferences ──
export const notificationPrefs = sqliteTable("notification_prefs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  email: text("email"),
  phone: text("phone"),
  emailEnabled: integer("email_enabled").notNull().default(1),
  smsEnabled: integer("sms_enabled").notNull().default(0),
  notifyOnMilestone: integer("notify_on_milestone").notNull().default(1),
  notifyOnUpdate: integer("notify_on_update").notNull().default(1),
});
export const insertNotifSchema = createInsertSchema(notificationPrefs).omit({ id: true });
export type InsertNotif = z.infer<typeof insertNotifSchema>;
export type NotificationPref = typeof notificationPrefs.$inferSelect;

export const admins = sqliteTable("admins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull(),
  password: text("password").notNull(), // plain text for demo
  name: text("name").notNull(),
  email: text("email"),
  googleId: text("google_id"),
});

export const insertAdminSchema = createInsertSchema(admins).omit({ id: true });
export type InsertAdmin = typeof admins.$inferInsert;
export type Admin = typeof admins.$inferSelect;


// ── NEW: AI Designs ──
export const designs = sqliteTable("designs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id"), // Optional for lead-stage designs
  clientName: text("client_name"),
  layoutJson: text("layout_json").notNull().default("[]"), // Coordinates of placed panels
  panelCount: integer("panel_count").notNull().default(0),
  systemKw: real("system_kw").notNull().default(0),
  annualYield: real("annual_yield").notNull().default(0), // kWh/yr
  roofImage: text("roof_image"), // Data URL or storage link
  status: text("status").notNull().default("draft"),
  createdAt: text("created_at").notNull(),
});

export const insertDesignSchema = createInsertSchema(designs).omit({ id: true });
export type InsertDesign = typeof designs.$inferInsert;
export type Design = typeof designs.$inferSelect;
export const quotations = sqliteTable("quotations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  items: text("items").notNull().default("[]"), // JSON array of { description, quantity, unitPrice, total }
  totalAmount: real("total_amount").notNull().default(0),
  status: text("status").notNull().default("draft"), // draft|sent|approved|rejected
  validUntil: text("valid_until"),
  createdAt: text("created_at").notNull().default(""),
});

export const insertQuotationSchema = createInsertSchema(quotations).omit({ id: true, createdAt: true });
export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type Quotation = typeof quotations.$inferSelect;

// ── NEW: Document Center ──
export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull().default("permit"), // permit|net_metering|warranty|contract|other
  fileUrl: text("file_url").notNull(),
  status: text("status").notNull().default("uploaded"), // uploaded|reviewing|approved|rejected
  uploadedAt: text("uploaded_at").notNull().default(""),
  requiresSignature: integer("requires_signature").notNull().default(0),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, uploadedAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// ── NEW: Payment Tracking ──
export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  milestoneId: integer("milestone_id"), // optional link to a milestone
  amount: real("amount").notNull(),
  status: text("status").notNull().default("pending"), // pending|paid|failed|refunded
  paymentMethod: text("payment_method"), // stripe|bank_transfer|cash
  transactionId: text("transaction_id"),
  paidAt: text("paid_at"),
  createdAt: text("created_at").notNull().default(""),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// ── NEW: Inventory Management ──
export const inventory = sqliteTable("inventory", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemName: text("item_name").notNull(),
  category: text("category").notNull().default("panels"), // panels|inverters|racking|cables|other
  quantity: integer("quantity").notNull().default(0),
  unit: text("unit").notNull().default("pcs"),
  minThreshold: integer("min_threshold").notNull().default(5),
  warehouseLocation: text("warehouse_location").default("A1-W1"),
  updatedAt: text("updated_at").notNull().default(""),
});

export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, updatedAt: true });
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

// ── NEW: Leads (Sales CRM) ──
export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email"),
  clientPhone: text("client_phone"),
  source: text("source").notNull().default("web"), // web|referral|walk-in
  status: text("status").notNull().default("new"), // new|contacted|survey_scheduled|quoted|closed_won|closed_lost
  score: integer("score").default(0), // 1-10 priority
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true });
export type InsertLead = typeof leads.$inferInsert;
export type Lead = typeof leads.$inferSelect;

// ── NEW: Referrals ──
export const referrals = sqliteTable("referrals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  referrerProjectId: integer("referrer_project_id").notNull(),
  referredName: text("referred_name").notNull(),
  referredEmail: text("referred_email"),
  status: text("status").notNull().default("pending"), // pending|contacted|sold|paid_out
  commissionAmount: real("commission_amount").default(0),
  createdAt: text("created_at").notNull(),
});

export type Referral = typeof referrals.$inferSelect;

// ── NEW: Procurement (Vendors & POs) ──
export const vendors = sqliteTable("vendors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  category: text("category").notNull(), // panels|inverters|racking|cables
});

export const purchaseOrders = sqliteTable("purchase_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  vendorId: integer("vendor_id").notNull(),
  poNumber: text("po_number").notNull(),
  totalAmount: real("total_amount").notNull().default(0),
  status: text("status").notNull().default("draft"), // draft|sent|delivered|paid
  itemsJson: text("items_json").notNull().default("[]"),
  deliveryExpected: text("delivery_expected"),
  createdAt: text("created_at").notNull(),
});

export type Vendor = typeof vendors.$inferSelect;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

// ── NEW: Crews (Logistics) ──
export const crews = sqliteTable("crews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  location: text("location").notNull(),
  contactNumber: text("contact_number"),
  status: text("status", { enum: ["idle", "on-site", "transit", "off"] }).default("idle").notNull(),
  currentProjectId: integer("current_project_id"),
  lastWeatherRisk: text("last_weather_risk"),
});

export const insertCrewSchema = createInsertSchema(crews).omit({ id: true });
export type Crew = typeof crews.$inferSelect;
export type InsertCrew = z.infer<typeof insertCrewSchema>;

// ── Feature 1: Proposals ──
export const proposals = sqliteTable("proposals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  templateStyle: text("template_style").notNull().default("modern"), // modern|classic|minimal
  isPublished: integer("is_published").default(0),
  totalValue: real("total_value").default(0),
  snapshotJson: text("snapshot_json"), // Stores full BOM & Project snapshot for the PDF
  createdAt: text("created_at").notNull(),
});
export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;

// ── Feature 2: After-Sales Service Jobs ──
export const serviceJobs = sqliteTable("service_jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  type: text("type").notNull().default("maintenance"), // maintenance|warranty|inspection|emergency
  description: text("description").notNull(),
  scheduledDate: text("scheduled_date"),
  resolvedDate: text("resolved_date"),
  status: text("status").notNull().default("open"), // open|scheduled|in_progress|resolved
  technicianName: text("technician_name"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});
export type ServiceJob = typeof serviceJobs.$inferSelect;
export type InsertServiceJob = typeof serviceJobs.$inferInsert;

// ── Feature 3: Client Portal Messages ──
export const clientMessages = sqliteTable("client_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  sender: text("sender").notNull().default("client"), // client|contractor
  message: text("message").notNull(),
  isRead: integer("is_read").notNull().default(0),
  createdAt: text("created_at").notNull(),
});
export type ClientMessage = typeof clientMessages.$inferSelect;
export type InsertClientMessage = typeof clientMessages.$inferInsert;

// ── Feature 5: Multi-Tenant / White-Label ──
export const tenants = sqliteTable("tenants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  subdomain: text("subdomain").notNull(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#fbbf24"),
  planTier: text("plan_tier").notNull().default("starter"), // starter|pro|enterprise
  ownerEmail: text("owner_email"),
  activeProjects: integer("active_projects").notNull().default(0),
  createdAt: text("created_at").notNull(),
});
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

// ── ERP: HR & Payroll ──
export const employees = sqliteTable("employees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role").notNull().default("installer"), // installer|supervisor|sales|admin|engineer
  email: text("email"),
  phone: text("phone"),
  dailyRate: real("daily_rate").default(0),
  employmentType: text("employment_type").notNull().default("full-time"), // full-time|part-time|contractor
  status: text("status").notNull().default("active"), // active|inactive|on-leave
  hiredDate: text("hired_date"),
  createdAt: text("created_at").notNull(),
});
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

export const timesheets = sqliteTable("timesheets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  employeeId: integer("employee_id").notNull(),
  projectId: integer("project_id"),
  date: text("date").notNull(),
  hoursWorked: real("hours_worked").notNull().default(8),
  taskDescription: text("task_description"),
  status: text("status").notNull().default("pending"), // pending|approved|rejected
  createdAt: text("created_at").notNull(),
});
export type Timesheet = typeof timesheets.$inferSelect;
export type InsertTimesheet = typeof timesheets.$inferInsert;

// ── ERP: Finance & Accounting ──
export const chartOfAccounts = sqliteTable("chart_of_accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull().default("expense"), // asset|liability|equity|revenue|expense
  balance: real("balance").notNull().default(0),
});
export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;

export const journalEntries = sqliteTable("journal_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  description: text("description").notNull(),
  debitAccountId: integer("debit_account_id").notNull(),
  creditAccountId: integer("credit_account_id").notNull(),
  amount: real("amount").notNull(),
  reference: text("reference"),
  type: text("type").notNull().default("general"), // general|invoice|payroll|expense
  date: text("date").notNull(),
  createdAt: text("created_at").notNull(),
});
export type JournalEntry = typeof journalEntries.$inferSelect;

// ── ERP: Compliance Calendar ──
export const complianceItems = sqliteTable("compliance_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  category: text("category").notNull().default("permit"), // permit|license|bir|pcab|insurance|inspection
  dueDate: text("due_date").notNull(),
  status: text("status").notNull().default("pending"), // pending|completed|overdue|waived
  notes: text("notes"),
  projectId: integer("project_id"),
  createdAt: text("created_at").notNull(),
});
export type ComplianceItem = typeof complianceItems.$inferSelect;

// ── ERP: Bill of Materials Templates ──
export const bomTemplates = sqliteTable("bom_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  systemKw: real("system_kw").notNull(),
  items: text("items").notNull().default("[]"), // JSON [{item, qty, unit, unitCost}]
  totalCost: real("total_cost").notNull().default(0),
  createdAt: text("created_at").notNull(),
});
export type BomTemplate = typeof bomTemplates.$inferSelect;

// ── Elite ERP: Ledger ──
export const stockTransactions = sqliteTable("stock_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  inventoryId: integer("inventory_id").notNull(),
  type: text("type").notNull(), // 'in'|'out'
  quantity: real("quantity").notNull(),
  reference: text("reference"), // project name or PO number
  createdAt: text("created_at").notNull(),
});

// ── Elite ERP: High-Fidelity Scheduling ──
export const schedules = sqliteTable("schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  title: text("title").notNull(),
  start: text("start").notNull(), // ISO date
  end: text("end").notNull(),
  resourceId: integer("resource_id"), // employee_id
});

// ── Elite ERP: System Intelligence ──
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read").default(0),
  createdAt: text("created_at").notNull(),
});
export type StockTransaction = typeof stockTransactions.$inferSelect;
export type InsertStockTransaction = typeof stockTransactions.$inferInsert;
export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ── NEW: IoT Solar Monitoring ──
export const solarReadings = sqliteTable("solar_readings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  wattageKw: real("wattage_kw").notNull(),
  energyTodayKwh: real("energy_today_kwh").notNull(),
  energyTotalKwh: real("energy_total_kwh").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertReadingSchema = createInsertSchema(solarReadings).omit({ id: true });
export type InsertReading = z.infer<typeof insertReadingSchema>;
export type SolarReading = typeof solarReadings.$inferSelect;
