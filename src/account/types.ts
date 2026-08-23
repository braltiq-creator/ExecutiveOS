/**
 * Customer Account — Phase 54
 * Identity, sessions, MFA, and API keys for the Organisation Portal.
 * Commercial SaaS — does not modify Core.
 */

export type AccountRole =
  | "owner"
  | "executive"
  | "admin"
  | "viewer";

export type AccountMember = {
  id: string;
  organisationId: string;
  name: string;
  email: string;
  role: AccountRole;
  permissions: string[];
  executiveProfileId: string | null;
  status: "active" | "invited" | "deactivated";
  lastLoginAt: string | null;
  invitedAt: string;
  activitySummary: string;
};

export type AccountSession = {
  id: string;
  accountId: string;
  deviceLabel: string;
  trusted: boolean;
  ipRegion: string;
  createdAt: string;
  lastActiveAt: string;
  current: boolean;
};

export type MfaStatus = {
  enabled: boolean;
  methods: Array<"authenticator" | "sms" | "email">;
  enforcedForAdmins: boolean;
  lastVerifiedAt: string | null;
};

export type AccountApiKey = {
  id: string;
  organisationId: string;
  label: string;
  keyId: string;
  secretPreview: string;
  createdAt: string;
  lastUsedAt: string | null;
  status: "active" | "revoked";
};

export type SecurityHealth = {
  score: number;
  grade: "strong" | "good" | "needs_attention";
  findings: string[];
};
