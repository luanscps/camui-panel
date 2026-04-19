-- Migration: 20260419_005_audit_log
-- Auditoria de ações administrativas

CREATE TABLE IF NOT EXISTS audit_log (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  performed_by UUID         REFERENCES auth.users(id),
  target_type  TEXT         NOT NULL CHECK (target_type IN ('device', 'license', 'user', 'plan_features')),
  target_id    UUID         NOT NULL,
  action       TEXT         NOT NULL,
  details      JSONB,
  ip_address   INET,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_target       ON audit_log (target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_by ON audit_log (performed_by, created_at DESC);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_log' AND policyname = 'service_role_only') THEN
    CREATE POLICY "service_role_only" ON audit_log FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

COMMENT ON TABLE audit_log IS 'Registro imutável de ações administrativas sobre devices, licenças e usuários.';
