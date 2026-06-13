import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getClient() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET /api/posts/comments?post_id=xxx
export async function GET(request: NextRequest) {
  try {
    const post_id = request.nextUrl.searchParams.get('post_id');
    if (!post_id) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 });
    }

    const supabase = getClient();
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        publisher:users!comments_publisher_uid_fkey(uid, username, nickname, profile_image)
      `)
      .eq('post_id', post_id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comments: comments || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/posts/comments - Add a comment
export async function POST(request: NextRequest) {
  try {
    const { post_id, publisher_uid, content, parent_comment_id } = await request.json();
    if (!post_id || !publisher_uid || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getClient();
    const { data, error } = await supabase.from('comments').insert({
      post_id,
      publisher_uid,
      content,
      parent_comment_id: parent_comment_id || null,
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comment: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/posts/comments?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    const supabase = getClient();
    const { error } = await supabase.from('comments').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Comment deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
