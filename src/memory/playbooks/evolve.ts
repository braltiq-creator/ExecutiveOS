/**
 * Living executive playbooks — evolve from confirmed experience.
 */

import type {
  LivingExecutivePlaybook,
  LivingPlaybookKind,
} from "@/memory/framework/types";
import { listEpisodes } from "@/memory/episodes";
import { listLessons } from "@/memory/lessons";
import { listMemoryPatterns } from "@/memory/patterns";

const playbooks = new Map<string, LivingExecutivePlaybook>();

const SEEDS: Array<{
  kind: LivingPlaybookKind;
  title: string;
  keywords: string[];
  baseSteps: string[];
}> = [
  {
    kind: "strategic_account_recovery",
    title: "Strategic Account Recovery",
    keywords: ["account", "customer", "retention", "churn"],
    baseSteps: [
      "Identify weakening strategic account signals",
      "Recall prior recovery episodes",
      "Executive sponsor outreach within 48 hours",
      "Confirm outcome and capture lessons",
    ],
  },
  {
    kind: "operational_incident_response",
    title: "Operational Incident Response",
    keywords: ["bottleneck", "capacity", "safety", "disruption", "incident"],
    baseSteps: [
      "Confirm operational impact and severity",
      "Recall similar incidents and successful actions",
      "Reallocate or escalate with clear owner",
      "Record episode and lessons within 24 hours",
    ],
  },
  {
    kind: "forecast_recovery",
    title: "Forecast Recovery",
    keywords: ["forecast", "pipeline", "confidence"],
    baseSteps: [
      "Diagnose forecast confidence drivers",
      "Recall prior forecast recovery decisions",
      "Challenge commit with sales leadership",
      "Track outcome and update playbook",
    ],
  },
  {
    kind: "major_customer_escalation",
    title: "Major Customer Escalation",
    keywords: ["escalat", "customer", "intervention"],
    baseSteps: [
      "Surface customer risk requiring executive attention",
      "Review prior escalations and outcomes",
      "Execute executive intervention",
      "Capture what worked / failed",
    ],
  },
  {
    kind: "executive_crisis_management",
    title: "Executive Crisis Management",
    keywords: ["crisis", "critical", "safety", "major"],
    baseSteps: [
      "Establish facts and containment owner",
      "Recall crisis episodes and playbook steps",
      "Communicate decisions and actions",
      "Debrief lessons into organisational memory",
    ],
  },
];

export function resetMemoryPlaybooks(): void {
  playbooks.clear();
}

export function listPlaybooks(tenantId: string): LivingExecutivePlaybook[] {
  return [...playbooks.values()]
    .filter((p) => p.tenantId === tenantId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function evolvePlaybooksFromExperience(
  tenantId: string,
  asOf = new Date().toISOString(),
): LivingExecutivePlaybook[] {
  const episodes = listEpisodes(tenantId);
  const lessons = listLessons(tenantId);
  const patterns = listMemoryPatterns(tenantId);
  const evolved: LivingExecutivePlaybook[] = [];

  for (const seed of SEEDS) {
    const sourceEpisodes = episodes.filter((ep) => {
      const hay = `${ep.name} ${ep.context} ${ep.businessQuestion}`.toLowerCase();
      return seed.keywords.some((k) => hay.includes(k));
    });
    const sourceLessons = lessons.filter((l) => {
      const hay = [
        ...l.whatWorked,
        ...l.whatFailed,
        ...l.futureRecommendations,
        ...l.tags,
      ]
        .join(" ")
        .toLowerCase();
      return seed.keywords.some((k) => hay.includes(k));
    });

    if (sourceEpisodes.length === 0 && sourceLessons.length === 0) {
      // Still create a seed playbook so the library exists
    }

    const lessonSteps = sourceLessons
      .flatMap((l) => l.futureRecommendations)
      .slice(0, 3);
    const patternNote = patterns
      .filter((p) =>
        seed.keywords.some((k) => p.name.includes(k) || p.description.includes(k)),
      )
      .map((p) => p.reusableGuidance)
      .slice(0, 1);

    const existing = playbooks.get(`pb-${tenantId}-${seed.kind}`);
    const playbook: LivingExecutivePlaybook = {
      id: `pb-${tenantId}-${seed.kind}`,
      tenantId,
      kind: seed.kind,
      title: seed.title,
      summary: `Living playbook evolved from ${sourceEpisodes.length} episode(s) and ${sourceLessons.length} lesson(s).`,
      steps: [...seed.baseSteps, ...lessonSteps].slice(0, 8),
      sourceEpisodeIds: sourceEpisodes.map((e) => e.id),
      sourceLessonIds: sourceLessons.map((l) => l.id),
      evolutionNotes: [
        ...(existing?.evolutionNotes ?? []),
        `${asOf}: refreshed from organisational memory`,
        ...patternNote,
      ].slice(-12),
      confidence: Math.min(
        90,
        35 + sourceEpisodes.length * 10 + sourceLessons.length * 8,
      ),
      updatedAt: asOf,
      createdAt: existing?.createdAt ?? asOf,
    };
    playbooks.set(playbook.id, playbook);
    evolved.push(playbook);
  }

  return evolved;
}
