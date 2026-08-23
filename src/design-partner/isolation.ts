/**
 * Tenant / organisation isolation helpers for Design Partner pilots.
 */

import { listAudit } from "@/data-gateway";
import { listLibrary } from "@/executive-snapshot-studio/history";
import { listDesignPartnerAudit } from "./audit";
import { listDesignPartnerFeedback } from "./feedback";
import { listDesignPartnerMetrics } from "./metrics";

export type IsolationProbeResult = {
  ok: boolean;
  organisationA: string;
  organisationB: string;
  failures: string[];
};

/**
 * Verify organisation A listings never include organisation B objects.
 * Uses existing scoped list APIs — does not invent a new security layer.
 */
export function probeDesignPartnerIsolation(
  organisationA: string,
  organisationB: string,
): IsolationProbeResult {
  const failures: string[] = [];

  const libA = listLibrary(organisationA);
  if (libA.some((e) => e.organisationId === organisationB)) {
    failures.push("Snapshot library leaked organisation B into A");
  }
  const libB = listLibrary(organisationB);
  if (libB.some((e) => e.organisationId === organisationA)) {
    failures.push("Snapshot library leaked organisation A into B");
  }

  const audA = listAudit(organisationA);
  if (audA.some((e) => e.organisationId === organisationB)) {
    failures.push("UDG audit leaked organisation B into A");
  }

  const dpaA = listDesignPartnerAudit(organisationA);
  if (dpaA.some((e) => e.organisationId === organisationB)) {
    failures.push("Design Partner audit leaked organisation B into A");
  }

  const metricsA = listDesignPartnerMetrics(organisationA);
  if (metricsA.some((e) => e.organisationId === organisationB)) {
    failures.push("Pilot metrics leaked organisation B into A");
  }

  const feedbackA = listDesignPartnerFeedback(organisationA);
  if (feedbackA.some((e) => e.organisationId === organisationB)) {
    failures.push("Pilot feedback leaked organisation B into A");
  }

  return {
    ok: failures.length === 0,
    organisationA,
    organisationB,
    failures,
  };
}
