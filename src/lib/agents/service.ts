import { createChatMessage } from "@/lib/ai/types";
import type { ConversationTurn } from "@/lib/ai/types";
import { AI_DEFAULTS } from "@/lib/ai/models";
import { buildExecutiveIntelligence } from "@/lib/intelligence/engine";
import { recordAiRequestUsage } from "@/lib/billing/service";
import {
  assertAiRequestAllowed,
  requireFeatureEntitlements,
} from "@/lib/features";
import { getAuthenticatedUser } from "@/lib/auth/actions";
import {
  assertRateLimit,
  createUserRateLimitKey,
} from "@/lib/security/rate-limit";
import { timed, createRequestId } from "@/lib/logging/logger";
import { toActionError } from "@/lib/errors";
import { planAdvisorOrchestration } from "@/lib/agents/planner";
import { orchestrateAdvisorConsultation } from "@/lib/agents/orchestrator";
import { listAgentDefinitions } from "@/lib/agents/registry";
import { validateAdvisorRequest } from "@/lib/agents/validation";
import type {
  AdvisorConsultResponse,
  AdvisorRequest,
  AdvisorsPageData,
} from "@/lib/agents/types";
import { AgentServiceError } from "@/lib/agents/types";

function trimHistory(history: ConversationTurn[]): ConversationTurn[] {
  return history
    .filter((message) => message.role === "user" || message.role === "assistant")
    .slice(-AI_DEFAULTS.maxHistoryTurns);
}

export async function loadAdvisorsPageData(): Promise<AdvisorsPageData> {
  const intelligence = await buildExecutiveIntelligence();
  const preferredName =
    intelligence.executive.preferredName ||
    intelligence.executive.fullName ||
    "Executive";

  return {
    agents: listAgentDefinitions(),
    preferredName,
  };
}

export async function consultExecutiveAdvisors(
  request: AdvisorRequest,
): Promise<AdvisorConsultResponse> {
  const validation = validateAdvisorRequest(request);
  if (validation.error) {
    return { error: validation.error };
  }

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { error: "Authentication is required." };
    }

    const entitlements = await requireFeatureEntitlements(user.id);
    assertAiRequestAllowed(entitlements);
    assertRateLimit({
      key: createUserRateLimitKey(user.id, "ai_advisors"),
      limit: 20,
      windowMs: 60_000,
    });

    const requestId = createRequestId();
    const intelligence = await timed(
      "buildExecutiveIntelligence",
      () => buildExecutiveIntelligence(),
      { requestId, userId: user.id },
    );
    const trimmedMessage = request.message.trim();
    const history = trimHistory(request.history);
    const plan = planAdvisorOrchestration(trimmedMessage, request.preferredAgentId);

    const result = await orchestrateAdvisorConsultation(
      plan,
      trimmedMessage,
      intelligence,
      history,
    );

    const agentCount = result.contributions.length;
    const aiCallsEstimate =
      plan.mode === "collaborative"
        ? agentCount * 2 + (agentCount > 1 ? 1 : 0)
        : agentCount * 2;

    for (let index = 0; index < aiCallsEstimate; index += 1) {
      await recordAiRequestUsage(user.id);
    }

    const responseContent = [
      result.unifiedRecommendation,
      "",
      "---",
      `*Advisors consulted: ${result.contributions.map((c) => c.agentName).join(", ")}*`,
    ].join("\n");

    return {
      message: createChatMessage("assistant", responseContent),
      plan: result.plan,
      contributions: result.contributions,
      reasoningSummary: result.reasoningSummary,
    };
  } catch (error) {
    if (error instanceof AgentServiceError) {
      return { error: error.message };
    }

    return toActionError(error);
  }
}

export async function recommendAdvisorForQuestion(
  message: string,
): Promise<{ agentId: string; rationale: string } | { error: string }> {
  const trimmed = message.trim();
  if (!trimmed) {
    return { error: "Enter a question to get an advisor recommendation." };
  }

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { error: "Authentication is required." };
    }

    const plan = planAdvisorOrchestration(trimmed);
    return {
      agentId: plan.primaryAgentId,
      rationale: plan.rationale,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to recommend an advisor.",
    };
  }
}
