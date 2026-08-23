type MeetingSummaryProps = {
  summary: string | null;
  analyzedAt?: string | null;
};

export function MeetingSummary({ summary, analyzedAt }: MeetingSummaryProps) {
  if (!summary) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-4 py-5">
        <p className="text-sm text-zinc-600">
          No summary yet. Add a summary or analyze meeting notes to generate one.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 px-4 py-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-zinc-900">Meeting Summary</h3>
        {analyzedAt ? (
          <span className="text-xs text-zinc-500">
            Analyzed {new Date(analyzedAt).toLocaleString()}
          </span>
        ) : null}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700">
        {summary}
      </p>
    </div>
  );
}
