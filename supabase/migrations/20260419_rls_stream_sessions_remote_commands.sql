-- =============================================================================
-- Migration: RLS policies for stream_sessions and remote_commands
-- Context : Required for client-side Supabase (anon key) queries to work
--           in FleetDeviceTimeline and RemoteCommandPanel.
--           Authenticated users see/manage only data from devices bound
--           to their own license.
-- =============================================================================

-- Enable RLS on both tables (safe to re-run)
ALTER TABLE stream_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_commands  ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- stream_sessions — SELECT
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'stream_sessions'
      AND policyname = 'user_sees_own_device_sessions'
  ) THEN
    CREATE POLICY user_sees_own_device_sessions
    ON stream_sessions
    FOR SELECT
    TO authenticated
    USING (
      device_id IN (
        SELECT da.id
        FROM   device_activations da
        JOIN   licenses l ON l.id = da.license_id
        WHERE  l.user_id = auth.uid()
      )
    );
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- remote_commands — ALL (SELECT + INSERT + UPDATE + DELETE)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'remote_commands'
      AND policyname = 'user_manages_own_device_commands'
  ) THEN
    CREATE POLICY user_manages_own_device_commands
    ON remote_commands
    FOR ALL
    TO authenticated
    USING (
      device_id IN (
        SELECT da.id
        FROM   device_activations da
        JOIN   licenses l ON l.id = da.license_id
        WHERE  l.user_id = auth.uid()
      )
    )
    WITH CHECK (
      device_id IN (
        SELECT da.id
        FROM   device_activations da
        JOIN   licenses l ON l.id = da.license_id
        WHERE  l.user_id = auth.uid()
      )
    );
  END IF;
END;
$$;
