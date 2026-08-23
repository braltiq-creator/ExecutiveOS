import type { ExecutiveIntelligenceRoleId } from "@/intelligence-models/types";
import type { ExecutiveJudgementModel } from "@/judgement-framework/types";
import { ceoJudgement } from "@/judgement-framework/roles/ceo";
import { cfoJudgement } from "@/judgement-framework/roles/cfo";
import { cooJudgement } from "@/judgement-framework/roles/coo";
import { croJudgement } from "@/judgement-framework/roles/cro";
import { csoJudgement } from "@/judgement-framework/roles/cso";
import { ccoJudgement } from "@/judgement-framework/roles/cco";
import { cioJudgement } from "@/judgement-framework/roles/cio";
import { ctoJudgement } from "@/judgement-framework/roles/cto";
import { cpoJudgement } from "@/judgement-framework/roles/cpo";
import { criskJudgement } from "@/judgement-framework/roles/crisk";

const REGISTRY: Record<ExecutiveIntelligenceRoleId, ExecutiveJudgementModel> = {
  ceo: ceoJudgement,
  cfo: cfoJudgement,
  coo: cooJudgement,
  cro: croJudgement,
  cso: csoJudgement,
  cco: ccoJudgement,
  cio: cioJudgement,
  cto: ctoJudgement,
  cpo: cpoJudgement,
  crisk: criskJudgement,
};

export function getExecutiveJudgementModel(
  roleId: ExecutiveIntelligenceRoleId,
): ExecutiveJudgementModel | undefined {
  return REGISTRY[roleId];
}

export function listExecutiveJudgementModels(): ExecutiveJudgementModel[] {
  return Object.values(REGISTRY);
}

export {
  ceoJudgement,
  cfoJudgement,
  cooJudgement,
  croJudgement,
  csoJudgement,
  ccoJudgement,
  cioJudgement,
  ctoJudgement,
  cpoJudgement,
  criskJudgement,
};
