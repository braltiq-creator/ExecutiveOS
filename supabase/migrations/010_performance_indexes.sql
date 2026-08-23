-- Performance indexes for production query patterns

CREATE INDEX IF NOT EXISTS idx_executive_memory_user_updated
  ON executive_memory (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_executive_decisions_user_status
  ON executive_decisions (user_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_executive_meetings_user_date
  ON executive_meetings (user_id, meeting_date DESC);

CREATE INDEX IF NOT EXISTS idx_strategic_initiatives_user_status
  ON strategic_initiatives (user_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_organization_members_org_user
  ON organization_members (organization_id, user_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_org_type
  ON knowledge_nodes (organization_id, node_type);

CREATE INDEX IF NOT EXISTS idx_knowledge_edges_org_source
  ON knowledge_edges (organization_id, source_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_edges_org_target
  ON knowledge_edges (organization_id, target_id);

CREATE INDEX IF NOT EXISTS idx_integrations_org_provider
  ON integrations (organization_id, provider_id);

CREATE INDEX IF NOT EXISTS idx_organization_usage_org_period
  ON organization_usage (organization_id, period_start DESC);
