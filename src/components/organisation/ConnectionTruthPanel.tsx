"use client";

import type { ConnectionTruthView } from "@/verified-evidence/ui-labels";

type Props = {
  views: ConnectionTruthView[];
};

/**
 * Minimal truthful connection / verification / evidence strip.
 * Does not claim business facts from connection state.
 */
export function ConnectionTruthPanel({ views }: Props) {
  return (
    <div className="space-y-4" data-verified-connections="true">
      <p className="text-sm leading-6 text-[var(--eos-text-secondary)]">
        A connection authorises inspection. It is not business evidence.
        Discovery only uses verified evidence.
      </p>
      <ul className="space-y-3">
        {views.map((view) => (
          <li
            key={view.providerId}
            className="rounded-xl border border-[var(--eos-border)] bg-[var(--eos-surface-solid)] p-4"
            data-provider={view.providerId}
          >
            <p className="font-display text-lg font-semibold tracking-tight">
              {view.label}
            </p>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-[var(--eos-text-muted)]">
                  Connection
                </dt>
                <dd className="text-sm">{view.connectionLabel}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-[var(--eos-text-muted)]">
                  Authentication
                </dt>
                <dd className="text-sm">{view.authenticationLabel}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-[var(--eos-text-muted)]">
                  Verification
                </dt>
                <dd className="text-sm">{view.verificationLabel}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-[var(--eos-text-muted)]">
                  Evidence
                </dt>
                <dd className="text-sm">{view.evidenceLabel}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-[var(--eos-text-muted)]">
                  Last verified
                </dt>
                <dd className="text-sm">{view.lastVerifiedLabel}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-[var(--eos-text-muted)]">
                  Source health
                </dt>
                <dd className="text-sm">{view.healthLabel}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
