import type {
  CommercialEditionId,
  SuccessPlan,
} from "@/commercial/framework/types";
import { getEdition } from "@/commercial/editions";

const plans = new Map<string, SuccessPlan>();
let seq = 0;

export function resetSuccessPlans(): void {
  plans.clear();
  seq = 0;
}

export function createSuccessPlan(input: {
  tenantId: string;
  editionId: CommercialEditionId;
  customerObjectives?: string[];
  executiveSponsors?: string[];
  reviewCadence?: SuccessPlan["reviewCadence"];
}): SuccessPlan {
  const edition = getEdition(input.editionId);
  const now = new Date().toISOString();
  seq += 1;
  const plan: SuccessPlan = {
    id: `csp-${seq}`,
    tenantId: input.tenantId,
    editionId: input.editionId,
    customerObjectives: input.customerObjectives ?? [
      "Establish a trusted daily Executive Brief",
      "Improve decision confidence on priority recommendations",
    ],
    strategicOutcomes: edition?.includedStrategicOutcomes.slice(0, 3) ?? [],
    executiveSponsors: input.executiveSponsors ?? ["CEO"],
    reviewCadence: input.reviewCadence ?? "fortnightly",
    successMilestones: [
      {
        id: "m1",
        label: "First Executive Brief completed",
        dueAt: null,
        complete: false,
      },
      {
        id: "m2",
        label: "Scenario validation complete",
        dueAt: null,
        complete: false,
      },
      {
        id: "m3",
        label: "Commercial conversion decision",
        dueAt: null,
        complete: false,
      },
    ],
    risks: [],
    actions: ["Schedule next executive review"],
    nextReviewAt: null,
    health: "amber",
    createdAt: now,
    updatedAt: now,
  };
  plans.set(plan.id, plan);
  return plan;
}

export function updateSuccessPlan(
  id: string,
  patch: Partial<
    Pick<
      SuccessPlan,
      | "customerObjectives"
      | "strategicOutcomes"
      | "executiveSponsors"
      | "reviewCadence"
      | "risks"
      | "actions"
      | "nextReviewAt"
      | "health"
      | "successMilestones"
    >
  >,
): SuccessPlan | null {
  const current = plans.get(id);
  if (!current) return null;
  const next = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  plans.set(id, next);
  return next;
}

export function listSuccessPlans(tenantId?: string): SuccessPlan[] {
  return [...plans.values()]
    .filter((p) => (tenantId ? p.tenantId === tenantId : true))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
