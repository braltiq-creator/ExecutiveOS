export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type ConversationTurn = Pick<ChatMessage, "role" | "content">;

export type AICompletionRequest = {
  systemPrompt: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

export type AICompletionResponse = {
  content: string;
  model: string;
  finishReason: string | null;
};

export type AIStreamChunk = {
  content: string;
  done: boolean;
};

export interface AIProvider {
  readonly name: string;
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
  stream?(
    request: AICompletionRequest,
  ): AsyncGenerator<AIStreamChunk, void, unknown>;
}

export type AIProviderName = "openai" | "anthropic" | "azure-openai";

export type ChiefOfStaffRequest = {
  message: string;
  history: ConversationTurn[];
};

export type ChiefOfStaffResult = {
  message: ChatMessage;
};

export type ChiefOfStaffError = {
  error: string;
};

export type ChiefOfStaffResponse = ChiefOfStaffResult | ChiefOfStaffError;

export const SUGGESTED_QUESTIONS = [
  "What should I focus on today?",
  "What risks should I address this week?",
  "Summarise my strategic priorities.",
  "What decisions are still outstanding?",
  "What opportunities am I missing?",
  "Help me prepare for my next board meeting.",
] as const;

export type SuggestedQuestion = (typeof SUGGESTED_QUESTIONS)[number];

export class AIServiceError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "AIServiceError";
    this.code = code;
  }
}

export function isChiefOfStaffError(
  response: ChiefOfStaffResponse,
): response is ChiefOfStaffError {
  return "error" in response;
}

export function createChatMessage(
  role: ChatRole,
  content: string,
  id?: string,
): ChatMessage {
  return {
    id: id ?? crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export type ConversationStore = {
  loadConversation: (userId: string) => Promise<ChatMessage[]>;
  saveConversation: (userId: string, messages: ChatMessage[]) => Promise<void>;
};

export type ConversationContext = {
  userId: string;
  messages: ChatMessage[];
};
