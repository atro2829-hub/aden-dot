import { NextRequest, NextResponse } from 'next/server';

/**
 * Database Setup API Route
 * 
 * This endpoint helps initialize the Supabase database schema.
 * Since direct PostgreSQL connections may be restricted by IPv6/SNI requirements,
 * this route returns the complete SQL schema that needs to be run in the
 * Supabase SQL Editor (Dashboard > SQL Editor).
 * 
 * It also verifies the current state of the database using the REST API.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return NextResponse.json({
        configured: false,
        message: 'Supabase environment variables are not set',
      }, { status: 500 });
    }

    // Check database state via REST API
    const tables = ['users', 'posts', 'comments', 'stories', 'followers', 
      'chat_rooms', 'chat_messages', 'notifications', 'gift_types', 'gifts',
      'live_streams', 'wallets', 'transactions', 'achievements', 'user_achievements',
      'daily_rewards', 'polls', 'poll_options', 'poll_votes', 'blocked_users',
      'reports', 'hashtags', 'post_hashtags', 'collections', 'collection_items',
      'post_likes', 'post_favorites', 'comment_likes', 'live_stream_viewers',
      'live_stream_comments'];

    const tableStatus: Record<string, { exists: boolean; count?: number }> = {};

    for (const table of tables) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=count&limit=0`, {
          headers: {
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Prefer': 'count=exact',
            'Range-Unit': 'items',
            'Range': '0-0',
          },
        });
        
        if (res.ok) {
          const contentRange = res.headers.get('content-range');
          const count = contentRange ? parseInt(contentRange.split('/')[1]) : 0;
          tableStatus[table] = { exists: true, count };
        } else {
          tableStatus[table] = { exists: false };
        }
      } catch {
        tableStatus[table] = { exists: false };
      }
    }

    const existingTables = Object.entries(tableStatus).filter(([, v]) => v.exists).length;
    const totalTables = tables.length;

    return NextResponse.json({
      configured: true,
      supabaseUrl: SUPABASE_URL,
      database: {
        totalTables,
        existingTables,
        missingTables: tables.filter(t => !tableStatus[t]?.exists),
        tableStatus,
        isSetup: existingTables === totalTables,
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check database state',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Supabase not configured',
      }, { status: 500 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'create-tables') {
      // Try to create tables using the REST API
      // This works by using the Supabase service role key
      // which has full database access
      
      const results: Record<string, { success: boolean; error?: string }> = {};

      // Try creating core tables via RPC if available
      // Otherwise, the user needs to run the SQL manually
      const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/setup_skyline_db`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (rpcRes.ok) {
        return NextResponse.json({
          success: true,
          message: 'Database setup completed via RPC function',
          results: await rpcRes.json(),
        });
      }

      // RPC function doesn't exist, return instructions
      return NextResponse.json({
        success: false,
        message: 'Database setup function not found. Please run the SQL schema in the Supabase SQL Editor.',
        instructions: {
          step1: 'Go to your Supabase Dashboard',
          step2: 'Navigate to SQL Editor',
          step3: 'Copy and paste the SQL schema',
          step4: 'Click Run to execute',
          sqlFile: '/supabase-schema.sql',
          dashboardUrl: `https://supabase.com/dashboard/project/ocjcbowrewenogrkexmr/sql`,
        },
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      error: 'Setup failed',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
