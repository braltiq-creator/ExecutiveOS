type OnboardingStepNavProps = {
  onBack?: () => void;
  backLabel?: string;
  continueLabel?: string;
  loading?: boolean;
  showBack?: boolean;
};

export function OnboardingStepNav({
  onBack,
  backLabel = "Back",
  continueLabel = "Continue",
  loading = false,
  showBack = true,
}: OnboardingStepNavProps) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
      {showBack && onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {backLabel}
        </button>
      ) : (
        <span />
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[148px]"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
            Saving...
          </span>
        ) : (
          continueLabel
        )}
      </button>
    </div>
  );
}
