"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  consultAdvisorsAction,
  recommendAdvisorAction,
} from "@/lib/agents/actions";
import {
  appendAssistantMessage,
  appendUserMessage,
  createInitialAdvisorConversation,
  getConversationHistory,
} from "@/lib/agents/conversation";
import { isAdvisorError } from "@/lib/agents/types";
import type { AgentId, AdvisorsPageData } from "@/lib/agents/types";
import { ChatMessage } from "@/components/assistant/ChatMessage";
import { MessageInput } from "@/components/assistant/MessageInput";
import { ThinkingIndicator } from "@/components/assistant/ThinkingIndicator";
import { AdvisorCard } from "@/components/advisors/AdvisorCard";
import { AdvisorReasoningPanel } from "@/components/advisors/AdvisorReasoningPanel";

type ExecutiveAdvisorsPanelProps = {
  data: AdvisorsPageData;
};

const SUGGESTED_QUESTIONS = [
  "Should we accelerate Initiative Alpha given current risks?",
  "How should I prepare for the board meeting?",
  "What operational bottlenecks are blocking our objectives?",
  "Help me communicate a difficult leadership decision.",
  "What should I focus on today?",
  "What risks could block our Q3 objectives?",
];

export function ExecutiveAdvisorsPanel({ data }: ExecutiveAdvisorsPanelProps) {
  const [conversation, setConversation] = useState(() =>
    createInitialAdvisorConversation(data.preferredName),
  );
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId | null>(null);
  const [recommendedAgentId, setRecommendedAgentId] = useState<AgentId | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages, isPending]);

  useEffect(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setRecommendedAgentId(null);
      return;
    }

    const timer = window.setTimeout(async () => {
      const result = await recommendAdvisorAction(trimmed);
      if ("agentId" in result) {
        setRecommendedAgentId(result.agentId as AgentId);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [input]);

  function submitMessage(messageText: string) {
    const trimmed = messageText.trim();
    if (!trimmed || isPending) {
      return;
    }

    const priorHistory = getConversationHistory(conversation.messages);
    setConversation((current) => appendUserMessage(current, trimmed));
    setInput("");
    setError(null);

    startTransition(async () => {
      const response = await consultAdvisorsAction(
        trimmed,
        priorHistory,
        selectedAgentId ?? undefined,
      );

      if (isAdvisorError(response)) {
        setError(response.error);
        return;
      }

      setConversation((current) =>
        appendAssistantMessage(
          current,
          response.message,
          response.plan,
          response.contributions,
          response.reasoningSummary,
        ),
      );
      setRecommendedAgentId(response.plan.primaryAgentId);
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-500">Executive Advisors</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Multi-Agent Intelligence
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-zinc-600 sm:text-base">
          A collaborative team of specialist advisors — each grounded in your executive context,
          knowledge graph, and operational data.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {data.agents.map((agent) => (
          <AdvisorCard
            key={agent.id}
            agent={agent}
            selected={selectedAgentId === agent.id}
            recommended={recommendedAgentId === agent.id}
            onSelect={(agentId) =>
              setSelectedAgentId((current) => (current === agentId ? null : agentId))
            }
          />
        ))}
      </div>

      {selectedAgentId ? (
        <p className="text-xs text-zinc-500">
          Consulting with{" "}
          <span className="font-medium text-zinc-700">
            {data.agents.find((agent) => agent.id === selectedAgentId)?.name}
          </span>
          . Click again to return to auto-routing.
        </p>
      ) : (
        <p className="text-xs text-zinc-500">
          No advisor selected — the orchestrator will route your question automatically.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex min-h-[60vh] flex-col rounded-2xl border border-zinc-200/80 bg-white/90 shadow-sm backdrop-blur-sm">
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
            {conversation.messages.map((message) => (
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

            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={isPending}
                  onClick={() => submitMessage(question)}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-white disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>

            <MessageInput
              value={input}
              onChange={setInput}
              onSubmit={() => submitMessage(input)}
              disabled={isPending}
              placeholder="Ask your executive advisor team..."
            />
          </div>
        </div>

        <AdvisorReasoningPanel
          plan={conversation.lastPlan}
          contributions={conversation.lastContributions}
          reasoningSummary={conversation.lastReasoningSummary}
        />
      </div>
    </div>
  );
}
