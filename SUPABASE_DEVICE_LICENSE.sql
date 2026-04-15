-- ================================================================
-- CAMUI Panel — Sub-licença por dispositivo
-- Adiciona license_key e status em device_activations
-- Execute no Supabase Dashboard → SQL Editor
-- ================================================================

-- 1. Adiciona colunas de sub-licença
ALTER TABLE device_activations
  ADD COLUMN IF NOT EXISTS sub_license_key TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS status          TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'SUSPENDED', 'REVOKED'));

-- 2. Índice para busca por sub_license_key
CREATE UNIQUE INDEX IF NOT EXISTS uq_sub_license_key
  ON device_activations (sub_license_key)
  WHERE sub_license_key IS NOT NULL;

-- 3. Índice para filtrar por status
CREATE INDEX IF NOT EXISTS idx_device_status
  ON device_activations (status);

-- 4. Gera sub_license_key para devices existentes que ainda não têm
UPDATE device_activations
SET sub_license_key = 'CAMUI-'
  || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 4))
  || '-'
  || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 4))
  || '-'
  || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 4))
  || '-'
  || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 4))
WHERE sub_license_key IS NULL;

-- 5. Verificação
-- SELECT id, device_name, sub_license_key, status FROM device_activations;
