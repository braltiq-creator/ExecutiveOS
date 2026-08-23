/**
 * Partner-shareable export documents (markdown).
 */

import type { IntelligenceProfileId } from "@/profiles";
import { getPilotByTenant } from "@/pilot/provisioning";
import { buildPilotHealthSnapshot } from "@/pilot/health";
import { getPlaybook } from "@/pilot/playbooks";
import { buildValidationSuite } from "@/validation";
import type {
  PilotExportDocument,
  PilotExportKind,
  PilotHealthSnapshot,
} from "@/pilot/types";
import type { DesignPartnerDashboard } from "@/validation";

type ExportContext = {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf: string;
  partnerName: string;
  health: PilotHealthSnapshot;
  suite: DesignPartnerDashboard;
  playbookTitle: string;
};

function buildExportContext(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
}): ExportContext {
  const asOf = input.asOf ?? new Date().toISOString();
  const pilot = getPilotByTenant(input.tenantId);
  const suite = buildValidationSuite({ tenantId: input.tenantId, asOf });
  return {
    tenantId: input.tenantId,
    profileId: input.profileId,
    asOf,
    partnerName: pilot?.partnerName ?? input.tenantId,
    health: buildPilotHealthSnapshot({ ...input, asOf, suite }),
    suite,
    playbookTitle: getPlaybook(input.profileId).title,
  };
}

function renderDocument(
  kind: PilotExportKind,
  ctx: ExportContext,
): PilotExportDocument {
  const titles: Record<PilotExportKind, string> = {
    readiness_report: "Pilot Readiness Report",
    deployment_summary: "Deployment Summary",
    executive_adoption: "Executive Adoption Report",
    connector_health: "Connector Health Report",
    validation_summary: "Validation Summary",
  };

  let markdown = `# ${titles[kind]}\n\n`;
  markdown += `**Partner:** ${ctx.partnerName}  \n`;
  markdown += `**Tenant:** ${ctx.tenantId}  \n`;
  markdown += `**Profile:** ${ctx.playbookTitle.replace(" Implementation Playbook", "")}  \n`;
  markdown += `**Generated:** ${ctx.asOf}\n\n`;

  switch (kind) {
    case "readiness_report":
      markdown += `## Readiness Score: ${ctx.health.readiness.overall}/100\n\n`;
      markdown += `${ctx.health.readiness.explanation}\n\n`;
      for (const c of ctx.health.readiness.components) {
        markdown += `### ${c.label} — ${c.score}/100\n`;
        markdown += `${c.explanation}\n`;
        if (c.gaps.length) {
          markdown += `Gaps: ${c.gaps.join("; ")}\n`;
        }
        markdown += "\n";
      }
      if (ctx.health.diagnostics.length > 0) {
        markdown += `## Open diagnostics\n\n`;
        for (const d of ctx.health.diagnostics.slice(0, 8)) {
          markdown += `- **${d.severity.toUpperCase()}** ${d.title}: ${d.detail}\n`;
        }
      }
      break;
    case "deployment_summary":
      markdown += `## Lifecycle\n\n`;
      markdown += `Stage: **${ctx.health.lifecycleStage}**\n\n`;
      markdown += `## Checklist\n\n`;
      for (const list of ctx.health.checklist) {
        markdown += `### ${list.label} (${list.overallStatus})\n`;
        for (const item of list.items) {
          markdown += `- [${item.status === "complete" ? "x" : " "}] ${item.label} — ${item.detail}\n`;
        }
        markdown += "\n";
      }
      markdown += `## Playbook\n\n${ctx.playbookTitle}\n`;
      break;
    case "executive_adoption":
      markdown += `## Adoption\n\n`;
      markdown += `- Time to first brief: ${ctx.health.success.timeToFirstBriefMinutes ?? "—"} min\n`;
      markdown += `- Engagement: ${ctx.health.success.executiveEngagementPct}%\n`;
      markdown += `- Daily active executives: ${ctx.health.success.dailyActiveUsers}\n`;
      markdown += `- Recommendation usefulness: ${ctx.health.success.recommendationUsefulnessPct}%\n`;
      markdown += `- Readiness trend: ${ctx.health.success.readinessTrend}\n`;
      markdown += `- Pilot completion: ${ctx.health.success.pilotCompletionRate}%\n\n`;
      markdown += `${ctx.health.success.explanation}\n`;
      break;
    case "connector_health":
      markdown += `## Connectors\n\n`;
      markdown += `Healthy required providers: ${ctx.health.providersHealthy}/${ctx.health.providersRequired}\n\n`;
      for (const p of ctx.suite.providers.providers) {
        markdown += `### ${p.label}\n`;
        markdown += `- Status: ${p.status}\n`;
        markdown += `- Connected: ${p.connected}\n`;
        markdown += `- ${p.explanation}\n\n`;
      }
      break;
    case "validation_summary":
      markdown += `## Validation\n\n`;
      markdown += `Overall maturity: ${ctx.suite.maturity.overall.score}%\n\n`;
      markdown += `Outstanding requests: ${ctx.suite.outstandingValidationRequests.length}\n\n`;
      for (const r of ctx.suite.outstandingValidationRequests) {
        markdown += `- ${r.label} (${r.priority}) — ${r.reason}\n`;
      }
      if (ctx.suite.intelligenceProfileValidation) {
        markdown += `\n## Profile scenarios\n\n`;
        for (const s of ctx.suite.intelligenceProfileValidation.scenarios) {
          markdown += `- ${s.passed ? "PASS" : "FAIL"}: ${s.label}\n`;
        }
      }
      break;
  }

  return {
    kind,
    title: titles[kind],
    tenantId: ctx.tenantId,
    partnerName: ctx.partnerName,
    generatedAt: ctx.asOf,
    markdown,
  };
}

export function exportPilotDocument(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  kind: PilotExportKind;
  asOf?: string;
}): PilotExportDocument {
  return renderDocument(input.kind, buildExportContext(input));
}

export function exportAllPilotDocuments(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
}): PilotExportDocument[] {
  const ctx = buildExportContext(input);
  const kinds: PilotExportKind[] = [
    "readiness_report",
    "deployment_summary",
    "executive_adoption",
    "connector_health",
    "validation_summary",
  ];
  return kinds.map((kind) => renderDocument(kind, ctx));
}
