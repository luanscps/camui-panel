-- Migration: 20260419_006_fleet_view
-- View consolidada de frota para o dashboard operacional

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
  CASE WHEN da.last_seen_at > NOW() - INTERVAL '5 minutes' THEN TRUE ELSE FALSE END AS is_online,
  CASE WHEN da.battery_level IS NOT NULL AND da.battery_level < 20 AND da.is_charging = FALSE THEN TRUE ELSE FALSE END AS battery_critical,
  CASE WHEN da.thermal_state IN ('serious', 'critical', 'emergency') THEN TRUE ELSE FALSE END AS thermal_critical,
  (
    SELECT COUNT(*) FROM stream_sessions ss
    WHERE ss.device_id = da.id AND ss.started_at > NOW() - INTERVAL '24 hours'
  ) AS sessions_last_24h,
  (
    SELECT COALESCE(SUM(ss.duration_seconds), 0) FROM stream_sessions ss
    WHERE ss.device_id = da.id AND ss.started_at > NOW() - INTERVAL '24 hours'
  ) AS stream_seconds_last_24h
FROM device_activations da
JOIN licenses l ON l.id = da.license_id;

COMMENT ON VIEW fleet_dashboard IS 'View consolidada de frota para o dashboard operacional. Não usar em queries de escrita.';
