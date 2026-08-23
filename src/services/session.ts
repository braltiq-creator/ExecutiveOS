import { isMockMode } from "@/lib/mock/mode";
import { MOCK_SESSION } from "@/lib/mock/session";
import type { AppSession } from "@/types/session";

/** Server-safe session for foundation surfaces. */
export async function getAppSession(): Promise<AppSession | null> {
  if (isMockMode()) {
    return MOCK_SESSION;
  }

  // Real Supabase session wiring remains in auth layer; foundation uses mock.
  return null;
}

export async function requireAppSession(): Promise<AppSession> {
  const session = await getAppSession();
  if (!session) {
    return MOCK_SESSION;
  }
  return session;
}
