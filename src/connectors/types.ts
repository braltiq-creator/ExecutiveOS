/**
 * Canonical Business Event Model.
 * Every connector maps into this — intelligence never sees vendor models.
 */

export type SourceSystem =
  | "microsoft365"
  | "salesforce"
  | "jira"
  | "simpro"
  | "manual"
  | "mock";

export type CanonicalEntityType =
  | "Outcome"
  | "Decision"
  | "Risk"
  | "Opportunity"
  | "Project"
  | "Meeting"
  | "Action"
  | "Document"
  | "Person"
  | "Team"
  | "Customer"
  | "Signal"
  | "Recommendation"
  | "Metric"
  | "StrategicInitiative"
  | "System";

export type BusinessEventType =
  | "entity_upserted"
  | "status_changed"
  | "risk_raised"
  | "risk_mitigated"
  | "meeting_scheduled"
  | "meeting_updated"
  | "opportunity_moved"
  | "issue_updated"
  | "decision_required"
  | "action_created"
  | "signal_emitted"
  | "relationship_asserted";

export type BusinessRelationship = {
  type: string;
  targetEntityId: string;
  targetEntityType?: CanonicalEntityType;
  weight?: number;
};

export type BusinessEvent = {
  id: string;
  timestamp: string;
  sourceSystem: SourceSystem | string;
  entityType: CanonicalEntityType;
  entityId: string;
  eventType: BusinessEventType | string;
  /** 0–100 executive importance */
  importance: number;
  /** 0–100 source confidence */
  confidence: number;
  relationships: BusinessRelationship[];
  payload: Record<string, unknown>;
  metadata: {
    connectorId: string;
    rawRef?: string;
    labels?: string[];
    [key: string]: unknown;
  };
};

export type ConnectorStatus =
  | "disconnected"
  | "connected"
  | "degraded"
  | "error";

export type ConnectorHealth = {
  connectorId: string;
  system: SourceSystem | string;
  status: ConnectorStatus;
  lastSuccessfulSync: string | null;
  lastAttemptAt: string | null;
  errorCount: number;
  warningCount: number;
  message: string;
};

export type ValidationIssue = {
  level: "error" | "warning";
  code: string;
  message: string;
  path?: string;
};

export type ValidationResult = {
  ok: boolean;
  issues: ValidationIssue[];
};

export type SyncOptions = {
  /** ISO timestamp — only fetch changes since (future incremental) */
  since?: string;
  dryRun?: boolean;
  limit?: number;
};

export type SyncObservability = {
  connectorId: string;
  system: SourceSystem | string;
  startedAt: string;
  finishedAt: string;
  latencyMs: number;
  recordsProcessed: number;
  eventsCreated: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  health: ConnectorHealth;
  lastSuccessfulSync: string | null;
};

export type SyncResult = {
  events: BusinessEvent[];
  observability: SyncObservability;
};
