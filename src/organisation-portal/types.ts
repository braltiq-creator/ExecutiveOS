/**
 * Organisation Portal — Phase 54
 * Customer-facing commercial SaaS portal (not admin console).
 */

import type {
  AccountApiKey,
  AccountMember,
  AccountSession,
  MfaStatus,
  SecurityHealth,
} from "@/account/types";
import type { ProvisioningExecutiveProfileId } from "@/provisioning/types";

export type PortalNavId =
  | "organisation"
  | "executives"
  | "connected_systems"
  | "executive_intelligence"
  | "subscription"
  | "security"
  | "usage_value"
  | "support";

export type PortalNavItem = {
  id: PortalNavId;
  label: string;
  href: string;
  description: string;
};

export type OrganisationDetails = {
  id: string;
  name: string;
  legalName: string;
  industry: string;
  timezone: string;
  branding: {
    displayName: string;
    primaryColor: string;
  };
  businessUnits: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; label: string; region: string }>;
  regionalSettings: {
    residency: string;
    currency: string;
    locale: string;
  };
  health: {
    score: number;
    label: string;
    notes: string[];
  };
};

export type ConnectedSystemStatus =
  | "connected"
  | "degraded"
  | "disconnected"
  | "available";

export type ConnectedSystem = {
  id: string;
  name: string;
  provider:
    | "microsoft_365"
    | "simpro"
    | "salesforce"
    | "microsoft_dynamics";
  status: ConnectedSystemStatus;
  healthScore: number;
  lastSyncAt: string | null;
  diagnostics: string[];
  reconnectPath: string;
};

export type InstalledPackSummary = {
  id: string;
  name: string;
  industry: string;
  health: "healthy" | "attention" | "inactive";
  learningStatus: string;
};

export type ExecutiveIntelligenceSection = {
  currentProfileId: ProvisioningExecutiveProfileId | string;
  currentProfileName: string;
  installedPacks: InstalledPackSummary[];
  availablePacks: Array<{ id: string; name: string; summary: string }>;
  recommendations: string[];
  packHealthLabel: string;
  learningStatus: string;
};

export type SubscriptionSection = {
  planId: string;
  planName: string;
  status: string;
  trial: {
    active: boolean;
    daysRemaining: number;
    endsAt: string | null;
  };
  renewalAt: string | null;
  invoices: Array<{
    id: string;
    amountLabel: string;
    status: string;
    issuedAt: string;
  }>;
  paymentMethod: string;
  usage: {
    seatsUsed: number;
    seatsLimit: number;
    executivesActive: number;
  };
  upgradePath: string;
  cancelPath: string;
};

export type UsageValueSection = {
  executiveValueScore: number;
  roiLabel: string;
  hoursSaved: number;
  recommendationsAccepted: number;
  businessOutcomes: string[];
  adoption: {
    score: number;
    label: string;
  };
  health: {
    score: number;
    label: string;
  };
};

export type SupportSection = {
  knowledgeBaseUrl: string;
  releaseNotesUrl: string;
  raiseRequestUrl: string;
  training: string[];
  videos: string[];
  designPartnerResources: string[];
};

export type OrganisationPortalSnapshot = {
  asOf: string;
  organisation: OrganisationDetails;
  executives: AccountMember[];
  connectedSystems: ConnectedSystem[];
  executiveIntelligence: ExecutiveIntelligenceSection;
  subscription: SubscriptionSection;
  security: {
    mfa: MfaStatus;
    sessions: AccountSession[];
    trustedDevices: AccountSession[];
    auditHistory: Array<{ id: string; summary: string; at: string }>;
    apiKeys: AccountApiKey[];
    health: SecurityHealth;
  };
  usageValue: UsageValueSection;
  support: SupportSection;
};

export type PortalSelfReview = {
  manageOrganisationIndependently: boolean;
  canInviteExecutives: boolean;
  canConnectSystems: boolean;
  canManageBilling: boolean;
  canUnderstandValue: boolean;
  allPassed: boolean;
  notes: string[];
};
