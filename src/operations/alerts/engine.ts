/**
 * Operations alerts — detect, acknowledge, track.
 */

import type { IntelligenceProfileId } from "@/profiles";
import { extractTenantTelemetry } from "@/operations/isolation";
import { computePilotOpsHealth } from "@/operations/health";
import { listSupportIssuesForTenant } from "@/operations/support";
import type { OpsAlert, OpsAlertKind } from "@/operations/types";

const alerts = new Map<string, OpsAlert>();
const previousHealth = new Map<string, number>();
const previousEngagement = new Map<string, number>();
const previousAccuracy = new Map<string, number>();
const previousGraph = new Map<string, number>();
const previousCoverage = new Map<string, number>();

export function resetOpsAlerts(): void {
  alerts.clear();
  previousHealth.clear();
  previousEngagement.clear();
  previousAccuracy.clear();
  previousGraph.clear();
  previousCoverage.clear();
}

export function listOpsAlerts(): OpsAlert[] {
  return [...alerts.values()];
}

export function listOpenOpsAlerts(): OpsAlert[] {
  return listOpsAlerts().filter((a) => a.status === "open");
}

function upsertAlert(input: Omit<OpsAlert, "acknowledgedAt" | "acknowledgedBy" | "status"> & {
  status?: OpsAlert["status"];
}): OpsAlert {
  const existing = alerts.get(input.id);
  if (existing && existing.status !== "resolved") {
    return existing;
  }
  const alert: OpsAlert = {
    ...input,
    acknowledgedAt: null,
    acknowledgedBy: null,
    status: input.status ?? "open",
  };
  alerts.set(alert.id, alert);
  return alert;
}

export function acknowledgeOpsAlert(input: {
  id: string;
  by: string;
  asOf?: string;
}): OpsAlert | null {
  const existing = alerts.get(input.id);
  if (!existing) return null;
  const next: OpsAlert = {
    ...existing,
    status: "acknowledged",
    acknowledgedAt: input.asOf ?? new Date().toISOString(),
    acknowledgedBy: input.by,
  };
  alerts.set(next.id, next);
  return next;
}

export function resolveOpsAlert(input: {
  id: string;
  asOf?: string;
}): OpsAlert | null {
  const existing = alerts.get(input.id);
  if (!existing) return null;
  const next: OpsAlert = { ...existing, status: "resolved" };
  alerts.set(next.id, next);
  return next;
}

export function evaluateOpsAlerts(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  companyName: string;
  asOf?: string;
}): OpsAlert[] {
  const asOf = input.asOf ?? new Date().toISOString();
  const t = extractTenantTelemetry({
    tenantId: input.tenantId,
    profileId: input.profileId,
    asOf,
  });
  const health = computePilotOpsHealth({
    tenantId: input.tenantId,
    profileId: input.profileId,
    asOf,
    telemetry: t,
  });
  const created: OpsAlert[] = [];

  const push = (
    kind: OpsAlertKind,
    severity: OpsAlert["severity"],
    title: string,
    detail: string,
  ) => {
    created.push(
      upsertAlert({
        id: `${kind}-${input.tenantId}`,
        tenantId: input.tenantId,
        kind,
        severity,
        title,
        detail,
        createdAt: asOf,
      }),
    );
  };

  const prevEng = previousEngagement.get(input.tenantId);
  if (prevEng != null && t.engagementPct < prevEng - 10) {
    push(
      "engagement_drop",
      "high",
      `${input.companyName}: executive engagement dropped`,
      `Engagement fell from ${prevEng}% to ${t.engagementPct}%`,
    );
  }
  previousEngagement.set(input.tenantId, t.engagementPct);

  if (t.providerStatuses.some((p) => !p.connected || p.status === "red")) {
    push(
      "provider_disconnected",
      "critical",
      `${input.companyName}: provider disconnected`,
      t.providerStatuses
        .filter((p) => !p.connected || p.status === "red")
        .map((p) => p.label)
        .join(", "),
    );
  }

  const prevCov = previousCoverage.get(input.tenantId);
  if (prevCov != null && t.discoveryCoveragePct < prevCov - 10) {
    push(
      "discovery_confidence_fall",
      "high",
      `${input.companyName}: discovery confidence fell`,
      `Coverage ${prevCov}% → ${t.discoveryCoveragePct}%`,
    );
  }
  previousCoverage.set(input.tenantId, t.discoveryCoveragePct);

  const prevAcc = previousAccuracy.get(input.tenantId);
  if (prevAcc != null && t.recommendationAccuracy < prevAcc - 10) {
    push(
      "recommendation_accuracy_drop",
      "moderate",
      `${input.companyName}: recommendation accuracy decreased`,
      `Accuracy ${prevAcc}% → ${t.recommendationAccuracy}%`,
    );
  }
  previousAccuracy.set(input.tenantId, t.recommendationAccuracy);

  const prevGraph = previousGraph.get(input.tenantId);
  if (prevGraph != null && t.knowledgeGraphConfidence < prevGraph - 10) {
    push(
      "knowledge_graph_deterioration",
      "moderate",
      `${input.companyName}: Knowledge Graph health deteriorated`,
      `Confidence ${prevGraph}% → ${t.knowledgeGraphConfidence}%`,
    );
  }
  previousGraph.set(input.tenantId, t.knowledgeGraphConfidence);

  const openTickets = listSupportIssuesForTenant(input.tenantId).filter(
    (i) => i.status === "open" || i.status === "in_progress",
  );
  if (openTickets.length >= 3) {
    push(
      "support_ticket_spike",
      "high",
      `${input.companyName}: support tickets increased`,
      `${openTickets.length} open/in-progress issues`,
    );
  }

  const prevHealth = previousHealth.get(input.tenantId);
  if (
    prevHealth != null &&
    Math.abs(health.overall.score - prevHealth) >= 15
  ) {
    push(
      "pilot_health_change",
      health.overall.score < prevHealth ? "high" : "moderate",
      `${input.companyName}: pilot health changed significantly`,
      `Health ${prevHealth} → ${health.overall.score}`,
    );
  }
  previousHealth.set(input.tenantId, health.overall.score);

  return created;
}
