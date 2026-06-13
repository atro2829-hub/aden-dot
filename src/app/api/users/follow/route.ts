import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getClient() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// POST /api/users/follow - Toggle follow
export async function POST(request: NextRequest) {
  try {
    const { follower_uid, followed_uid } = await request.json();
    if (!follower_uid || !followed_uid) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = getClient();

    const { data: existing } = await supabase
      .from('followers')
      .select('*')
      .eq('follower_uid', follower_uid)
      .eq('followed_uid', followed_uid)
      .single();

    if (existing) {
      await supabase.from('followers').delete().eq('follower_uid', follower_uid).eq('followed_uid', followed_uid);
      return NextResponse.json({ following: false });
    } else {
      await supabase.from('followers').insert({ follower_uid, followed_uid });
      return NextResponse.json({ following: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/users/follow?uid=xxx&type=followers|following
export async function GET(request: NextRequest) {
  try {
    const uid = request.nextUrl.searchParams.get('uid');
    const type = request.nextUrl.searchParams.get('type') || 'followers';

    if (!uid) {
      return NextResponse.json({ error: 'uid is required' }, { status: 400 });
    }

    const supabase = getClient();

    if (type === 'followers') {
      const { data, error } = await supabase
        .from('followers')
        .select('follower_uid, users!followers_follower_uid_fkey(*)')
        .eq('followed_uid', uid);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ users: data?.map((f: any) => f.users) || [] });
    } else {
      const { data, error } = await supabase
        .from('followers')
        .select('followed_uid, users!followers_followed_uid_fkey(*)')
        .eq('follower_uid', uid);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ users: data?.map((f: any) => f.users) || [] });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
