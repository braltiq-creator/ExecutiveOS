import { requireAppAccess } from "@/lib/auth/access";
import { loadIntegrationsPageData } from "@/lib/integrations/actions";
import { AppShell } from "@/components/layout/AppShell";
import { IntegrationGrid } from "@/components/integrations/IntegrationGrid";

export default async function IntegrationsSettingsPage() {
  await requireAppAccess({ requireOnboarding: false });
  const data = await loadIntegrationsPageData();

  return (
    <AppShell breadcrumb="Integrations">
      <div className="space-y-10">
        <div>
          <p className="text-sm font-medium text-zinc-500">Integrations</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Integration Platform
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
            Connect executive systems to enrich intelligence, briefings, and operational
            context. All connections are organization-scoped and validated server-side.
          </p>
        </div>

        <IntegrationGrid data={data} />
      </div>
    </AppShell>
  );
}
