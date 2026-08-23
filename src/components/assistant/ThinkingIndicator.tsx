export function ThinkingIndicator() {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/80 px-4 py-3"
      role="status"
      aria-live="polite"
      aria-label="Assistant is thinking"
    >
      <span className="flex gap-1">
        <span className="size-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:0ms]" />
        <span className="size-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
        <span className="size-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
      </span>
      <span className="text-sm text-zinc-600">Chief of Staff is thinking...</span>
    </div>
  );
}
