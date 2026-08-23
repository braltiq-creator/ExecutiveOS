import { resetGrowthSubscriptions } from "@/growth/subscriptions";
import { resetGrowthTelemetry } from "@/growth/telemetry";
import { resetActivationJourneys } from "@/growth/activation";
import { resetProviderSetup } from "@/growth/provider-setup";
import { resetExecutiveValue } from "@/growth/executive-value";
import { resetGrowthRoiReports } from "@/growth/roi";
import { resetGrowthNotifications } from "@/growth/notifications";

export function resetGrowthPlatform(): void {
  resetGrowthSubscriptions();
  resetGrowthTelemetry();
  resetActivationJourneys();
  resetProviderSetup();
  resetExecutiveValue();
  resetGrowthRoiReports();
  resetGrowthNotifications();
}
