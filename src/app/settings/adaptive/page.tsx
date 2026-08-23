import { requireAppAccess } from "@/lib/auth/access";
import { AppFrame } from "@/components/layout/AppFrame";
import { ExperiencePage } from "@/experience/layouts/ExperiencePage";
import { ExperienceCardShell } from "@/experience/design-system/Card";
import { ExperienceBadge } from "@/experience/design-system/Badge";
import {
  disableAdaptiveLearning,
  enableAdaptiveLearning,
  listLearningHistory,
  resetAdaptiveProfile,
  viewLearnedPreferences,
} from "@/adaptive";

type SearchParams = Promise<{ action?: string }>;

export default async function AdaptiveSettingsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  await requireAppAccess({ requireOnboarding: false });
  const params = (await searchParams) ?? {};

  const tenantId = "tenant-northline";
  const executiveId = "executive-primary";
  const profileId = "operations_executive" as const;

  if (params.action === "disable") {
    viewLearnedPreferences({ tenantId, executiveId, profileId });
    disableAdaptiveLearning({ tenantId, executiveId });
  } else if (params.action === "enable") {
    viewLearnedPreferences({ tenantId, executiveId, profileId });
    enableAdaptiveLearning({ tenantId, executiveId });
  } else if (params.action === "reset") {
    resetAdaptiveProfile({ tenantId, executiveId, profileId });
  }

  const learned = viewLearnedPreferences({
    tenantId,
    executiveId,
    profileId,
  });
  const history = listLearningHistory({ tenantId, executiveId }).slice(0, 12);

  return (
    <AppFrame title="Adaptive learning" density="snapshot">
      <ExperiencePage width="brief" className="space-y-8 pb-16">
        <header className="space-y-3 pt-2">
          <ExperienceBadge tone="accent">Governance</ExperienceBadge>
          <h1 className="ex-display">Your adaptive profile</h1>
          <p className="ex-body max-w-xl">
            ExecutiveOS learns how you work to improve presentation and
            prioritisation — never Core intelligence. You can review, reset, or
            disable learning anytime.
          </p>
        </header>

        <ExperienceCardShell className="space-y-3">
          <p className="ex-heading text-base">
            Status: {learned.enabled ? "Learning on" : "Learning off"}
          </p>
          <p className="ex-body">
            Learning confidence {learned.profile.learningConfidence}% · Detail{" "}
            {learned.profile.preferredDetailLevel} · Style{" "}
            {learned.profile.preferredCommunicationStyle}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={
                learned.enabled
                  ? "/settings/adaptive?action=disable"
                  : "/settings/adaptive?action=enable"
              }
              className="inline-flex min-h-9 items-center rounded-[var(--ex-radius)] bg-[var(--ex-accent)] px-3 text-sm font-medium text-white"
            >
              {learned.enabled ? "Disable adaptive learning" : "Enable learning"}
            </a>
            <a
              href="/settings/adaptive?action=reset"
              className="inline-flex min-h-9 items-center rounded-[var(--ex-radius)] border border-[var(--eos-border)] px-3 text-sm font-medium text-[var(--ex-text)]"
            >
              Reset adaptive profile
            </a>
          </div>
        </ExperienceCardShell>

        <section className="space-y-3">
          <h2 className="ex-heading">Learned preferences</h2>
          <ul className="space-y-2">
            {learned.preferences.map((pref) => (
              <li key={pref.key}>
                <ExperienceCardShell>
                  <p className="ex-heading text-base">
                    {pref.key.replace(/_/g, " ")}: {String(pref.value)}
                  </p>
                  <p className="ex-body mt-1">{pref.explanation}</p>
                  <p className="ex-caption mt-2 normal-case tracking-normal">
                    Confidence {pref.confidence}%
                  </p>
                </ExperienceCardShell>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="ex-heading">Learning history</h2>
          <ul className="space-y-2">
            {history.length === 0 ? (
              <li className="ex-body">No learning events yet.</li>
            ) : (
              history.map((entry) => (
                <li key={entry.id}>
                  <ExperienceCardShell>
                    <p className="ex-caption">{entry.category}</p>
                    <p className="ex-body mt-1">{entry.summary}</p>
                  </ExperienceCardShell>
                </li>
              ))
            )}
          </ul>
        </section>
      </ExperiencePage>
    </AppFrame>
  );
}
