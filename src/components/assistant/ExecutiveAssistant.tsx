"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { sendChiefOfStaffMessage } from "@/lib/ai/actions";
import { createChatMessage, isChiefOfStaffError } from "@/lib/ai/types";
import type { ChatMessage as ChatMessageType } from "@/lib/ai/types";
import { ChatMessage } from "@/components/assistant/ChatMessage";
import { MessageInput } from "@/components/assistant/MessageInput";
import { SuggestedQuestions } from "@/components/assistant/SuggestedQuestions";
import { ThinkingIndicator } from "@/components/assistant/ThinkingIndicator";

type ExecutiveAssistantProps = {
  preferredName: string;
};

function buildWelcomeMessage(preferredName: string): ChatMessageType {
  return createChatMessage(
    "assistant",
    `Good to see you, ${preferredName}. I'm your AI Chief of Staff — grounded in your executive profile, objectives, memory, and priorities. What would you like to work through?`,
    "welcome-message",
  );
}

export function ExecutiveAssistant({ preferredName }: ExecutiveAssistantProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>(() => [
    buildWelcomeMessage(preferredName),
  ]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  function submitMessage(messageText: string) {
    const trimmed = messageText.trim();
    if (!trimmed || isPending) {
      return;
    }

    const userMessage = createChatMessage("user", trimmed);
    const priorHistory = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError(null);

    startTransition(async () => {
      const response = await sendChiefOfStaffMessage(trimmed, priorHistory);

      if (isChiefOfStaffError(response)) {
        setError(response.error);
        return;
      }

      setMessages((current) => [...current, response.message]);
    });
  }

  return (
    <div className="flex min-h-[70vh] flex-col gap-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-500">AI Chief of Staff</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Executive Assistant
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
          Conversational guidance powered by your Executive Intelligence context.
        </p>
      </div>

      <div className="flex flex-1 flex-col rounded-2xl border border-zinc-200/80 bg-white/90 shadow-sm backdrop-blur-sm">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isPending ? <ThinkingIndicator /> : null}
          <div ref={scrollRef} />
        </div>

        <div className="space-y-4 border-t border-zinc-100 px-4 py-4 sm:px-6 sm:py-5">
          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            >
              {error}
            </div>
          ) : null}

          <SuggestedQuestions
            disabled={isPending}
            onSelect={(question) => submitMessage(question)}
          />

          <MessageInput
            value={input}
            onChange={setInput}
            onSubmit={() => submitMessage(input)}
            disabled={isPending}
          />
        </div>
      </div>
    </div>
  );
}
