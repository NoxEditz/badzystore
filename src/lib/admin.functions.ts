import { createServerFn } from "@tanstack/react-start";
import { createHash, timingSafeEqual } from "node:crypto";

// Server-side admin auth. The passkey lives in ADMIN_PASSKEY (server env)
// and is checked with a timing-safe compare. Success stores an unlocked
// flag in an encrypted, httpOnly session cookie signed with
// ADMIN_SESSION_SECRET. The client never sees the passkey or the raw
// session value.
//
// NOTE: this file is imported by src/routes/admin.tsx, so it's reachable
// from the client bundle. Server-only APIs (`@tanstack/react-start/server`,
// service-role clients, etc.) must be dynamic-imported inside handler
// bodies — those bodies are stripped from the client bundle by TanStack.

// Hash both sides to equal-length digests before comparing — timingSafeEqual
// throws on a length mismatch, and the raw length would leak through timing.
function passkeyMatches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

// Very small in-memory rate limiter to slow brute-force attempts.
// Best-effort only — server instances are stateless, so this is defence-
// in-depth on top of the strong random passkey.
const attempts = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 8;

function checkRateLimit(key: string) {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now });
    return;
  }
  rec.count += 1;
  if (rec.count > MAX_ATTEMPTS) {
    throw new Error("Too many attempts. Please wait a minute and try again.");
  }
}

export const adminSignIn = createServerFn({ method: "POST" })
  .validator((data: { passkey: string }) => {
    if (!data || typeof data.passkey !== "string" || data.passkey.length < 4 || data.passkey.length > 256) {
      throw new Error("Invalid passkey.");
    }
    return data;
  })
  .handler(async ({ data }) => {
    checkRateLimit("global");

    const expected = process.env.ADMIN_PASSKEY;
    if (!expected) throw new Error("ADMIN_PASSKEY is not configured on the server.");

    if (!passkeyMatches(data.passkey, expected)) {
      return { ok: false as const };
    }

    const { openAdminSession } = await import("./admin.server");
    const session = await openAdminSession();
    await session.update({ unlocked: true, since: Date.now() });
    return { ok: true as const };
  });

export const adminSignOut = createServerFn({ method: "POST" }).handler(async () => {
  const { openAdminSession } = await import("./admin.server");
  const session = await openAdminSession();
  await session.clear();
  return { ok: true as const };
});

export const getAdminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { openAdminSession } = await import("./admin.server");
  const session = await openAdminSession();
  return { authenticated: Boolean(session.data.unlocked) };
});
