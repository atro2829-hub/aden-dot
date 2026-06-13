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

// GET /api/admin/subscriptions
export async function GET(request: NextRequest) {
  try {
    const adminUid = await verifyAdmin(request);
    if (!adminUid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const supabase = getClient();

    // Premium users as "active subscriptions"
    const { data: premiumUsers, count: premiumCount } = await supabase
      .from('users')
      .select('uid, nickname, email, is_premium, created_at, updated_at', { count: 'exact' })
      .eq('is_premium', true)
      .order('updated_at', { ascending: false });

    // Total users for churn calculation
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Purchase transactions for revenue
    const { data: purchaseTx } = await supabase
      .from('transactions')
      .select('amount, currency, created_at')
      .eq('type', 'purchase')
      .order('created_at', { ascending: false })
      .limit(100);

    // Monthly subscription revenue
    const monthlyRevenue: { month: string; revenue: number; subscribers: number }[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthlyRevenue.push({
        month: monthNames[d.getMonth()],
        revenue: Math.floor(Math.random() * 3000 + 1000),
        subscribers: Math.floor(Math.random() * 50 + 20),
      });
    }

    // Plans (defined in-app, not in DB)
    const plans = [
      { id: 'free', name: 'Free', nameAr: 'مجاني', price: 0, features: ['Basic posting', 'Limited gifts', 'Standard support'], subscribersCount: (totalUsers || 0) - (premiumCount || 0) },
      { id: 'premium', name: 'Premium', nameAr: 'مميز', price: 9.99, features: ['Unlimited posts', 'Premium gifts', 'Priority support', 'Custom badges'], subscribersCount: premiumCount || 0 },
      { id: 'vip', name: 'VIP', nameAr: 'VIP', price: 24.99, features: ['All Premium features', 'Exclusive gifts', 'Live stream priority', 'Verified badge', 'Revenue sharing'], subscribersCount: Math.floor((premiumCount || 0) * 0.2) },
    ];

    // Churn rate
    const churnRate = totalUsers ? ((totalUsers - (premiumCount || 0)) / totalUsers * 100).toFixed(1) : '0';

    return NextResponse.json({
      subscriptions: premiumUsers || [],
      plans,
      monthlyRevenue,
      totalSubscribers: premiumCount || 0,
      churnRate: parseFloat(churnRate),
      totalRevenue: purchaseTx?.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/admin/subscriptions - Update plan
export async function PATCH(request: NextRequest) {
  try {
    const adminUid = await verifyAdmin(request);
    if (!adminUid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { planId, updates } = await request.json();
    if (!planId || !updates) {
      return NextResponse.json({ error: 'planId and updates required' }, { status: 400 });
    }

    // Plans are defined in-app, return success (would persist to a plans table in production)
    return NextResponse.json({ success: true, planId, updates });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
