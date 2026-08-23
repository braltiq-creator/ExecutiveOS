import type {
  AccountApiKey,
  AccountMember,
  AccountSession,
  MfaStatus,
} from "@/account/types";

const members = new Map<string, AccountMember[]>();
const sessions = new Map<string, AccountSession[]>();
const mfa = new Map<string, MfaStatus>();
const apiKeys = new Map<string, AccountApiKey[]>();

let memberSeq = 0;
let sessionSeq = 0;
let keySeq = 0;

export function resetAccountStore(): void {
  members.clear();
  sessions.clear();
  mfa.clear();
  apiKeys.clear();
  memberSeq = 0;
  sessionSeq = 0;
  keySeq = 0;
}

export function getMembers(organisationId: string): AccountMember[] {
  return members.get(organisationId) ?? [];
}

export function setMembers(
  organisationId: string,
  list: AccountMember[],
): AccountMember[] {
  members.set(organisationId, list);
  return list;
}

export function nextMemberId(): string {
  memberSeq += 1;
  return `member-${memberSeq}`;
}

export function getSessions(accountId: string): AccountSession[] {
  return sessions.get(accountId) ?? [];
}

export function setSessions(
  accountId: string,
  list: AccountSession[],
): AccountSession[] {
  sessions.set(accountId, list);
  return list;
}

export function nextSessionId(): string {
  sessionSeq += 1;
  return `session-${sessionSeq}`;
}

export function getMfa(accountId: string): MfaStatus | undefined {
  return mfa.get(accountId);
}

export function setMfa(accountId: string, status: MfaStatus): MfaStatus {
  mfa.set(accountId, status);
  return status;
}

export function getApiKeys(organisationId: string): AccountApiKey[] {
  return apiKeys.get(organisationId) ?? [];
}

export function setApiKeys(
  organisationId: string,
  list: AccountApiKey[],
): AccountApiKey[] {
  apiKeys.set(organisationId, list);
  return list;
}

export function nextKeyId(): string {
  keySeq += 1;
  return `akey-${keySeq}`;
}
