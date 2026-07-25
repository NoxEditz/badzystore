import { useSession } from "@tanstack/react-start/server";

export type AdminSession = { unlocked?: boolean; since?: number };

function sessionConfig() {
  const isProduction = process.env.NODE_ENV === "production";
  const password =
    process.env.ADMIN_SESSION_SECRET ||
    (!isProduction ? "badzy-local-admin-session-secret-6565-dev-only" : "");
  if (!password || password.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET is not configured (min 32 chars).");
  }
  return {
    password,
    name: "badzy-admin",
    maxAge: 60 * 60 * 8, // 8 hours
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

export async function openAdminSession() {
  return useSession<AdminSession>(sessionConfig());
}

// Server-only helper for other server functions that need to guard admin work.
// The `.server.ts` extension keeps this file out of the client bundle entirely.
export async function requireAdmin() {
  const session = await openAdminSession();
  if (!session.data.unlocked) {
    throw new Error("Unauthorized");
  }
}
