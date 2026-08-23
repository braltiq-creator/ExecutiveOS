"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { EXDS_TONE_VAR, toneFromHealth } from "../colour";
import type { ExdsDigitalTwinNode } from "../types";

const DOMAIN_ORDER = [
  "organisation",
  "operations",
  "commercial",
  "people",
  "capital",
  "customers",
  "technology",
  "risk",
] as const;

type DigitalTwinStripProps = {
  nodes: ExdsDigitalTwinNode[];
  className?: string;
};

/**
 * Subtle organisation status strip — living enterprise model.
 * Links into existing workspaces only.
 */
export function DigitalTwinStrip({ nodes, className }: DigitalTwinStripProps) {
  const byDomain = new Map(nodes.map((n) => [n.domain, n]));
  const ordered = DOMAIN_ORDER.map(
    (domain) =>
      byDomain.get(domain) ?? {
        domain,
        label: domain.charAt(0).toUpperCase() + domain.slice(1),
        health: "unknown" as const,
      },
  );

  return (
    <section
      aria-label="Executive digital twin"
      className={cn(
        "exds-fade-in flex flex-wrap items-stretch gap-1 rounded-[var(--eos-radius-md)]",
        "border border-[var(--exds-card-border)] bg-[var(--exds-card-bg)] p-1.5",
        className,
      )}
    >
      {ordered.map((node) => {
        const tone = toneFromHealth(node.health);
        const content = (
          <>
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: EXDS_TONE_VAR[tone] }}
              aria-hidden="true"
            />
            <span className="truncate">{node.label}</span>
          </>
        );

        const sharedClass = cn(
          "exds-focus-ring inline-flex min-w-0 flex-1 items-center gap-1.5",
          "rounded-[var(--eos-radius-sm)] px-2.5 py-1.5",
          "eos-type-caption text-[var(--eos-color-text-secondary)]",
          "hover:bg-[color-mix(in_srgb,var(--eos-color-text)_4%,transparent)]",
          "hover:text-[var(--eos-color-text)]",
        );

        if (node.href) {
          return (
            <Link
              key={node.domain}
              href={node.href}
              title={node.summary}
              className={sharedClass}
            >
              {content}
            </Link>
          );
        }

        return (
          <span key={node.domain} title={node.summary} className={sharedClass}>
            {content}
          </span>
        );
      })}
    </section>
  );
}
