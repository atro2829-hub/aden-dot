import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getClient() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function verifyAdmin(request: NextRequest): Promise<string | null> {
  const adminUid = request.headers.get('x-admin-uid');
  if (!adminUid) return null;
  const supabase = getClient();
  const { data } = await supabase.from('users').select('role').eq('uid', adminUid).single();
  return data?.role === 'admin' ? adminUid : null;
}

// GET /api/admin/users?search=&role=&sort=&page=&limit=
export async function GET(request: NextRequest) {
  try {
    const adminUid = await verifyAdmin(request);
    if (!adminUid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const search = request.nextUrl.searchParams.get('search') || '';
    const role = request.nextUrl.searchParams.get('role') || '';
    const sort = request.nextUrl.searchParams.get('sort') || 'created_at';
    const sortOrder = request.nextUrl.searchParams.get('order') || 'desc';
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');
    const from = (page - 1) * limit;

    const supabase = getClient();
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range(from, from + limit - 1);

    if (search) {
      query = query.or(`username.ilike.%${search}%,nickname.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (role) {
      query = query.eq('role', role);
    }

    query = query.order(sort, { ascending: sortOrder === 'asc' });

    const { data, count, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ users: data, total: count, page, limit });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/admin/users - Update user (ban, verify, role change, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const adminUid = await verifyAdmin(request);
    if (!adminUid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { uid, action, ...extra } = body;

    if (!uid || !action) {
      return NextResponse.json({ error: 'uid and action are required' }, { status: 400 });
    }

    const supabase = getClient();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    switch (action) {
      case 'ban':
        updates.status = 'banned';
        break;
      case 'unban':
        updates.status = 'online';
        break;
      case 'verify':
        updates.is_verified = true;
        break;
      case 'unverify':
        updates.is_verified = false;
        break;
      case 'give_premium':
        updates.is_premium = true;
        break;
      case 'remove_premium':
        updates.is_premium = false;
        break;
      case 'change_role':
        if (!['user', 'moderator', 'admin', 'supporter'].includes(extra.role)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }
        updates.role = extra.role;
        break;
      case 'delete':
        const { error: delError } = await supabase.from('users').delete().eq('uid', uid);
        if (delError) return NextResponse.json({ error: delError.message }, { status: 500 });
        // Log admin action
        await supabase.from('notifications').insert({
          user_uid: adminUid,
          type: 'system',
          content: `Admin deleted user ${uid}`,
        });
        return NextResponse.json({ success: true, action: 'delete' });
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('uid', uid)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Log admin action
    await supabase.from('notifications').insert({
      user_uid: adminUid,
      type: 'system',
      content: `Admin performed ${action} on user ${uid}`,
    });

    return NextResponse.json({ success: true, user: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/users - Bulk action
export async function POST(request: NextRequest) {
  try {
    const adminUid = await verifyAdmin(request);
    if (!adminUid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { uids, action, ...extra } = await request.json();
    if (!uids?.length || !action) {
      return NextResponse.json({ error: 'uids array and action are required' }, { status: 400 });
    }

    const supabase = getClient();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    switch (action) {
      case 'ban':
        updates.status = 'banned';
        break;
      case 'unban':
        updates.status = 'online';
        break;
      case 'verify':
        updates.is_verified = true;
        break;
      case 'change_role':
        if (!['user', 'moderator', 'admin'].includes(extra.role)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }
        updates.role = extra.role;
        break;
      default:
        return NextResponse.json({ error: 'Unknown bulk action' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .in('uid', uids)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, updated: data?.length || 0 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
