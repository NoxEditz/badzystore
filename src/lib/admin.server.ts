import { useSession } from "@tanstack/react-start/server";

type AdminSession = { unlocked?: boolean; since?: number };

function sessionConfig() {
  const password = process.env.ADMIN_SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET is not configured (min 32 chars).");
  }
  return {
    password,
    name: "badzy-admin",
    maxAge: 60 * 60 * 8,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

// Server-only helper for other server functions that need to guard admin work.
// The `.server.ts` extension keeps this out of the client bundle.
export async function requireAdmin() {
  const session = await useSession<AdminSession>(sessionConfig());
  if (!session.data.unlocked) {
    throw new Error("Unauthorized");
  }
}
