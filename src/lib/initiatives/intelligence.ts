import { fetchActiveInitiativesForIntelligence } from "@/lib/initiatives/queries";
import type { InitiativeWithLinks } from "@/lib/initiatives/types";
import type { HealthTrend } from "@/lib/health/types";
import { formatInitiativeHealth, formatInitiativePriority, formatInitiativeStatus } from "@/lib/initiatives/types";
import type { ExecutiveInitiativeContext } from "@/types/intelligence";

export async function loadExecutiveInitiativeRecords(
  userId: string,
): Promise<InitiativeWithLinks[]> {
  return fetchActiveInitiativesForIntelligence(userId);
}

export function mapExecutiveInitiatives(
  initiatives: InitiativeWithLinks[],
): ExecutiveInitiativeContext[] {
  return initiatives.map(({ initiative, links }) => ({
    id: initiative.id,
    title: initiative.title,
    description: initiative.description,
    status: initiative.status,
    statusLabel: formatInitiativeStatus(initiative.status),
    priority: initiative.priority,
    priorityLabel: formatInitiativePriority(initiative.priority),
    owner: initiative.owner,
    startDate: initiative.start_date,
    targetDate: initiative.target_date,
    progressPercentage: initiative.progress_percentage,
    healthScore: 75,
    healthTrend: "stable" satisfies HealthTrend,
    healthStatus: initiative.health_status,
    healthLabel: formatInitiativeHealth(initiative.health_status),
    healthExplanation: [],
    linkCount: links.length,
    updatedAt: initiative.updated_at,
  }));
}
