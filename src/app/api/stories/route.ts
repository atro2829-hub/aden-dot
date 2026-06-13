import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getClient() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET /api/stories
export async function GET(request: NextRequest) {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        publisher:users!stories_publisher_uid_fkey(uid, username, nickname, profile_image)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ stories: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/stories - Create a story
export async function POST(request: NextRequest) {
  try {
    const { publisher_uid, media_base64, media_mime_type } = await request.json();
    if (!publisher_uid) {
      return NextResponse.json({ error: 'Missing publisher_uid' }, { status: 400 });
    }

    const supabase = getClient();
    const { data, error } = await supabase.from('stories').insert({
      publisher_uid,
      media_base64: media_base64 || '',
      media_mime_type: media_mime_type || '',
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ story: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
