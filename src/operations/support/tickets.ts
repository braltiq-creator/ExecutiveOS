/**
 * Support issue tracking + recurring pattern detection.
 */

import type {
  SupportIssue,
  SupportPattern,
  SupportSeverity,
  SupportStatus,
} from "@/operations/types";

const issues = new Map<string, SupportIssue>();

export function resetSupportIssues(): void {
  issues.clear();
}

export function listSupportIssues(): SupportIssue[] {
  return [...issues.values()];
}

export function listSupportIssuesForTenant(tenantId: string): SupportIssue[] {
  return listSupportIssues().filter((i) => i.tenantId === tenantId);
}

export function recordSupportIssue(input: {
  tenantId: string;
  title: string;
  severity: SupportSeverity;
  owner: string;
  category: string;
  asOf?: string;
}): SupportIssue {
  const createdAt = input.asOf ?? new Date().toISOString();
  const issue: SupportIssue = {
    id: `sup-${input.tenantId}-${issues.size + 1}`,
    tenantId: input.tenantId,
    title: input.title,
    severity: input.severity,
    status: "open",
    owner: input.owner,
    resolution: null,
    rootCause: null,
    createdAt,
    resolvedAt: null,
    timeToResolutionHours: null,
    category: input.category,
  };
  issues.set(issue.id, issue);
  return issue;
}

export function updateSupportIssue(input: {
  id: string;
  status?: SupportStatus;
  resolution?: string;
  rootCause?: string;
  owner?: string;
  asOf?: string;
}): SupportIssue | null {
  const existing = issues.get(input.id);
  if (!existing) return null;
  const asOf = input.asOf ?? new Date().toISOString();
  const resolved =
    input.status === "resolved" || input.status === "closed"
      ? asOf
      : existing.resolvedAt;
  const ttr =
    resolved != null
      ? Math.max(
          0,
          Math.round(
            (new Date(resolved).getTime() -
              new Date(existing.createdAt).getTime()) /
              3_600_000,
          ),
        )
      : null;
  const next: SupportIssue = {
    ...existing,
    status: input.status ?? existing.status,
    resolution: input.resolution ?? existing.resolution,
    rootCause: input.rootCause ?? existing.rootCause,
    owner: input.owner ?? existing.owner,
    resolvedAt: resolved,
    timeToResolutionHours: ttr,
  };
  issues.set(next.id, next);
  return next;
}

export function detectSupportPatterns(): SupportPattern[] {
  const open = listSupportIssues().filter(
    (i) => i.status === "open" || i.status === "in_progress" || i.status === "waiting",
  );
  const byCategory = new Map<string, SupportIssue[]>();
  for (const issue of open) {
    const list = byCategory.get(issue.category) ?? [];
    list.push(issue);
    byCategory.set(issue.category, list);
  }

  const patterns: SupportPattern[] = [];
  for (const [category, list] of byCategory) {
    if (list.length < 2) continue;
    const severityRank: Record<SupportSeverity, number> = {
      critical: 0,
      high: 1,
      moderate: 2,
      low: 3,
    };
    const severity = list.reduce(
      (worst, i) =>
        severityRank[i.severity] < severityRank[worst] ? i.severity : worst,
      "low" as SupportSeverity,
    );
    const tenantIds = [...new Set(list.map((i) => i.tenantId))];
    patterns.push({
      id: `pattern-${category}`,
      pattern: `Recurring ${category} issues across ${tenantIds.length} partner(s)`,
      category,
      occurrences: list.length,
      tenantIds,
      severity,
      recommendation:
        severity === "critical" || severity === "high"
          ? "Escalate to engineering with aggregated reproduction notes"
          : "Add playbook FAQ and proactive CS outreach",
    });
  }
  return patterns.sort((a, b) => b.occurrences - a.occurrences);
}
