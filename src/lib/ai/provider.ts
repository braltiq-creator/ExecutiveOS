import OpenAI from "openai";
import type {
  AICompletionRequest,
  AICompletionResponse,
  AIProvider,
  AIStreamChunk,
} from "@/lib/ai/types";
import { AIServiceError } from "@/lib/ai/types";
import { getChiefOfStaffModel } from "@/lib/ai/models";

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  private readonly client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const response = await this.client.chat.completions.create({
      model: request.model ?? getChiefOfStaffModel(),
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      messages: [
        { role: "system", content: request.systemPrompt },
        ...request.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    });

    const choice = response.choices[0];

    if (!choice?.message?.content) {
      throw new AIServiceError(
        "The AI provider returned an empty response.",
        "EMPTY_RESPONSE",
      );
    }

    return {
      content: choice.message.content,
      model: response.model,
      finishReason: choice.finish_reason,
    };
  }

  async *stream(
    request: AICompletionRequest,
  ): AsyncGenerator<AIStreamChunk, void, unknown> {
    const stream = await this.client.chat.completions.create({
      model: request.model ?? getChiefOfStaffModel(),
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      stream: true,
      messages: [
        { role: "system", content: request.systemPrompt },
        ...request.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content ?? "";

      if (content) {
        yield { content, done: false };
      }
    }

    yield { content: "", done: true };
  }
}

export function createOpenAIProvider(): OpenAIProvider {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new AIServiceError(
      "OPENAI_API_KEY is not configured.",
      "PROVIDER_NOT_CONFIGURED",
    );
  }

  return new OpenAIProvider(apiKey);
}

let cachedProvider: AIProvider | null = null;

export function createAIProvider(): AIProvider {
  const providerName = process.env.AI_PROVIDER ?? "openai";

  switch (providerName) {
    case "openai":
      return createOpenAIProvider();
    case "anthropic":
      throw new AIServiceError(
        "Anthropic provider is not implemented yet.",
        "PROVIDER_NOT_IMPLEMENTED",
      );
    case "azure-openai":
      throw new AIServiceError(
        "Azure OpenAI provider is not implemented yet.",
        "PROVIDER_NOT_IMPLEMENTED",
      );
    default:
      throw new AIServiceError(
        `Unsupported AI provider: ${providerName}`,
        "PROVIDER_UNSUPPORTED",
      );
  }
}

export function getAIProvider(): AIProvider {
  if (!cachedProvider) {
    cachedProvider = createAIProvider();
  }

  return cachedProvider;
}

export function resetAIProviderCache(): void {
  cachedProvider = null;
}
