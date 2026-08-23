import { requireAppAccess } from "@/lib/auth/access";
import { loadBillingPageData } from "@/lib/billing/actions";
import { AppShell } from "@/components/layout/AppShell";
import { BillingDashboard } from "@/components/billing/BillingDashboard";

export default async function BillingSettingsPage() {
  await requireAppAccess({ requireOnboarding: false });
  const { overview, plans } = await loadBillingPageData();

  return (
    <AppShell breadcrumb="Billing">
      <BillingDashboard overview={overview} plans={plans} />
    </AppShell>
  );
}
