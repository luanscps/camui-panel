-- ================================================================
-- CAMUI Panel — Migration: device_activations campos de fingerprint
-- Execute no Supabase Dashboard → SQL Editor
-- ================================================================

-- 1. Adiciona colunas que podem não existir ainda
--    (IF NOT EXISTS evita erro caso alguma já exista)
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

-- 2. Índice único: impede que o mesmo celular (android_id)
--    seja registrado duas vezes na mesma licença
CREATE UNIQUE INDEX IF NOT EXISTS uq_device_android_id_license
  ON device_activations (license_id, android_id)
  WHERE android_id IS NOT NULL;

-- 3. Índice de busca rápida por fingerprint
CREATE INDEX IF NOT EXISTS idx_device_fingerprint
  ON device_activations (fingerprint)
  WHERE fingerprint IS NOT NULL;

-- 4. Garante que activated_at tem valor padrão
ALTER TABLE device_activations
  ALTER COLUMN activated_at SET DEFAULT NOW();

-- 5. A tabela licenses precisa ter a coluna license_key
--    para o app Android validar. Adiciona se não existir.
ALTER TABLE licenses
  ADD COLUMN IF NOT EXISTS license_key TEXT UNIQUE;

-- 6. RLS — habilita se ainda não estiver
ALTER TABLE device_activations ENABLE ROW LEVEL SECURITY;

-- 7. Policy de leitura: usuário vê apenas seus próprios devices
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

-- 8. Policy de escrita: apenas service_role pode inserir/atualizar
--    (o app Android usa a API route /api/activate que roda com service_role)
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
-- Verificação: rode este SELECT para confirmar as colunas
-- ================================================================
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'device_activations'
-- ORDER BY ordinal_position;
