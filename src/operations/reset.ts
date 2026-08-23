/**
 * Reset all Operations Centre + Observability in-memory stores (tests).
 */

import { resetPartnerOpsRegistry } from "@/operations/partners";
import { resetSupportIssues } from "@/operations/support";
import { resetOpsAlerts } from "@/operations/alerts";
import { resetOpsNotes } from "@/operations/notes";
import { resetOpsTasks } from "@/operations/tasks";
import { resetPartnerReviews } from "@/operations/reviews";
import { resetRoadmapItems } from "@/operations/roadmap";
import { resetEngagementHistory } from "@/operations/engagement";
import { resetPortfolioAnalyticsState } from "@/operations/analytics";
import { resetMonitoringHistory } from "@/operations/monitoring";
import { resetPlatformAlerts, resetAlertThresholds } from "@/operations/alerts";
import { resetReleaseManagement } from "@/operations/release-management";
import { resetIncidents } from "@/operations/incident-management";

export function resetOperationsCentre(): void {
  resetPartnerOpsRegistry();
  resetSupportIssues();
  resetOpsAlerts();
  resetOpsNotes();
  resetOpsTasks();
  resetPartnerReviews();
  resetRoadmapItems();
  resetEngagementHistory();
  resetPortfolioAnalyticsState();
  resetMonitoringHistory();
  resetPlatformAlerts();
  resetAlertThresholds();
  resetReleaseManagement();
  resetIncidents();
}
