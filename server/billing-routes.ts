import type { Express } from "express";
import crypto from "crypto";
import { storage } from "./storage.js";
import { PLANS, planPrice, addBillingPeriod, type BillingCycle } from "../shared/plans.js";

/**
 * Subscription billing through PayMongo hosted checkout.
 *
 * 1. The contractor picks a plan; the server creates a checkout session priced from shared/plans.ts.
 * 2. PayMongo sends checkout_session.payment.paid to /api/webhooks/paymongo.
 * 3. The webhook is verified with PAYMONGO_WEBHOOK_SECRET and extends the account's paidUntil date.
 * The browser never decides whether a payment succeeded.
 */

type Mw = (req: any, res: any, next: any) => any;
interface Deps { requireAuth: Mw; requireUser: Mw; appUrl: (req: any) => string }

const API_BASE = "https://api.paymongo.com/v1";
const paymentsEnabled = () => !!process.env.PAYMONGO_SECRET_KEY && !!process.env.PAYMONGO_WEBHOOK_SECRET;

/** Verifies the Paymongo-Signature header: HMAC-SHA256 of "<t>.<raw body>" compared with te (test) or li (live). */
export function verifyPaymongoSignature(header: string | undefined, rawBody: Buffer | string | undefined, secret: string, livemode: boolean): boolean {
  if (!header || !rawBody || !secret) return false;
  const parts = Object.fromEntries(header.split(",").map(kv => {
    const i = kv.indexOf("=");
    return [kv.slice(0, i).trim(), kv.slice(i + 1).trim()];
  }));
  const given = livemode ? parts.li : parts.te;
  if (!parts.t || !given) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${parts.t}.${rawBody.toString()}`).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(given, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Extends access from today or from the current end date, whichever is later. */
async function activate(userId: number, plan: string, cycle: BillingCycle) {
  const user: any = await storage.getUserById(userId);
  if (!user) return null;
  const current = user.paidUntil ? new Date(user.paidUntil) : null;
  const from = current && current.getTime() > Date.now() ? current : new Date();
  const paidUntil = addBillingPeriod(from, cycle).toISOString();
  return storage.updateUserSubscription(userId, {
    subscriptionStatus: "active",
    subscriptionPlan: plan,
    billingCycle: cycle,
    subscriptionStartDate: user.subscriptionStartDate || new Date().toISOString(),
    paidUntil,
  } as any);
}

export function registerBillingRoutes(app: Express, deps: Deps) {
  const { requireAuth, requireUser, appUrl } = deps;

  app.get("/api/billing/plans", (_req, res) => res.json({ plans: PLANS, paymentsEnabled: paymentsEnabled() }));

  // Old mock endpoint: it used to activate plans without payment.
  app.post("/api/user/subscribe", requireUser, (_req, res) =>
    res.status(410).json({ error: "Please use the checkout to subscribe." }));

  app.post("/api/user/checkout", requireUser, async (req: any, res) => {
    const plan = String(req.body?.plan ?? "");
    const cycle = String(req.body?.billingCycle ?? "") as BillingCycle;
    const amount = planPrice(plan, cycle);
    if (amount === null) return res.status(400).json({ error: "Choose a valid plan and billing cycle." });
    if (!paymentsEnabled()) {
      return res.status(503).json({ error: "Online payment is not switched on yet. Message SolarIQ to activate your plan by bank transfer or GCash." });
    }
    const event: any = await storage.docInsert("billing_events", {
      userId: req.userId, provider: "paymongo", checkoutId: null, plan, billingCycle: cycle, amount,
      status: "pending", note: null, createdAt: new Date().toISOString(), paidAt: null,
    });
    const planName = PLANS.find(p => p.id === plan)!.name;
    const base = appUrl(req);
    const methods = (process.env.PAYMONGO_METHODS || "gcash,paymaya,card").split(",").map(m => m.trim()).filter(Boolean);
    try {
      const r = await fetch(`${API_BASE}/checkout_sessions`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            attributes: {
              line_items: [{ name: `SolarIQ ${planName} (${cycle === "year" ? "1 year" : "1 month"})`, amount: Math.round(amount * 100), currency: "PHP", quantity: 1 }],
              payment_method_types: methods,
              description: `SolarIQ ${planName} plan`,
              reference_number: `SIQ-${event.id}`,
              send_email_receipt: true,
              show_line_items: true,
              customer_email: req.user.email,
              success_url: `${base}/?payment=success#/dashboard`,
              cancel_url: `${base}/?payment=cancelled#/dashboard`,
              metadata: { billingEventId: String(event.id), userId: String(req.userId) },
            },
          },
        }),
      });
      const json: any = await r.json().catch(() => ({}));
      const checkoutUrl = json?.data?.attributes?.checkout_url;
      if (!r.ok || !checkoutUrl) {
        await storage.docUpdate("billing_events", event.id, { status: "failed", note: JSON.stringify(json?.errors ?? json).slice(0, 500) });
        console.error("[billing] PayMongo checkout failed:", r.status, json);
        return res.status(502).json({ error: "The payment page could not be opened. Please try again in a minute." });
      }
      await storage.docUpdate("billing_events", event.id, { checkoutId: json.data.id });
      res.json({ checkoutUrl });
    } catch (e: any) {
      await storage.docUpdate("billing_events", event.id, { status: "failed", note: String(e?.message).slice(0, 500) });
      res.status(502).json({ error: "The payment page could not be opened. Please try again in a minute." });
    }
  });

  app.post("/api/webhooks/paymongo", async (req: any, res) => {
    const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
    if (!secret) return res.status(503).json({ error: "Webhook not configured" });
    const livemode = !!req.body?.data?.attributes?.livemode;
    if (!verifyPaymongoSignature(req.headers["paymongo-signature"], req.rawBody, secret, livemode)) {
      return res.status(401).json({ error: "Invalid signature" });
    }
    const type = req.body?.data?.attributes?.type;
    if (type !== "checkout_session.payment.paid") return res.json({ ok: true, ignored: type });

    const session = req.body?.data?.attributes?.data;
    const checkoutId = session?.id;
    const metaId = Number(session?.attributes?.metadata?.billingEventId);
    const events = await storage.docList("billing_events");
    const event: any = events.find((e: any) => e.checkoutId && e.checkoutId === checkoutId) ?? events.find((e: any) => e.id === metaId);
    if (!event) {
      console.error("[billing] paid checkout with no matching billing event:", checkoutId);
      return res.json({ ok: true, unmatched: true });
    }
    if (event.status === "paid") return res.json({ ok: true, duplicate: true });

    const paidCentavos = (session?.attributes?.line_items ?? []).reduce((sum: number, li: any) => sum + (li.amount ?? 0) * (li.quantity ?? 1), 0);
    if (paidCentavos && paidCentavos < Math.round(event.amount * 100)) {
      await storage.docUpdate("billing_events", event.id, { status: "failed", note: `Amount mismatch: ${paidCentavos}` });
      return res.json({ ok: true, mismatch: true });
    }
    await storage.docUpdate("billing_events", event.id, { status: "paid", paidAt: new Date().toISOString(), checkoutId: checkoutId ?? event.checkoutId });
    await activate(event.userId, event.plan, event.billingCycle);
    res.json({ ok: true });
  });

  app.get("/api/user/billing", requireUser, async (req: any, res) => {
    const list = (await storage.docList("billing_events")).filter((e: any) => e.userId === req.userId && e.status !== "pending");
    list.sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)));
    res.json(list);
  });

  // ── Admin: manual activation for pilots and offline payments (bank transfer, cash, GCash send) ──
  app.post("/api/admin/users/:id/access", requireAuth, async (req: any, res) => {
    const user: any = await storage.getUserById(+req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    const action = req.body?.action;
    if (action === "revoke") {
      await storage.updateUserSubscription(user.id, { subscriptionStatus: "expired", paidUntil: null } as any);
      await storage.docInsert("billing_events", { userId: user.id, provider: "manual", checkoutId: null, plan: user.subscriptionPlan || "starter", billingCycle: user.billingCycle || "month", amount: 0, status: "manual", note: "Access revoked by admin", createdAt: new Date().toISOString(), paidAt: null });
      return res.json({ ok: true });
    }
    const plan = String(req.body?.plan ?? "starter");
    const until = String(req.body?.paidUntil ?? "");
    const amount = Number(req.body?.amount ?? 0);
    if (!PLANS.some(p => p.id === plan)) return res.status(400).json({ error: "Unknown plan." });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(until) || new Date(until + "T23:59:59").getTime() < Date.now()) {
      return res.status(400).json({ error: "Pick an end date in the future." });
    }
    const note = String(req.body?.note ?? "").slice(0, 300) || "Manual activation";
    await storage.updateUserSubscription(user.id, {
      subscriptionStatus: "active", subscriptionPlan: plan, billingCycle: user.billingCycle || "month",
      subscriptionStartDate: user.subscriptionStartDate || new Date().toISOString(),
      paidUntil: new Date(until + "T23:59:59").toISOString(),
    } as any);
    await storage.docInsert("billing_events", {
      userId: user.id, provider: "manual", checkoutId: null, plan, billingCycle: "month",
      amount: Number.isFinite(amount) && amount >= 0 ? amount : 0, status: "manual", note,
      createdAt: new Date().toISOString(), paidAt: new Date().toISOString(),
    });
    res.json({ ok: true });
  });

  app.get("/api/admin/billing-events", requireAuth, async (_req, res) => {
    const list = await storage.docList("billing_events");
    list.sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)));
    res.json(list.slice(0, 200));
  });
}
