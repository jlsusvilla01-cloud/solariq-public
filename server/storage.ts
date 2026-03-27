import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { projects, milestones, updates, faqs, testimonials, pricingPlans, admins, milestonePhotos, signatures, notificationPrefs, quotations, documents, payments, inventory, designs, leads, referrals, vendors, purchaseOrders, crews, proposals, serviceJobs, clientMessages, tenants, employees, timesheets, chartOfAccounts, journalEntries, complianceItems, bomTemplates, stockTransactions, schedules, notifications } from "@shared/schema";
import type { InsertProject, Project, InsertMilestone, Milestone, InsertUpdate, Update, InsertFaq, Faq, InsertTestimonial, Testimonial, InsertPricing, PricingPlan, InsertMilestonePhoto, MilestonePhoto, InsertSignature, Signature, InsertNotif, NotificationPref, InsertQuotation, Quotation, InsertDocument, Document, InsertPayment, Payment, InsertInventory, Inventory, InsertDesign, Design, Lead, InsertLead, Referral, Vendor, PurchaseOrder, Crew, InsertCrew, Proposal, InsertProposal, ServiceJob, InsertServiceJob, ClientMessage, InsertClientMessage, Tenant, InsertTenant, Employee, InsertEmployee, Timesheet, InsertTimesheet, ChartOfAccount, JournalEntry, ComplianceItem, BomTemplate, StockTransaction, InsertStockTransaction, Schedule, InsertSchedule, Notification, InsertNotification, Admin, InsertAdmin } from "@shared/schema";
import { eq } from "drizzle-orm";

const client = createClient({ 
  url: process.env.DATABASE_URL || "file:solariq_v3.db",
  authToken: process.env.DATABASE_AUTH_TOKEN
});
export const db = drizzle(client);

async function seedAll() {
  // Seed admins
  const adminRes = await client.execute({ sql: "SELECT COUNT(*) as c FROM admins WHERE username=?", args: ["admin"] });
  if (Number(adminRes.rows[0].c) === 0) {
    console.log("Seeding default admin...");
    await client.execute(`INSERT INTO admins (username, password, name, email) VALUES ('admin','solariq2026','SolarIQ Admin', 'admin@solariq.app')`);
  }

  // Seed FAQs
  const faqRes = await client.execute("SELECT COUNT(*) as c FROM faqs");
  if (Number(faqRes.rows[0].c) === 0) {
    const seedFaqsByPhase = [
      ["How long does solar installation take?","Most residential installations take 1–3 days for physical install after permits are approved. The full process from survey to commissioning typically takes 4–8 weeks.","installation",1],
      ["What is net metering and how does it work in the Philippines?","Net metering allows you to sell excess solar energy back to your distribution utility (e.g., Meralco, VECO). Your meter runs backward when you produce more than you consume, effectively reducing your bill. Under ERC rules, residential systems up to 100 kW are eligible.","billing",2],
      ["Do I need a permit to install solar panels?","Yes. In the Philippines you need a building permit from your LGU/DPWH and an electrical permit. For grid-tied systems, you also need approval from your distribution utility for interconnection.","permits",3],
      ["What happens during a power outage?","Standard grid-tied systems automatically shut down during a power outage for safety reasons. If you want power during outages, you need a battery storage system or a hybrid inverter with backup capability.","technical",4],
      ["How do I monitor my solar system's performance?","Your inverter comes with monitoring software accessible via a mobile app or web portal. You can track daily, monthly, and annual energy production, as well as system health alerts.","monitoring",5],
      ["What maintenance is required?","Solar panels require minimal maintenance. We recommend cleaning panels every 3–6 months (more often in dusty or coastal areas), and a professional inspection every 2–3 years. Inverters typically have a 5–10 year warranty.","maintenance",6],
      ["How much can I save on my electricity bill?","Savings depend on your system size, energy consumption, and local tariff. A properly sized 6 kWp system in the Philippines can offset 60–80% of a typical household electricity bill, saving ₱3,000–₱6,000 per month.","billing",7],
      ["Is my roof strong enough for solar panels?","Our survey team will assess your roof's structural integrity before any installation. Most concrete and steel roofs are suitable. If reinforcement is needed, we will advise you before proceeding.","structural",8],
      ["Can I upgrade my system later?","Yes, our systems are designed with scalability in mind. You can add more panels or upgrade your inverter/battery capacity as your energy needs grow, provided there is enough roof space.","technical",9],
      ["What financing options are available?","We offer several flexible financing plans, including 0% interest bridge loans for the first 6 months and partnerships with major local banks for long-term solar loans up to 10 years.","billing",10],
    ];
    for (const [q, a, c, o] of seedFaqsByPhase) {
      await client.execute({ sql: "INSERT INTO faqs (question,answer,category,sort_order,published) VALUES (?,?,?,?,1)", args: [q, a, c, o] });
    }
  }

  // Seed Testimonials
  const testRes = await client.execute("SELECT COUNT(*) as c FROM testimonials");
  if (Number(testRes.rows[0].c) === 0) {
    const seeds = [
      ["Maria Santos","Quezon City","Homeowner","SolarIQ made the entire process transparent. I could check my installation progress anytime from my phone. The crew was professional and finished 2 days ahead of schedule!",5,"8 kWp","MS"],
      ["Roberto Reyes","Cebu City","Business Owner","We installed a 25 kWp system for our restaurant. The platform tracked every milestone and the contractor sent us photos at each stage. Our electricity bill dropped by 70%.",5,"25 kWp","RR"],
      ["Ana dela Cruz","Davao City","Homeowner","As someone who knew nothing about solar, the FAQ section answered all my questions. The progress tracker gave me peace of mind during the whole installation.",5,"6 kWp","AD"],
      ["Jose Magno","Manila","Solar Contractor","The admin dashboard saves me hours every week. I manage 12 active projects and all clients can see their progress in real time. No more endless WhatsApp messages asking for updates.",5,"Contractor","JM"],
      ["Grace Villanueva","Laguna","Homeowner","The change order tracking feature kept us informed when there was a design adjustment. No surprises, no hidden costs. Exactly what you want from a contractor.",5,"10 kWp","GV"],
      ["Carlo Mendoza","Iloilo","SME Owner","From site survey to full commissioning, everything was logged. Our 40 kWp commercial system was installed flawlessly. ROI is tracking ahead of projections.",5,"40 kWp","CM"],
    ];
    for (const [n, l, r, q, rt, ss, ai] of seeds) {
      await client.execute({ sql: "INSERT INTO testimonials (name,location,role,quote,rating,system_size,published,avatar_initials,created_at) VALUES (?,?,?,?,?,?,1,?,?)", args: [n, l, r, q, rt, ss, ai, new Date().toISOString()] });
    }
  }

  // Seed Pricing
  const planRes = await client.execute("SELECT COUNT(*) as c FROM pricing_plans");
  if (Number(planRes.rows[0].c) === 0) {
    const plans = [
      ["Starter",999,"month","Perfect for new solar contractors with a small client base",JSON.stringify(["Up to 5 active projects","Client progress tracker","Basic milestone tracking","Share link for clients","Email support","SolarIQ branding"]),0,"Start Free Trial",1],
      ["Professional",2499,"month","The complete toolkit for growing contractors",JSON.stringify(["Up to 25 active projects","All Starter features","Photo updates per milestone","Change order tracking","Permit & BOM manager","Priority support","Custom branding / white-label","SMS/email client notifications"]),1,"Start Free Trial",2],
      ["Enterprise",4999,"month","For large contractors and EPCs managing complex portfolios",JSON.stringify(["Unlimited projects","All Pro features","3D solar designer + yield simulation","Structural load calculator","Shading analysis tool","Dedicated account manager","API access for integrations","Custom domain","Team access (up to 10 users)","Investor PDF reports"]),0,"Contact Sales",3],
      ["Starter (Annual)",799,"year","Perfect for new solar contractors with a small client base",JSON.stringify(["Up to 5 active projects","Client progress tracker","Basic milestone tracking","Share link for clients","Email support","SolarIQ branding"]),0,"Start Free Trial",4],
      ["Professional (Annual)",1999,"year","The complete toolkit for growing contractors",JSON.stringify(["Up to 25 active projects","All Starter features","Photo updates per milestone","Change order tracking","Permit & BOM manager","Priority support","Custom branding / white-label","SMS/email client notifications"]),1,"Start Free Trial",5],
      ["Enterprise (Annual)",3999,"year","For large contractors and EPCs managing complex portfolios",JSON.stringify(["Unlimited projects","All Pro features","3D solar designer + yield simulation","Structural load calculator","Shading analysis tool","Dedicated account manager","API access for integrations","Custom domain","Team access (up to 10 users)","Investor PDF reports"]),0,"Contact Sales",6],
    ];
    for (const [n, p, b, d, f, h, c, o] of plans) {
      await client.execute({ sql: "INSERT INTO pricing_plans (name,price,billing_cycle,description,features,highlighted,cta_label,sort_order,published) VALUES (?,?,?,?,?,?,?,?,1)", args: [n, p, b, d, f, h, c, o] });
    }
  }

  // Seed Demo Project
  const projRes = await client.execute("SELECT COUNT(*) as c FROM projects");
  if (Number(projRes.rows[0].c) === 0) {
    const token = "demo-abc123";
    await client.execute({ sql: "INSERT INTO projects (client_name,client_email,client_phone,address,system_kw,panel_count,contract_value,share_token,start_date,estimated_end_date,status,overall_progress,annual_savings,roi_projected_years,total_lifetime_savings,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", args: ["Juan Dela Cruz","juan@example.com","09171234567","123 Solar St, Quezon City, Metro Manila",8,20,192000,token,"2026-03-01","2026-04-15","installation",65,45000,4,1125000,new Date().toISOString()] });
    
    const p = await client.execute({ sql: "SELECT id FROM projects WHERE share_token=?", args: [token] });
    const pid = Number(p.rows[0].id);

    await client.execute({ sql: "INSERT INTO quotations (project_id, items, total_amount, status, valid_until, created_at) VALUES (?, ?, ?, ?, ?, ?)", args: [pid, JSON.stringify([{ description: "8kWP Solar System", quantity: 1, unitPrice: 192000, total: 192000 }]), 192000, "approved", "2026-05-01", new Date().toISOString()] });
    await client.execute({ sql: "INSERT INTO documents (project_id, title, type, file_url, status, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)", args: [pid, "Building Permit - Approved", "permit", "https://example.com/permit.pdf", "approved", new Date().toISOString()] });
    await client.execute({ sql: "INSERT INTO documents (project_id, title, type, file_url, status, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)", args: [pid, "Net Metering App - Pending Utility", "net_metering", "https://example.com/netmetering.pdf", "reviewing", new Date().toISOString()] });
    await client.execute({ sql: "INSERT INTO payments (project_id, amount, status, payment_method, paid_at, created_at) VALUES (?, ?, ?, ?, ?, ?)", args: [pid, 50000, "paid", "stripe", "2026-03-02", new Date().toISOString()] });
    await client.execute({ sql: "INSERT INTO payments (project_id, amount, status, created_at) VALUES (?, ?, ?, ?)", args: [pid, 75000, "pending", new Date().toISOString()] });

    const phases = [
      [pid,"Site Survey Complete","Roof assessment, shading analysis, and structural review completed","survey","completed","2026-03-05",1],
      [pid,"System Design Approved","Final 8 kWp layout with 20 x 400W panels approved by client","design","completed","2026-03-10",2],
      [pid,"Permits Submitted","Building and electrical permits submitted to Quezon City LGU","permitting","completed","2026-03-15",3],
      [pid,"Permits Approved","All permits cleared. Utility interconnection approved by Meralco","permitting","completed","2026-03-22",4],
      [pid,"Materials Delivered","All panels, inverter, racking, and wiring delivered on-site","procurement","completed","2026-03-28",5],
      [pid,"Racking Installation","Roof mounts and racking rails installed","installation","completed","2026-04-02",6],
      [pid,"Panel Installation","Solar panels mounted and wired","installation","in_progress",null,7],
      [pid,"Inverter & Electrical","Inverter installation and electrical connections","installation","pending",null,8],
      [pid,"Final Inspection","Local authority and utility inspection","inspection","pending",null,9],
      [pid,"Commissioning & Handover","System tested, monitoring set up, client training","commissioned","pending",null,10],
    ];
    for (const [prid, t, d, ph, s, c, o] of phases) {
      await client.execute({ sql: "INSERT INTO milestones (project_id,title,description,phase,status,completed_at,sort_order) VALUES (?,?,?,?,?,?,?)", args: [prid, t, d, ph, s, c, o] });
    }
    
    const updatesSeeds = [
      [pid,"Welcome to your SolarIQ progress tracker! We'll keep you updated every step of the way.","update","SolarIQ Team","2026-03-01T09:00:00Z"],
      [pid,"Site survey completed. Your roof is in excellent condition — no structural issues found!","milestone","Engr. Santos","2026-03-05T14:30:00Z"],
      [pid,"Great news! All permits have been approved by Quezon City LGU and Meralco. We're ready to order materials.","milestone","Engr. Santos","2026-03-22T10:15:00Z"],
      [pid,"All materials are on-site and inventoried. Installation crew arrives tomorrow morning at 7am.","update","Engr. Santos","2026-03-28T16:45:00Z"],
      [pid,"Panel installation is 60% complete. Looking great up there! We'll send photos this afternoon.","update","Engr. Santos","2026-04-03T11:00:00Z"],
    ];
    for (const [prid, m, t, b, c] of updatesSeeds) {
      await client.execute({ sql: "INSERT INTO updates (project_id,message,type,posted_by,created_at) VALUES (?,?,?,?,?)", args: [prid, m, t, b, c] });
    }

    // Seed Inventory
    await client.execute({ sql: "INSERT INTO inventory (item_name, category, quantity, unit, min_threshold, updated_at) VALUES (?, ?, ?, ?, ?, ?)", args: ["Solar Panel - 400W Mono", "panels", 45, "pcs", 10, new Date().toISOString()] });
    await client.execute({ sql: "INSERT INTO inventory (item_name, category, quantity, unit, min_threshold, updated_at) VALUES (?, ?, ?, ?, ?, ?)", args: ["Hybrid Inverter - 10kW", "inverters", 3, "pcs", 5, new Date().toISOString()] });

    // Seed Crews
    await client.execute(`INSERT INTO crews (name, location, status, last_weather_risk) VALUES 
      ('Team Alfa (Metro Manila)', 'Quezon City', 'on-site', 'Low'),
      ('Team Bravo (Cebu)', 'Cebu City', 'transit', 'HIGH'),
      ('Team Charlie (Davao)', 'Davao City', 'idle', 'Mid')`);

    // Seed Tenants
    await client.execute({ sql: "INSERT INTO tenants (name, subdomain, primary_color, plan_tier, owner_email, active_projects, created_at) VALUES (?,?,?,?,?,?,?)", args: ["SolarPH Contractors", "solarph", "#fbbf24", "enterprise", "admin@solarph.com", 12, new Date().toISOString()] });
    await client.execute({ sql: "INSERT INTO tenants (name, subdomain, primary_color, plan_tier, owner_email, active_projects, created_at) VALUES (?,?,?,?,?,?,?)", args: ["SunPower Cebu", "suncebu", "#22d3ee", "pro", "ops@suncebu.com", 5, new Date().toISOString()] });
    
    // Seed Employees
    await client.execute({ sql: "INSERT INTO employees (name, role, email, phone, daily_rate, employment_type, status, hired_date, created_at) VALUES (?,?,?,?,?,?,?,?,?)", args: ["Engr. Ramon Santos", "supervisor", "rsantos@solarph.com", "09171112222", 2500, "full-time", "active", "2024-01-15", new Date().toISOString()] });
    
    // Seed BOM Template
    const items8kw = JSON.stringify([
      { item: "Solar Panel 400W Mono", qty: 20, unit: "pcs", unitCost: 8500 },
      { item: "Hybrid Inverter 10kW", qty: 1, unit: "unit", unitCost: 45000 },
    ]);
    await client.execute({ sql: "INSERT INTO bom_templates (name, system_kw, items, total_cost, created_at) VALUES (?,?,?,?,?)", args: ["8 kWp Grid-Tied Residential", 8, items8kw, 229600, new Date().toISOString()] });
  }
}

async function initDb() {
  await client.execute(`CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, client_name TEXT NOT NULL, client_email TEXT, client_phone TEXT, address TEXT NOT NULL, system_kw REAL NOT NULL DEFAULT 6, panel_count INTEGER NOT NULL DEFAULT 15, contract_value REAL NOT NULL DEFAULT 0, share_token TEXT NOT NULL, start_date TEXT, estimated_end_date TEXT, notes TEXT, contractor_notes TEXT, status TEXT NOT NULL DEFAULT 'survey', overall_progress INTEGER NOT NULL DEFAULT 0, roi_projected_years INTEGER DEFAULT 5, annual_savings INTEGER DEFAULT 0, total_lifetime_savings INTEGER DEFAULT 0, created_at TEXT NOT NULL DEFAULT '', client_portal_pin TEXT, tenant_id INTEGER DEFAULT 1, scheduled_start TEXT, scheduled_end TEXT)`);
  
  await client.execute(`CREATE TABLE IF NOT EXISTS milestones (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, title TEXT NOT NULL, description TEXT, phase TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', completed_at TEXT, sort_order INTEGER NOT NULL DEFAULT 0, photo TEXT, note TEXT)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS updates (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, message TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'update', posted_by TEXT NOT NULL DEFAULT 'Contractor', created_at TEXT NOT NULL DEFAULT '', is_read INTEGER NOT NULL DEFAULT 0)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS faqs (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT NOT NULL, answer TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'general', sort_order INTEGER NOT NULL DEFAULT 0, published INTEGER NOT NULL DEFAULT 1)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS testimonials (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, location TEXT, role TEXT NOT NULL DEFAULT 'Homeowner', quote TEXT NOT NULL, rating INTEGER NOT NULL DEFAULT 5, system_size TEXT, published INTEGER NOT NULL DEFAULT 1, avatar_initials TEXT, created_at TEXT NOT NULL DEFAULT '')`);
  await client.execute(`CREATE TABLE IF NOT EXISTS pricing_plans (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price REAL NOT NULL, billing_cycle TEXT NOT NULL DEFAULT 'month', description TEXT, features TEXT NOT NULL DEFAULT '[]', highlighted INTEGER NOT NULL DEFAULT 0, cta_label TEXT NOT NULL DEFAULT 'Get Started', sort_order INTEGER NOT NULL DEFAULT 0, published INTEGER NOT NULL DEFAULT 1)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS milestone_photos (id INTEGER PRIMARY KEY AUTOINCREMENT, milestone_id INTEGER NOT NULL, project_id INTEGER NOT NULL, data_url TEXT NOT NULL, caption TEXT, photo_type TEXT NOT NULL DEFAULT 'progress', created_at TEXT NOT NULL DEFAULT '')`);
  await client.execute(`CREATE TABLE IF NOT EXISTS signatures (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, signer_name TEXT NOT NULL, signer_role TEXT NOT NULL DEFAULT 'Client', signature_data_url TEXT NOT NULL, signed_at TEXT NOT NULL DEFAULT '', ip_address TEXT, agreement_text TEXT)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS notification_prefs (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, email TEXT, phone TEXT, email_enabled INTEGER NOT NULL DEFAULT 1, sms_enabled INTEGER NOT NULL DEFAULT 0, notify_on_milestone INTEGER NOT NULL DEFAULT 1, notify_on_update INTEGER NOT NULL DEFAULT 1)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, email TEXT, google_id TEXT)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS quotations (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, items TEXT NOT NULL DEFAULT '[]', total_amount REAL NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'draft', valid_until TEXT, created_at TEXT NOT NULL DEFAULT '')`);
  await client.execute(`CREATE TABLE IF NOT EXISTS documents (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, title TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'permit', file_url TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'uploaded', uploaded_at TEXT NOT NULL DEFAULT '', requires_signature INTEGER NOT NULL DEFAULT 0)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS payments (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, milestone_id INTEGER, amount REAL NOT NULL, status TEXT NOT NULL DEFAULT 'pending', payment_method TEXT, transaction_id TEXT, paid_at TEXT, created_at TEXT NOT NULL DEFAULT '')`);
  await client.execute(`CREATE TABLE IF NOT EXISTS designs (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, panel_capacity_kw REAL NOT NULL, panels JSON NOT NULL DEFAULT '[]', annual_yield_kwh REAL NOT NULL, status TEXT NOT NULL DEFAULT 'draft', created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS inventory (id INTEGER PRIMARY KEY AUTOINCREMENT, item_name TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'panels', quantity INTEGER NOT NULL DEFAULT 0, unit TEXT NOT NULL DEFAULT 'pcs', min_threshold INTEGER NOT NULL DEFAULT 5, updated_at TEXT NOT NULL DEFAULT '', warehouse_location TEXT DEFAULT 'A1-W1')`);
  await client.execute(`CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY AUTOINCREMENT, client_name TEXT NOT NULL, client_email TEXT, client_phone TEXT, address TEXT NOT NULL, source TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', notes TEXT, created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS referrals (id INTEGER PRIMARY KEY AUTOINCREMENT, referrer_project_id INTEGER NOT NULL, referred_name TEXT NOT NULL, referred_email TEXT, commission_amount INTEGER DEFAULT 0, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS vendors (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT NOT NULL, contact_person TEXT, contact_phone TEXT, created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS purchase_orders (id INTEGER PRIMARY KEY AUTOINCREMENT, vendor_id INTEGER NOT NULL, po_number TEXT NOT NULL, total_amount REAL NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'draft', items_json TEXT NOT NULL DEFAULT '[]', delivery_expected TEXT, created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS crews (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, location TEXT NOT NULL, contact_number TEXT, status TEXT NOT NULL DEFAULT 'idle', current_project_id INTEGER, last_weather_risk TEXT)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS proposals (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, template_style TEXT NOT NULL DEFAULT 'modern', include_roi INTEGER NOT NULL DEFAULT 1, include_financing INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'draft', notes TEXT, created_at TEXT NOT NULL, is_published INTEGER DEFAULT 0, total_value REAL DEFAULT 0, snapshot_json TEXT)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS service_jobs (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, type TEXT NOT NULL DEFAULT 'maintenance', description TEXT NOT NULL, scheduled_date TEXT, resolved_date TEXT, status TEXT NOT NULL DEFAULT 'open', technician_name TEXT, notes TEXT, created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS client_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, sender TEXT NOT NULL DEFAULT 'client', message TEXT NOT NULL, is_read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS tenants (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, subdomain TEXT NOT NULL, logo_url TEXT, primary_color TEXT NOT NULL DEFAULT '#fbbf24', plan_tier TEXT NOT NULL DEFAULT 'starter', owner_email TEXT, active_projects INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'installer', email TEXT, phone TEXT, daily_rate REAL DEFAULT 0, employment_type TEXT NOT NULL DEFAULT 'full-time', status TEXT NOT NULL DEFAULT 'active', hired_date TEXT, created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS timesheets (id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id INTEGER NOT NULL, project_id INTEGER, date TEXT NOT NULL, hours_worked REAL NOT NULL DEFAULT 8, task_description TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS chart_of_accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'expense', balance REAL NOT NULL DEFAULT 0)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS journal_entries (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT NOT NULL, debit_account_id INTEGER NOT NULL, credit_account_id INTEGER NOT NULL, amount REAL NOT NULL, reference TEXT, type TEXT NOT NULL DEFAULT 'general', date TEXT NOT NULL, created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS compliance_items (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'permit', due_date TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', notes TEXT, project_id INTEGER, created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS bom_templates (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, system_kw REAL NOT NULL, items TEXT NOT NULL DEFAULT '[]', total_cost REAL NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS stock_transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, inventory_id INTEGER NOT NULL, type TEXT NOT NULL, quantity REAL NOT NULL, reference TEXT, created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS schedules (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, title TEXT NOT NULL, start TEXT NOT NULL, end TEXT NOT NULL, resource_id INTEGER)`);
  await client.execute(`CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, message TEXT NOT NULL, is_read INTEGER DEFAULT 0, created_at TEXT NOT NULL)`);

  // Migrations for existing tables
  try { await client.execute("ALTER TABLE projects ADD COLUMN roi_projected_years INTEGER DEFAULT 5"); } catch(e){}
  try { await client.execute("ALTER TABLE projects ADD COLUMN annual_savings INTEGER DEFAULT 0"); } catch(e){}
  try { await client.execute("ALTER TABLE projects ADD COLUMN total_lifetime_savings INTEGER DEFAULT 0"); } catch(e){}
  try { await client.execute("ALTER TABLE projects ADD COLUMN client_portal_pin TEXT"); } catch(e){}
  try { await client.execute("ALTER TABLE projects ADD COLUMN tenant_id INTEGER DEFAULT 1"); } catch(e){}
  try { await client.execute("ALTER TABLE projects ADD COLUMN scheduled_start TEXT"); } catch(e){}
  try { await client.execute("ALTER TABLE projects ADD COLUMN scheduled_end TEXT"); } catch(e){}
  try { await client.execute("ALTER TABLE admins ADD COLUMN email TEXT"); } catch(e){}
  try { await client.execute("ALTER TABLE admins ADD COLUMN google_id TEXT"); } catch(e){}
  try { await client.execute("ALTER TABLE inventory ADD COLUMN warehouse_location TEXT DEFAULT 'A1-W1'"); } catch(e){}
  try { await client.execute("ALTER TABLE proposals ADD COLUMN is_published INTEGER DEFAULT 0"); } catch(e){}
  try { await client.execute("ALTER TABLE proposals ADD COLUMN total_value REAL DEFAULT 0"); } catch(e){}
  try { await client.execute("ALTER TABLE proposals ADD COLUMN snapshot_json TEXT"); } catch(e){}

  await seedAll();
}

export { initDb, seedAll };

export class Storage {
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
    return res.find(p => p.shareToken === token && p.clientPortalPin === pin) || null;
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
}

export const storage = new Storage();
