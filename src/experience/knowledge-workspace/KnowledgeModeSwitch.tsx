"use client";

import { cn } from "@/lib/utils/cn";

export type KnowledgeMode = "explore" | "ask";

type Props = {
  mode: KnowledgeMode;
  onChange: (mode: KnowledgeMode) => void;
};

export function KnowledgeModeSwitch({ mode, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Knowledge experience mode"
      className="flex flex-wrap gap-2"
      data-knowledge-mode-switch="true"
    >
      {(
        [
          ["explore", "Explore network"],
          ["ask", "Ask"],
        ] as const
      ).map(([id, label]) => {
        const selected = mode === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            data-knowledge-mode={id}
            onClick={() => onChange(id)}
            className={cn(
              "rounded-[6px] border px-3 py-1.5 text-[0.78rem] transition-colors",
              selected
                ? "border-[color-mix(in_srgb,var(--eos-color-executive-blue,#6a9fd8)_55%,transparent)] bg-[color-mix(in_srgb,var(--eos-color-executive-blue,#6a9fd8)_14%,transparent)] text-[var(--eos-color-text)]"
                : "border-[var(--exs-divider,color-mix(in_srgb,white_8%,transparent))] text-[var(--eos-color-text-muted)]",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
