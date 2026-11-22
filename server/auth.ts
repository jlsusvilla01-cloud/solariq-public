import crypto from "crypto";

/**
 * Passwords, sessions and rate limits.
 *
 * Passwords are stored as scrypt hashes ("scrypt$salt$hash"). Older plaintext
 * passwords still verify once and are re-hashed on that login.
 *
 * Sessions are signed tokens: base64url(JSON payload) + "." + HMAC-SHA256.
 * The signing key comes from SESSION_SECRET, or is derived from a secret that
 * already exists on the server (the Firebase private key, the database token, or
 * ADMIN_PASSWORD as a last resort). Without any of those, a random key is used and
 * people sign in again after a restart.
 */

const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string | null | undefined): { ok: boolean; needsRehash: boolean } {
  if (!stored || typeof password !== "string") return { ok: false, needsRehash: false };
  if (stored.startsWith("scrypt$")) {
    const [, saltB64, hashB64] = stored.split("$");
    if (!saltB64 || !hashB64) return { ok: false, needsRehash: false };
    const expected = Buffer.from(hashB64, "base64");
    const actual = crypto.scryptSync(password, Buffer.from(saltB64, "base64"), expected.length);
    return { ok: expected.length === actual.length && crypto.timingSafeEqual(expected, actual), needsRehash: false };
  }
  // Legacy plaintext: compare in constant time, then ask the caller to upgrade it.
  const a = crypto.createHash("sha256").update(password).digest();
  const b = crypto.createHash("sha256").update(stored).digest();
  const ok = crypto.timingSafeEqual(a, b);
  return { ok, needsRehash: ok };
}

export const MIN_PASSWORD_LENGTH = 8;
export const DEFAULT_ADMIN_PASSWORD = "solariq2026"; // published in old versions of the code; flagged when still in use

let cachedSecret: Buffer | null = null;
export let sessionSecretSource: "SESSION_SECRET" | "derived" | "admin_password" | "random" = "random";

function sessionSecret(): Buffer {
  if (cachedSecret) return cachedSecret;
  const explicit = process.env.SESSION_SECRET;
  const derivedFrom = process.env.FIREBASE_PRIVATE_KEY || process.env.DATABASE_AUTH_TOKEN;
  if (explicit && explicit.length >= 32) {
    cachedSecret = crypto.createHash("sha256").update(explicit).digest();
    sessionSecretSource = "SESSION_SECRET";
  } else if (derivedFrom) {
    cachedSecret = crypto.createHmac("sha256", derivedFrom).update("solariq-session-v1").digest();
    sessionSecretSource = "derived";
  } else if (process.env.ADMIN_PASSWORD) {
    // Stable across server instances, but only as strong as the admin password; SESSION_SECRET is better.
    cachedSecret = crypto.createHmac("sha256", process.env.ADMIN_PASSWORD).update("solariq-session-v1").digest();
    sessionSecretSource = "admin_password";
  } else {
    cachedSecret = crypto.randomBytes(32);
    sessionSecretSource = "random";
    console.warn("[auth] No SESSION_SECRET or database secret found; sessions will reset when the server restarts.");
  }
  return cachedSecret;
}

export type Role = "admin" | "user";
export interface SessionPayload { sub: number; role: Role; exp: number; v: 1 }

const TTL_SECONDS: Record<Role, number> = { admin: 12 * 3600, user: 30 * 24 * 3600 };

export function signSession(sub: number, role: Role): string {
  const payload: SessionPayload = { sub, role, exp: Math.floor(Date.now() / 1000) + TTL_SECONDS[role], v: 1 };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", sessionSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySession(token: string | undefined | null, role: Role): SessionPayload | null {
  if (!token || typeof token !== "string") return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", sessionSecret()).update(body).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (payload.v !== 1 || payload.role !== role || !Number.isInteger(payload.sub)) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function bearerToken(req: { headers: Record<string, any> }): string | null {
  const auth = req.headers.authorization;
  return typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

/** Random, URL-safe token for share links. */
export function randomToken(bytes = 12): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

/**
 * Simple fixed-window rate limiter. It is per server instance, so on serverless
 * hosting it slows attacks down rather than stopping them outright.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();
export function rateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > 10_000) buckets.forEach((b, k) => { if (b.resetAt < now) buckets.delete(k); });
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  bucket.count++;
  return bucket.count > limit;
}

export function clientIp(req: { headers: Record<string, any>; ip?: string; socket?: { remoteAddress?: string } }): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd) return fwd.split(",")[0].trim();
  return req.ip || req.socket?.remoteAddress || "unknown";
}

/** Removes secrets before a user or admin record is sent to the browser. */
export function publicUser<T extends Record<string, any>>(u: T): Omit<T, "password"> {
  const { password: _pw, ...rest } = u;
  return rest;
}
