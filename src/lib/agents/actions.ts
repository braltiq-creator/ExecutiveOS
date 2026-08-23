"use server";

import {
  consultExecutiveAdvisors,
  loadAdvisorsPageData,
  recommendAdvisorForQuestion,
} from "@/lib/agents/service";
import type {
  AdvisorConsultResponse,
  AdvisorRequest,
  AdvisorsPageData,
} from "@/lib/agents/types";
import type { ConversationTurn } from "@/lib/ai/types";
import type { AgentId } from "@/lib/agents/types";

export async function loadAdvisorsPageDataAction(): Promise<AdvisorsPageData> {
  return loadAdvisorsPageData();
}

export async function consultAdvisorsAction(
  message: string,
  history: ConversationTurn[],
  preferredAgentId?: AgentId,
): Promise<AdvisorConsultResponse> {
  const request: AdvisorRequest = {
    message,
    history,
    preferredAgentId,
  };

  return consultExecutiveAdvisors(request);
}

export async function recommendAdvisorAction(
  message: string,
): Promise<{ agentId: string; rationale: string } | { error: string }> {
  return recommendAdvisorForQuestion(message);
}
