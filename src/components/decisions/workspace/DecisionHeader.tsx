"use client";

import Link from "next/link";
import { EngineDecisionStatusBadge } from "@/components/decisions/EngineDecisionStatusBadge";
import type { DecisionWorkspaceModel } from "@/lib/decisions/workspace";
import {
  ExecutiveBadge,
  ExecutiveDivider,
  ExecutiveHeading,
  ds,
} from "@/design-system";
import { cn } from "@/lib/utils/cn";

type DecisionHeaderProps = {
  model: DecisionWorkspaceModel;
};

export function DecisionHeader({ model }: DecisionHeaderProps) {
  return (
    <header
      className={cn(
        "eos-reveal eos-reveal-delay-0",
        "pb-[var(--eos-space-2xl)] pt-[var(--eos-space-xs)]",
      )}
    >
      <Link
        href="/decisions"
        className={cn(
          ds.type.body,
          "underline-offset-4 hover:text-[var(--eos-color-text)] hover:underline",
          ds.focusRing,
        )}
      >
        Decision register
      </Link>

      <div
        className={cn(
          "mt-[var(--eos-space-xl)] flex flex-wrap items-center",
          "gap-[var(--eos-space-md)]",
        )}
      >
        <EngineDecisionStatusBadge status={model.status} />
        <ExecutiveBadge>Decision workspace</ExecutiveBadge>
      </div>

      <ExecutiveHeading
        as="h1"
        size="xl"
        className="mt-[var(--eos-space-lg)] max-w-3xl sm:text-[2.35rem]"
      >
        {model.title}
      </ExecutiveHeading>

      <dl
        className={cn(
          "mt-[var(--eos-space-xl)] grid max-w-2xl",
          "gap-[var(--eos-space-xl)] sm:grid-cols-2",
        )}
      >
        <div>
          <dt className={ds.type.label}>Owner</dt>
          <dd className={cn(ds.type.body, "mt-[var(--eos-space-sm)] text-[var(--eos-color-text)]")}>
            {model.owner}
          </dd>
        </div>
        <div>
          <dt className={ds.type.label}>Due</dt>
          <dd
            className={cn(
              ds.type.body,
              "mt-[var(--eos-space-sm)] font-mono text-[var(--eos-color-text)]",
            )}
          >
            {model.deadline}
          </dd>
        </div>
        <div>
          <dt className={ds.type.label}>Estimated decision time</dt>
          <dd
            className={cn(
              ds.type.metric,
              "mt-[var(--eos-space-sm)] text-[var(--eos-type-display-l-size)]",
            )}
          >
            {model.estimatedMinutes}
            <span
              className={cn(
                ds.type.supporting,
                "ml-[var(--eos-space-sm)] font-medium",
              )}
            >
              minutes
            </span>
          </dd>
        </div>
        <div>
          <dt className={ds.type.label}>Status</dt>
          <dd
            className={cn(
              ds.type.body,
              "mt-[var(--eos-space-sm)] capitalize text-[var(--eos-color-text)]",
            )}
          >
            {model.statusLabel}
          </dd>
        </div>
      </dl>

      <ExecutiveDivider className="mt-[var(--eos-space-2xl)]" />
    </header>
  );
}
