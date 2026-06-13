import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getClient() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET /api/users?uid=xxx or /api/users?username=xxx
export async function GET(request: NextRequest) {
  try {
    const uid = request.nextUrl.searchParams.get('uid');
    const username = request.nextUrl.searchParams.get('username');
    const supabase = getClient();

    if (uid) {
      const { data, error } = await supabase.from('users').select('*').eq('uid', uid).single();
      if (error) return NextResponse.json({ error: error.message }, { status: 404 });
      return NextResponse.json({ user: data });
    }

    if (username) {
      const { data, error } = await supabase.from('users').select('*').eq('username', username).single();
      if (error) return NextResponse.json({ error: error.message }, { status: 404 });
      return NextResponse.json({ user: data });
    }

    // Get all users (for recommendations)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('followers_count', { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ users: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/users - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const { uid, ...updates } = await request.json();
    if (!uid) {
      return NextResponse.json({ error: 'uid is required' }, { status: 400 });
    }

    const supabase = getClient();

    // Convert camelCase to snake_case for DB
    const dbUpdates: Record<string, any> = {};
    const fieldMap: Record<string, string> = {
      username: 'username',
      nickname: 'nickname',
      bio: 'bio',
      gender: 'gender',
      profileImage: 'profile_image',
      coverImage: 'cover_image',
      status: 'status',
      region: 'region',
    };

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMap[key]) {
        dbUpdates[fieldMap[key]] = value;
      }
    }

    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('uid', uid)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ user: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
