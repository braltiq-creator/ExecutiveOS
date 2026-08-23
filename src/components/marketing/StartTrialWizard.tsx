"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { signUp, type AuthActionState } from "@/lib/auth/actions";
import {
  PROFILES,
  PRICING,
  START_TRIAL_PAGE,
  TRUST,
} from "@/components/marketing/content";

const STEPS = [
  "Account",
  "Profile",
  "Organisation",
  "Microsoft",
  "Connector",
  "Discovery",
  "Brief",
] as const;

type ProfileId = keyof typeof PROFILES;

type TrialState = {
  fullName: string;
  email: string;
  password: string;
  profileId: ProfileId | null;
  organisationName: string;
  organisationSize: string;
  microsoft: "connect" | "skip" | null;
  operational: "connect" | "skip" | null;
  outcome1: string;
  outcome2: string;
  outcome3: string;
};

const initial: TrialState = {
  fullName: "",
  email: "",
  password: "",
  profileId: null,
  organisationName: "",
  organisationSize: "200-2000",
  microsoft: null,
  operational: null,
  outcome1: "",
  outcome2: "",
  outcome3: "",
};

function connectorLabel(profileId: ProfileId | null) {
  if (profileId === "commercial") return "Salesforce";
  if (profileId === "manufacturing") return "Dynamics / ERP";
  return "Simpro";
}

function persistIntent(state: TrialState) {
  try {
    sessionStorage.setItem(
      "executiveos.trial.intent",
      JSON.stringify({
        profileId: state.profileId,
        organisationName: state.organisationName,
        organisationSize: state.organisationSize,
        microsoft: state.microsoft,
        operational: state.operational,
        outcomes: [state.outcome1, state.outcome2, state.outcome3],
        fullName: state.fullName,
        email: state.email,
      }),
    );
  } catch {
    /* ignore quota / private mode */
  }
}

export function StartTrialWizard({
  initialProfile,
}: {
  initialProfile?: ProfileId;
}) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<TrialState>({
    ...initial,
    profileId: initialProfile ?? null,
  });
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const profile = state.profileId ? PROFILES[state.profileId] : null;
  const operationalName = connectorLabel(state.profileId);

  const canContinue = useMemo(() => {
    switch (step) {
      case 0:
        return (
          state.fullName.trim().length > 1 &&
          state.email.includes("@") &&
          state.password.length >= 8
        );
      case 1:
        return Boolean(state.profileId);
      case 2:
        return state.organisationName.trim().length > 1;
      case 3:
        return state.microsoft !== null;
      case 4:
        return state.operational !== null;
      case 5:
        return (
          state.outcome1.trim().length > 2 &&
          state.outcome2.trim().length > 2 &&
          state.outcome3.trim().length > 2
        );
      default:
        return true;
    }
  }, [state, step]);

  function update<K extends keyof TrialState>(key: K, value: TrialState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function finishDiscovery() {
    setError(null);
    setInfo(null);
    persistIntent(state);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", state.email.trim());
      formData.set("password", state.password);

      try {
        const result = (await signUp(
          { error: null, success: null } satisfies AuthActionState,
          formData,
        )) as AuthActionState | void;

        if (result && "error" in result && result.error) {
          setInfo(
            "You can open the product and finish account confirmation if needed. Your trial intent is saved on this device.",
          );
          setStep(6);
          return;
        }

        if (result && "success" in result && result.success) {
          setInfo(result.success);
          setStep(6);
          return;
        }

        setStep(6);
      } catch {
        // Next.js redirect() from signUp surfaces as a throw — journey continues in-app.
        setStep(6);
      }
    });
  }

  function next() {
    setError(null);
    if (step === 5) {
      finishDiscovery();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="mk-wizard mk-v3-wizard">
      <p className="mk-kicker">Welcome</p>
      <h1 className="mk-h2">{START_TRIAL_PAGE.headline}</h1>
      <p className="mk-lead">{START_TRIAL_PAGE.subheadline}</p>

      <div className="mk-trust" style={{ marginTop: "1.25rem" }}>
        {TRUST.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <div className="mk-v3-stepper" aria-label="Trial progress">
        <div className="mk-v3-stepper-bar">
          <i style={{ width: `${progress}%` }} />
        </div>
        <ol className="mk-v3-stepper-list">
          {STEPS.map((label, index) => (
            <li
              key={label}
              data-active={index === step}
              data-done={index < step}
            >
              <span className="mk-v3-stepper-index">{index + 1}</span>
              <span className="mk-v3-stepper-label">{label}</span>
            </li>
          ))}
        </ol>
      </div>
      <p className="mk-body mk-v3-stepper-status">
        Step {step + 1} of {STEPS.length} — {STEPS[step]}
      </p>

      {error ? (
        <p className="mk-body" style={{ color: "var(--ex-critical)" }}>
          {error}
        </p>
      ) : null}
      {info ? <p className="mk-body">{info}</p> : null}

      {step === 0 ? (
        <div>
          <div className="mk-field">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              value={state.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="mk-field">
            <label htmlFor="email">Work email</label>
            <input
              id="email"
              type="email"
              value={state.email}
              onChange={(e) => update("email", e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="mk-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={state.password}
              onChange={(e) => update("password", e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mk-choice">
          {(Object.keys(PROFILES) as Array<keyof typeof PROFILES>).map((id) => (
            <button
              key={id}
              type="button"
              data-selected={state.profileId === id}
              onClick={() => update("profileId", id)}
            >
              <strong>{PROFILES[id].name}</strong>
              <span>{PROFILES[id].subheadline}</span>
            </button>
          ))}
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <div className="mk-field">
            <label htmlFor="org">Organisation</label>
            <input
              id="org"
              value={state.organisationName}
              onChange={(e) => update("organisationName", e.target.value)}
              placeholder="Company name"
              required
            />
          </div>
          <div className="mk-field">
            <label htmlFor="size">Approximate size</label>
            <select
              id="size"
              value={state.organisationSize}
              onChange={(e) => update("organisationSize", e.target.value)}
            >
              <option value="1-199">Under 200 employees</option>
              <option value="200-2000">200–2,000 employees</option>
              <option value="2000+">2,000+ employees</option>
            </select>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div>
          <p className="mk-body">
            Connect Microsoft 365 when you are ready. Calendar and collaboration
            context enrich Discovery — they are not the product.
          </p>
          <div className="mk-choice">
            <button
              type="button"
              data-selected={state.microsoft === "connect"}
              onClick={() => update("microsoft", "connect")}
            >
              <strong>Connect Microsoft 365</strong>
              <span>
                You can complete the connection after your first brief.
              </span>
            </button>
            <button
              type="button"
              data-selected={state.microsoft === "skip"}
              onClick={() => update("microsoft", "skip")}
            >
              <strong>Continue without connecting yet</strong>
              <span>Start with outcomes and your Executive Profile.</span>
            </button>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div>
          <p className="mk-body">
            Operational connector for {profile?.name ?? "your profile"}:{" "}
            {operationalName}. Optional — systems of record stay systems of
            record.
          </p>
          <div className="mk-choice">
            <button
              type="button"
              data-selected={state.operational === "connect"}
              onClick={() => update("operational", "connect")}
            >
              <strong>Connect {operationalName}</strong>
              <span>Finish connection in Organisation Portal when ready.</span>
            </button>
            <button
              type="button"
              data-selected={state.operational === "skip"}
              onClick={() => update("operational", "skip")}
            >
              <strong>Skip for now</strong>
              <span>{PRICING.principle}</span>
            </button>
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div>
          <p className="mk-body">
            Name three outcomes you would defend this quarter. Discovery uses
            these to ground your Executive Brief.
          </p>
          <div className="mk-field">
            <label htmlFor="o1">Outcome 1</label>
            <input
              id="o1"
              value={state.outcome1}
              onChange={(e) => update("outcome1", e.target.value)}
            />
          </div>
          <div className="mk-field">
            <label htmlFor="o2">Outcome 2</label>
            <input
              id="o2"
              value={state.outcome2}
              onChange={(e) => update("outcome2", e.target.value)}
            />
          </div>
          <div className="mk-field">
            <label htmlFor="o3">Outcome 3</label>
            <input
              id="o3"
              value={state.outcome3}
              onChange={(e) => update("outcome3", e.target.value)}
            />
          </div>
        </div>
      ) : null}

      {step === 6 ? (
        <div className="mk-card" style={{ marginTop: "1.5rem" }}>
          <p className="mk-card-meta">Executive Brief</p>
          <h2 className="mk-h3">Your trial is ready</h2>
          <p className="mk-body">
            Profile: {profile?.name ?? "Selected"}. Organisation:{" "}
            {state.organisationName}. Outcomes captured for Discovery.
          </p>
          <p className="mk-body">
            Open your Command Centre for the first Executive Brief. Complete any
            remaining provider connections from the Organisation Portal.
          </p>
          <div className="mk-actions">
            <Link href="/activate" className="mk-btn mk-btn-primary">
              Open Executive Brief
            </Link>
            <Link href="/today" className="mk-btn mk-btn-secondary">
              Go to Command Centre
            </Link>
          </div>
        </div>
      ) : null}

      {step < 6 ? (
        <div className="mk-actions">
          {step > 0 ? (
            <button
              type="button"
              className="mk-btn mk-btn-secondary"
              onClick={back}
            >
              Back
            </button>
          ) : null}
          <button
            type="button"
            className="mk-btn mk-btn-primary"
            onClick={next}
            disabled={!canContinue || pending}
          >
            {pending
              ? "Preparing…"
              : step === 5
                ? "Prepare Executive Brief"
                : "Continue"}
          </button>
        </div>
      ) : null}

      <p className="mk-body" style={{ marginTop: "2rem", fontSize: "0.9rem" }}>
        Already have an account? <Link href="/sign-in">Sign in</Link>
        {" · "}
        Prefer a shorter path? <Link href="/get-started">Get started</Link>
      </p>
    </div>
  );
}
