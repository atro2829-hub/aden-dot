import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getClient() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET /api/posts?filter=global|local|followings|favorites&uid=xxx&region=US
export async function GET(request: NextRequest) {
  try {
    const filter = request.nextUrl.searchParams.get('filter') || 'global';
    const uid = request.nextUrl.searchParams.get('uid') || '';
    const region = request.nextUrl.searchParams.get('region') || '';
    const supabase = getClient();

    let query = supabase
      .from('posts')
      .select(`
        *,
        publisher:users!posts_publisher_uid_fkey(uid, username, nickname, profile_image, is_verified)
      `)
      .eq('is_private', false)
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter === 'local' && region) {
      query = query.eq('region', region);
    }

    if (filter === 'favorites' && uid) {
      // Get favorite post IDs first
      const { data: favs } = await supabase
        .from('post_favorites')
        .select('post_id')
        .eq('user_uid', uid);
      const favIds = favs?.map((f: any) => f.post_id) || [];
      if (favIds.length === 0) {
        return NextResponse.json({ posts: [] });
      }
      query = query.in('id', favIds);
    }

    if (filter === 'followings' && uid) {
      const { data: following } = await supabase
        .from('followers')
        .select('followed_uid')
        .eq('follower_uid', uid);
      const followingIds = following?.map((f: any) => f.followed_uid) || [];
      if (followingIds.length === 0) {
        return NextResponse.json({ posts: [] });
      }
      query = query.in('publisher_uid', followingIds);
    }

    const { data: posts, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get like/favorite status for the current user
    let enrichedPosts = posts || [];
    if (uid && enrichedPosts.length > 0) {
      const postIds = enrichedPosts.map((p: any) => p.id);

      const [likesRes, favsRes] = await Promise.all([
        supabase.from('post_likes').select('post_id').eq('user_uid', uid).in('post_id', postIds),
        supabase.from('post_favorites').select('post_id').eq('user_uid', uid).in('post_id', postIds),
      ]);

      const likedIds = new Set(likesRes.data?.map((l: any) => l.post_id) || []);
      const favedIds = new Set(favsRes.data?.map((f: any) => f.post_id) || []);

      enrichedPosts = enrichedPosts.map((p: any) => ({
        ...p,
        is_liked: likedIds.has(p.id),
        is_favorite: favedIds.has(p.id),
      }));
    }

    return NextResponse.json({ posts: enrichedPosts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { publisher_uid, type, content, media_base64, media_mime_type, description, is_private, comments_disabled, region } = body;

    if (!publisher_uid || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getClient();

    const { data, error } = await supabase.from('posts').insert({
      publisher_uid,
      type,
      content: content || '',
      media_base64: media_base64 || '',
      media_mime_type: media_mime_type || '',
      description: description || '',
      is_private: is_private || false,
      comments_disabled: comments_disabled || false,
      favorites_disabled: false,
      region: region || '',
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ post: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/posts?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const supabase = getClient();
    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Post deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
