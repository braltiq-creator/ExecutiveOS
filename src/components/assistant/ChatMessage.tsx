import type { ChatMessage as ChatMessageType } from "@/lib/ai/types";

type ChatMessageProps = {
  message: ChatMessageType;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%] sm:px-5 sm:py-4 ${
          isUser
            ? "bg-zinc-900 text-white"
            : "border border-zinc-200/80 bg-white text-zinc-900"
        }`}
      >
        {!isUser ? (
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Chief of Staff
          </p>
        ) : null}
        <div
          className={`whitespace-pre-wrap text-sm leading-6 sm:text-[15px] ${
            isUser ? "text-white" : "text-zinc-700"
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
