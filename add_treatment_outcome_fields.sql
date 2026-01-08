-- Add treatment outcome tracking fields to treatment_plans table
-- Run this SQL in your Supabase Dashboard > SQL Editor

ALTER TABLE treatment_plans
ADD COLUMN IF NOT EXISTS is_successful BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS outcome_notes TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS outcome_decided_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS outcome_decided_by UUID REFERENCES auth.users(id);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'treatment_plans'
  AND column_name IN ('is_successful', 'outcome_notes', 'outcome_decided_at', 'outcome_decided_by')
ORDER BY ordinal_position;
