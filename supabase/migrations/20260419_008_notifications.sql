-- Migration: 20260419_008_notifications
-- Notificações internas para o dashboard

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT         NOT NULL CHECK (type IN (
                'device_offline', 'license_expiring', 'stream_error',
                'battery_critical', 'thermal_critical', 'device_activated', 'device_suspended'
              )),
  title       TEXT         NOT NULL,
  body        TEXT,
  device_id   UUID         REFERENCES device_activations(id) ON DELETE SET NULL,
  license_id  UUID         REFERENCES licenses(id) ON DELETE SET NULL,
  read        BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, created_at DESC)
  WHERE read = FALSE;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'user_sees_own_notifications') THEN
    CREATE POLICY "user_sees_own_notifications" ON notifications FOR SELECT
      USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'user_updates_own_notifications') THEN
    CREATE POLICY "user_updates_own_notifications" ON notifications FOR UPDATE
      USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'service_role_write_notifications') THEN
    CREATE POLICY "service_role_write_notifications" ON notifications FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

COMMENT ON TABLE notifications IS 'Notificações internas para alertas do dashboard. Lidas/não-lidas por usuário.';
