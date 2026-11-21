/**
 * Small fetch wrapper shared by the admin portal and the contractor dashboard.
 * Errors carry the server's own message and HTTP status, so screens can show them as-is.
 */
export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export type ApiFetch = (url: string, opts?: RequestInit & { body?: any }) => Promise<any>;

export interface ApiOptions {
  tokenKey: string; // localStorage key holding the session token
  onUnauthorized?: () => void;
  onPaymentRequired?: () => void;
}

function readToken(key: string): string {
  try { return localStorage.getItem(key) || ""; } catch { return ""; }
}

export function makeApi({ tokenKey, onUnauthorized, onPaymentRequired }: ApiOptions): ApiFetch {
  return async (url, opts = {}) => {
    const token = readToken(tokenKey);
    const r = await fetch(url, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...((opts.headers as Record<string, string>) || {}),
      },
    });
    const text = await r.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!r.ok) {
      if (r.status === 401) onUnauthorized?.();
      if (r.status === 402) onPaymentRequired?.();
      const message = (data && typeof data === "object" && data.error) || (typeof data === "string" && data) || `Request failed (${r.status})`;
      throw new ApiError(r.status, message, data);
    }
    return data;
  };
}

/** Public endpoints with no session. */
export async function publicFetch(url: string, opts: RequestInit & { body?: any } = {}) {
  const r = await fetch(url, { ...opts, headers: { "Content-Type": "application/json", ...((opts.headers as Record<string, string>) || {}) } });
  const data = await r.json().catch(() => null);
  if (!r.ok) throw new ApiError(r.status, data?.error || `Request failed (${r.status})`, data);
  return data;
}
