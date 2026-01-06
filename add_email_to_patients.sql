-- Add email column to patients table for direct email access
-- This avoids the need to use auth.admin API which can be unreliable

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);

-- Update existing patients with their email from auth.users
-- This is a one-time migration for existing data
UPDATE patients p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id
AND p.email IS NULL;

-- Make email required going forward (after backfill)
-- ALTER TABLE patients ALTER COLUMN email SET NOT NULL;
-- (Commented out - uncomment after verifying all existing patients have emails)
