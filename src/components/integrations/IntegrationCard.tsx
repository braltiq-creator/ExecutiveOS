"use client";

import { useState } from "react";
import Link from "next/link";
import type { IntegrationView } from "@/lib/integrations/types";
import { formatIntegrationStatus } from "@/lib/integrations/types";
import { ConnectButton } from "@/components/integrations/ConnectButton";
import { IntegrationSettings } from "@/components/integrations/IntegrationSettings";

type IntegrationCardProps = {
  view: IntegrationView;
  canManage: boolean;
  hasIntegrationsFeature: boolean;
};

function statusBadgeClass(status: IntegrationView["health"]["status"]): string {
  switch (status) {
    case "connected":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "syncing":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "error":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-600";
  }
}

export function IntegrationCard({
  view,
  canManage,
  hasIntegrationsFeature,
}: IntegrationCardProps) {
  const [error, setError] = useState<string | null>(null);
  const { provider, health } = view;
  const isConnected = health.isConnected;

  return (
    <article className="rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            {provider.vendor}
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">
            {provider.name}
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{provider.description}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadgeClass(health.status)}`}
        >
          {formatIntegrationStatus(health.status)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {provider.context_domains.map((domain) => (
          <span
            key={domain}
            className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600"
          >
            {domain}
          </span>
        ))}
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {!hasIntegrationsFeature ? (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/70 p-4">
          <p className="text-sm text-zinc-600">
            Enterprise integrations are available on the Enterprise plan.
          </p>
          <Link
            href="/settings/billing"
            className="mt-3 inline-flex text-sm font-medium text-zinc-900 underline-offset-4 hover:underline"
          >
            View plans
          </Link>
        </div>
      ) : canManage && !isConnected ? (
        <div className="mt-6">
          <ConnectButton
            providerId={provider.id}
            onError={setError}
          />
        </div>
      ) : null}

      <IntegrationSettings view={view} canManage={canManage && hasIntegrationsFeature} />
    </article>
  );
}
