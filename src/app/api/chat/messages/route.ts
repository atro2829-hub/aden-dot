import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getClient() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET /api/chat/messages?room_id=xxx
export async function GET(request: NextRequest) {
  try {
    const room_id = request.nextUrl.searchParams.get('room_id');
    if (!room_id) {
      return NextResponse.json({ error: 'room_id is required' }, { status: 400 });
    }

    const supabase = getClient();
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', room_id)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Mark messages as read
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('room_id', room_id)
      .neq('sender_uid', request.nextUrl.searchParams.get('uid') || '')
      .eq('is_read', false);

    return NextResponse.json({ messages: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/chat/messages - Send a message
export async function POST(request: NextRequest) {
  try {
    const { room_id, sender_uid, content, media_base64, media_mime_type } = await request.json();
    if (!room_id || !sender_uid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getClient();

    // Insert message
    const { data, error } = await supabase.from('chat_messages').insert({
      room_id,
      sender_uid,
      content: content || '',
      media_base64: media_base64 || '',
      media_mime_type: media_mime_type || '',
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update room's last message
    await supabase
      .from('chat_rooms')
      .update({
        last_message: content || '📷 Media',
        last_message_time: Date.now(),
      })
      .eq('id', room_id);

    return NextResponse.json({ message: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
