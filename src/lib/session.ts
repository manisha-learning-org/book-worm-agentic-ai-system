// ─────────────────────────────────────────────────────────────
//  Session helper – lightweight cookie-based auth
//
//  Strategy (no extra deps):
//    • On login/register the server sets an HttpOnly cookie
//      "bw_session" whose value is  <userId>:<secret-hmac>
//    • Every protected route calls getCurrentUser() which reads
//      the cookie, verifies the HMAC, and returns the DB user.
//    • The HMAC key is SESSION_SECRET in env (falls back to a
//      dev default so the app works without extra setup).
// ─────────────────────────────────────────────────────────────

import { cookies } from "next/headers";
import { createHmac } from "crypto";
import prisma from "@/lib/prisma";

const SECRET =
  process.env.SESSION_SECRET ?? "bookworm-dev-secret-change-in-prod";
const COOKIE_NAME = "bw_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ── HMAC helpers ───────────────────────────────────────────────

function sign(userId: string): string {
  const hmac = createHmac("sha256", SECRET);
  hmac.update(userId);
  return hmac.digest("hex");
}

function verify(userId: string, sig: string): boolean {
  return sign(userId) === sig;
}

// ── Public API ─────────────────────────────────────────────────

/** Build a session token string from a userId */
export function createSessionToken(userId: string): string {
  return `${userId}:${sign(userId)}`;
}

/** Set the session cookie on the response (call from route handlers) */
export async function setSessionCookie(userId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

/** Clear the session cookie */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
}

/** Read cookie → verify → return full DB User, or null */
export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const [userId, sig] = token.split(":");
  if (!userId || !sig || !verify(userId, sig)) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: true },
  });
}

/** Same as getCurrentUser but throws a 401 Response if not authed */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}
