-- Run this SQL in your Supabase Dashboard > SQL Editor

-- Disable transaction for enum modification (required for Postgres)
BEGIN;
  -- Add new status to the enum type
  ALTER TYPE patient_status ADD VALUE IF NOT EXISTS 'TREATMENT_COMPLETED';
COMMIT;

-- Verify the changes
SELECT enum_range(NULL::patient_status);
