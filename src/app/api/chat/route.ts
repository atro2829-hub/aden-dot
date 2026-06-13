import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getClient() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET /api/chat?uid=xxx - Get chat rooms for a user
export async function GET(request: NextRequest) {
  try {
    const uid = request.nextUrl.searchParams.get('uid');
    if (!uid) {
      return NextResponse.json({ error: 'uid is required' }, { status: 400 });
    }

    const supabase = getClient();

    // Get chat rooms where user is participant
    const { data: rooms, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .or(`participant_1.eq.${uid},participant_2.eq.${uid}`)
      .order('last_message_time', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Enrich with other user info
    const enrichedRooms = await Promise.all(
      (rooms || []).map(async (room: any) => {
        const otherUid = room.participant_1 === uid ? room.participant_2 : room.participant_1;
        const { data: otherUser } = await supabase
          .from('users')
          .select('uid, username, nickname, profile_image, status')
          .eq('uid', otherUid)
          .single();

        // Get unread count
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', room.id)
          .eq('sender_uid', otherUid)
          .eq('is_read', false);

        return {
          ...room,
          other_user: otherUser,
          unread_count: count || 0,
        };
      })
    );

    return NextResponse.json({ rooms: enrichedRooms });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/chat - Create or get chat room
export async function POST(request: NextRequest) {
  try {
    const { participant_1, participant_2 } = await request.json();
    if (!participant_1 || !participant_2) {
      return NextResponse.json({ error: 'Missing participants' }, { status: 400 });
    }

    const supabase = getClient();

    // Check if room exists
    const { data: existing } = await supabase
      .from('chat_rooms')
      .select('*')
      .or(`and(participant_1.eq.${participant_1},participant_2.eq.${participant_2}),and(participant_1.eq.${participant_2},participant_2.eq.${participant_1})`)
      .single();

    if (existing) {
      return NextResponse.json({ room: existing });
    }

    // Create new room
    const { data, error } = await supabase.from('chat_rooms').insert({
      participant_1,
      participant_2,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ room: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
