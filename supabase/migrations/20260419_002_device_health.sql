-- Migration: 20260419_002_device_health
-- Saúde do device, build, rede e termais

ALTER TABLE device_activations
  ADD COLUMN IF NOT EXISTS app_build_number   INTEGER,
  ADD COLUMN IF NOT EXISTS battery_level      SMALLINT CHECK (battery_level BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS is_charging        BOOLEAN,
  ADD COLUMN IF NOT EXISTS thermal_state      TEXT CHECK (thermal_state IN (
                                                'nominal', 'fair', 'serious', 'critical', 'emergency', 'shutdown'
                                              )),
  ADD COLUMN IF NOT EXISTS network_type       TEXT CHECK (network_type IN (
                                                'wifi', '5g', '4g', '3g', 'ethernet', 'unknown'
                                              )),
  ADD COLUMN IF NOT EXISTS network_strength   SMALLINT CHECK (network_strength BETWEEN 0 AND 4),
  ADD COLUMN IF NOT EXISTS camera_summary     JSONB;

CREATE INDEX IF NOT EXISTS idx_device_activations_thermal
  ON device_activations (thermal_state)
  WHERE thermal_state IN ('serious', 'critical', 'emergency');

CREATE INDEX IF NOT EXISTS idx_device_activations_battery_low
  ON device_activations (battery_level)
  WHERE battery_level IS NOT NULL AND battery_level < 20;

COMMENT ON COLUMN device_activations.app_build_number IS 'Build number da versão do app instalada no device.';
COMMENT ON COLUMN device_activations.battery_level    IS 'Nível atual de bateria de 0 a 100.';
COMMENT ON COLUMN device_activations.thermal_state    IS 'Estado térmico atual do dispositivo reportado pelo ThermalManager.';
COMMENT ON COLUMN device_activations.network_type     IS 'Tipo de conexão ativa no momento do último heartbeat.';
COMMENT ON COLUMN device_activations.camera_summary   IS 'Resumo das câmeras disponíveis no device, indexado de cameras[].';
