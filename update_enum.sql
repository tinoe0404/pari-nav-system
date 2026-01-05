-- Run this SQL in your Supabase Dashboard > SQL Editor

-- Disable transaction for enum modification (required for Postgres)
BEGIN;
  -- Add new statuses to the enum type
  ALTER TYPE patient_status ADD VALUE IF NOT EXISTS 'INTAKE_COMPLETED';
  ALTER TYPE patient_status ADD VALUE IF NOT EXISTS 'CONSULTATION_COMPLETED';
COMMIT;

-- Verify the changes
SELECT enum_range(NULL::patient_status);
