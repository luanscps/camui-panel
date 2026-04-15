-- ================================================================
-- CAMUI Panel — Migration: colunas de dispositivo + sub-licença
-- Garante que TODAS as colunas necessárias existem.
-- Execute no Supabase Dashboard → SQL Editor
-- ================================================================

-- 1. Colunas de fingerprint / info do dispositivo
ALTER TABLE device_activations
  ADD COLUMN IF NOT EXISTS device_name      TEXT,
  ADD COLUMN IF NOT EXISTS device_brand     TEXT,
  ADD COLUMN IF NOT EXISTS device_model     TEXT,
  ADD COLUMN IF NOT EXISTS device_hardware  TEXT,
  ADD COLUMN IF NOT EXISTS android_version  TEXT,
  ADD COLUMN IF NOT EXISTS sdk_int          INTEGER,
  ADD COLUMN IF NOT EXISTS android_id       TEXT,
  ADD COLUMN IF NOT EXISTS app_version      TEXT,
  ADD COLUMN IF NOT EXISTS fingerprint      TEXT,
  ADD COLUMN IF NOT EXISTS last_seen        TIMESTAMPTZ DEFAULT NOW();

-- 2. Colunas de sub-licença por dispositivo
ALTER TABLE device_activations
  ADD COLUMN IF NOT EXISTS sub_license_key  TEXT,
  ADD COLUMN IF NOT EXISTS status           TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'SUSPENDED', 'REVOKED'));

-- 3. Índice único: mesmo celular não pode ativar 2x na mesma licença
CREATE UNIQUE INDEX IF NOT EXISTS uq_device_android_id_license
  ON device_activations (license_id, android_id)
  WHERE android_id IS NOT NULL;

-- 4. Índice único para sub_license_key
CREATE UNIQUE INDEX IF NOT EXISTS uq_sub_license_key
  ON device_activations (sub_license_key)
  WHERE sub_license_key IS NOT NULL;

-- 5. Índice para busca por status
CREATE INDEX IF NOT EXISTS idx_device_status
  ON device_activations (status);

-- 6. Índice para busca por fingerprint
CREATE INDEX IF NOT EXISTS idx_device_fingerprint
  ON device_activations (fingerprint)
  WHERE fingerprint IS NOT NULL;

-- 7. Garante activated_at com default
ALTER TABLE device_activations
  ALTER COLUMN activated_at SET DEFAULT NOW();

-- 8. Gera sub_license_key para devices existentes sem uma
UPDATE device_activations
SET sub_license_key = 'CAMUI-'
  || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 4)) || '-'
  || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 4)) || '-'
  || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 4)) || '-'
  || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 4))
WHERE sub_license_key IS NULL;

-- 9. A tabela licenses precisa ter license_key
ALTER TABLE licenses
  ADD COLUMN IF NOT EXISTS license_key TEXT UNIQUE;

-- 10. RLS — habilita se não estiver
ALTER TABLE device_activations ENABLE ROW LEVEL SECURITY;

-- 11. Policy de leitura: usuário vê apenas seus próprios devices
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'device_activations'
    AND policyname  = 'user_sees_own_devices'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY user_sees_own_devices
        ON device_activations
        FOR SELECT
        USING (
          license_id IN (
            SELECT id FROM licenses WHERE user_id = auth.uid()
          )
        )
    $policy$;
  END IF;
END $$;

-- 12. Policy de escrita: apenas service_role (API route do Next.js)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'device_activations'
    AND policyname  = 'service_role_write_devices'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY service_role_write_devices
        ON device_activations
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true)
    $policy$;
  END IF;
END $$;

-- ================================================================
-- Verificação: confirma as colunas criadas
-- ================================================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'device_activations'
ORDER BY ordinal_position;
