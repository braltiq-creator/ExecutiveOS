import type {
  ExecutiveIntelligenceModel,
  ExecutiveIntelligenceRoleId,
} from "@/intelligence-models/types";
import { CEO_INTELLIGENCE_MODEL } from "@/intelligence-models/roles/ceo";
import { CFO_INTELLIGENCE_MODEL } from "@/intelligence-models/roles/cfo";
import { COO_INTELLIGENCE_MODEL } from "@/intelligence-models/roles/coo";
import { CRO_INTELLIGENCE_MODEL } from "@/intelligence-models/roles/cro";
import { CSO_INTELLIGENCE_MODEL } from "@/intelligence-models/roles/cso";
import { CCO_INTELLIGENCE_MODEL } from "@/intelligence-models/roles/cco";
import { CIO_INTELLIGENCE_MODEL } from "@/intelligence-models/roles/cio";
import { CTO_INTELLIGENCE_MODEL } from "@/intelligence-models/roles/cto";
import { CPO_INTELLIGENCE_MODEL } from "@/intelligence-models/roles/cpo";
import { CRISK_INTELLIGENCE_MODEL } from "@/intelligence-models/roles/crisk";

export {
  CEO_INTELLIGENCE_MODEL,
  CFO_INTELLIGENCE_MODEL,
  COO_INTELLIGENCE_MODEL,
  CRO_INTELLIGENCE_MODEL,
  CSO_INTELLIGENCE_MODEL,
  CCO_INTELLIGENCE_MODEL,
  CIO_INTELLIGENCE_MODEL,
  CTO_INTELLIGENCE_MODEL,
  CPO_INTELLIGENCE_MODEL,
  CRISK_INTELLIGENCE_MODEL,
};

export const EXECUTIVE_INTELLIGENCE_MODELS: ExecutiveIntelligenceModel[] = [
  CEO_INTELLIGENCE_MODEL,
  CFO_INTELLIGENCE_MODEL,
  COO_INTELLIGENCE_MODEL,
  CRO_INTELLIGENCE_MODEL,
  CSO_INTELLIGENCE_MODEL,
  CCO_INTELLIGENCE_MODEL,
  CIO_INTELLIGENCE_MODEL,
  CTO_INTELLIGENCE_MODEL,
  CPO_INTELLIGENCE_MODEL,
  CRISK_INTELLIGENCE_MODEL,
];

export function getExecutiveIntelligenceModel(
  roleId: ExecutiveIntelligenceRoleId,
): ExecutiveIntelligenceModel | undefined {
  return EXECUTIVE_INTELLIGENCE_MODELS.find(
    (model) => model.identity.roleId === roleId,
  );
}

/** Permanent product Council today — subset of EIM library */
export const PERMANENT_COUNCIL_ROLE_IDS: ExecutiveIntelligenceRoleId[] = [
  "ceo",
  "cfo",
  "coo",
  "cro",
  "cso",
];
