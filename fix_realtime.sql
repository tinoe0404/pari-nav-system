-- ==============================================
-- FIX PERMISSIONS AND REALTIME CONFIGURATION
-- ==============================================

-- 1. Enable RLS (Ensure it is on)
alter table patients enable row level security;
alter table treatment_plans enable row level security;
alter table treatment_reviews enable row level security;
alter table profiles enable row level security;

-- 2. RESET Realtime Publication (The "Nuclear" Option)
-- This ensures these tables are definitely in the publication.
-- WARNING: This replaces the list of tables in the publication with ONLY these.
-- If you have other tables relying on realtime, add them to this list.
alter publication supabase_realtime set table patients, treatment_plans, treatment_reviews;

-- 3. Update Admin RLS Policies

-- Patients Policy: Allow Admins to View All
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

-- Treatment Plans Policy: Allow Admins to View All
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

-- Treatment Reviews Policy: Allow Admins to View All
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

-- Profiles Access: Allow Users to View Own Profile
-- This is critical for the admin check above to work!
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile"
on profiles for select
to authenticated
using ( auth.uid() = id );
