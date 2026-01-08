-- ==============================================
-- FIX PERMISSIONS ONLY (Since Realtime is active)
-- ==============================================

-- 1. Update Admin RLS Policies (Safely)
-- We drop existing policies first to avoid "already exists" errors, 
-- then recreate them to ensure they are correct.

-- Patients Policy
drop policy if exists "Admins can view all patients" on patients;
create policy "Admins can view all patients"
on patients for select
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role in ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Treatment Plans Policy
drop policy if exists "Admins can view all treatment plans" on treatment_plans;
create policy "Admins can view all treatment plans"
on treatment_plans for select
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role in ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Treatment Reviews Policy
drop policy if exists "Admins can view all reviews" on treatment_reviews;
create policy "Admins can view all reviews"
on treatment_reviews for select
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role in ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Profiles Access
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile"
on profiles for select
to authenticated
using ( auth.uid() = id );
