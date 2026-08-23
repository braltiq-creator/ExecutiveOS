"use server";

import {
  provisionDesignPartner,
  updatePilotStage,
  listPilots,
  getPilot,
} from "@/pilot/provisioning";
import type { IntelligenceProfileId } from "@/profiles";
import type { PilotEnvironment, PilotLifecycleStage } from "@/pilot/types";
import type { DataResidency } from "@/runtime/tenant/types";

export async function provisionDesignPartnerAction(input: {
  partnerName: string;
  industry: string;
  intelligenceProfileId: IntelligenceProfileId;
  administratorEmail: string;
  region?: DataResidency;
  environment?: PilotEnvironment;
  seats?: number;
}): Promise<{ ok: boolean; tenantId?: string; pilotId?: string; message: string }> {
  if (!input.partnerName.trim()) {
    return { ok: false, message: "Partner name is required." };
  }
  if (!input.administratorEmail.trim()) {
    return { ok: false, message: "Administrator email is required." };
  }
  try {
    const result = provisionDesignPartner({
      partnerName: input.partnerName.trim(),
      industry: input.industry.trim() || "General",
      intelligenceProfileId: input.intelligenceProfileId,
      administratorEmail: input.administratorEmail.trim(),
      region: input.region,
      environment: input.environment,
      seats: input.seats,
    });
    return {
      ok: true,
      tenantId: result.tenantId,
      pilotId: result.pilot.id,
      message: result.message,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Provisioning failed",
    };
  }
}

export async function advancePilotStageAction(input: {
  pilotId: string;
  stage: PilotLifecycleStage;
  note?: string;
}): Promise<{ ok: boolean; message: string }> {
  const updated = updatePilotStage({
    pilotId: input.pilotId,
    stage: input.stage,
    note: input.note,
  });
  if (!updated) return { ok: false, message: "Pilot not found" };
  return {
    ok: true,
    message: `Advanced ${updated.partnerName} to ${updated.stage}`,
  };
}

export async function listPilotsAction() {
  return listPilots().map((p) => ({
    id: p.id,
    tenantId: p.tenantId,
    partnerName: p.partnerName,
    stage: p.stage,
    profileId: p.intelligenceProfileId,
  }));
}

export async function getPilotAction(pilotId: string) {
  return getPilot(pilotId) ?? null;
}
