/**
 * Industry overlays adjust judgement thresholds only.
 * They never redefine executive judgement identity.
 */

import type { ExecutiveIntelligenceRoleId, IndustryOverlayId } from "@/intelligence-models/types";
import { defineJudgementOverlay } from "@/judgement-framework/define";
import type { JudgementIndustryOverlay } from "@/judgement-framework/types";
import { EJF_V1 } from "@/judgement-framework/roles/helpers";

function overlay(
  id: IndustryOverlayId,
  roleId: ExecutiveIntelligenceRoleId,
  deltas: {
    actionBiasDelta?: number;
    recommendConfidenceFloorDelta?: number;
    escalateForceThresholdDelta?: number;
    crisisForceThresholdDelta?: number;
    notes: string[];
  },
): JudgementIndustryOverlay {
  return defineJudgementOverlay({
    id,
    roleId,
    version: EJF_V1,
    actionBiasDelta: deltas.actionBiasDelta ?? 0,
    recommendConfidenceFloorDelta: deltas.recommendConfidenceFloorDelta ?? 0,
    escalateForceThresholdDelta: deltas.escalateForceThresholdDelta ?? 0,
    crisisForceThresholdDelta: deltas.crisisForceThresholdDelta ?? 0,
    thresholdNotes: deltas.notes,
  });
}

const OVERLAYS: JudgementIndustryOverlay[] = [
  overlay("manufacturing", "coo", {
    escalateForceThresholdDelta: -4,
    crisisForceThresholdDelta: -3,
    notes: ["Safety and throughput force escalate slightly earlier."],
  }),
  overlay("manufacturing", "cfo", {
    recommendConfidenceFloorDelta: 3,
    notes: ["Inventory/working-capital calls need firmer evidence."],
  }),
  overlay("mining", "crisk", {
    escalateForceThresholdDelta: -5,
    crisisForceThresholdDelta: -4,
    actionBiasDelta: 2,
    notes: ["Safety and license-to-operate compress escalate thresholds."],
  }),
  overlay("utilities", "coo", {
    escalateForceThresholdDelta: -3,
    crisisForceThresholdDelta: -2,
    notes: ["Reliability and public consequence tighten ops thresholds."],
  }),
  overlay("healthcare", "crisk", {
    escalateForceThresholdDelta: -6,
    crisisForceThresholdDelta: -5,
    notes: ["Patient harm risk lowers crisis/escalate bars."],
  }),
  overlay("field_services", "coo", {
    actionBiasDelta: -2,
    notes: ["Utilisation myths — prefer monitor until capacity evidence solid."],
  }),
  overlay("technology", "cto", {
    recommendConfidenceFloorDelta: 2,
    notes: ["Platform one-way doors demand slightly higher confidence."],
  }),
  overlay("financial_services", "cfo", {
    escalateForceThresholdDelta: -3,
    recommendConfidenceFloorDelta: 4,
    notes: ["Capital and liquidity: escalate earlier, recommend with more proof."],
  }),
];

export function getJudgementOverlay(
  industry: IndustryOverlayId,
  roleId: ExecutiveIntelligenceRoleId,
): JudgementIndustryOverlay | undefined {
  return OVERLAYS.find((o) => o.id === industry && o.roleId === roleId);
}

export function listJudgementOverlays(): JudgementIndustryOverlay[] {
  return [...OVERLAYS];
}
