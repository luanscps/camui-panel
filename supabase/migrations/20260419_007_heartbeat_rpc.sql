-- Migration: 20260419_007_heartbeat_rpc
-- RPC de heartbeat: atualiza telemetria em uma única chamada segura

CREATE OR REPLACE FUNCTION device_heartbeat(
  p_sub_license_key   TEXT,
  p_streaming_now     BOOLEAN  DEFAULT FALSE,
  p_rtmp_url          TEXT     DEFAULT NULL,
  p_bitrate_kbps      INTEGER  DEFAULT NULL,
  p_battery_level     SMALLINT DEFAULT NULL,
  p_is_charging       BOOLEAN  DEFAULT NULL,
  p_thermal_state     TEXT     DEFAULT NULL,
  p_network_type      TEXT     DEFAULT NULL,
  p_network_strength  SMALLINT DEFAULT NULL,
  p_stream_error      TEXT     DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_device_id      UUID;
  v_license_id     UUID;
  v_device_status  TEXT;
  v_lic_status     TEXT;
  v_expires_at     TIMESTAMPTZ;
BEGIN
  SELECT da.id, da.license_id, da.status, l.status, l.expires_at
  INTO v_device_id, v_license_id, v_device_status, v_lic_status, v_expires_at
  FROM device_activations da
  JOIN licenses l ON l.id = da.license_id
  WHERE da.sub_license_key = p_sub_license_key
  LIMIT 1;

  IF v_device_id IS NULL   THEN RETURN jsonb_build_object('ok', FALSE, 'reason', 'device_not_found'); END IF;
  IF v_device_status != 'ACTIVE' THEN RETURN jsonb_build_object('ok', FALSE, 'reason', 'device_suspended'); END IF;
  IF v_lic_status != 'ACTIVE' OR v_expires_at < NOW() THEN RETURN jsonb_build_object('ok', FALSE, 'reason', 'license_expired'); END IF;

  UPDATE device_activations SET
    last_seen_at      = NOW(),
    streaming_now     = p_streaming_now,
    last_rtmp_url     = COALESCE(p_rtmp_url,         last_rtmp_url),
    last_bitrate_kbps = COALESCE(p_bitrate_kbps,     last_bitrate_kbps),
    battery_level     = COALESCE(p_battery_level,    battery_level),
    is_charging       = COALESCE(p_is_charging,      is_charging),
    thermal_state     = COALESCE(p_thermal_state,    thermal_state),
    network_type      = COALESCE(p_network_type,     network_type),
    network_strength  = COALESCE(p_network_strength, network_strength),
    last_stream_error = CASE WHEN p_stream_error IS NOT NULL THEN p_stream_error ELSE last_stream_error END
  WHERE id = v_device_id;

  RETURN jsonb_build_object('ok', TRUE, 'device_id', v_device_id);
END;
$$;

COMMENT ON FUNCTION device_heartbeat IS 'RPC segura para o app Android reportar estado operacional periodicamente.';
