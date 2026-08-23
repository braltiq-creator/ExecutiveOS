"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  WELCOME_BODY,
  WELCOME_HEADLINE,
  WELCOME_PROMISE,
  createDiscoverySession,
  submitMinimumQuestions,
  runDiscovery,
  validateDiscovery,
  completeDiscovery,
  selectDiscoveryIntelligenceProfile,
  getValidationQueue,
  saveDiscoverySession,
  type DiscoverySession,
  type MinimumQuestions,
  type ExecutiveRoleOption,
  type PrimaryObjectiveOption,
  type BriefingTimePreference,
} from "@/onboarding";
import {
  listIntelligenceProfiles,
  type IntelligenceProfileId,
} from "@/profiles";
import { completeExecutiveOnboarding } from "@/lib/onboarding/actions";

const ROLES: ExecutiveRoleOption[] = [
  "CEO",
  "Managing Director",
  "Owner",
  "COO",
  "CFO",
  "General Manager",
];

const OBJECTIVES: PrimaryObjectiveOption[] = [
  "Growth",
  "Profitability",
  "Operational Excellence",
  "Customer Experience",
  "Safety",
  "Innovation",
];

const BRIEFING_TIMES: BriefingTimePreference[] = ["Morning", "Afternoon"];

const STRATEGIC_OUTCOME_EXAMPLES = [
  "Improve operational reliability",
  "Grow profitable revenue",
  "Strengthen strategic customer retention",
  "Reduce delivery risk",
  "Improve forecast confidence",
  "Build scalable capacity",
];

type Phase = "welcome" | "questions" | "discovering" | "validating" | "brief";

type DiscoveryExperienceProps = {
  tenantId?: string;
  userId?: string;
  preferredName?: string;
};

export function DiscoveryExperience({
  tenantId = "tenant-northline",
  userId = "user-executive",
  preferredName,
}: DiscoveryExperienceProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("welcome");
  const [session, setSession] = useState<DiscoverySession>(() =>
    createDiscoverySession({ tenantId, userId }),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [questions, setQuestions] = useState<MinimumQuestions>({
    role: "CEO",
    primaryObjective: "Operational Excellence",
    briefingTime: "Morning",
    strategicOutcomes: ["", "", ""],
  });

  const queue = useMemo(
    () => (session ? getValidationQueue(session) : []),
    [session],
  );

  function startDiscovery() {
    setError(null);
    startTransition(() => {
      let next = submitMinimumQuestions(session, questions);
      next = runDiscovery(next, {
        connectedSystems: ["microsoft365", "simpro"],
        asOf: new Date().toISOString(),
      });
      setSession(next);
      saveDiscoverySession(next);
      setPhase("validating");
    });
  }

  function handleValidate(
    discoveryId: string,
    action: "confirm" | "edit" | "ignore",
    editedValue?: string,
  ) {
    const next = validateDiscovery(session, discoveryId, action, editedValue);
    setSession(next);
    saveDiscoverySession(next);
  }

  function finish() {
    setError(null);
    startTransition(async () => {
      const completed = completeDiscovery(session);
      setSession(completed);
      saveDiscoverySession(completed);
      setPhase("brief");

      const result = await completeExecutiveOnboarding();
      if (result.error) {
        // Discovery brief still shown; persistence may fail in mock
        setError(result.error);
      }
    });
  }

  function openToday() {
    router.push("/today");
    router.refresh();
  }

  return (
    <div className="relative min-h-full bg-[var(--eos-canvas)] text-[var(--eos-text)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(61,110,168,0.10),transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-2xl flex-col px-6 py-12 sm:px-8 lg:py-16">
        <header className="mb-10">
          <p className="text-sm font-semibold tracking-tight text-[var(--eos-accent)]">
            ExecutiveOS
          </p>
          <div className="mt-6">
            <ProgressBar percent={session.progress.percent} />
            <p className="mt-2 text-xs text-[var(--eos-text-muted)]">
              Target under {session.progress.targetMinutes} minutes ·{" "}
              {session.progress.message}
            </p>
          </div>
        </header>

        {phase === "welcome" ? (
          <section className="space-y-8">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {preferredName
                  ? `${preferredName}, ${WELCOME_HEADLINE.toLowerCase()}`
                  : WELCOME_HEADLINE}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[var(--eos-text-secondary)]">
                {WELCOME_BODY}
              </p>
            </div>
            <ul className="space-y-3">
              {WELCOME_PROMISE.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-6 text-[var(--eos-text-secondary)]"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--eos-accent)]" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="rounded-lg bg-[var(--eos-accent)] px-5 py-2.5 text-sm font-medium text-white"
              onClick={() => setPhase("questions")}
            >
              Begin discovery
            </button>
          </section>
        ) : null}

        {phase === "questions" ? (
          <section className="space-y-8">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                A few things I can&apos;t infer yet
              </h1>
              <p className="mt-3 text-sm leading-6 text-[var(--eos-text-secondary)]">
                Everything else I&apos;ll learn from Microsoft 365 and your
                operational systems.
              </p>
            </div>

            <Field label="Your role">
              <OptionGrid
                options={ROLES}
                value={questions.role}
                onChange={(role) =>
                  setQuestions((q) => ({ ...q, role: role as ExecutiveRoleOption }))
                }
              />
            </Field>

            <Field label="Primary business objective">
              <OptionGrid
                options={OBJECTIVES}
                value={questions.primaryObjective}
                onChange={(primaryObjective) =>
                  setQuestions((q) => ({
                    ...q,
                    primaryObjective:
                      primaryObjective as PrimaryObjectiveOption,
                  }))
                }
              />
            </Field>

            <Field label="Preferred executive briefing time">
              <OptionGrid
                options={BRIEFING_TIMES}
                value={questions.briefingTime}
                onChange={(briefingTime) =>
                  setQuestions((q) => ({
                    ...q,
                    briefingTime: briefingTime as BriefingTimePreference,
                  }))
                }
              />
            </Field>

            <Field label="What are your three most important strategic outcomes over the next 12 months?">
              <div className="space-y-3">
                <p className="text-xs leading-5 text-[var(--eos-text-muted)]">
                  Examples: {STRATEGIC_OUTCOME_EXAMPLES.slice(0, 4).join(" · ")}.
                  ExecutiveOS will refine these over time from observed behaviour
                  and connected systems.
                </p>
                {[0, 1, 2].map((index) => (
                  <input
                    key={index}
                    type="text"
                    className="w-full rounded-lg border border-[var(--eos-border)] bg-[var(--eos-surface)] px-3 py-2.5 text-sm text-[var(--eos-text)]"
                    placeholder={`Strategic outcome ${index + 1}`}
                    value={questions.strategicOutcomes?.[index] ?? ""}
                    onChange={(e) =>
                      setQuestions((q) => {
                        const next = [...(q.strategicOutcomes ?? ["", "", ""])];
                        next[index] = e.target.value;
                        return { ...q, strategicOutcomes: next };
                      })
                    }
                  />
                ))}
              </div>
            </Field>

            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-lg border border-[var(--eos-border)] px-4 py-2.5 text-sm"
                onClick={() => setPhase("welcome")}
              >
                Back
              </button>
              <button
                type="button"
                disabled={
                  pending ||
                  (questions.strategicOutcomes ?? []).filter((s) => s.trim())
                    .length < 1
                }
                className="rounded-lg bg-[var(--eos-accent)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                onClick={startDiscovery}
              >
                {pending ? "Discovering…" : "Connect & discover"}
              </button>
            </div>
          </section>
        ) : null}

        {phase === "validating" ? (
          <section className="space-y-8">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                Does this look right?
              </h1>
              <p className="mt-3 text-sm leading-6 text-[var(--eos-text-secondary)]">
                I discovered {session.discoveries.length} signals across your
                connected systems. Confirm, edit, or ignore — every correction
                improves tomorrow&apos;s brief.
              </p>
            </div>

            {session.profileRecommendation ? (
              <div className="rounded-xl border border-[var(--eos-border)] bg-[var(--eos-surface-solid)] p-5 shadow-[var(--eos-shadow-1)]">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--eos-text-muted)]">
                  Recommended experience
                </p>
                <p className="mt-2 font-display text-xl font-semibold tracking-tight">
                  {session.profileRecommendation.profileName}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--eos-text-secondary)]">
                  {session.profileRecommendation.explanation}
                </p>
                <p className="mt-4 text-xs text-[var(--eos-text-muted)]">
                  Prefer a different executive experience?
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {listIntelligenceProfiles().map((profile) => {
                    const selected =
                      session.intelligenceProfileId === profile.id;
                    return (
                      <button
                        key={profile.id}
                        type="button"
                        className={
                          selected
                            ? "rounded-lg bg-[var(--eos-accent)] px-3 py-1.5 text-xs font-medium text-white"
                            : "rounded-lg border border-[var(--eos-border)] px-3 py-1.5 text-xs text-[var(--eos-text-secondary)]"
                        }
                        onClick={() => {
                          const next = selectDiscoveryIntelligenceProfile(
                            session,
                            profile.id as IntelligenceProfileId,
                          );
                          setSession(next);
                          saveDiscoverySession(next);
                        }}
                      >
                        {profile.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <ul className="space-y-4">
              {queue.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-[var(--eos-border)] bg-[var(--eos-surface-solid)] p-5 shadow-[var(--eos-shadow-1)]"
                >
                  <p className="text-sm leading-6 text-[var(--eos-text)]">
                    {item.summary}
                  </p>
                  <p className="mt-2 text-xs text-[var(--eos-text-muted)]">
                    Confidence {item.confidence}% · {item.evidence[0]}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <ActionButton
                      label="Confirm"
                      onClick={() => handleValidate(item.id, "confirm")}
                    />
                    <ActionButton
                      label="Edit"
                      onClick={() => {
                        const next = window.prompt(
                          "Correct this",
                          item.editableValue ?? item.label,
                        );
                        if (next) handleValidate(item.id, "edit", next);
                      }}
                    />
                    <ActionButton
                      label="Ignore"
                      tone="muted"
                      onClick={() => handleValidate(item.id, "ignore")}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <button
              type="button"
              disabled={pending}
              className="rounded-lg bg-[var(--eos-accent)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              onClick={finish}
            >
              {pending ? "Preparing briefing…" : "Generate first briefing"}
            </button>
          </section>
        ) : null}

        {phase === "brief" && session.brief ? (
          <section className="space-y-8">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                Your first Executive Briefing
              </h1>
              <p className="mt-3 text-sm leading-6 text-[var(--eos-text-secondary)]">
                {session.brief.executiveSummary}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BriefCard
                title="Business health"
                body={session.brief.businessHealth}
              />
              <BriefCard
                title="Operational health"
                body={session.brief.operationalHealth}
              />
            </div>

            <BriefList
              title="Strategic priorities"
              items={session.brief.strategicPriorities}
            />
            <BriefList
              title="Upcoming governance"
              items={session.brief.upcomingGovernance}
            />
            <BriefList
              title="Key relationships"
              items={session.brief.keyRelationships}
            />
            <BriefList
              title="What ExecutiveOS learned today"
              items={session.brief.whatWeLearned}
            />

            <p className="text-sm text-[var(--eos-text-muted)]">
              {session.brief.confidenceSummary}
            </p>

            {error ? (
              <p className="text-sm text-[var(--eos-warning)]">{error}</p>
            ) : null}

            <button
              type="button"
              className="rounded-lg bg-[var(--eos-accent)] px-5 py-2.5 text-sm font-medium text-white"
              onClick={openToday}
            >
              Open Today
            </button>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--eos-health-track)]">
      <div
        className="h-full rounded-full bg-[var(--eos-accent)] transition-[width] duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--eos-text-muted)]">
        {label}
      </p>
      {children}
    </div>
  );
}

function OptionGrid({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={
              selected
                ? "rounded-lg bg-[var(--eos-accent)] px-3 py-2 text-sm font-medium text-white"
                : "rounded-lg border border-[var(--eos-border)] bg-[var(--eos-surface-solid)] px-3 py-2 text-sm text-[var(--eos-text-secondary)]"
            }
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  tone = "default",
}: {
  label: string;
  onClick: () => void;
  tone?: "default" | "muted";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        tone === "muted"
          ? "rounded-md border border-[var(--eos-border)] px-3 py-1.5 text-xs text-[var(--eos-text-muted)]"
          : "rounded-md border border-[var(--eos-border)] bg-[var(--eos-surface-solid)] px-3 py-1.5 text-xs font-medium text-[var(--eos-text)]"
      }
    >
      {label}
    </button>
  );
}

function BriefCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-[var(--eos-border)] bg-[var(--eos-surface-solid)] p-4 shadow-[var(--eos-shadow-1)]">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--eos-text-muted)]">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--eos-text-secondary)]">
        {body}
      </p>
    </div>
  );
}

function BriefList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--eos-text-muted)]">
        {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="text-sm leading-6 text-[var(--eos-text-secondary)]"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
