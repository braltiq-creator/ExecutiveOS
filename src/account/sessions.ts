import {
  getSessions,
  nextSessionId,
  setSessions,
} from "@/account/store";
import type { AccountSession } from "@/account/types";

export function ensureDefaultSessions(
  accountId: string,
  asOf = new Date().toISOString(),
): AccountSession[] {
  const existing = getSessions(accountId);
  if (existing.length > 0) return existing;

  const list: AccountSession[] = [
    {
      id: nextSessionId(),
      accountId,
      deviceLabel: "MacBook Pro · Chrome",
      trusted: true,
      ipRegion: "Sydney, AU",
      createdAt: asOf,
      lastActiveAt: asOf,
      current: true,
    },
    {
      id: nextSessionId(),
      accountId,
      deviceLabel: "iPhone · Safari",
      trusted: true,
      ipRegion: "Sydney, AU",
      createdAt: asOf,
      lastActiveAt: asOf,
      current: false,
    },
  ];
  return setSessions(accountId, list);
}

export function listSessions(accountId: string): AccountSession[] {
  return ensureDefaultSessions(accountId);
}

export function revokeSession(
  accountId: string,
  sessionId: string,
): AccountSession[] {
  const next = listSessions(accountId).filter((s) => s.id !== sessionId);
  return setSessions(accountId, next);
}

export function listTrustedDevices(accountId: string): AccountSession[] {
  return listSessions(accountId).filter((s) => s.trusted);
}
