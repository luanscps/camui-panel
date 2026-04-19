-- Migration: 20260419_009_rls_review
-- Revisão e hardening de RLS nas tabelas core
-- Garante que todas as tabelas sensíveis têm RLS ativo e políticas corretas
-- Idempotente: usa DO $$ BEGIN ... IF NOT EXISTS ... END $$

-- ─── licenses ────────────────────────────────────────────────────────────────
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- Usuário vê somente sua própria licença
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'licenses' AND policyname = 'user_sees_own_license') THEN
    CREATE POLICY "user_sees_own_license" ON licenses FOR SELECT
      USING (user_id = auth.uid());
  END IF;
END $$;

-- service_role pode tudo (usado pelos Route Handlers com SUPABASE_SERVICE_ROLE_KEY)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'licenses' AND policyname = 'service_role_all_licenses') THEN
    CREATE POLICY "service_role_all_licenses" ON licenses FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ─── device_activations ───────────────────────────────────────────────────────
ALTER TABLE device_activations ENABLE ROW LEVEL SECURITY;

-- Usuário vê somente devices vinculados à sua licença
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'device_activations' AND policyname = 'user_sees_own_devices') THEN
    CREATE POLICY "user_sees_own_devices" ON device_activations FOR SELECT
      USING (
        license_id IN (SELECT id FROM licenses WHERE user_id = auth.uid())
      );
  END IF;
END $$;

-- service_role pode tudo (ativação, heartbeat, actions)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'device_activations' AND policyname = 'service_role_all_devices') THEN
    CREATE POLICY "service_role_all_devices" ON device_activations FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ─── plan_features ────────────────────────────────────────────────────────────
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ler plan_features (dados não sensíveis)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'plan_features' AND policyname = 'authenticated_read_plan_features') THEN
    CREATE POLICY "authenticated_read_plan_features" ON plan_features FOR SELECT
      USING (auth.role() IN ('authenticated', 'service_role'));
  END IF;
END $$;

-- Apenas service_role pode escrever em plan_features
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'plan_features' AND policyname = 'service_role_write_plan_features') THEN
    CREATE POLICY "service_role_write_plan_features" ON plan_features FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ─── Verificação final (log no psql) ──────────────────────────────────────────
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN VALUES ('licenses'), ('device_activations'), ('plan_features'),
                  ('stream_sessions'), ('remote_commands'), ('audit_log'), ('notifications')
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = t AND c.relrowsecurity = TRUE AND n.nspname = 'public'
    ) THEN
      RAISE WARNING 'RLS NÃO ATIVO na tabela: %', t;
    ELSE
      RAISE NOTICE 'RLS OK: %', t;
    END IF;
  END LOOP;
END $$;
