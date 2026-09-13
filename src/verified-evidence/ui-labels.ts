/**
 * Minimal truthful connection status presentation (Phase 37).
 * Connection ≠ evidence.
 */

import type { OrganizationConnection } from "@/verified-evidence/types";
import { PHASE37_PROVIDERS } from "@/verified-evidence/types";

export type ConnectionTruthView = {
  providerId: string;
  label: string;
  connectionLabel: string;
  authenticationLabel: string;
  verificationLabel: string;
  evidenceLabel: string;
  lastVerifiedLabel: string;
  healthLabel: string;
};

export function buildConnectionTruthViews(input: {
  connections: OrganizationConnection[];
  evidenceCountByProvider: Partial<Record<string, number>>;
}): ConnectionTruthView[] {
  return PHASE37_PROVIDERS.map((meta) => {
    const row =
      input.connections.find((c) => c.provider === meta.id) ?? null;
    const evidenceCount = input.evidenceCountByProvider[meta.id] ?? 0;
    return {
      providerId: meta.id,
      label: meta.label,
      connectionLabel: humanConnection(row?.connectionStatus ?? "not_connected"),
      authenticationLabel: humanAuth(row?.authenticationStatus ?? "none"),
      verificationLabel: humanVerification(row?.verificationStatus ?? "unverified"),
      evidenceLabel:
        evidenceCount > 0
          ? `${evidenceCount} verified evidence item${evidenceCount === 1 ? "" : "s"}`
          : "No verified evidence",
      lastVerifiedLabel: row?.lastVerifiedAt
        ? new Date(row.lastVerifiedAt).toLocaleString()
        : "Never verified",
      healthLabel: humanHealth(row?.health ?? "unknown"),
    };
  });
}

function humanConnection(status: string): string {
  switch (status) {
    case "connected":
      return "Connected";
    case "connecting":
      return "Connecting";
    case "verification_required":
      return "Connected — verification required";
    case "degraded":
      return "Degraded";
    case "revoked":
      return "Revoked";
    case "error":
      return "Error";
    default:
      return "Not connected";
  }
}

function humanAuth(status: string): string {
  switch (status) {
    case "authenticated":
      return "Authenticated";
    case "pending":
      return "Authentication pending";
    case "expired":
      return "Authentication expired";
    case "revoked":
      return "Authentication revoked";
    case "error":
      return "Authentication error";
    default:
      return "Not authenticated";
  }
}

function humanVerification(status: string): string {
  switch (status) {
    case "verified":
      return "Verified";
    case "verification_required":
      return "Verification required";
    case "failed":
      return "Verification failed";
    case "stale":
      return "Verification stale";
    default:
      return "Unverified";
  }
}

function humanHealth(status: string): string {
  switch (status) {
    case "healthy":
      return "Healthy";
    case "degraded":
      return "Degraded";
    case "unhealthy":
      return "Unhealthy";
    default:
      return "Unknown";
  }
}
