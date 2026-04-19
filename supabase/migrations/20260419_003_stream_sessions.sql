-- Migration: 20260419_003_stream_sessions
-- Histórico de sessões de streaming por device

CREATE TABLE IF NOT EXISTS stream_sessions (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id         UUID         NOT NULL REFERENCES device_activations(id) ON DELETE CASCADE,
  license_id        UUID         NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  protocol          TEXT         NOT NULL DEFAULT 'RTMP' CHECK (protocol IN ('RTMP')),
  rtmp_url          TEXT,
  started_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  ended_at          TIMESTAMPTZ,
  duration_seconds  INTEGER GENERATED ALWAYS AS (
                      EXTRACT(EPOCH FROM (ended_at - started_at))::INTEGER
                    ) STORED,
  avg_bitrate_kbps  INTEGER,
  peak_bitrate_kbps INTEGER,
  resolution        TEXT,
  fps               SMALLINT,
  end_reason        TEXT CHECK (end_reason IN (
                      'user_stopped', 'network_error', 'encoder_error',
                      'license_expired', 'device_suspended', 'app_crash', 'unknown'
                    )),
  error_message     TEXT,
  bytes_sent        BIGINT,
  frames_sent       BIGINT,
  frames_dropped    INTEGER,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stream_sessions_device_id  ON stream_sessions (device_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_stream_sessions_license_id ON stream_sessions (license_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_stream_sessions_active     ON stream_sessions (device_id) WHERE ended_at IS NULL;

ALTER TABLE stream_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'stream_sessions' AND policyname = 'user_sees_own_sessions'
  ) THEN
    CREATE POLICY "user_sees_own_sessions" ON stream_sessions FOR SELECT
      USING (license_id IN (SELECT id FROM licenses WHERE user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'stream_sessions' AND policyname = 'service_role_write_sessions'
  ) THEN
    CREATE POLICY "service_role_write_sessions" ON stream_sessions FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

COMMENT ON TABLE stream_sessions IS 'Histórico completo de sessões de streaming por device. Uma linha por sessão iniciada.';
