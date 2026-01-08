-- Add new patient statuses for review system
-- Run this SQL in your Supabase Dashboard > SQL Editor

-- Add new statuses to patient_status enum
BEGIN;
  ALTER TYPE patient_status ADD VALUE IF NOT EXISTS 'REVIEW_1_PENDING';
  ALTER TYPE patient_status ADD VALUE IF NOT EXISTS 'REVIEW_2_PENDING';
  ALTER TYPE patient_status ADD VALUE IF NOT EXISTS 'REVIEW_3_PENDING';
  ALTER TYPE patient_status ADD VALUE IF NOT EXISTS 'REVIEWS_COMPLETED';
  ALTER TYPE patient_status ADD VALUE IF NOT EXISTS 'JOURNEY_COMPLETE';
COMMIT;

-- Verify the changes
SELECT enum_range(NULL::patient_status);
