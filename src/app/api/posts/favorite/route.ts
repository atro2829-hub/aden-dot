import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getClient() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// POST /api/posts/favorite - Toggle favorite on a post
export async function POST(request: NextRequest) {
  try {
    const { post_id, user_uid } = await request.json();
    if (!post_id || !user_uid) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = getClient();

    const { data: existing } = await supabase
      .from('post_favorites')
      .select('*')
      .eq('post_id', post_id)
      .eq('user_uid', user_uid)
      .single();

    if (existing) {
      await supabase.from('post_favorites').delete().eq('post_id', post_id).eq('user_uid', user_uid);
      return NextResponse.json({ favorited: false });
    } else {
      await supabase.from('post_favorites').insert({ post_id, user_uid });
      return NextResponse.json({ favorited: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
