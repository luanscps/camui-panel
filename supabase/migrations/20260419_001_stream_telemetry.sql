-- Migration: 20260419_001_stream_telemetry
-- Adiciona campos de telemetria operacional de stream ao device

ALTER TABLE device_activations
  ADD COLUMN IF NOT EXISTS streaming_now         BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS current_protocol      TEXT        NOT NULL DEFAULT 'RTMP'
                                                 CHECK (current_protocol IN ('RTMP')),
  ADD COLUMN IF NOT EXISTS last_rtmp_url         TEXT,
  ADD COLUMN IF NOT EXISTS stream_started_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stream_ended_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_stream_error     TEXT,
  ADD COLUMN IF NOT EXISTS last_bitrate_kbps     INTEGER,
  ADD COLUMN IF NOT EXISTS total_stream_seconds  BIGINT      NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stream_session_count  INTEGER     NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_device_activations_streaming_now
  ON device_activations (streaming_now)
  WHERE streaming_now = TRUE;

COMMENT ON COLUMN device_activations.streaming_now        IS 'TRUE se o device está transmitindo agora. Atualizado via heartbeat.';
COMMENT ON COLUMN device_activations.current_protocol     IS 'Protocolo ativo de streaming. Apenas RTMP permitido neste escopo.';
COMMENT ON COLUMN device_activations.last_rtmp_url        IS 'Último endpoint RTMP utilizado pelo device.';
COMMENT ON COLUMN device_activations.stream_started_at    IS 'Início da sessão de streaming atual ou mais recente.';
COMMENT ON COLUMN device_activations.stream_ended_at      IS 'Término da última sessão de streaming.';
COMMENT ON COLUMN device_activations.last_stream_error    IS 'Última mensagem de erro de streaming reportada pelo device.';
COMMENT ON COLUMN device_activations.last_bitrate_kbps    IS 'Último bitrate reportado (kbps).';
COMMENT ON COLUMN device_activations.total_stream_seconds IS 'Total acumulado de segundos transmitidos pelo device.';
COMMENT ON COLUMN device_activations.stream_session_count IS 'Número de sessões de streaming realizadas pelo device.';
