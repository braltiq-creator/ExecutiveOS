import type { IntegrationsPageData } from "@/lib/integrations/types";
import { IntegrationCard } from "@/components/integrations/IntegrationCard";

type IntegrationGridProps = {
  data: IntegrationsPageData;
};

export function IntegrationGrid({ data }: IntegrationGridProps) {
  const { integrations, canManage, hasIntegrationsFeature } = data;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {integrations.map((view) => (
        <IntegrationCard
          key={view.provider.id}
          view={view}
          canManage={canManage}
          hasIntegrationsFeature={hasIntegrationsFeature}
        />
      ))}
    </div>
  );
}
