/**
 * Phase 57 — regenerate internal commercial validation report from fixture.
 * Usage: npx tsx scripts/run-commercial-validation.ts
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  clearStudioStores,
  formatCommercialValidationReport,
} from "../src/executive-snapshot-studio";
import { runCommercialValidationFromFile } from "../src/executive-snapshot-studio/server";
import {
  clearAuditStore,
  clearLineageStore,
  clearMappingStore,
  clearSnapshotStore,
} from "../src/data-gateway";

clearStudioStores();
clearSnapshotStore();
clearMappingStore();
clearLineageStore();
clearAuditStore();

const fixture = resolve(
  process.cwd(),
  "fixtures/validation/salesforce-opportunity-export.csv",
);

const result = runCommercialValidationFromFile(fixture, {
  organisationId: "org-validation",
  organisationName: "Validation Organisation",
  profileId: "profile-validation",
  productId: "executiveos",
});

const report = formatCommercialValidationReport(result);
const out = resolve(
  process.cwd(),
  "docs/validation/PHASE_57_COMMERCIAL_EXPORT_VALIDATION.md",
);
writeFileSync(out, report, "utf8");

console.log(
  JSON.stringify(
    {
      ingested: result.ingested,
      profile: result.profile.profileId,
      records: result.snapshot?.meta.recordCount,
      readiness: result.readiness?.executiveReadiness,
      insights: result.analysis?.insights.length,
      briefConfidence: result.brief?.confidence,
      report: out,
      errors: result.errors,
    },
    null,
    2,
  ),
);
