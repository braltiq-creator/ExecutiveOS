"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";
import { EXDS_TONE_VAR } from "../colour";
import type { ExdsRelationshipNode } from "../types";

type RelationshipGraphProps = {
  title?: string;
  nodes: ExdsRelationshipNode[];
  orientation?: "vertical" | "horizontal";
  className?: string;
};

/**
 * Enterprise relationship chain.
 * Customer → Demand → Factory → Inventory → Working Capital → Outcome
 */
export function RelationshipGraph({
  title = "Enterprise relationships",
  nodes,
  orientation = "vertical",
  className,
}: RelationshipGraphProps) {
  const vertical = orientation === "vertical";

  return (
    <section
      className={cn(
        "rounded-[var(--exds-card-radius)] border border-[var(--exds-card-border)]",
        "bg-[var(--exds-card-bg)] p-[var(--eos-space-lg)]",
        className,
      )}
      aria-label={title}
    >
      <p className={ds.type.label}>{title}</p>
      <ol
        className={cn(
          "mt-[var(--eos-space-md)]",
          vertical
            ? "flex flex-col"
            : "flex flex-wrap items-center gap-x-2 gap-y-3",
        )}
      >
        {nodes.map((node, index) => {
          const tone = node.tone ?? "intelligence";
          const nodeEl = (
            <span
              className={cn(
                "inline-flex items-center rounded-[var(--eos-radius-sm)]",
                "border border-[var(--exds-card-border)] px-3 py-2",
                "eos-type-subheading text-[var(--eos-color-text)]",
              )}
              style={{
                boxShadow: `inset 3px 0 0 ${EXDS_TONE_VAR[tone]}`,
              }}
            >
              {node.label}
            </span>
          );

          return (
            <li
              key={node.id}
              className={cn(
                "flex",
                vertical ? "flex-col items-start" : "items-center",
              )}
            >
              {node.href ? (
                <Link href={node.href} className="exds-focus-ring exds-interactive">
                  {nodeEl}
                </Link>
              ) : (
                nodeEl
              )}
              {index < nodes.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "eos-type-caption text-[var(--eos-color-text-muted)]",
                    vertical ? "my-1.5 ml-4" : "mx-1",
                  )}
                >
                  {vertical ? "↓" : "→"}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
