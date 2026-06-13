import { NextRequest, NextResponse } from 'next/server';

/**
 * Execute SQL via Supabase Management API
 * Requires a personal access token (sbp_...)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, sql } = body;

    if (!accessToken || !sql) {
      return NextResponse.json({ 
        error: 'Missing accessToken or sql' 
      }, { status: 400 });
    }

    if (!accessToken.startsWith('sbp_')) {
      return NextResponse.json({ 
        error: 'Invalid access token format. Must start with sbp_ (get one from https://supabase.com/dashboard/account/tokens)' 
      }, { status: 400 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const projectRef = SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '');

    if (!projectRef) {
      return NextResponse.json({ error: 'Supabase URL not configured' }, { status: 500 });
    }

    // Execute SQL via Management API
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        error: `Management API error: ${response.status}`,
        details: errorText,
      }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json({ success: true, result });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to execute SQL',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
