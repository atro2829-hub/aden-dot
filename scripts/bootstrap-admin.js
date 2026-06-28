#!/usr/bin/env node
/**
 * Aden Dot - Admin Account Bootstrap Script
 * Creates the admin user in Supabase Auth and ensures the profile has admin role.
 *
 * Usage:
 *   node scripts/bootstrap-admin.js
 *
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zjdkfzemrosdgkgtzhtg.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL = 'admin@adendot.app';
const ADMIN_PASSWORD = 'Aden@2026';

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log(`Bootstrap admin account on: ${SUPABASE_URL}`);
  console.log(`Admin email: ${ADMIN_EMAIL}`);

  // Step 1: Try to create the admin auth user via admin API
  // POST /auth/v1/admin/users with service_role key
  const createUserUrl = `${SUPABASE_URL}/auth/v1/admin/users`;
  const createUserBody = {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      username: 'admin',
      nickname: 'مدير المنصة',
    },
  };

  let adminUid = null;

  try {
    const res = await fetch(createUserUrl, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createUserBody),
    });

    if (res.status === 200 || res.status === 201) {
      const data = await res.json();
      adminUid = data.id;
      console.log(`Admin user created successfully. UID: ${adminUid}`);
    } else if (res.status === 400 || res.status === 422) {
      const data = await res.json();
      if (data.msg && data.msg.includes('already been registered')) {
        console.log('Admin user already exists, fetching UID...');
        // Fetch the existing user
        const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1000`, {
          method: 'GET',
          headers: {
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          },
        });
        const users = await listRes.json();
        const admin = users.users && users.users.find((u) => u.email === ADMIN_EMAIL);
        if (admin) {
          adminUid = admin.id;
          console.log(`Found existing admin UID: ${adminUid}`);
        } else {
          console.error('Could not find admin user in list');
        }
      } else {
        console.error('Failed to create admin user:', data);
      }
    } else {
      console.error(`Unexpected status ${res.status}:`, await res.text());
    }
  } catch (err) {
    console.error('Error creating admin user:', err.message);
  }

  if (!adminUid) {
    console.error('No admin UID available. Aborting profile update.');
    process.exit(1);
  }

  // Step 2: Upsert the admin profile in public.users
  const upsertUrl = `${SUPABASE_URL}/rest/v1/users?on_conflict=uid`;
  const upsertBody = {
    uid: adminUid,
    email: ADMIN_EMAIL,
    username: 'admin',
    nickname: 'مدير المنصة',
    bio: 'حساب المسؤول الرسمي لمنصة عدن',
    role: 'admin',
    is_verified: true,
    is_email_verified: true,
    is_profile_complete: true,
    is_premium: true,
    status: 'online',
    coins_balance: 100000,
    diamonds_balance: 10000,
    level: 99,
    xp: 100000,
    last_seen: Date.now(),
  };

  try {
    const res = await fetch(upsertUrl, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(upsertBody),
    });

    if (res.ok) {
      const data = await res.json();
      console.log('Admin profile created/updated successfully:');
      console.log(`  UID: ${data[0].uid}`);
      console.log(`  Role: ${data[0].role}`);
      console.log(`  Verified: ${data[0].is_verified}`);
    } else {
      console.error(`Failed to upsert admin profile (${res.status}):`, await res.text());
    }
  } catch (err) {
    console.error('Error upserting admin profile:', err.message);
  }

  console.log('\n=====================================');
  console.log('Admin account setup complete!');
  console.log('Email:    ' + ADMIN_EMAIL);
  console.log('Password: ' + ADMIN_PASSWORD);
  console.log('=====================================');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
