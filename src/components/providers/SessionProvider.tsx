"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AppSession } from "@/types/session";
import { MOCK_SESSION } from "@/lib/mock/session";

const SessionContext = createContext<AppSession>(MOCK_SESSION);

export function SessionProvider({
  session,
  children,
}: {
  session: AppSession;
  children: ReactNode;
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): AppSession {
  return useContext(SessionContext);
}
