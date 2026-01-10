-- ==============================================
-- RESET & CLEAN RLS POLICIES FOR PATIENTS
-- ==============================================
-- Run this script to remove duplicate policies and establish clear permissions.

-- 1. DROP ALL EXISTING POLICIES (Cleaning up clutter)
DROP POLICY IF EXISTS "Admins can view all patients" ON patients;
DROP POLICY IF EXISTS "Admins can update all patients" ON patients;
DROP POLICY IF EXISTS "Admins can insert patients" ON patients;
DROP POLICY IF EXISTS "Users can view their own patient data" ON patients;
DROP POLICY IF EXISTS "Users can update their own patient data" ON patients;
DROP POLICY IF EXISTS "Users can insert their own patient record" ON patients;
DROP POLICY IF EXISTS "enable_read_all_patients_for_admins" ON patients;
DROP POLICY IF EXISTS "enable_update_all_patients_for_admins" ON patients;
DROP POLICY IF EXISTS "enable_read_own_patient" ON patients;
DROP POLICY IF EXISTS "enable_update_own_patient" ON patients;
DROP POLICY IF EXISTS "enable_insert_own_patient" ON patients;
DROP POLICY IF EXISTS "patients_own_data" ON patients;

-- 2. ENSURE RLS IS ENABLED
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- 3. ADMIN POLICIES (Access to ALL rows)

-- Admin View All
CREATE POLICY "admin_read_all_patients"
ON patients FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Admin Update All
CREATE POLICY "admin_update_all_patients"
ON patients FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Admin Insert
CREATE POLICY "admin_insert_patients"
ON patients FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- 4. USER POLICIES (Access to OWN rows only)

-- User View Own
CREATE POLICY "user_read_own_patient"
ON patients FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- User Update Own
CREATE POLICY "user_update_own_patient"
ON patients FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- User Insert Own
CREATE POLICY "user_insert_own_patient"
ON patients FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5. VERIFY PUBLICATION
-- Ensure patients table is in the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE patients;
