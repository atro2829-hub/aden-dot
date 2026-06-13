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

// In-memory settings store (would be DB in production)
let appSettings = {
  appName: 'Aden Dot',
  appNameAr: 'عدن دوت',
  version: '2.1.0',
  maintenanceMode: false,
  featureFlags: {
    liveStreaming: true,
    gifts: true,
    stories: true,
    polls: true,
    achievements: true,
    dailyRewards: true,
    chatRooms: true,
    subscriptions: true,
    walletWithdrawal: true,
  },
  rateLimits: {
    maxPostsPerHour: 10,
    maxCommentsPerHour: 30,
    maxGiftsPerMinute: 5,
    maxMessagesPerMinute: 20,
  },
  contentPolicies: {
    maxPostLength: 2000,
    maxCommentLength: 500,
    profanityFilter: true,
    mediaModeration: true,
    autoFlagThreshold: 3,
  },
  economy: {
    coinToDiamondRate: 100,
    minWithdrawal: 1000,
    platformFeePercent: 30,
    bonusDailyCoins: 50,
  },
};

// GET /api/admin/settings
export async function GET(request: NextRequest) {
  try {
    const adminUid = await verifyAdmin(request);
    if (!adminUid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ settings: appSettings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/admin/settings
export async function PATCH(request: NextRequest) {
  try {
    const adminUid = await verifyAdmin(request);
    if (!adminUid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updates = await request.json();
    appSettings = { ...appSettings, ...updates };

    // In production, save to DB
    return NextResponse.json({ success: true, settings: appSettings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
