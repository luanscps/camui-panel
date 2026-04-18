# Migrations SQL — CAMUI Dashboard Avançado

> Migrations cumulativas e ordenadas para evoluir o banco Supabase além da base atual.
> Aplicar em sequência. Compatíveis com PostgreSQL 15+ / Supabase.
> Escopo: telemetria de stream, observabilidade de frota, comandos remotos e auditoria.

---

## Como aplicar

```bash
# Via Supabase CLI (recomendado)
supabase db push

# Via SQL Editor no Dashboard Supabase
# Copiar e executar cada migration individualmente na ordem indicada
```

---

## Migration 001 — Telemetria operacional de stream

Adiciona campos de observabilidade de streaming em `device_activations`.

```sql
-- Migration: 20260418_001_stream_telemetry
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

-- Índice para query de devices em streaming agora
CREATE INDEX IF NOT EXISTS idx_device_activations_streaming_now
  ON device_activations (streaming_now)
  WHERE streaming_now = TRUE;

-- Comentários descritivos
COMMENT ON COLUMN device_activations.streaming_now
  IS 'TRUE se o device está transmitindo agora. Atualizado via heartbeat.';

COMMENT ON COLUMN device_activations.current_protocol
  IS 'Protocolo ativo de streaming. Apenas RTMP permitido neste escopo.';

COMMENT ON COLUMN device_activations.last_rtmp_url
  IS 'Último endpoint RTMP utilizado pelo device.';

COMMENT ON COLUMN device_activations.stream_started_at
  IS 'Início da sessão de streaming atual ou mais recente.';

COMMENT ON COLUMN device_activations.stream_ended_at
  IS 'Término da última sessão de streaming.';

COMMENT ON COLUMN device_activations.last_stream_error
  IS 'Última mensagem de erro de streaming reportada pelo device.';

COMMENT ON COLUMN device_activations.last_bitrate_kbps
  IS 'Último bitrate reportado (kbps).';

COMMENT ON COLUMN device_activations.total_stream_seconds
  IS 'Total acumulado de segundos transmitidos pelo device.';

COMMENT ON COLUMN device_activations.stream_session_count
  IS 'Número de sessões de streaming realizadas pelo device.';
```

---

## Migration 002 — Saúde do device e informações de rede

Adiciona campos de saúde do aparelho, versão do build e informações de conectividade.

```sql
-- Migration: 20260418_002_device_health
-- Saúde do device, build, rede e termais

ALTER TABLE device_activations
  ADD COLUMN IF NOT EXISTS app_build_number   INTEGER,
  ADD COLUMN IF NOT EXISTS battery_level      SMALLINT
                                              CHECK (battery_level BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS is_charging        BOOLEAN,
  ADD COLUMN IF NOT EXISTS thermal_state      TEXT
                                              CHECK (thermal_state IN (
                                                'nominal', 'fair', 'serious', 'critical', 'emergency', 'shutdown'
                                              )),
  ADD COLUMN IF NOT EXISTS network_type       TEXT
                                              CHECK (network_type IN (
                                                'wifi', '5g', '4g', '3g', 'ethernet', 'unknown'
                                              )),
  ADD COLUMN IF NOT EXISTS network_strength   SMALLINT
                                              CHECK (network_strength BETWEEN 0 AND 4),
  ADD COLUMN IF NOT EXISTS camera_summary     JSONB;

-- Índice para filtro por saúde térmica crítica
CREATE INDEX IF NOT EXISTS idx_device_activations_thermal
  ON device_activations (thermal_state)
  WHERE thermal_state IN ('serious', 'critical', 'emergency');

-- Índice para filtro por nível de bateria baixo
CREATE INDEX IF NOT EXISTS idx_device_activations_battery_low
  ON device_activations (battery_level)
  WHERE battery_level IS NOT NULL AND battery_level < 20;

COMMENT ON COLUMN device_activations.app_build_number
  IS 'Build number da versão do app instalada no device.';

COMMENT ON COLUMN device_activations.battery_level
  IS 'Nível atual de bateria de 0 a 100.';

COMMENT ON COLUMN device_activations.thermal_state
  IS 'Estado térmico atual do dispositivo reportado pelo ThermalManager.';

COMMENT ON COLUMN device_activations.network_type
  IS 'Tipo de conexão ativa no momento do último heartbeat.';

COMMENT ON COLUMN device_activations.camera_summary
  IS 'Resumo das câmeras disponíveis no device, indexado de cameras[].';
```

---

## Migration 003 — Histórico de sessões de streaming

Tabela separada para histórico completo de sessões de stream por device.

```sql
-- Migration: 20260418_003_stream_sessions
-- Histórico de sessões de streaming por device

CREATE TABLE IF NOT EXISTS stream_sessions (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id       UUID          NOT NULL REFERENCES device_activations(id) ON DELETE CASCADE,
  license_id      UUID          NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,

  protocol        TEXT          NOT NULL DEFAULT 'RTMP'
                                CHECK (protocol IN ('RTMP')),
  rtmp_url        TEXT,

  started_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  ended_at        TIMESTAMPTZ,
  duration_seconds INTEGER      GENERATED ALWAYS AS (
                    EXTRACT(EPOCH FROM (ended_at - started_at))::INTEGER
                  ) STORED,

  avg_bitrate_kbps INTEGER,
  peak_bitrate_kbps INTEGER,
  resolution      TEXT,
  fps             SMALLINT,

  end_reason      TEXT          CHECK (end_reason IN (
                    'user_stopped', 'network_error', 'encoder_error',
                    'license_expired', 'device_suspended', 'app_crash', 'unknown'
                  )),
  error_message   TEXT,

  bytes_sent      BIGINT,
  frames_sent     BIGINT,
  frames_dropped  INTEGER,

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Índices operacionais
CREATE INDEX IF NOT EXISTS idx_stream_sessions_device_id
  ON stream_sessions (device_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_stream_sessions_license_id
  ON stream_sessions (license_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_stream_sessions_active
  ON stream_sessions (device_id)
  WHERE ended_at IS NULL;

-- RLS
ALTER TABLE stream_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_sees_own_sessions"
  ON stream_sessions FOR SELECT
  USING (
    license_id IN (
      SELECT id FROM licenses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "service_role_write_sessions"
  ON stream_sessions FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE stream_sessions
  IS 'Histórico completo de sessões de streaming por device. Uma linha por sessão iniciada.';
```

---

## Migration 004 — Fila de comandos remotos

Tabela para comandos remotos enviados do painel para o device.

```sql
-- Migration: 20260418_004_remote_commands
-- Comandos remotos do painel para o device Android

CREATE TABLE IF NOT EXISTS remote_commands (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id     UUID          NOT NULL REFERENCES device_activations(id) ON DELETE CASCADE,
  issued_by     UUID          REFERENCES auth.users(id),

  command       TEXT          NOT NULL CHECK (command IN (
                  'start_stream', 'stop_stream',
                  'set_iso', 'set_exposure', 'set_focus',
                  'set_wb', 'set_zoom', 'set_bitrate', 'set_resolution',
                  'toggle_flash', 'toggle_ois', 'switch_camera',
                  'revalidate_license', 'request_status'
                )),
  payload       JSONB,

  status        TEXT          NOT NULL DEFAULT 'pending'
                              CHECK (status IN (
                                'pending', 'delivered', 'executed', 'failed', 'expired'
                              )),

  issued_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  delivered_at  TIMESTAMPTZ,
  executed_at   TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW() + INTERVAL '5 minutes',

  result        JSONB,
  error_message TEXT
);

-- Índice para polling de comandos pendentes pelo device
CREATE INDEX IF NOT EXISTS idx_remote_commands_pending
  ON remote_commands (device_id, issued_at)
  WHERE status = 'pending';

-- Auto-expirar comandos pendentes vencidos (via pg_cron ou background job)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('expire-remote-commands', '* * * * *',
--   'UPDATE remote_commands SET status = ''expired''
--    WHERE status = ''pending'' AND expires_at < NOW()');

-- RLS
ALTER TABLE remote_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_sees_own_commands"
  ON remote_commands FOR SELECT
  USING (
    device_id IN (
      SELECT da.id FROM device_activations da
      JOIN licenses l ON l.id = da.license_id
      WHERE l.user_id = auth.uid()
    )
  );

CREATE POLICY "user_inserts_own_commands"
  ON remote_commands FOR INSERT
  WITH CHECK (
    device_id IN (
      SELECT da.id FROM device_activations da
      JOIN licenses l ON l.id = da.license_id
      WHERE l.user_id = auth.uid()
    )
  );

CREATE POLICY "service_role_write_commands"
  ON remote_commands FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE remote_commands
  IS 'Fila de comandos remotos enviados do painel para dispositivos Android.';
```

---

## Migration 005 — Log de auditoria

Tabela de auditoria para ações administrativas sobre devices e licenças.

```sql
-- Migration: 20260418_005_audit_log
-- Auditoria de ações administrativas

CREATE TABLE IF NOT EXISTS audit_log (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  performed_by UUID          REFERENCES auth.users(id),
  target_type  TEXT          NOT NULL CHECK (target_type IN (
                 'device', 'license', 'user', 'plan_features'
               )),
  target_id    UUID          NOT NULL,
  action       TEXT          NOT NULL,
  details      JSONB,
  ip_address   INET,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_target
  ON audit_log (target_type, target_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_performed_by
  ON audit_log (performed_by, created_at DESC);

-- RLS: somente admins via service_role
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_only"
  ON audit_log FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE audit_log
  IS 'Registro imutável de ações administrativas sobre devices, licenças e usuários.';
```

---

## Migration 006 — View materializada de frota

View para o dashboard de operações com dados agregados por device.

```sql
-- Migration: 20260418_006_fleet_dashboard_view
-- View para o console de operações de frota

CREATE OR REPLACE VIEW fleet_dashboard AS
SELECT
  da.id                           AS device_id,
  da.license_id,
  l.user_id,
  l.plan,
  l.status                        AS license_status,
  l.expires_at,

  da.device_name,
  da.device_brand,
  da.device_model,
  da.android_version,
  da.app_version,
  da.app_build_number,
  da.status                       AS device_status,
  da.sub_license_key,

  da.streaming_now,
  da.current_protocol,
  da.last_rtmp_url,
  da.stream_started_at,
  da.last_bitrate_kbps,
  da.last_stream_error,
  da.total_stream_seconds,
  da.stream_session_count,

  da.battery_level,
  da.is_charging,
  da.thermal_state,
  da.network_type,
  da.network_strength,

  da.last_seen_at,
  da.activated_at,
  da.phone_image_url,
  da.phone_specs,
  da.cameras,
  da.camera_summary,

  -- Indicadores calculados
  CASE
    WHEN da.last_seen_at > NOW() - INTERVAL '5 minutes' THEN TRUE
    ELSE FALSE
  END                             AS is_online,

  CASE
    WHEN da.battery_level IS NOT NULL AND da.battery_level < 20
         AND da.is_charging = FALSE THEN TRUE
    ELSE FALSE
  END                             AS battery_critical,

  CASE
    WHEN da.thermal_state IN ('serious', 'critical', 'emergency') THEN TRUE
    ELSE FALSE
  END                             AS thermal_critical,

  -- Sessões recentes (últimas 24h)
  (
    SELECT COUNT(*) FROM stream_sessions ss
    WHERE ss.device_id = da.id
      AND ss.started_at > NOW() - INTERVAL '24 hours'
  )                               AS sessions_last_24h,

  -- Duração total streaming hoje
  (
    SELECT COALESCE(SUM(ss.duration_seconds), 0)
    FROM stream_sessions ss
    WHERE ss.device_id = da.id
      AND ss.started_at > NOW() - INTERVAL '24 hours'
  )                               AS stream_seconds_last_24h

FROM device_activations da
JOIN licenses l ON l.id = da.license_id;

COMMENT ON VIEW fleet_dashboard
  IS 'View consolidada de frota para o dashboard operacional. Não usar em queries de escrita.';
```

---

## Migration 007 — Função de heartbeat

Função RPC para o app Android reportar estado em uma única chamada.

```sql
-- Migration: 20260418_007_heartbeat_rpc
-- RPC de heartbeat: atualiza telemetria em uma única chamada segura

CREATE OR REPLACE FUNCTION device_heartbeat(
  p_sub_license_key   TEXT,
  p_streaming_now     BOOLEAN         DEFAULT FALSE,
  p_rtmp_url          TEXT            DEFAULT NULL,
  p_bitrate_kbps      INTEGER         DEFAULT NULL,
  p_battery_level     SMALLINT        DEFAULT NULL,
  p_is_charging       BOOLEAN         DEFAULT NULL,
  p_thermal_state     TEXT            DEFAULT NULL,
  p_network_type      TEXT            DEFAULT NULL,
  p_network_strength  SMALLINT        DEFAULT NULL,
  p_stream_error      TEXT            DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_device_id UUID;
  v_license_id UUID;
  v_device_status TEXT;
  v_license_status TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Localizar device pela sub-licença
  SELECT da.id, da.license_id, da.status, l.status, l.expires_at
  INTO v_device_id, v_license_id, v_device_status, v_license_status, v_expires_at
  FROM device_activations da
  JOIN licenses l ON l.id = da.license_id
  WHERE da.sub_license_key = p_sub_license_key
  LIMIT 1;

  IF v_device_id IS NULL THEN
    RETURN jsonb_build_object('ok', FALSE, 'reason', 'device_not_found');
  END IF;

  IF v_device_status != 'ACTIVE' THEN
    RETURN jsonb_build_object('ok', FALSE, 'reason', 'device_suspended');
  END IF;

  IF v_license_status != 'ACTIVE' OR v_expires_at < NOW() THEN
    RETURN jsonb_build_object('ok', FALSE, 'reason', 'license_expired');
  END IF;

  -- Atualizar telemetria
  UPDATE device_activations SET
    last_seen_at      = NOW(),
    streaming_now     = p_streaming_now,
    last_rtmp_url     = COALESCE(p_rtmp_url, last_rtmp_url),
    last_bitrate_kbps = COALESCE(p_bitrate_kbps, last_bitrate_kbps),
    battery_level     = COALESCE(p_battery_level, battery_level),
    is_charging       = COALESCE(p_is_charging, is_charging),
    thermal_state     = COALESCE(p_thermal_state, thermal_state),
    network_type      = COALESCE(p_network_type, network_type),
    network_strength  = COALESCE(p_network_strength, network_strength),
    last_stream_error = CASE WHEN p_stream_error IS NOT NULL THEN p_stream_error ELSE last_stream_error END
  WHERE id = v_device_id;

  RETURN jsonb_build_object('ok', TRUE, 'device_id', v_device_id);
END;
$$;

COMMENT ON FUNCTION device_heartbeat
  IS 'RPC segura para o app Android reportar estado operacional periodicamente.';
```

---

## Migration 008 — Notificações do sistema

Tabela de notificações para alertas no dashboard (bateria crítica, erros, expiração).

```sql
-- Migration: 20260418_008_notifications
-- Notificações internas para o dashboard

CREATE TABLE IF NOT EXISTS notifications (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         TEXT          NOT NULL CHECK (type IN (
                 'device_offline', 'license_expiring', 'stream_error',
                 'battery_critical', 'thermal_critical', 'device_activated',
                 'device_suspended'
               )),
  title        TEXT          NOT NULL,
  body         TEXT,
  device_id    UUID          REFERENCES device_activations(id) ON DELETE SET NULL,
  license_id   UUID          REFERENCES licenses(id) ON DELETE SET NULL,
  read         BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, created_at DESC)
  WHERE read = FALSE;

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_sees_own_notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_updates_own_notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "service_role_write_notifications"
  ON notifications FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE notifications
  IS 'Notificações internas para alertas do dashboard. Lidas/não-lidas por usuário.';
```

---

## Resumo das migrations

| # | Nome | Tabela / Objeto afetado | Finalidade |
|---|---|---|---|
| 001 | stream_telemetry | `device_activations` | Campos de streaming em tempo real |
| 002 | device_health | `device_activations` | Saúde, bateria, rede, build |
| 003 | stream_sessions | `stream_sessions` (nova) | Histórico de sessões de streaming |
| 004 | remote_commands | `remote_commands` (nova) | Fila de comandos remotos |
| 005 | audit_log | `audit_log` (nova) | Auditoria de ações administrativas |
| 006 | fleet_dashboard_view | `fleet_dashboard` (view) | View consolidada para operações |
| 007 | heartbeat_rpc | `device_heartbeat()` (fn) | RPC de heartbeat do device |
| 008 | notifications | `notifications` (nova) | Alertas e notificações do dashboard |

---

## Payload de heartbeat — Android

O app deve chamar `device_heartbeat` a cada **30–60 segundos** durante operação:

```kotlin
// Chamada Supabase via RPC
supabase.rpc("device_heartbeat", mapOf(
  "p_sub_license_key"  to subLicenseKey,
  "p_streaming_now"    to streamingService.isStreaming,
  "p_rtmp_url"         to streamingService.currentRtmpUrl,
  "p_bitrate_kbps"     to streamingService.currentBitrate,
  "p_battery_level"    to batteryManager.level,
  "p_is_charging"      to batteryManager.isCharging,
  "p_thermal_state"    to thermalManager.currentThermalStatus.name.lowercase(),
  "p_network_type"     to connectivityManager.activeNetworkType,
  "p_stream_error"     to streamingService.lastError
))
```

---

## Índices completos adicionados

```sql
-- Resumo de todos os índices criados neste conjunto de migrations
-- device_activations
idx_device_activations_streaming_now   → WHERE streaming_now = TRUE
idx_device_activations_thermal         → WHERE thermal_state crítico
idx_device_activations_battery_low     → WHERE battery_level < 20

-- stream_sessions
idx_stream_sessions_device_id          → device_id, started_at DESC
idx_stream_sessions_license_id         → license_id, started_at DESC
idx_stream_sessions_active             → WHERE ended_at IS NULL

-- remote_commands
idx_remote_commands_pending            → device_id, issued_at WHERE status = pending

-- audit_log
idx_audit_log_target                   → target_type, target_id, created_at DESC
idx_audit_log_performed_by             → performed_by, created_at DESC

-- notifications
idx_notifications_user_unread          → user_id, created_at DESC WHERE read = FALSE
```
