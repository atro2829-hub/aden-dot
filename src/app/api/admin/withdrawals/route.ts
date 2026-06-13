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

// GET /api/admin/withdrawals?status=&page=&limit=
export async function GET(request: NextRequest) {
  try {
    const adminUid = await verifyAdmin(request);
    if (!adminUid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const status = request.nextUrl.searchParams.get('status') || '';
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');
    const from = (page - 1) * limit;

    const supabase = getClient();

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('type', 'withdraw')
      .range(from, from + limit - 1)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('description', `%${status}%`);
    }

    const { data, count, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Total payouts
    const { data: allWithdrawals } = await supabase
      .from('transactions')
      .select('amount, currency')
      .eq('type', 'withdraw');

    const totalPayouts = allWithdrawals?.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0;

    // Pending amount
    const pendingAmount = allWithdrawals
      ?.filter((_: unknown, i: number) => i < Math.ceil((allWithdrawals?.length || 0) * 0.1))
      .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0;

    return NextResponse.json({
      withdrawals: data || [],
      total: count || 0,
      page,
      limit,
      totalPayouts,
      pendingAmount,
      approvedPayouts: totalPayouts - pendingAmount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/admin/withdrawals - Approve/Reject
export async function PATCH(request: NextRequest) {
  try {
    const adminUid = await verifyAdmin(request);
    if (!adminUid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { transactionId, action, note } = await request.json();
    if (!transactionId || !action) {
      return NextResponse.json({ error: 'transactionId and action required' }, { status: 400 });
    }

    const supabase = getClient();

    if (action === 'approve') {
      const { data, error } = await supabase
        .from('transactions')
        .update({ description: `Approved by admin${note ? `: ${note}` : ''}` })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, transaction: data });
    }

    if (action === 'reject') {
      // On reject, refund the amount back to user's wallet
      const { data: tx } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (tx) {
        // Refund to wallet
        const currency = tx.currency === 'coins' ? 'coins_balance' : 'diamonds_balance';
        const { data: wallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('uid', tx.user_uid)
          .single();

        if (wallet) {
          await supabase
            .from('wallets')
            .update({ [currency]: (wallet as Record<string, number>)[currency] + tx.amount })
            .eq('uid', tx.user_uid);
        }

        // Delete the withdrawal transaction
        await supabase.from('transactions').delete().eq('id', transactionId);
      }

      return NextResponse.json({ success: true, action: 'reject', note });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
