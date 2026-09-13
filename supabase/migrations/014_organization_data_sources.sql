-- Phase 37 addendum — Manual weekly data ingestion (first-class)
-- Connection ≠ Data Source ≠ Evidence
-- Manual uploads do NOT require a Connection record.

CREATE TABLE IF NOT EXISTS public.organization_data_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name text NOT NULL,
  source_type text NOT NULL DEFAULT 'workbook_export',
  provider text,
  ingestion_method text NOT NULL DEFAULT 'USER_UPLOAD'
    CHECK (ingestion_method IN ('USER_UPLOAD', 'API', 'CONNECTOR', 'FILE_DROP')),
  expected_cadence text
    CHECK (
      expected_cadence IS NULL
      OR expected_cadence IN ('DAILY', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY', 'AD_HOC')
    ),
  schema_version text,
  schema_fingerprint text,
  mapping_definition jsonb NOT NULL DEFAULT '{}'::jsonb,
  health_status text NOT NULL DEFAULT 'unknown'
    CHECK (health_status IN ('unknown', 'healthy', 'degraded', 'unhealthy')),
  last_received_at timestamptz,
  last_validated_at timestamptz,
  last_snapshot_at timestamptz,
  last_snapshot_id text,
  previous_snapshot_id text,
  connection_id uuid REFERENCES public.organization_integrations (id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

CREATE INDEX IF NOT EXISTS organization_data_sources_org_idx
  ON public.organization_data_sources (organization_id);

ALTER TABLE public.organization_evidence
  ADD COLUMN IF NOT EXISTS data_source_id uuid
    REFERENCES public.organization_data_sources (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS organization_evidence_data_source_idx
  ON public.organization_evidence (organization_id, data_source_id);

ALTER TABLE public.organization_data_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organization_data_sources_select_member" ON public.organization_data_sources;
CREATE POLICY "organization_data_sources_select_member"
  ON public.organization_data_sources
  FOR SELECT
  TO authenticated
  USING (public.is_active_organization_member(organization_id));

DROP POLICY IF EXISTS "organization_data_sources_insert_member" ON public.organization_data_sources;
CREATE POLICY "organization_data_sources_insert_member"
  ON public.organization_data_sources
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_active_organization_member(organization_id));

DROP POLICY IF EXISTS "organization_data_sources_update_member" ON public.organization_data_sources;
CREATE POLICY "organization_data_sources_update_member"
  ON public.organization_data_sources
  FOR UPDATE
  TO authenticated
  USING (public.is_active_organization_member(organization_id))
  WITH CHECK (public.is_active_organization_member(organization_id));

COMMENT ON TABLE public.organization_data_sources IS
  'Logical business data sources. Manual USER_UPLOAD sources do not require a Connection.';
