"use client";

import dynamic from "next/dynamic";
import type { ImmersionNetworkModel } from "@/experience/immersion/types";

const KnowledgeNetworkExplorer = dynamic(
  () =>
    import("@/experience/immersion/KnowledgeNetworkExplorer").then(
      (m) => m.KnowledgeNetworkExplorer,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[360px] items-center justify-center rounded-[10px] border border-[color-mix(in_srgb,white_8%,transparent)] bg-[#12151c]"
        data-knowledge-network="loading"
      >
        <p className="eos-type-caption text-[var(--eos-color-text-muted)]">
          Loading knowledge network…
        </p>
      </div>
    ),
  },
);

type Props = {
  model: ImmersionNetworkModel;
  className?: string;
};

export function KnowledgeNetworkExplorerLazy(props: Props) {
  return <KnowledgeNetworkExplorer {...props} />;
}
