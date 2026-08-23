import { AGENT_IDS } from "@/lib/agents/types";
import type { AdvisorRequest } from "@/lib/agents/types";

const MAX_MESSAGE_LENGTH = 4000;

export function validateAdvisorRequest(request: AdvisorRequest): {
  error: string | null;
} {
  const message = request.message?.trim() ?? "";

  if (!message) {
    return { error: "Enter a question for your advisors." };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return { error: "Question is too long. Please shorten it." };
  }

  if (
    request.preferredAgentId &&
    !AGENT_IDS.includes(request.preferredAgentId)
  ) {
    return { error: "Unknown advisor selected." };
  }

  if (!Array.isArray(request.history)) {
    return { error: "Invalid conversation history." };
  }

  return { error: null };
}
