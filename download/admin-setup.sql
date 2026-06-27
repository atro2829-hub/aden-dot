-- =============================================
-- Aden Dot - Admin Account Setup Script
-- =============================================
-- Run this in Supabase SQL Editor to:
-- 1. Create the admin user (admin@adendot.app)
-- 2. Set the role to admin
-- 3. Mark as verified
-- 4. Grant all admin privileges
--
-- Admin credentials:
-- Email:    admin@adendot.app
-- Password: Aden@2026
-- =============================================

-- Step 1: Create the admin auth user (if not exists)
-- Note: This must be done via Supabase Dashboard > Authentication > Users > Add User
-- because we need a password hash that only the auth server can create.
--
-- After creating the user in Dashboard, run the SQL below to:
-- a) Find the admin user by email
-- b) Update their profile to be an admin

-- Step 2: Update the admin profile
UPDATE public.users
SET
  role = 'admin',
  is_verified = TRUE,
  is_email_verified = TRUE,
  is_profile_complete = TRUE,
  status = 'online',
  nickname = COALESCE(NULLIF(nickname, ''), 'مدير المنصة'),
  bio = COALESCE(NULLIF(bio, ''), 'حساب المسؤول الرسمي لمنصة عدن'),
  last_seen = EXTRACT(EPOCH FROM NOW()) * 1000,
  updated_at = NOW()
WHERE email = 'admin@adendot.app';

-- Step 3: Verify the update
SELECT uid, email, username, nickname, role, is_verified
FROM public.users
WHERE email = 'admin@adendot.app';

-- Step 4: Grant admin coins and premium status
UPDATE public.users
SET
  coins_balance = GREATEST(coins_balance, 100000),
  diamonds_balance = GREATEST(diamonds_balance, 10000),
  is_premium = TRUE,
  level = GREATEST(level, 99),
  xp = GREATEST(xp, 100000)
WHERE email = 'admin@adendot.app';

-- =============================================
-- RLS Policies for Admin
-- =============================================
-- (Run only if RLS policies don't already include admin bypass)

-- Allow admin to read all data
DROP POLICY IF EXISTS "Admin can read all users" ON public.users;
CREATE POLICY "Admin can read all users" ON public.users
  FOR SELECT TO authenticated
  USING (
    auth.uid()::text = uid
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.uid = auth.uid()::text AND u.role = 'admin')
  );

-- Allow admin to update all users
DROP POLICY IF EXISTS "Admin can update all users" ON public.users;
CREATE POLICY "Admin can update all users" ON public.users
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.uid = auth.uid()::text AND u.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.uid = auth.uid()::text AND u.role = 'admin')
  );

-- Allow admin to delete any post
DROP POLICY IF EXISTS "Admin can delete posts" ON public.posts;
CREATE POLICY "Admin can delete posts" ON public.posts
  FOR DELETE TO authenticated
  USING (
    publisher_uid = auth.uid()::text
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.uid = auth.uid()::text AND u.role = 'admin')
  );

-- =============================================
-- Verification Query
-- Run this to confirm admin setup
-- =============================================
-- SELECT
--   u.email,
--   u.username,
--   u.role,
--   u.is_verified,
--   u.coins_balance,
--   u.is_premium,
--   u.level
-- FROM public.users u
-- WHERE u.email = 'admin@adendot.app';
