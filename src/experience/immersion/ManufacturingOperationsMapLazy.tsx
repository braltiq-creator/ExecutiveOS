"use client";

import dynamic from "next/dynamic";
import type { ManufacturingOperationsMapModel } from "@/experience/immersion/types";

const ManufacturingOperationsMap = dynamic(
  () =>
    import("@/experience/immersion/ManufacturingOperationsMap").then(
      (m) => m.ManufacturingOperationsMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[360px] items-center justify-center rounded-[10px] border border-[color-mix(in_srgb,white_8%,transparent)] bg-[var(--eos-color-surface-elevated,#12151c)]"
        data-manufacturing-operations-map="loading"
      >
        <p className="eos-type-caption text-[var(--eos-color-text-muted)]">
          Loading operations map…
        </p>
      </div>
    ),
  },
);

type Props = {
  model: ManufacturingOperationsMapModel;
  className?: string;
  compact?: boolean;
  initialSelectedId?: string | null;
};

export function ManufacturingOperationsMapLazy(props: Props) {
  return <ManufacturingOperationsMap {...props} />;
}
