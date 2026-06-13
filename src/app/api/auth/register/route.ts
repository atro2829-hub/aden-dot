import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getServiceClient() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// POST /api/auth/register
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const uid = authData.user.id;

    // Create user profile in users table
    const { error: profileError } = await supabase.from('users').insert({
      uid,
      email,
      username: '',
      nickname: '',
      bio: '',
      gender: 'unspecified',
      profile_image: '',
      cover_image: '',
      status: 'online',
      role: 'user',
      is_verified: false,
      is_premium: false,
      region: '',
      followers_count: 0,
      following_count: 0,
      posts_count: 0,
      level: 1,
      popularity: 0,
      gifts: 0,
      subscribers: 0,
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    return NextResponse.json({
      user: authData.user,
      uid,
      message: 'Account created successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
