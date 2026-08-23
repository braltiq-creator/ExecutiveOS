import { buildExecutiveIntelligence } from "@/lib/intelligence/engine";
import { AI_DEFAULTS, getChiefOfStaffModel } from "@/lib/ai/models";
import { getAIProvider } from "@/lib/ai/provider";
import { buildChiefOfStaffSystemPrompt } from "@/lib/ai/prompts/chiefOfStaff";
import { recordAiRequestUsage } from "@/lib/billing/service";
import {
  assertAiRequestAllowed,
  requireFeatureEntitlements,
} from "@/lib/features";
import { getAuthenticatedUser } from "@/lib/auth/actions";
import { toActionError } from "@/lib/errors";
import {
  assertRateLimit,
  createUserRateLimitKey,
} from "@/lib/security/rate-limit";
import { timed, createRequestId } from "@/lib/logging/logger";
import type {
  ChiefOfStaffRequest,
  ChiefOfStaffResponse,
  ConversationTurn,
} from "@/lib/ai/types";
import {
  AIServiceError,
  createChatMessage,
} from "@/lib/ai/types";

function trimHistory(history: ConversationTurn[]): ConversationTurn[] {
  const conversational = history.filter(
    (message) => message.role === "user" || message.role === "assistant",
  );

  return conversational.slice(-AI_DEFAULTS.maxHistoryTurns);
}

export async function askChiefOfStaff(
  request: ChiefOfStaffRequest,
): Promise<ChiefOfStaffResponse> {
  const trimmedMessage = request.message.trim();

  if (!trimmedMessage) {
    return { error: "Enter a question to continue." };
  }

  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return { error: "Authentication is required." };
    }

    const entitlements = await requireFeatureEntitlements(user.id);
    assertAiRequestAllowed(entitlements);
    assertRateLimit({
      key: createUserRateLimitKey(user.id, "ai_chief_of_staff"),
      limit: 30,
      windowMs: 60_000,
    });

    const requestId = createRequestId();

    const intelligence = await timed(
      "buildExecutiveIntelligence",
      () => buildExecutiveIntelligence(),
      { requestId, userId: user.id },
    );
    const systemPrompt = buildChiefOfStaffSystemPrompt(intelligence);
    const provider = getAIProvider();
    const history = trimHistory(request.history);

    const completion = await provider.complete({
      systemPrompt,
      messages: [
        ...history.map((message) => ({
          role: message.role as "user" | "assistant",
          content: message.content,
        })),
        { role: "user", content: trimmedMessage },
      ],
      model: getChiefOfStaffModel(),
      temperature: AI_DEFAULTS.temperature,
      maxTokens: AI_DEFAULTS.maxTokens,
    });

    await recordAiRequestUsage(user.id);

    return {
      message: createChatMessage("assistant", completion.content),
    };
  } catch (error) {
    if (error instanceof AIServiceError) {
      return { error: error.message };
    }

    return toActionError(error);
  }
}

export async function streamChiefOfStaff(
  request: ChiefOfStaffRequest,
): Promise<AsyncGenerator<string, ChiefOfStaffResponse, unknown>> {
  async function* generator() {
    const result = await askChiefOfStaff(request);

    if ("error" in result && result.error) {
      return result;
    }

    if ("message" in result && result.message) {
      yield result.message.content;
    }

    return result;
  }

  return generator();
}
