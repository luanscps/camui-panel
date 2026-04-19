-- Migration: 20260419_004_remote_commands
-- Comandos remotos do painel para o device Android

CREATE TABLE IF NOT EXISTS remote_commands (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id     UUID         NOT NULL REFERENCES device_activations(id) ON DELETE CASCADE,
  issued_by     UUID         REFERENCES auth.users(id),
  command       TEXT         NOT NULL CHECK (command IN (
                  'start_stream', 'stop_stream',
                  'set_iso', 'set_exposure', 'set_focus',
                  'set_wb', 'set_zoom', 'set_bitrate', 'set_resolution',
                  'toggle_flash', 'toggle_ois', 'switch_camera',
                  'revalidate_license', 'request_status'
                )),
  payload       JSONB,
  status        TEXT         NOT NULL DEFAULT 'pending' CHECK (status IN (
                  'pending', 'delivered', 'executed', 'failed', 'expired'
                )),
  issued_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  delivered_at  TIMESTAMPTZ,
  executed_at   TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW() + INTERVAL '5 minutes',
  result        JSONB,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_remote_commands_pending
  ON remote_commands (device_id, issued_at)
  WHERE status = 'pending';

ALTER TABLE remote_commands ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'remote_commands' AND policyname = 'user_sees_own_commands') THEN
    CREATE POLICY "user_sees_own_commands" ON remote_commands FOR SELECT
      USING (
        device_id IN (
          SELECT da.id FROM device_activations da
          JOIN licenses l ON l.id = da.license_id
          WHERE l.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'remote_commands' AND policyname = 'user_inserts_own_commands') THEN
    CREATE POLICY "user_inserts_own_commands" ON remote_commands FOR INSERT
      WITH CHECK (
        device_id IN (
          SELECT da.id FROM device_activations da
          JOIN licenses l ON l.id = da.license_id
          WHERE l.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'remote_commands' AND policyname = 'service_role_write_commands') THEN
    CREATE POLICY "service_role_write_commands" ON remote_commands FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

COMMENT ON TABLE remote_commands IS 'Fila de comandos remotos enviados do painel para dispositivos Android.';
