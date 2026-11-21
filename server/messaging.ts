import nodemailer from "nodemailer";
import { storage } from "./storage.js";

/**
 * Email (SMTP) and SMS (Semaphore) sending, with every attempt written to the message log.
 * When a channel is not configured the attempt is logged as "skipped" instead of failing.
 */

export type Channel = "email" | "sms";
export type Purpose = "lead_alert" | "review_request" | "proposal" | "project_update" | "proposal_accepted";

export interface SendResult { ok: boolean; status: "sent" | "failed" | "skipped"; detail?: string; previewUrl?: string | false }

interface LogContext { userId?: number | null; projectId?: number | null; leadId?: number | null; purpose: Purpose }

export const emailConfigured = () => !!process.env.SMTP_HOST;
export const smsConfigured = () => !!process.env.SEMAPHORE_API_KEY;

async function log(ctx: LogContext, channel: Channel, recipient: string, result: SendResult) {
  try {
    await storage.docInsert("message_log", {
      userId: ctx.userId ?? null,
      projectId: ctx.projectId ?? null,
      leadId: ctx.leadId ?? null,
      channel,
      purpose: ctx.purpose,
      recipient,
      status: result.status,
      detail: result.detail ? result.detail.slice(0, 500) : null,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[messaging] could not write message log:", e);
  }
}

let devTransport: nodemailer.Transporter | null = null;
async function transporter(): Promise<nodemailer.Transporter | null> {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  // Test inbox only on a developer machine; never pretend to send in production.
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    if (!devTransport) {
      const acct = await nodemailer.createTestAccount();
      devTransport = nodemailer.createTransport({ host: "smtp.ethereal.email", port: 587, auth: { user: acct.user, pass: acct.pass } });
    }
    return devTransport;
  }
  return null;
}

export async function sendEmail(to: string, subject: string, html: string, ctx: LogContext): Promise<SendResult> {
  let result: SendResult;
  try {
    const t = await transporter();
    if (!t) {
      result = { ok: false, status: "skipped", detail: "Email is not set up (SMTP_HOST missing)." };
    } else {
      const from = process.env.SMTP_FROM || (process.env.SMTP_USER ? `SolarIQ <${process.env.SMTP_USER}>` : '"SolarIQ" <noreply@solariq.app>');
      const info = await t.sendMail({ from, to, subject, html });
      result = { ok: true, status: "sent", previewUrl: nodemailer.getTestMessageUrl(info) };
    }
  } catch (e: any) {
    result = { ok: false, status: "failed", detail: e?.message || "Email failed." };
  }
  await log(ctx, "email", to, result);
  return result;
}

/** Converts common Philippine mobile formats to 639XXXXXXXXX; returns null if it is not a PH mobile number. */
export function normalizePhMobile(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, "");
  let local: string | null = null;
  if (/^09\d{9}$/.test(digits)) local = digits.slice(1);
  else if (/^639\d{9}$/.test(digits)) local = digits.slice(2);
  else if (/^9\d{9}$/.test(digits)) local = digits;
  return local ? `63${local}` : null;
}

export async function sendSms(to: string, message: string, ctx: LogContext): Promise<SendResult> {
  const number = normalizePhMobile(to);
  let result: SendResult;
  if (!number) {
    result = { ok: false, status: "failed", detail: "Not a valid Philippine mobile number." };
  } else if (!process.env.SEMAPHORE_API_KEY) {
    result = { ok: false, status: "skipped", detail: "SMS is not set up (SEMAPHORE_API_KEY missing)." };
  } else {
    try {
      const body = new URLSearchParams({ apikey: process.env.SEMAPHORE_API_KEY, number, message: message.slice(0, 450) });
      if (process.env.SEMAPHORE_SENDER_NAME) body.set("sendername", process.env.SEMAPHORE_SENDER_NAME);
      const r = await fetch("https://api.semaphore.co/api/v4/messages", { method: "POST", body });
      const text = await r.text();
      result = r.ok ? { ok: true, status: "sent" } : { ok: false, status: "failed", detail: `Semaphore ${r.status}: ${text.slice(0, 200)}` };
    } catch (e: any) {
      result = { ok: false, status: "failed", detail: e?.message || "SMS failed." };
    }
  }
  await log(ctx, "sms", number ?? to, result);
  return result;
}

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

/** Branded HTML wrapper; every dynamic value is escaped. */
export function emailHtml(heading: string, paragraphs: string[], button?: { label: string; url: string }): string {
  const safeUrl = button && /^https?:\/\//i.test(button.url) ? esc(button.url) : null;
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f1117;color:#e5e7eb;padding:32px;border-radius:12px">
    <div style="font-weight:700;font-size:18px;color:#fff;margin-bottom:20px">Solar<span style="color:#fbbf24">IQ</span></div>
    <h2 style="color:#fff;margin:0 0 12px">${esc(heading)}</h2>
    ${paragraphs.map(p => `<p style="color:#d1d5db;line-height:1.6;margin:0 0 12px">${esc(p)}</p>`).join("")}
    ${safeUrl && button ? `<a href="${safeUrl}" style="background:#fbbf24;color:#0f1117;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:8px">${esc(button.label)}</a>` : ""}
  </div>`;
}
