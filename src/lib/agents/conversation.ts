import { createChatMessage } from "@/lib/ai/types";
import type { ChatMessage } from "@/lib/ai/types";
import type {
  AdvisorConversationState,
  AgentContribution,
  OrchestrationPlan,
} from "@/lib/agents/types";

export function createInitialAdvisorConversation(
  preferredName: string,
): AdvisorConversationState {
  return {
    messages: [
      createChatMessage(
        "assistant",
        `Welcome, ${preferredName}. Your Executive Advisor team is ready — ten specialists plus your Chief of Staff can collaborate on any question. Ask anything, or select an advisor to consult directly.`,
        "advisors-welcome",
      ),
    ],
    lastPlan: null,
    lastContributions: [],
    lastReasoningSummary: null,
  };
}

export function appendUserMessage(
  state: AdvisorConversationState,
  content: string,
): AdvisorConversationState {
  return {
    ...state,
    messages: [...state.messages, createChatMessage("user", content)],
  };
}

export function appendAssistantMessage(
  state: AdvisorConversationState,
  message: ChatMessage,
  plan: OrchestrationPlan,
  contributions: AgentContribution[],
  reasoningSummary: string,
): AdvisorConversationState {
  return {
    messages: [...state.messages, message],
    lastPlan: plan,
    lastContributions: contributions,
    lastReasoningSummary: reasoningSummary,
  };
}

export function getConversationHistory(
  messages: ChatMessage[],
): Array<{ role: "user" | "assistant"; content: string }> {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      role: message.role as "user" | "assistant",
      content: message.content,
    }));
}
