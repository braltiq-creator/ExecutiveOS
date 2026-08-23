import type {
  IncidentRecord,
  IncidentSeverity,
  IncidentStatus,
  ProviderId,
} from "@/operations/observability/types";

const incidents = new Map<string, IncidentRecord>();
let seq = 0;

export function resetIncidents(): void {
  incidents.clear();
  seq = 0;
}

export function openIncident(input: {
  title: string;
  severity: IncidentSeverity;
  affectedTenantIds?: string[];
  providerId?: ProviderId | null;
  note?: string;
  asOf?: string;
}): IncidentRecord {
  const asOf = input.asOf ?? new Date().toISOString();
  seq += 1;
  const record: IncidentRecord = {
    id: `inc-${seq}`,
    title: input.title,
    severity: input.severity,
    status: "investigating",
    openedAt: asOf,
    resolvedAt: null,
    affectedTenantIds: input.affectedTenantIds ?? [],
    providerId: input.providerId ?? null,
    timeline: [{ at: asOf, note: input.note ?? "Incident opened" }],
    rootCause: null,
    resolution: null,
    postIncidentReview: null,
    lessonsLearned: [],
  };
  incidents.set(record.id, record);
  return record;
}

export function updateIncident(input: {
  id: string;
  status?: IncidentStatus;
  note?: string;
  rootCause?: string;
  resolution?: string;
  postIncidentReview?: string;
  lessonsLearned?: string[];
  asOf?: string;
}): IncidentRecord | null {
  const current = incidents.get(input.id);
  if (!current) return null;
  const asOf = input.asOf ?? new Date().toISOString();
  const next: IncidentRecord = {
    ...current,
    status: input.status ?? current.status,
    rootCause: input.rootCause ?? current.rootCause,
    resolution: input.resolution ?? current.resolution,
    postIncidentReview:
      input.postIncidentReview ?? current.postIncidentReview,
    lessonsLearned: input.lessonsLearned ?? current.lessonsLearned,
    resolvedAt:
      input.status === "resolved" || input.status === "postmortem"
        ? asOf
        : current.resolvedAt,
    timeline: input.note
      ? [...current.timeline, { at: asOf, note: input.note }]
      : current.timeline,
  };
  incidents.set(next.id, next);
  return next;
}

export function listIncidents(): IncidentRecord[] {
  return [...incidents.values()].sort((a, b) =>
    b.openedAt.localeCompare(a.openedAt),
  );
}

export function listOpenIncidents(): IncidentRecord[] {
  return listIncidents().filter(
    (i) => i.status !== "resolved" && i.status !== "postmortem",
  );
}
