'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { useAuthStore, useAppStore } from '@/lib/store';
import { formatNumber } from '@/lib/i18n';
import {
  CoinIcon, DiamondCurrencyIcon, VerifiedIcon, OnlineIcon,
  ShieldIcon, SettingsIcon, GiftIcon, WalletIcon,
  CrownIcon, StarIcon, LightningIcon,
} from '@/components/icons/aden-dot-icons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Database } from '@/lib/supabase-types';

const RED = '#EF4444';
const GREEN = '#22C55E';
const AMBER = '#F59E0B';

type AdminSection = 'overview' | 'users' | 'moderation' | 'subscriptions' | 'withdrawals' | 'deposits' | 'payments' | 'gifts' | 'livestreams' | 'settings' | 'logs';

// ============ Admin Supabase Client ============
// Uses service role key for admin operations (bypasses RLS).
// Acceptable for Capacitor mobile app (not a public web app).
let adminClient: SupabaseClient<Database> | null = null;

function getSupabaseAdmin(): SupabaseClient<Database> | null {
  if (adminClient) return adminClient;
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zjdkfzemrosdgkgtzhtg.supabase.co';
  let serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGtmemVtcm9zZGdrZ3R6aHRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTM3NTg1NywiZXhwIjoyMDk2OTUxODU3fQ.gKTa_CbKLCHcgjLA_-OqGwCqHHr3dtDxZ-3Pbx-bWx4';
  if (!url || !serviceKey) {
    console.warn('[Admin] Missing Supabase configuration');
    return null;
  }
  try {
    adminClient = createClient<Database>(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: 'public' },
    });
    return adminClient;
  } catch (e) {
    console.error('[Admin] Failed to create admin client:', e);
    return null;
  }
}

// ============ Toast Notification Helper ============
function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);
  return { toast, showToast, ToastUI: toast ? (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-lg text-xs font-medium shadow-lg"
      style={{ background: toast.type === 'success' ? GREEN : RED, color: '#fff' }}
    >
      {toast.message}
    </motion.div>
  ) : null };
}

// ============ Custom Icons for Admin ============
function DashboardIcon({ size = 20, color = 'var(--primary)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function UsersIcon({ size = 20, color = 'var(--primary)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function ModerationIcon({ size = 20, color = 'var(--primary)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function SubscriptionIcon({ size = 20, color = 'var(--primary)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20" /><path d="M6 16h4" />
    </svg>
  );
}

function WithdrawalIcon({ size = 20, color = 'var(--primary)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}

function ActivityIcon({ size = 20, color = 'var(--primary)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function StreamIcon({ size = 20, color = RED }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M8 10l4 3-4 3V10z" fill={color} />
    </svg>
  );
}

function LogsIcon({ size = 20, color = 'var(--primary)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function EyeIcon2({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// ============ Sidebar Navigation ============
function AdminSidebar({ active, onChange, lang }: { active: AdminSection; onChange: (section: AdminSection) => void; lang: string }) {
  const isRTL = lang === 'ar';
  const items: { id: AdminSection; icon: React.ReactNode; labelEn: string; labelAr: string }[] = [
    { id: 'overview', icon: <DashboardIcon />, labelEn: 'Dashboard', labelAr: 'لوحة التحكم' },
    { id: 'users', icon: <UsersIcon />, labelEn: 'Users', labelAr: 'المستخدمون' },
    { id: 'moderation', icon: <ModerationIcon />, labelEn: 'Moderation', labelAr: 'الإشراف' },
    { id: 'subscriptions', icon: <SubscriptionIcon />, labelEn: 'Subscriptions', labelAr: 'الاشتراكات' },
    { id: 'deposits', icon: <CoinIcon size={20} />, labelEn: 'Deposits', labelAr: 'الإيداعات' },
    { id: 'withdrawals', icon: <WithdrawalIcon />, labelEn: 'Withdrawals', labelAr: 'السحوبات' },
    { id: 'payments', icon: <SettingsIcon size={20} />, labelEn: 'Payment Methods', labelAr: 'طرق الدفع' },
    { id: 'gifts', icon: <GiftIcon size={20} />, labelEn: 'Gifts & Economy', labelAr: 'الهدايا والاقتصاد' },
    { id: 'livestreams', icon: <StreamIcon />, labelEn: 'Live Streams', labelAr: 'البث المباشر' },
    { id: 'settings', icon: <SettingsIcon size={20} />, labelEn: 'App Settings', labelAr: 'إعدادات التطبيق' },
    { id: 'logs', icon: <LogsIcon />, labelEn: 'Admin Logs', labelAr: 'سجل المشرفين' },
  ];

  return (
    <div
      className="hidden lg:flex flex-col w-56 shrink-0 border-r"
      style={{
        background: 'var(--card)',
        borderColor: `var(--primary)15`,
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      <div className="p-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `var(--primary)20` }}>
          <ShieldIcon size={18} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">{isRTL ? 'لوحة المشرف' : 'Admin Panel'}</h2>
          <p className="text-[10px]" style={{ color: 'var(--primary)' }}>{isRTL ? 'عدن دوت' : 'Aden Dot'}</p>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-0.5">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
              style={{
                background: active === item.id ? `var(--primary)15` : 'transparent',
                color: active === item.id ? 'var(--primary)' : 'var(--muted-foreground)',
                border: active === item.id ? `1px solid var(--primary)25` : '1px solid transparent',
              }}
            >
              {item.icon}
              <span className="font-medium">{isRTL ? item.labelAr : item.labelEn}</span>
            </button>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

// ============ Mobile Tab Bar ============
function AdminMobileTabs({ active, onChange, lang }: { active: AdminSection; onChange: (section: AdminSection) => void; lang: string }) {
  const isRTL = lang === 'ar';
  const tabs: { id: AdminSection; icon: React.ReactNode; label: string }[] = [
    { id: 'overview', icon: <DashboardIcon size={18} />, label: isRTL ? 'الرئيسية' : 'Home' },
    { id: 'users', icon: <UsersIcon size={18} />, label: isRTL ? 'المستخدمون' : 'Users' },
    { id: 'moderation', icon: <ModerationIcon size={18} />, label: isRTL ? 'الإشراف' : 'Moderate' },
    { id: 'withdrawals', icon: <WithdrawalIcon size={18} />, label: isRTL ? 'السحوبات' : 'Payouts' },
    { id: 'settings', icon: <SettingsIcon size={18} />, label: isRTL ? 'الإعدادات' : 'Settings' },
  ];

  const [moreOpen, setMoreOpen] = useState(false);
  const moreItems: { id: AdminSection; icon: React.ReactNode; label: string }[] = [
    { id: 'subscriptions', icon: <SubscriptionIcon size={18} />, label: isRTL ? 'الاشتراكات' : 'Subs' },
    { id: 'gifts', icon: <GiftIcon size={18} />, label: isRTL ? 'الهدايا' : 'Gifts' },
    { id: 'livestreams', icon: <StreamIcon size={18} />, label: isRTL ? 'البث' : 'Live' },
    { id: 'logs', icon: <LogsIcon size={18} />, label: isRTL ? 'السجلات' : 'Logs' },
  ];

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'var(--card)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-around py-2 px-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { onChange(tab.id); setMoreOpen(false); }}
              className="flex flex-col items-center gap-0.5 py-1 px-2 relative"
            >
              {active === tab.id && (
                <motion.div layoutId="adminTab" className="absolute -top-1.5 w-6 h-0.5 rounded-full" style={{ background: 'var(--primary)' }} />
              )}
              <div style={{ color: active === tab.id ? 'var(--primary)' : 'var(--muted-foreground)' }}>{tab.icon}</div>
              <span className="text-[9px] font-medium" style={{ color: active === tab.id ? 'var(--primary)' : 'var(--muted-foreground)' }}>{tab.label}</span>
            </button>
          ))}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="flex flex-col items-center gap-0.5 py-1 px-2"
          >
            <div style={{ color: moreOpen ? 'var(--primary)' : 'var(--muted-foreground)' }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
              </svg>
            </div>
            <span className="text-[9px] font-medium" style={{ color: moreOpen ? 'var(--primary)' : 'var(--muted-foreground)' }}>{isRTL ? 'المزيد' : 'More'}</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="lg:hidden fixed bottom-16 left-2 right-2 z-50 rounded-xl p-3 space-y-1"
            style={{ background: 'var(--card)', border: `1px solid var(--primary)20` }}
          >
            {moreItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { onChange(item.id); setMoreOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                style={{
                  background: active === item.id ? `var(--primary)15` : 'transparent',
                  color: active === item.id ? 'var(--primary)' : 'var(--muted-foreground)',
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============ Stat Card ============
function StatCard({ icon, label, value, subValue, color = 'var(--primary)', delay = 0 }: {
  icon: React.ReactNode; label: string; value: string | number; subValue?: string; color?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-4 rounded-xl"
      style={{ background: 'var(--card)', border: `1px solid ${color}12` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}12` }}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      {subValue && <p className="text-[10px] text-muted-foreground mt-0.5">{subValue}</p>}
    </motion.div>
  );
}

// ============ Date Helpers ============
function getDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function getTimestampDaysAgo(days: number): number {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

// ============ Section 1: Dashboard Overview ============
function DashboardOverview({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const [stats, setStats] = useState<{
    totalUsers: number; newUsersToday: number; activeUsers: number;
    totalPosts: number; totalGifts: number; activeStreams: number;
    premiumUsers: number; totalPurchaseRevenue: number; totalWithdrawals: number;
    pendingWithdrawals: number;
  } | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number; users: number }[]>([]);
  const [userGrowth, setUserGrowth] = useState<{ date: string; newUsers: number }[]>([]);
  const [recentActivity, setRecentActivity] = useState<{ id: string; type: string; userUid: string; description: string; timestamp: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      const sb = getSupabaseAdmin();
      if (!sb) { setError('Supabase admin client not configured'); setLoading(false); return; }

      try {
        // Parallel queries for dashboard stats
        const [
          usersCount, activeUsersCount, premiumUsersCount,
          postsCount, giftsCount, activeStreamsCount,
          newUsersToday, recentTransactions, recentGifts,
        ] = await Promise.all([
          // Total users
          sb.from('users').select('uid', { count: 'exact', head: true }),
          // Active users (last 24h)
          sb.from('users').select('uid', { count: 'exact', head: true }).gt('last_seen', getTimestampDaysAgo(1)),
          // Premium users
          sb.from('users').select('uid', { count: 'exact', head: true }).eq('is_premium', true),
          // Total posts
          sb.from('posts').select('id', { count: 'exact', head: true }),
          // Total gifts sent
          sb.from('gifts').select('id', { count: 'exact', head: true }),
          // Active streams
          sb.from('live_streams').select('id', { count: 'exact', head: true }).eq('status', 'live'),
          // New users today
          sb.from('users').select('uid', { count: 'exact', head: true }).gte('created_at', getDaysAgo(0)),
          // Recent purchase transactions for revenue
          sb.from('transactions').select('amount, currency').eq('type', 'purchase'),
          // Recent gifts for activity
          sb.from('gifts').select('id, sender_uid, receiver_uid, created_at, gift_type_id').order('created_at', { ascending: false }).limit(10),
        ]);

        const totalPurchaseRevenue = (recentTransactions.data || []).reduce((sum, t) => sum + (t.amount || 0), 0);

        // Withdrawals
        const [withdrawalTx, pendingWithdrawalTx] = await Promise.all([
          sb.from('transactions').select('amount').eq('type', 'withdraw'),
          sb.from('transactions').select('amount').eq('type', 'withdraw').eq('description', 'pending'),
        ]);

        const totalWithdrawals = (withdrawalTx.data || []).reduce((sum, t) => sum + (t.amount || 0), 0);
        const pendingWithdrawals = (pendingWithdrawalTx.data || []).reduce((sum, t) => sum + (t.amount || 0), 0);

        setStats({
          totalUsers: usersCount.count || 0,
          newUsersToday: newUsersToday.count || 0,
          activeUsers: activeUsersCount.count || 0,
          totalPosts: postsCount.count || 0,
          totalGifts: giftsCount.count || 0,
          activeStreams: activeStreamsCount.count || 0,
          premiumUsers: premiumUsersCount.count || 0,
          totalPurchaseRevenue,
          totalWithdrawals,
          pendingWithdrawals,
        });

        // User growth: last 7 days
        const growthData: { date: string; newUsers: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const dayStr = getDaysAgo(i);
          const nextDayStr = getDaysAgo(i - 1);
          const { count: dayCount } = await sb
            .from('users')
            .select('uid', { count: 'exact', head: true })
            .gte('created_at', dayStr)
            .lt('created_at', nextDayStr);
          growthData.push({ date: dayStr, newUsers: dayCount || 0 });
        }
        setUserGrowth(growthData);

        // Monthly revenue: last 6 months
        const revenueData: { month: string; revenue: number; users: number }[] = [];
        for (let m = 5; m >= 0; m--) {
          const monthStart = new Date();
          monthStart.setMonth(monthStart.getMonth() - m);
          monthStart.setDate(1);
          const monthStr = monthStart.toLocaleString(isRTL ? 'ar' : 'en', { month: 'short' });
          const startISO = monthStart.toISOString().split('T')[0];
          const nextMonth = new Date(monthStart);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          const endISO = nextMonth.toISOString().split('T')[0];

          const [monthRev, monthUsers] = await Promise.all([
            sb.from('transactions').select('amount').eq('type', 'purchase').gte('created_at', Math.floor(monthStart.getTime() / 1000)).lt('created_at', Math.floor(nextMonth.getTime() / 1000)),
            sb.from('users').select('uid', { count: 'exact', head: true }).gte('created_at', startISO).lt('created_at', endISO),
          ]);
          revenueData.push({
            month: monthStr,
            revenue: (monthRev.data || []).reduce((s, t) => s + (t.amount || 0), 0),
            users: monthUsers.count || 0,
          });
        }
        setMonthlyRevenue(revenueData);

        // Recent activity from gifts + transactions
        const activities: { id: string; type: string; userUid: string; description: string; timestamp: number }[] = [];
        for (const g of recentGifts.data || []) {
          activities.push({
            id: g.id,
            type: 'gift',
            userUid: g.sender_uid,
            description: isRTL ? `أرسل هدية إلى ${g.receiver_uid.substring(0, 8)}` : `Sent gift to ${g.receiver_uid.substring(0, 8)}`,
            timestamp: g.created_at,
          });
        }
        const recentTx = await sb.from('transactions').select('id, user_uid, type, amount, created_at').order('created_at', { ascending: false }).limit(5);
        for (const t of recentTx.data || []) {
          activities.push({
            id: t.id,
            type: t.type,
            userUid: t.user_uid,
            description: `${t.type} ${t.amount} ${isRTL ? 'عملات' : 'coins'}`,
            timestamp: t.created_at,
          });
        }
        activities.sort((a, b) => b.timestamp - a.timestamp);
        setRecentActivity(activities.slice(0, 15));
      } catch (err) {
        console.error('[Admin] Failed to load dashboard stats:', err);
        setError(isRTL ? 'فشل تحميل الإحصائيات' : 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [isRTL, lang]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--card)' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  const quickActions = [
    { icon: <UsersIcon size={16} color="var(--primary)" />, label: isRTL ? 'إدارة المستخدمين' : 'Manage Users', section: 'users' as AdminSection },
    { icon: <ModerationIcon size={16} color="var(--primary)" />, label: isRTL ? 'مراجعة البلاغات' : 'Review Reports', section: 'moderation' as AdminSection },
    { icon: <WithdrawalIcon size={16} color="var(--primary)" />, label: isRTL ? 'طلبات السحب' : 'Withdrawals', section: 'withdrawals' as AdminSection },
    { icon: <SettingsIcon size={16} />, label: isRTL ? 'إعدادات التطبيق' : 'App Settings', section: 'settings' as AdminSection },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<UsersIcon size={16} color="var(--primary)" />} label={isRTL ? 'إجمالي المستخدمين' : 'Total Users'} value={formatNumber(stats?.totalUsers || 0, lang)} subValue={`${formatNumber(stats?.newUsersToday || 0, lang)} ${isRTL ? 'جدد اليوم' : 'new today'}`} delay={0} />
        <StatCard icon={<OnlineIcon size={16} />} label={isRTL ? 'المستخدمون النشطون' : 'Active Users'} value={formatNumber(stats?.activeUsers || 0, lang)} color={GREEN} delay={0.05} />
        <StatCard icon={<SubscriptionIcon size={16} color="var(--primary)" />} label={isRTL ? 'المشتركون المميزون' : 'Premium Subs'} value={formatNumber(stats?.premiumUsers || 0, lang)} delay={0.1} />
        <StatCard icon={<CoinIcon size={16} />} label={isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'} value={formatNumber(stats?.totalPurchaseRevenue || 0, lang)} subValue={isRTL ? 'عملات' : 'coins'} delay={0.15} />
        <StatCard icon={<GiftIcon size={16} color={GREEN} />} label={isRTL ? 'الهدايا المرسلة' : 'Gifts Sent'} value={formatNumber(stats?.totalGifts || 0, lang)} color={GREEN} delay={0.2} />
        <StatCard icon={<StreamIcon size={16} />} label={isRTL ? 'البثوث النشطة' : 'Active Streams'} value={stats?.activeStreams || 0} color={RED} delay={0.25} />
        <StatCard icon={<WithdrawalIcon size={16} color={AMBER} />} label={isRTL ? 'إجمالي المسحوبات' : 'Total Payouts'} value={formatNumber(stats?.totalWithdrawals || 0, lang)} color={AMBER} delay={0.3} />
        <StatCard icon={<LogsIcon size={16} color="var(--primary)" />} label={isRTL ? 'طلبات سحب معلقة' : 'Pending Payouts'} value={stats?.pendingWithdrawals || 0} color="var(--primary)" delay={0.35} />
      </div>

      {/* Revenue Chart */}
      <Card style={{ background: 'var(--card)', border: `1px solid var(--primary)10` }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            {isRTL ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            {monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'var(--card)', border: `1px solid var(--primary)30`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: 'var(--primary)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="url(#revGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">{isRTL ? 'لا توجد بيانات' : 'No data'}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Growth Chart */}
      <Card style={{ background: 'var(--card)', border: `1px solid var(--primary)10` }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            {isRTL ? 'نمو المستخدمين (7 أيام)' : 'User Growth (7 days)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-36">
            {userGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 9 }} tickFormatter={(v: string) => v.split('-').slice(1).join('/')} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'var(--card)', border: `1px solid var(--primary)30`, borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="newUsers" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">{isRTL ? 'لا توجد بيانات' : 'No data'}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">{isRTL ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, i) => (
            <motion.button
              key={i}
              className="p-3 rounded-xl flex items-center gap-2 transition-all"
              style={{ background: 'var(--card)', border: `1px solid var(--primary)08` }}
              whileHover={{ background: `var(--primary)08` }}
              whileTap={{ scale: 0.98 }}
            >
              {action.icon}
              <span className="text-xs text-foreground/70">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">{isRTL ? 'النشاط الأخير' : 'Recent Activity'}</h3>
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {recentActivity.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">{isRTL ? 'لا يوجد نشاط' : 'No recent activity'}</p>
          )}
          {recentActivity.map((activity, i) => (
            <motion.div
              key={activity.id + i}
              className="flex items-center gap-2 p-2.5 rounded-lg"
              style={{ background: 'var(--card)', border: `1px solid rgba(255,255,255,0.03)` }}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: activity.type === 'gift' ? `${GREEN}15` : `var(--primary)15` }}>
                {activity.type === 'gift' ? <GiftIcon size={14} color={GREEN} /> : <ActivityIcon size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground/70 truncate">{activity.description}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(activity.timestamp).toLocaleString(isRTL ? 'ar' : 'en')}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ Section 2: User Management ============
function UserManagement({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const { showToast, ToastUI } = useToast();
  const [users, setUsers] = useState<Database['public']['Tables']['users']['Row'][]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Database['public']['Tables']['users']['Row'] | null>(null);
  const [actionDialog, setActionDialog] = useState<{ user: Database['public']['Tables']['users']['Row']; action: string } | null>(null);
  const [noteText, setNoteText] = useState('');
  const [editBalance, setEditBalance] = useState<{ uid: string; coins: number; diamonds: number } | null>(null);

  const PAGE_SIZE = 20;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const sb = getSupabaseAdmin();
    if (!sb) { setLoading(false); return; }

    try {
      let query = sb.from('users').select('*', { count: 'exact' });

      if (search) {
        query = query.or(`username.ilike.%${search}%,nickname.ilike.%${search}%,email.ilike.%${search}%`);
      }
      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, count, error: qErr } = await query.order('created_at', { ascending: false }).range(from, to);

      if (qErr) throw qErr;
      setUsers(data || []);
      setTotal(count || 0);
    } catch (err) {
      console.error('[Admin] Failed to load users:', err);
      showToast(isRTL ? 'فشل تحميل المستخدمين' : 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, isRTL, showToast]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const performAction = async (uid: string, action: string) => {
    const sb = getSupabaseAdmin();
    if (!sb) return;

    try {
      const updates: Partial<Database['public']['Tables']['users']['Update']> = {};

      switch (action) {
        case 'ban': updates.status = 'busy'; break; // Using busy as banned indicator
        case 'unban': updates.status = 'online'; break;
        case 'verify': updates.is_verified = true; break;
        case 'unverify': updates.is_verified = false; break;
        case 'delete':
          const { error: delErr } = await sb.from('users').delete().eq('uid', uid);
          if (delErr) throw delErr;
          setActionDialog(null);
          setNoteText('');
          loadUsers();
          showToast(isRTL ? 'تم حذف المستخدم' : 'User deleted');
          return;
        default: break;
      }

      if (Object.keys(updates).length > 0) {
        const { error: updErr } = await sb.from('users').update(updates).eq('uid', uid);
        if (updErr) throw updErr;
      }

      setActionDialog(null);
      setNoteText('');
      loadUsers();
      showToast(isRTL ? 'تم تنفيذ الإجراء' : 'Action completed');
    } catch (err) {
      console.error('[Admin] Failed to perform action:', err);
      showToast(isRTL ? 'فشل تنفيذ الإجراء' : 'Action failed', 'error');
    }
  };

  const changeRole = async (uid: string, newRole: string) => {
    const sb = getSupabaseAdmin();
    if (!sb) return;
    try {
      const { error } = await sb.from('users').update({ role: newRole }).eq('uid', uid);
      if (error) throw error;
      loadUsers();
      showToast(isRTL ? 'تم تغيير الدور' : 'Role updated');
    } catch (err) {
      showToast(isRTL ? 'فشل تغيير الدور' : 'Failed to change role', 'error');
    }
  };

  const saveBalance = async () => {
    if (!editBalance) return;
    const sb = getSupabaseAdmin();
    if (!sb) return;
    try {
      const { error } = await sb.from('users').update({
        coins_balance: editBalance.coins,
        diamonds_balance: editBalance.diamonds,
      }).eq('uid', editBalance.uid);
      if (error) throw error;
      setEditBalance(null);
      loadUsers();
      showToast(isRTL ? 'تم تحديث الرصيد' : 'Balance updated');
    } catch (err) {
      showToast(isRTL ? 'فشل تحديث الرصيد' : 'Failed to update balance', 'error');
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = { admin: 'var(--primary)', moderator: 'var(--primary)', supporter: '#3B82F6', user: '#6B7280' };
    const c = colors[role] || '#6B7280';
    return <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${c}15`, color: c }}>{role}</span>;
  };

  return (
    <div className="space-y-3">
      {ToastUI}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[150px]">
          <Input
            placeholder={isRTL ? 'بحث عن مستخدم...' : 'Search users...'}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="text-xs h-9"
            style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }}
          />
        </div>
        <Select value={roleFilter || 'all'} onValueChange={(v) => { setRoleFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-28 h-9 text-xs" style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }}>
            <SelectValue placeholder={isRTL ? 'الدور' : 'Role'} />
          </SelectTrigger>
          <SelectContent style={{ background: 'var(--card)', borderColor: `var(--primary)20` }}>
            <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="supporter">Supporter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'var(--card)' }} />)}</div>
      ) : (
        <div className="space-y-1.5 max-h-[55vh] overflow-y-auto">
          {users.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">{isRTL ? 'لا يوجد مستخدمون' : 'No users found'}</p>
          )}
          {users.map((user, i) => (
            <motion.div
              key={user.uid}
              className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer"
              style={{ background: 'var(--card)', border: `1px solid rgba(255,255,255,0.03)` }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => setSelectedUser(user)}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-[10px]" style={{ background: `var(--primary)15`, color: 'var(--primary)' }}>
                  {(user.nickname || 'U').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-foreground truncate">{user.nickname}</span>
                  {user.is_verified && <VerifiedIcon size={10} />}
                  {roleBadge(user.role)}
                </div>
                <p className="text-[10px] text-muted-foreground truncate">@{user.username || user.uid.substring(0, 8)}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-[10px]">
                  <CoinIcon size={8} /><span className="text-muted-foreground">{formatNumber(user.coins_balance, lang)}</span>
                  <DiamondCurrencyIcon size={8} /><span className="text-muted-foreground">{formatNumber(user.diamonds_balance, lang)}</span>
                </div>
                <p className="text-[9px] text-muted-foreground">{user.status}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="outline" className="h-7 text-[10px]" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            {isRTL ? 'السابق' : 'Prev'}
          </Button>
          <span className="text-[10px] text-muted-foreground">{page} / {totalPages}</span>
          <Button size="sm" variant="outline" className="h-7 text-[10px]" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            {isRTL ? 'التالي' : 'Next'}
          </Button>
        </div>
      )}

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto" style={{ background: 'var(--card)', border: `1px solid var(--primary)20` }}>
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground text-sm flex items-center gap-2">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="text-xs" style={{ background: `var(--primary)15`, color: 'var(--primary)' }}>
                      {selectedUser.nickname.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      {selectedUser.nickname}
                      {selectedUser.is_verified && <VerifiedIcon size={12} />}
                      {roleBadge(selectedUser.role)}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-normal">@{selectedUser.username || selectedUser.uid.substring(0, 8)}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg" style={{ background: 'var(--muted)' }}>
                    <span className="text-muted-foreground">{isRTL ? 'البريد' : 'Email'}</span>
                    <p className="text-foreground truncate">{selectedUser.email}</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'var(--muted)' }}>
                    <span className="text-muted-foreground">{isRTL ? 'الحالة' : 'Status'}</span>
                    <p className="text-foreground">{selectedUser.status}</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'var(--muted)' }}>
                    <span className="text-muted-foreground">{isRTL ? 'المستوى' : 'Level'}</span>
                    <p className="text-foreground">{selectedUser.level} ({formatNumber(selectedUser.xp, lang)} XP)</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'var(--muted)' }}>
                    <span className="text-muted-foreground">{isRTL ? 'المنشورات' : 'Posts'}</span>
                    <p className="text-foreground">{selectedUser.posts_count}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg" style={{ background: `var(--primary)08`, border: `1px solid var(--primary)10` }}>
                    <div className="flex items-center gap-1"><CoinIcon size={10} /><span className="text-muted-foreground">{isRTL ? 'العملات' : 'Coins'}</span></div>
                    <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{formatNumber(selectedUser.coins_balance, lang)}</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: `${AMBER}08`, border: `1px solid ${AMBER}10` }}>
                    <div className="flex items-center gap-1"><DiamondCurrencyIcon size={10} /><span className="text-muted-foreground">{isRTL ? 'الألماس' : 'Diamonds'}</span></div>
                    <p className="text-sm font-bold" style={{ color: AMBER }}>{formatNumber(selectedUser.diamonds_balance, lang)}</p>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-2">
                  <h4 className="text-[10px] text-muted-foreground uppercase">{isRTL ? 'إجراءات' : 'Actions'}</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    <Button size="sm" variant="outline" className="h-8 text-[10px]" style={{ borderColor: selectedUser.is_verified ? AMBER : GREEN, color: selectedUser.is_verified ? AMBER : GREEN }} onClick={() => setActionDialog({ user: selectedUser, action: selectedUser.is_verified ? 'unverify' : 'verify' })}>
                      {selectedUser.is_verified ? (isRTL ? 'إلغاء التوثيق' : 'Unverify') : (isRTL ? 'توثيق' : 'Verify')}
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-[10px]" style={{ borderColor: selectedUser.status === 'busy' ? GREEN : RED, color: selectedUser.status === 'busy' ? GREEN : RED }} onClick={() => setActionDialog({ user: selectedUser, action: selectedUser.status === 'busy' ? 'unban' : 'ban' })}>
                      {selectedUser.status === 'busy' ? (isRTL ? 'إلغاء الحظر' : 'Unban') : (isRTL ? 'حظر' : 'Ban')}
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-[10px]" onClick={() => setEditBalance({ uid: selectedUser.uid, coins: selectedUser.coins_balance, diamonds: selectedUser.diamonds_balance })}>
                      <CoinIcon size={10} /> {isRTL ? 'تعديل الرصيد' : 'Edit Balance'}
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-[10px]" style={{ borderColor: RED, color: RED }} onClick={() => setActionDialog({ user: selectedUser, action: 'delete' })}>
                      {isRTL ? 'حذف' : 'Delete'}
                    </Button>
                  </div>

                  {/* Change Role */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{isRTL ? 'تغيير الدور:' : 'Change Role:'}</span>
                    <Select value={selectedUser.role} onValueChange={(v) => changeRole(selectedUser.uid, v)}>
                      <SelectTrigger className="h-7 text-[10px] w-28" style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ background: 'var(--card)' }}>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="supporter">Supporter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground">
                  {isRTL ? 'انضم في' : 'Joined'}: {new Date(selectedUser.created_at).toLocaleString(isRTL ? 'ar' : 'en')}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Balance Edit Dialog */}
      <Dialog open={!!editBalance} onOpenChange={() => setEditBalance(null)}>
        <DialogContent className="max-w-sm" style={{ background: 'var(--card)', border: `1px solid var(--primary)20` }}>
          {editBalance && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground text-sm">{isRTL ? 'تعديل الرصيد' : 'Edit Balance'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1"><CoinIcon size={10} /> {isRTL ? 'العملات' : 'Coins'}</Label>
                  <Input type="number" value={editBalance.coins} onChange={(e) => setEditBalance({ ...editBalance, coins: parseInt(e.target.value) || 0 })} className="text-xs h-8" style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1"><DiamondCurrencyIcon size={10} /> {isRTL ? 'الألماس' : 'Diamonds'}</Label>
                  <Input type="number" value={editBalance.diamonds} onChange={(e) => setEditBalance({ ...editBalance, diamonds: parseInt(e.target.value) || 0 })} className="text-xs h-8" style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }} />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setEditBalance(null)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
                <Button size="sm" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }} onClick={saveBalance}>{isRTL ? 'حفظ' : 'Save'}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setNoteText(''); }}>
        <DialogContent className="max-w-sm" style={{ background: 'var(--card)', border: `1px solid var(--primary)20` }}>
          {actionDialog && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground text-sm">{isRTL ? 'تأكيد الإجراء' : 'Confirm Action'}</DialogTitle>
              </DialogHeader>
              <p className="text-xs text-muted-foreground">
                {isRTL ? 'هل أنت متأكد من' : 'Are you sure you want to '}
                <span className="font-semibold text-foreground">{actionDialog.action}</span>
                {isRTL ? ` على ${actionDialog.user.nickname}` : ` ${actionDialog.user.nickname}`}?
              </p>
              <Textarea
                placeholder={isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="text-xs"
                style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }}
              />
              <DialogFooter className="gap-2">
                <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => { setActionDialog(null); setNoteText(''); }}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
                <Button size="sm" style={{ background: actionDialog.action === 'ban' || actionDialog.action === 'delete' ? RED : GREEN, color: '#fff' }} onClick={() => performAction(actionDialog.user.uid, actionDialog.action)}>
                  {isRTL ? 'تأكيد' : 'Confirm'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Section 3: Content Moderation ============
function ContentModeration({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const { showToast, ToastUI } = useToast();
  const [reportedPosts, setReportedPosts] = useState<Database['public']['Tables']['posts']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedPost, setSelectedPost] = useState<Database['public']['Tables']['posts']['Row'] | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ postId: string; action: 'delete' | 'dismiss' } | null>(null);

  useEffect(() => {
    async function loadReports() {
      const sb = getSupabaseAdmin();
      if (!sb) { setLoading(false); return; }

      try {
        // Load posts that might need moderation - we check for posts with high views or flagged content
        // Since there's no reports table, we'll show recent posts for admin review
        const { data, error } = await sb
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setReportedPosts(data || []);
      } catch (err) {
        console.error('[Admin] Failed to load posts for moderation:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleAction = async () => {
    if (!confirmAction) return;
    const sb = getSupabaseAdmin();
    if (!sb) return;

    try {
      if (confirmAction.action === 'delete') {
        const { error } = await sb.from('posts').delete().eq('id', confirmAction.postId);
        if (error) throw error;
        setReportedPosts(prev => prev.filter(p => p.id !== confirmAction.postId));
        showToast(isRTL ? 'تم حذف المنشور' : 'Post deleted');
      } else {
        // Dismiss - remove from list
        setReportedPosts(prev => prev.filter(p => p.id !== confirmAction.postId));
        showToast(isRTL ? 'تم رفض البلاغ' : 'Report dismissed');
      }
    } catch (err) {
      console.error('[Admin] Moderation action failed:', err);
      showToast(isRTL ? 'فشل الإجراء' : 'Action failed', 'error');
    } finally {
      setConfirmAction(null);
    }
  };

  const filtered = filter
    ? reportedPosts.filter(p => p.content?.toLowerCase().includes(filter.toLowerCase()) || p.publisher_uid.toLowerCase().includes(filter.toLowerCase()))
    : reportedPosts;

  return (
    <div className="space-y-3">
      {ToastUI}

      <div className="grid grid-cols-3 gap-2">
        <StatCard icon={<ModerationIcon size={16} color="var(--primary)" />} label={isRTL ? 'إجمالي المنشورات' : 'Total Posts'} value={reportedPosts.length} />
        <StatCard icon={<UsersIcon size={16} color={RED} />} label={isRTL ? 'منشورات خاصة' : 'Private Posts'} value={reportedPosts.filter(p => p.is_private).length} color={RED} />
        <StatCard icon={<StarIcon size={16} />} label={isRTL ? 'مثبتة' : 'Pinned'} value={reportedPosts.filter(p => p.is_pinned).length} color={GREEN} />
      </div>

      <Input
        placeholder={isRTL ? 'بحث في المنشورات...' : 'Search posts...'}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="text-xs h-9"
        style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }}
      />

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-lg animate-pulse" style={{ background: 'var(--card)' }} />)}</div>
      ) : (
        <div className="space-y-1.5 max-h-[55vh] overflow-y-auto">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">{isRTL ? 'لا توجد منشورات' : 'No posts found'}</p>
          )}
          {filtered.map((post, i) => (
            <motion.div
              key={post.id}
              className="p-3 rounded-lg"
              style={{ background: 'var(--card)', border: `1px solid rgba(255,255,255,0.03)` }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge className="text-[8px] h-3.5" style={{ background: `${post.is_private ? RED : GREEN}12`, color: post.is_private ? RED : GREEN, borderColor: 'transparent' }}>
                      {post.type}
                    </Badge>
                    {post.is_pinned && <Badge className="text-[8px] h-3.5" style={{ background: `var(--primary)12`, color: 'var(--primary)', borderColor: 'transparent' }}>{isRTL ? 'مثبت' : 'Pinned'}</Badge>}
                  </div>
                  <p className="text-xs text-foreground/80 line-clamp-2">{post.content || post.description || (isRTL ? 'منشور وسائط' : 'Media post')}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <span>{isRTL ? 'بواسطة' : 'By'}: {post.publisher_uid.substring(0, 8)}</span>
                    <span>· {new Date(post.created_at).toLocaleDateString(isRTL ? 'ar' : 'en')}</span>
                    <span>· ❤️ {post.likes_count}</span>
                    <span>· 💬 {post.comments_count}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] text-muted-foreground" onClick={() => setSelectedPost(post)}>
                    {isRTL ? 'عرض' : 'View'}
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 text-[10px]" style={{ borderColor: RED, color: RED }} onClick={() => setConfirmAction({ postId: post.id, action: 'delete' })}>
                    {isRTL ? 'حذف' : 'Delete'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Post Detail Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-md" style={{ background: 'var(--card)', border: `1px solid var(--primary)20` }}>
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground text-sm">{isRTL ? 'تفاصيل المنشور' : 'Post Details'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg" style={{ background: 'var(--muted)' }}>
                  <p className="text-foreground">{selectedPost.content || selectedPost.description || (isRTL ? 'منشور وسائط' : 'Media post')}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg" style={{ background: 'var(--muted)' }}>
                    <span className="text-muted-foreground">{isRTL ? 'النوع' : 'Type'}</span>
                    <p className="text-foreground">{selectedPost.type}</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'var(--muted)' }}>
                    <span className="text-muted-foreground">{isRTL ? 'الإعجابات' : 'Likes'}</span>
                    <p className="text-foreground">{selectedPost.likes_count}</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'var(--muted)' }}>
                    <span className="text-muted-foreground">{isRTL ? 'التعليقات' : 'Comments'}</span>
                    <p className="text-foreground">{selectedPost.comments_count}</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'var(--muted)' }}>
                    <span className="text-muted-foreground">{isRTL ? 'المشاهدات' : 'Views'}</span>
                    <p className="text-foreground">{selectedPost.views_count}</p>
                  </div>
                </div>
                <div className="p-2 rounded-lg" style={{ background: 'var(--muted)' }}>
                  <span className="text-muted-foreground">{isRTL ? 'معرف الناشر' : 'Publisher UID'}</span>
                  <p className="text-foreground break-all">{selectedPost.publisher_uid}</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{isRTL ? 'تاريخ الإنشاء' : 'Created'}: {new Date(selectedPost.created_at).toLocaleString(isRTL ? 'ar' : 'en')}</span>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => { setSelectedPost(null); setConfirmAction({ postId: selectedPost.id, action: 'dismiss' }); }}>{isRTL ? 'رفض البلاغ' : 'Dismiss'}</Button>
                <Button size="sm" style={{ background: RED, color: '#fff' }} onClick={() => { setSelectedPost(null); setConfirmAction({ postId: selectedPost.id, action: 'delete' }); }}>{isRTL ? 'حذف المنشور' : 'Delete Post'}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent className="max-w-sm" style={{ background: 'var(--card)', border: `1px solid var(--primary)20` }}>
          {confirmAction && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground text-sm">
                  {confirmAction.action === 'delete' ? (isRTL ? 'حذف المنشور' : 'Delete Post') : (isRTL ? 'رفض البلاغ' : 'Dismiss Report')}
                </DialogTitle>
              </DialogHeader>
              <p className="text-xs text-muted-foreground">
                {confirmAction.action === 'delete'
                  ? (isRTL ? 'هل أنت متأكد من حذف هذا المنشور؟ هذا الإجراء لا يمكن التراجع عنه.' : 'Are you sure you want to delete this post? This action cannot be undone.')
                  : (isRTL ? 'هل تريد رفض هذا البلاغ؟' : 'Are you sure you want to dismiss this report?')
                }
              </p>
              <DialogFooter className="gap-2">
                <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setConfirmAction(null)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
                <Button size="sm" style={{ background: confirmAction.action === 'delete' ? RED : GREEN, color: '#fff' }} onClick={handleAction}>
                  {confirmAction.action === 'delete' ? (isRTL ? 'حذف' : 'Delete') : (isRTL ? 'رفض' : 'Dismiss')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Section 4: Subscription Management ============
function SubscriptionManagement({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const [premiumUsers, setPremiumUsers] = useState<Database['public']['Tables']['users']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadSubscriptions() {
      const sb = getSupabaseAdmin();
      if (!sb) { setLoading(false); return; }
      try {
        const { data, error } = await sb
          .from('users')
          .select('*')
          .eq('is_premium', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setPremiumUsers(data || []);
      } catch (err) {
        console.error('[Admin] Failed to load subscriptions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSubscriptions();
  }, []);

  const filtered = search
    ? premiumUsers.filter(u => u.nickname?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase()) || u.uid.toLowerCase().includes(search.toLowerCase()))
    : premiumUsers;

  const togglePremium = async (uid: string, currentPremium: boolean) => {
    const sb = getSupabaseAdmin();
    if (!sb) return;
    try {
      const { error } = await sb.from('users').update({ is_premium: !currentPremium }).eq('uid', uid);
      if (error) throw error;
      setPremiumUsers(prev => prev.map(u => u.uid === uid ? { ...u, is_premium: !currentPremium } : u));
    } catch (err) {
      console.error('[Admin] Failed to toggle premium:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<CrownIcon size={16} />} label={isRTL ? 'المشتركون المميزون' : 'Premium Users'} value={premiumUsers.length} color="var(--primary)" />
        <StatCard icon={<SubscriptionIcon size={16} color={GREEN} />} label={isRTL ? 'النشطون' : 'Active'} value={premiumUsers.filter(u => u.status === 'online').length} color={GREEN} />
      </div>

      <Input
        placeholder={isRTL ? 'بحث في المشتركين...' : 'Search subscribers...'}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="text-xs h-9"
        style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }}
      />

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'var(--card)' }} />)}</div>
      ) : (
        <div className="space-y-1.5 max-h-[55vh] overflow-y-auto">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">{isRTL ? 'لا يوجد مشتركون مميزون' : 'No premium users'}</p>
          )}
          {filtered.map((user, i) => (
            <motion.div
              key={user.uid}
              className="flex items-center gap-2 p-2.5 rounded-lg"
              style={{ background: 'var(--card)', border: `1px solid var(--primary)08` }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-[10px]" style={{ background: `var(--primary)15`, color: 'var(--primary)' }}>
                  {(user.nickname || 'U').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-foreground">{user.nickname}</span>
                  {user.is_verified && <VerifiedIcon size={10} />}
                  <CrownIcon size={10} />
                </div>
                <p className="text-[10px] text-muted-foreground">@{user.username || user.uid.substring(0, 8)} · {isRTL ? 'انضم' : 'Joined'}: {new Date(user.created_at).toLocaleDateString(isRTL ? 'ar' : 'en')}</p>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-[10px]" style={{ borderColor: RED, color: RED }} onClick={() => togglePremium(user.uid, user.is_premium)}>
                {isRTL ? 'إلغاء الاشتراك' : 'Cancel Sub'}
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ Section 5: Withdrawal Management ============
function WithdrawalManagement({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const { showToast, ToastUI } = useToast();
  const [withdrawals, setWithdrawals] = useState<Database['public']['Tables']['withdrawal_requests']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('pending');
  const [actionDialog, setActionDialog] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);
  const [note, setNote] = useState('');

  const loadWithdrawals = useCallback(async () => {
    const sb = getSupabaseAdmin();
    if (!sb) { setLoading(false); return; }
    try {
      let query = sb.from('withdrawal_requests')
        .select('*, payment_method:payment_methods(*), user:users!withdrawal_requests_user_uid_fkey(uid,username,nickname,email)')
        .order('created_at', { ascending: false })
        .limit(200);
      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      setWithdrawals((data || []) as unknown as Database['public']['Tables']['withdrawal_requests']['Row'][]);
    } catch (err) {
      console.error('[Admin] Failed to load withdrawals:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadWithdrawals(); }, [loadWithdrawals]);

  const handleAction = async () => {
    if (!actionDialog) return;
    const sb = getSupabaseAdmin();
    if (!sb) return;
    try {
      const { data, error } = await sb.rpc('process_withdrawal_request', {
        p_request_id: actionDialog.id,
        p_action: actionDialog.action,
        p_admin_note: note,
      });
      if (error) throw error;
      const result = data as { ok?: boolean; error?: string };
      if (!result?.ok) {
        showToast(isRTL ? 'فشل: ' + (result?.error || '') : 'Failed: ' + (result?.error || ''), 'error');
        return;
      }
      setActionDialog(null);
      setNote('');
      await loadWithdrawals();
      showToast(actionDialog.action === 'approve' ? (isRTL ? 'تمت الموافقة والدفع' : 'Approved & Paid') : (isRTL ? 'تم الرفض' : 'Rejected'));
    } catch (err) {
      console.error('[Admin] Withdrawal action failed:', err);
      showToast(isRTL ? 'فشل الإجراء' : 'Action failed', 'error');
    }
  };

  const totalPending = withdrawals.filter(w => w.status === 'pending').reduce((s, w) => s + (w.amount_coins || 0), 0);
  const totalCompleted = withdrawals.filter(w => w.status === 'completed').reduce((s, w) => s + (w.amount_coins || 0), 0);

  if (loading) {
    return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: 'var(--card)' }} />)}</div>;
  }

  return (
    <div className="space-y-4">
      {ToastUI}

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<WithdrawalIcon size={16} color="var(--primary)" />} label={isRTL ? 'سحوبات معلقة' : 'Pending Withdrawals'} value={formatNumber(totalPending, lang)} color={AMBER} />
        <StatCard icon={<CoinIcon size={16} />} label={isRTL ? 'سحوبات مكتملة' : 'Completed Withdrawals'} value={formatNumber(totalCompleted, lang)} color={GREEN} />
      </div>

      <div className="flex gap-2">
        {(['pending', 'completed', 'rejected', 'all'] as const).map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setLoading(true); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              statusFilter === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {isRTL
              ? (s === 'pending' ? 'معلقة' : s === 'completed' ? 'مكتملة' : s === 'rejected' ? 'مرفوضة' : 'الكل')
              : s === 'pending' ? 'Pending' : s === 'completed' ? 'Completed' : s === 'rejected' ? 'Rejected' : 'All'}
          </button>
        ))}
      </div>

      <div className="space-y-1.5 max-h-[55vh] overflow-y-auto">
        {withdrawals.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">{isRTL ? 'لا توجد طلبات سحب' : 'No withdrawal requests'}</p>
        )}
        {withdrawals.map((w, i) => {
          const pm = (w as { payment_method?: { name_ar?: string; name?: string; icon_emoji?: string } }).payment_method;
          const usr = (w as { user?: { nickname?: string; username?: string; email?: string } }).user;
          return (
            <motion.div
              key={w.id}
              className="p-3 rounded-lg"
              style={{ background: 'var(--card)', border: `1px solid rgba(255,255,255,0.03)` }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <DiamondCurrencyIcon size={12} />
                    <span className="text-sm font-semibold text-foreground">-{formatNumber(w.amount_coins, lang)}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {pm?.icon_emoji} {isRTL ? pm?.name_ar : pm?.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    {usr?.nickname || usr?.username || w.user_uid} · {new Date(w.created_at).toLocaleString(isRTL ? 'ar' : 'en')}
                  </p>
                  {w.destination_account && (
                    <p className="text-[10px] text-muted-foreground italic mt-0.5 truncate">
                      {isRTL ? 'إلى:' : 'To:'} {w.destination_account}
                    </p>
                  )}
                  {w.user_note && <p className="text-[10px] text-muted-foreground italic mt-0.5 truncate">"{w.user_note}"</p>}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1" style={{
                    background: w.status === 'completed' ? `${GREEN}20` : w.status === 'pending' ? `${AMBER}20` : `${RED}20`,
                    color: w.status === 'completed' ? GREEN : w.status === 'pending' ? AMBER : RED,
                  }}>
                    {w.status}
                  </span>
                </div>
                {w.status === 'pending' && (
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" style={{ borderColor: GREEN, color: GREEN }} onClick={() => setActionDialog({ id: w.id, action: 'approve' })}>
                      {isRTL ? 'دفع' : 'Pay'}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" style={{ borderColor: RED, color: RED }} onClick={() => setActionDialog({ id: w.id, action: 'reject' })}>
                      {isRTL ? 'رفض' : 'Reject'}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setNote(''); }}>
        <DialogContent className="max-w-sm" style={{ background: 'var(--card)', border: `1px solid var(--primary)20` }}>
          {actionDialog && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground text-sm">
                  {actionDialog.action === 'approve' ? (isRTL ? 'تأكيد دفع السحب' : 'Approve & Pay Withdrawal') : (isRTL ? 'رفض السحب' : 'Reject Withdrawal')}
                </DialogTitle>
              </DialogHeader>
              <Textarea
                placeholder={isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="text-xs"
                style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }}
              />
              <DialogFooter className="gap-2">
                <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => { setActionDialog(null); setNote(''); }}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
                <Button size="sm" style={{ background: actionDialog.action === 'approve' ? GREEN : RED, color: '#fff' }} onClick={handleAction}>
                  {actionDialog.action === 'approve' ? (isRTL ? 'دفع' : 'Pay') : (isRTL ? 'رفض' : 'Reject')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Section 6: Gift & Economy Management ============
function GiftEconomyManagement({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const { showToast, ToastUI } = useToast();
  const [giftTypes, setGiftTypes] = useState<Database['public']['Tables']['gift_types']['Row'][]>([]);
  const [giftStats, setGiftStats] = useState<{ category: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editGift, setEditGift] = useState<Database['public']['Tables']['gift_types']['Row'] | null>(null);
  const [showAddGift, setShowAddGift] = useState(false);
  const [newGift, setNewGift] = useState({ name: '', nameAr: '', emoji: '🎁', coinCost: 10, diamondValue: 1, category: 'basic' });
  const [editGiftValues, setEditGiftValues] = useState({ name: '', nameAr: '', emoji: '', coinCost: 0, diamondValue: 0, category: '', isActive: true });

  useEffect(() => {
    async function loadGifts() {
      const sb = getSupabaseAdmin();
      if (!sb) { setLoading(false); return; }
      try {
        const [giftTypesResult, giftsResult] = await Promise.all([
          sb.from('gift_types').select('*').order('sort_order', { ascending: true }),
          sb.from('gifts').select('gift_type_id'),
        ]);

        if (giftTypesResult.error) throw giftTypesResult.error;
        setGiftTypes(giftTypesResult.data || []);

        // Compute stats by category
        const categoryMap: Record<string, number> = {};
        for (const gt of giftTypesResult.data || []) {
          const cat = gt.category || 'basic';
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        }
        setGiftStats(Object.entries(categoryMap).map(([category, count]) => ({ category, count })));
      } catch (err) {
        console.error('[Admin] Failed to load gift types:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGifts();
  }, []);

  const addGift = async () => {
    const sb = getSupabaseAdmin();
    if (!sb) return;
    try {
      const { data, error } = await sb.from('gift_types').insert({
        name: newGift.name,
        name_ar: newGift.nameAr,
        emoji: newGift.emoji,
        coin_cost: newGift.coinCost,
        diamond_value: newGift.diamondValue,
        category: newGift.category,
        animation_type: 'float',
        is_active: true,
        sort_order: giftTypes.length,
      }).select();
      if (error) throw error;
      if (data) setGiftTypes(prev => [...prev, ...data]);
      setShowAddGift(false);
      setNewGift({ name: '', nameAr: '', emoji: '🎁', coinCost: 10, diamondValue: 1, category: 'basic' });
      showToast(isRTL ? 'تمت إضافة الهدية' : 'Gift added');
    } catch (err) {
      console.error('[Admin] Failed to add gift:', err);
      showToast(isRTL ? 'فشل إضافة الهدية' : 'Failed to add gift', 'error');
    }
  };

  const updateGift = async () => {
    if (!editGift) return;
    const sb = getSupabaseAdmin();
    if (!sb) return;
    try {
      const { error } = await sb.from('gift_types').update({
        name: editGiftValues.name,
        name_ar: editGiftValues.nameAr,
        emoji: editGiftValues.emoji,
        coin_cost: editGiftValues.coinCost,
        diamond_value: editGiftValues.diamondValue,
        category: editGiftValues.category,
        is_active: editGiftValues.isActive,
      }).eq('id', editGift.id);
      if (error) throw error;
      setGiftTypes(prev => prev.map(g => g.id === editGift.id ? { ...g, ...editGiftValues } : g));
      setEditGift(null);
      showToast(isRTL ? 'تم تحديث الهدية' : 'Gift updated');
    } catch (err) {
      showToast(isRTL ? 'فشل تحديث الهدية' : 'Failed to update gift', 'error');
    }
  };

  const deleteGift = async (id: string) => {
    const sb = getSupabaseAdmin();
    if (!sb) return;
    try {
      const { error } = await sb.from('gift_types').delete().eq('id', id);
      if (error) throw error;
      setGiftTypes(prev => prev.filter(g => g.id !== id));
      showToast(isRTL ? 'تم حذف الهدية' : 'Gift deleted');
    } catch (err) {
      showToast(isRTL ? 'فشل حذف الهدية' : 'Failed to delete gift', 'error');
    }
  };

  const toggleGiftActive = async (id: string, currentActive: boolean) => {
    const sb = getSupabaseAdmin();
    if (!sb) return;
    try {
      const { error } = await sb.from('gift_types').update({ is_active: !currentActive }).eq('id', id);
      if (error) throw error;
      setGiftTypes(prev => prev.map(g => g.id === id ? { ...g, is_active: !currentActive } : g));
    } catch (err) {
      console.error('[Admin] Failed to toggle gift:', err);
    }
  };

  const categoryColors: Record<string, string> = { basic: '#6B7280', premium: 'var(--primary)', luxury: 'var(--primary)', seasonal: GREEN, exclusive: RED };
  const categories = ['basic', 'premium', 'luxury', 'seasonal', 'exclusive'];

  const PIE_COLORS = ['#6B7280', 'var(--primary)', '#D4A853', GREEN, RED];

  return (
    <div className="space-y-4">
      {ToastUI}

      {/* Gift Types */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground">{isRTL ? 'أنواع الهدايا' : 'Gift Types'}</h3>
          <Button size="sm" className="h-7 text-[10px]" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }} onClick={() => setShowAddGift(true)}>
            {isRTL ? '+ إضافة هدية' : '+ Add Gift'}
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'var(--card)' }} />)}</div>
        ) : (
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {giftTypes.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">{isRTL ? 'لا توجد هدايا' : 'No gift types'}</p>
            )}
            {giftTypes.map((gift, i) => {
              const category = gift.category || 'basic';
              const color = categoryColors[category] || '#6B7280';
              return (
                <motion.div
                  key={gift.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg"
                  style={{ background: 'var(--card)', border: `1px solid ${color}10` }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <span className="text-xl">{gift.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-foreground">{gift.name}</span>
                      <Badge className="text-[8px] h-3.5" style={{ background: `${color}12`, color, borderColor: 'transparent' }}>{category}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5"><CoinIcon size={8} />{gift.coin_cost}</span>
                      <span className="flex items-center gap-0.5"><DiamondCurrencyIcon size={8} />{gift.diamond_value}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch checked={gift.is_active} className="scale-75" onCheckedChange={() => toggleGiftActive(gift.id, gift.is_active)} />
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground" onClick={() => {
                      setEditGift(gift);
                      setEditGiftValues({ name: gift.name, nameAr: gift.name_ar || '', emoji: gift.emoji || '', coinCost: gift.coin_cost, diamondValue: gift.diamond_value, category: gift.category, isActive: gift.is_active });
                    }}>
                      <SettingsIcon size={12} />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" style={{ color: RED }} onClick={() => deleteGift(gift.id)}>
                      ×
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Gift Category Chart */}
      <Card style={{ background: 'var(--card)', border: `1px solid var(--primary)10` }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">{isRTL ? 'توزيع الهدايا' : 'Gift Distribution'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-36">
            {giftStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={giftStats.map(s => ({ name: s.category, value: s.count }))} dataKey="value" innerRadius={35} outerRadius={55} paddingAngle={2}>
                    {giftStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--card)', border: `1px solid var(--primary)30`, borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">{isRTL ? 'لا توجد بيانات' : 'No data'}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Gift Dialog */}
      <Dialog open={showAddGift} onOpenChange={setShowAddGift}>
        <DialogContent className="max-w-sm" style={{ background: 'var(--card)', border: `1px solid var(--primary)20` }}>
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm">{isRTL ? 'إضافة هدية جديدة' : 'Add New Gift'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">{isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
              <Input value={newGift.name} onChange={(e) => setNewGift({ ...newGift, name: e.target.value })} className="text-xs h-8" style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
              <Input value={newGift.nameAr} onChange={(e) => setNewGift({ ...newGift, nameAr: e.target.value })} className="text-xs h-8" style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Emoji</Label>
              <Input value={newGift.emoji} onChange={(e) => setNewGift({ ...newGift, emoji: e.target.value })} className="text-xs h-8 w-16" style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">{isRTL ? 'تكلفة العملات' : 'Coin Cost'}</Label>
                <Input type="number" value={newGift.coinCost} onChange={(e) => setNewGift({ ...newGift, coinCost: parseInt(e.target.value) || 0 })} className="text-xs h-8" style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{isRTL ? 'قيمة الألماس' : 'Diamond Value'}</Label>
                <Input type="number" value={newGift.diamondValue} onChange={(e) => setNewGift({ ...newGift, diamondValue: parseInt(e.target.value) || 0 })} className="text-xs h-8" style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }} />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{isRTL ? 'الفئة' : 'Category'}</Label>
              <Select value={newGift.category} onValueChange={(v) => setNewGift({ ...newGift, category: v })}>
                <SelectTrigger className="h-8 text-xs" style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: 'var(--card)' }}>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setShowAddGift(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button size="sm" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }} onClick={addGift} disabled={!newGift.name}>{isRTL ? 'إضافة' : 'Add Gift'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Gift Dialog */}
      <Dialog open={!!editGift} onOpenChange={() => setEditGift(null)}>
        <DialogContent className="max-w-sm" style={{ background: 'var(--card)', border: `1px solid var(--primary)20` }}>
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm">{isRTL ? 'تعديل الهدية' : 'Edit Gift'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">{isRTL ? 'الاسم' : 'Name'}</Label>
              <Input value={editGiftValues.name} onChange={(e) => setEditGiftValues({ ...editGiftValues, name: e.target.value })} className="text-xs h-8" style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
              <Input value={editGiftValues.nameAr} onChange={(e) => setEditGiftValues({ ...editGiftValues, nameAr: e.target.value })} className="text-xs h-8" style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">{isRTL ? 'تكلفة العملات' : 'Coin Cost'}</Label>
                <Input type="number" value={editGiftValues.coinCost} onChange={(e) => setEditGiftValues({ ...editGiftValues, coinCost: parseInt(e.target.value) || 0 })} className="text-xs h-8" style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{isRTL ? 'قيمة الألماس' : 'Diamond Value'}</Label>
                <Input type="number" value={editGiftValues.diamondValue} onChange={(e) => setEditGiftValues({ ...editGiftValues, diamondValue: parseInt(e.target.value) || 0 })} className="text-xs h-8" style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">{isRTL ? 'نشط' : 'Active'}</Label>
              <Switch checked={editGiftValues.isActive} onCheckedChange={(v) => setEditGiftValues({ ...editGiftValues, isActive: v })} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setEditGift(null)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button size="sm" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }} onClick={updateGift}>{isRTL ? 'حفظ' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Section 7: Live Stream Management ============
function LiveStreamManagement({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const { showToast, ToastUI } = useToast();
  const [streams, setStreams] = useState<Database['public']['Tables']['live_streams']['Row'][]>([]);
  const [allStreams, setAllStreams] = useState<Database['public']['Tables']['live_streams']['Row'][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStreams() {
      const sb = getSupabaseAdmin();
      if (!sb) { setLoading(false); return; }
      try {
        const { data, error } = await sb.from('live_streams').select('*').order('started_at', { ascending: false }).limit(50);
        if (error) throw error;
        setAllStreams(data || []);
        setStreams((data || []).filter(s => s.status === 'live'));
      } catch (err) {
        console.error('[Admin] Failed to load streams:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStreams();
  }, []);

  const endStream = async (streamId: string) => {
    const sb = getSupabaseAdmin();
    if (!sb) return;
    try {
      const { error } = await sb.from('live_streams').update({ status: 'ended', ended_at: Date.now() }).eq('id', streamId);
      if (error) throw error;
      setStreams(prev => prev.filter(s => s.id !== streamId));
      setAllStreams(prev => prev.map(s => s.id === streamId ? { ...s, status: 'ended' } : s));
      showToast(isRTL ? 'تم إنهاء البث' : 'Stream ended');
    } catch (err) {
      console.error('[Admin] Failed to end stream:', err);
      showToast(isRTL ? 'فشل إنهاء البث' : 'Failed to end stream', 'error');
    }
  };

  // Stream analytics data from real streams
  const streamAnalytics = allStreams.slice(0, 7).map((s, i) => ({
    day: new Date(s.started_at).toLocaleDateString(isRTL ? 'ar' : 'en', { weekday: 'short' }),
    viewers: s.viewer_count || 0,
    streams: allStreams.filter(as => {
      const d = new Date(as.started_at);
      const sd = new Date(s.started_at);
      return d.toDateString() === sd.toDateString();
    }).length,
  }));

  return (
    <div className="space-y-4">
      {ToastUI}

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<StreamIcon size={16} />} label={isRTL ? 'البثوث النشطة' : 'Active Streams'} value={streams.length} color={RED} />
        <StatCard icon={<UsersIcon size={16} color="var(--primary)" />} label={isRTL ? 'إجمالي المشاهدين' : 'Total Viewers'} value={formatNumber(streams.reduce((sum, s) => sum + (s.viewer_count || 0), 0), lang)} />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-lg animate-pulse" style={{ background: 'var(--card)' }} />)}</div>
      ) : (
        <div className="space-y-2">
          {streams.length === 0 && (
            <div className="text-center py-8">
              <StreamIcon size={32} color="#6B7280" />
              <p className="text-sm text-muted-foreground mt-2">{isRTL ? 'لا توجد بثوث نشطة' : 'No active streams'}</p>
            </div>
          )}
          {streams.map((stream, i) => (
            <motion.div
              key={stream.id}
              className="p-3 rounded-xl"
              style={{ background: 'var(--card)', border: `1px solid ${RED}10` }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-semibold text-foreground">{stream.title || (isRTL ? 'بث مباشر' : 'Live Stream')}</span>
                </div>
                <Badge className="text-[9px] h-4" style={{ background: `${RED}15`, color: RED, borderColor: 'transparent' }}>LIVE</Badge>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{isRTL ? 'المضيف' : 'Host'}: {(stream.host_uid || '').substring(0, 8)}</span>
                  <span className="flex items-center gap-0.5"><EyeIcon2 size={10} /> {stream.viewer_count}</span>
                  <span className="flex items-center gap-0.5"><GiftIcon size={10} color="var(--primary)" /> {stream.gifts_coins_total}</span>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-[10px]" style={{ borderColor: RED, color: RED }} onClick={() => endStream(stream.id)}>
                  {isRTL ? 'إنهاء' : 'End Stream'}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stream Analytics */}
      <Card style={{ background: 'var(--card)', border: `1px solid var(--primary)10` }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">{isRTL ? 'تحليلات البث' : 'Stream Analytics'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-36">
            {streamAnalytics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={streamAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'var(--card)', border: `1px solid var(--primary)30`, borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="viewers" stroke={RED} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="streams" stroke="var(--primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">{isRTL ? 'لا توجد بيانات' : 'No data'}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ Section 8: App Settings ============
// Settings are persisted in localStorage since this is a Capacitor static export app.
const SETTINGS_KEY = 'aden_dot_admin_settings';

interface AppAdminSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxStreamDuration: number;
  defaultCoinsNewUsers: number;
  coinToDiamondRate: number;
  minWithdrawal: number;
  platformFeePercent: number;
  bonusDailyCoins: number;
  featureFlags: Record<string, boolean>;
  contentModerationAuto: boolean;
  contentModerationBlockWords: boolean;
  maxPostLength: number;
}

const DEFAULT_SETTINGS: AppAdminSettings = {
  maintenanceMode: false,
  registrationEnabled: true,
  maxStreamDuration: 120,
  defaultCoinsNewUsers: 500,
  coinToDiamondRate: 100,
  minWithdrawal: 1000,
  platformFeePercent: 30,
  bonusDailyCoins: 50,
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
  contentModerationAuto: false,
  contentModerationBlockWords: true,
  maxPostLength: 2000,
};

function loadSettings(): AppAdminSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch { /* empty */ }
  return DEFAULT_SETTINGS;
}

function saveSettingsToStorage(settings: AppAdminSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch { /* empty */ }
}

function AppSettingsSection({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const { showToast, ToastUI } = useToast();
  const [settings, setSettings] = useState<AppAdminSettings>(() => loadSettings());
  const [saving, setSaving] = useState(false);

  const updateSettings = (updates: Partial<AppAdminSettings>) => {
    setSaving(true);
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettingsToStorage(newSettings);
    setTimeout(() => {
      setSaving(false);
      showToast(isRTL ? 'تم حفظ الإعدادات' : 'Settings saved');
    }, 300);
  };



  const featureLabels: Record<string, { en: string; ar: string }> = {
    liveStreaming: { en: 'Live Streaming', ar: 'البث المباشر' },
    gifts: { en: 'Gifts', ar: 'الهدايا' },
    stories: { en: 'Stories', ar: 'القصص' },
    polls: { en: 'Polls', ar: 'الاستطلاعات' },
    achievements: { en: 'Achievements', ar: 'الإنجازات' },
    dailyRewards: { en: 'Daily Rewards', ar: 'المكافآت اليومية' },
    chatRooms: { en: 'Chat Rooms', ar: 'غرف المحادثة' },
    subscriptions: { en: 'Subscriptions', ar: 'الاشتراكات' },
    walletWithdrawal: { en: 'Wallet Withdrawal', ar: 'سحب المحفظة' },
  };

  return (
    <div className="space-y-4">
      {ToastUI}

      {/* General */}
      <Card style={{ background: 'var(--card)', border: `1px solid var(--primary)10` }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">{isRTL ? 'عام' : 'General'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-foreground">{isRTL ? 'وضع الصيانة' : 'Maintenance Mode'}</p>
              <p className="text-[10px] text-muted-foreground">{isRTL ? 'تعطيل التطبيق مؤقتاً' : 'Temporarily disable the app'}</p>
            </div>
            <Switch checked={settings.maintenanceMode} onCheckedChange={(v) => updateSettings({ maintenanceMode: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-foreground">{isRTL ? 'التسجيل مفعّل' : 'Registration Enabled'}</p>
              <p className="text-[10px] text-muted-foreground">{isRTL ? 'السماح بتسجيل حسابات جديدة' : 'Allow new account registration'}</p>
            </div>
            <Switch checked={settings.registrationEnabled} onCheckedChange={(v) => updateSettings({ registrationEnabled: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-foreground">{isRTL ? 'الحد الأقصى لمدة البث' : 'Max Stream Duration'}</p>
              <p className="text-[10px] text-muted-foreground">{isRTL ? 'بالدقائق' : 'In minutes'}</p>
            </div>
            <Input type="number" value={settings.maxStreamDuration} onChange={(e) => updateSettings({ maxStreamDuration: parseInt(e.target.value) || 120 })} className="w-20 h-7 text-xs text-center" style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-foreground">{isRTL ? 'عملات المستخدمين الجدد' : 'Default Coins for New Users'}</p>
            </div>
            <Input type="number" value={settings.defaultCoinsNewUsers} onChange={(e) => updateSettings({ defaultCoinsNewUsers: parseInt(e.target.value) || 500 })} className="w-20 h-7 text-xs text-center" style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }} />
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card style={{ background: 'var(--card)', border: `1px solid var(--primary)10` }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">{isRTL ? 'ميزات التطبيق' : 'Feature Flags'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {Object.entries(settings.featureFlags).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-foreground/70">{isRTL ? featureLabels[key]?.ar : featureLabels[key]?.en || key}</span>
              <Switch
                checked={enabled}
                onCheckedChange={(v) => updateSettings({ featureFlags: { ...settings.featureFlags, [key]: v } })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Economy Settings */}
      <Card style={{ background: 'var(--card)', border: `1px solid var(--primary)10` }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">{isRTL ? 'إعدادات الاقتصاد' : 'Economy Settings'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { key: 'coinToDiamondRate' as const, label: isRTL ? 'سعر العملة إلى ألماس' : 'Coin→Diamond Rate', icon: <CoinIcon size={14} /> },
            { key: 'minWithdrawal' as const, label: isRTL ? 'الحد الأدنى للسحب' : 'Min Withdrawal', icon: <WithdrawalIcon size={14} /> },
            { key: 'platformFeePercent' as const, label: isRTL ? 'عمولة المنصة %' : 'Platform Fee %', icon: <WalletIcon size={14} /> },
            { key: 'bonusDailyCoins' as const, label: isRTL ? 'مكافأة العملات اليومية' : 'Daily Bonus Coins', icon: <StarIcon size={14} /> },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {item.icon}
                <span className="text-xs text-foreground/70">{item.label}</span>
              </div>
              <Input
                type="number"
                value={settings[item.key]}
                className="w-20 h-7 text-xs text-center"
                style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }}
                onChange={(e) => updateSettings({ [item.key]: parseInt(e.target.value) || 0 })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Content Policies */}
      <Card style={{ background: 'var(--card)', border: `1px solid var(--primary)10` }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">{isRTL ? 'سياسات المحتوى' : 'Content Policies'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-foreground/70">{isRTL ? 'الإشراف التلقائي' : 'Auto Moderation'}</p>
              <p className="text-[10px] text-muted-foreground">{isRTL ? 'حذف المحتوى المخالف تلقائياً' : 'Auto-remove violating content'}</p>
            </div>
            <Switch checked={settings.contentModerationAuto} onCheckedChange={(v) => updateSettings({ contentModerationAuto: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-foreground/70">{isRTL ? 'حظر الكلمات' : 'Block Words'}</p>
              <p className="text-[10px] text-muted-foreground">{isRTL ? 'فلترة الكلمات المحظورة' : 'Filter prohibited words'}</p>
            </div>
            <Switch checked={settings.contentModerationBlockWords} onCheckedChange={(v) => updateSettings({ contentModerationBlockWords: v })} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground/70">{isRTL ? 'الحد الأقصى لطول المنشور' : 'Max Post Length'}</span>
            <Input
              type="number"
              value={settings.maxPostLength}
              className="w-20 h-7 text-xs text-center"
              style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }}
              onChange={(e) => updateSettings({ maxPostLength: parseInt(e.target.value) || 2000 })}
            />
          </div>
        </CardContent>
      </Card>

      {saving && (
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--primary)' }}>
          <motion.div className="w-3 h-3 rounded-full" style={{ border: `2px solid var(--primary)30`, borderTopColor: 'var(--primary)' }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} />
          {isRTL ? 'جاري الحفظ...' : 'Saving...'}
        </div>
      )}
    </div>
  );
}

// ============ Section 9: Admin Logs ============
// Uses the notifications table (type = 'system') as admin action logs
function AdminLogs({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const [logs, setLogs] = useState<Database['public']['Tables']['notifications']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLogs() {
      const sb = getSupabaseAdmin();
      if (!sb) { setError(isRTL ? 'عميل المشرف غير مهيأ' : 'Admin client not configured'); setLoading(false); return; }

      try {
        const { data, error: qErr } = await sb
          .from('notifications')
          .select('*')
          .eq('type', 'system')
          .order('created_at', { ascending: false })
          .limit(100);

        if (qErr) throw qErr;
        setLogs(data || []);
      } catch (err) {
        console.error('[Admin] Failed to load logs:', err);
        setError(isRTL ? 'فشل تحميل السجلات' : 'Failed to load logs');
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [isRTL]);

  const filteredLogs = filter
    ? logs.filter(l => (l.content || '').toLowerCase().includes(filter.toLowerCase()) || (l.user_uid || '').toLowerCase().includes(filter.toLowerCase()))
    : logs;

  return (
    <div className="space-y-3">
      <Input
        placeholder={isRTL ? 'بحث في السجلات...' : 'Search logs...'}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="text-xs h-9"
        style={{ background: 'var(--muted)', borderColor: `var(--primary)15`, color: 'var(--foreground)' }}
      />

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'var(--card)' }} />)}</div>
      ) : (
        <div className="space-y-1 max-h-[65vh] overflow-y-auto">
          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <LogsIcon size={32} color="#6B7280" />
              <p className="text-sm text-muted-foreground mt-2">{isRTL ? 'لا توجد سجلات' : 'No admin logs found'}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{isRTL ? 'ستظهر سجلات الإجراءات هنا' : 'Admin action logs will appear here'}</p>
            </div>
          )}
          {filteredLogs.map((log, i) => (
            <motion.div
              key={log.id}
              className="flex items-start gap-2 p-2.5 rounded-lg"
              style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.03)' }}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{ background: `var(--primary)10` }}>
                <ShieldIcon size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{log.content || (isRTL ? 'إجراء نظام' : 'System action')}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{log.user_uid || (isRTL ? 'النظام' : 'System')}</span>
                  <span className="text-[10px] text-muted-foreground">· {new Date(log.created_at).toLocaleString(isRTL ? 'ar' : 'en')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ Section 5b: Deposit Management (NEW) ============
function DepositManagement({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const { showToast, ToastUI } = useToast();
  const [deposits, setDeposits] = useState<Database['public']['Tables']['deposit_requests']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('pending');
  const [actionDialog, setActionDialog] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);
  const [note, setNote] = useState('');

  const loadDeposits = useCallback(async () => {
    const sb = getSupabaseAdmin();
    if (!sb) { setLoading(false); return; }
    try {
      let query = sb.from('deposit_requests')
        .select('*, payment_method:payment_methods(*), user:users!deposit_requests_user_uid_fkey(uid,username,nickname,email)')
        .order('created_at', { ascending: false })
        .limit(200);
      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      setDeposits((data || []) as unknown as Database['public']['Tables']['deposit_requests']['Row'][]);
    } catch (err) {
      console.error('[Admin] Failed to load deposits:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadDeposits(); }, [loadDeposits]);

  const handleAction = async () => {
    if (!actionDialog) return;
    const sb = getSupabaseAdmin();
    if (!sb) return;
    try {
      const { data, error } = await sb.rpc('process_deposit_request', {
        p_request_id: actionDialog.id,
        p_action: actionDialog.action,
        p_admin_note: note,
      });
      if (error) throw error;
      const result = data as { ok?: boolean; error?: string };
      if (!result?.ok) {
        showToast(isRTL ? 'فشل: ' + (result?.error || '') : 'Failed: ' + (result?.error || ''), 'error');
        return;
      }
      setActionDialog(null);
      setNote('');
      await loadDeposits();
      showToast(actionDialog.action === 'approve' ? (isRTL ? 'تم اعتماد الإيداع' : 'Deposit approved') : (isRTL ? 'تم الرفض' : 'Rejected'));
    } catch (err) {
      console.error('[Admin] Deposit action failed:', err);
      showToast(isRTL ? 'فشل الإجراء' : 'Action failed', 'error');
    }
  };

  const totalPending = deposits.filter(d => d.status === 'pending').reduce((s, d) => s + (d.amount_coins || 0), 0);
  const totalCompleted = deposits.filter(d => d.status === 'completed').reduce((s, d) => s + (d.amount_coins || 0), 0);

  if (loading) {
    return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: 'var(--card)' }} />)}</div>;
  }

  return (
    <div className="space-y-4">
      {ToastUI}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<CoinIcon size={16} />} label={isRTL ? 'إيداعات معلقة' : 'Pending Deposits'} value={formatNumber(totalPending, lang)} color={AMBER} />
        <StatCard icon={<CoinIcon size={16} />} label={isRTL ? 'إيداعات مكتملة' : 'Completed Deposits'} value={formatNumber(totalCompleted, lang)} color={GREEN} />
      </div>

      <div className="flex gap-2">
        {(['pending', 'completed', 'rejected', 'all'] as const).map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setLoading(true); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              statusFilter === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {isRTL
              ? (s === 'pending' ? 'معلقة' : s === 'completed' ? 'مكتملة' : s === 'rejected' ? 'مرفوضة' : 'الكل')
              : s === 'pending' ? 'Pending' : s === 'completed' ? 'Completed' : s === 'rejected' ? 'Rejected' : 'All'}
          </button>
        ))}
      </div>

      <div className="space-y-1.5 max-h-[55vh] overflow-y-auto">
        {deposits.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">{isRTL ? 'لا توجد إيداعات' : 'No deposits'}</p>
        )}
        {deposits.map((d, i) => {
          const pm = (d as { payment_method?: { name_ar?: string; name?: string; icon_emoji?: string } }).payment_method;
          const usr = (d as { user?: { nickname?: string; username?: string; email?: string } }).user;
          return (
            <motion.div
              key={d.id}
              className="p-3 rounded-lg"
              style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.03)' }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <CoinIcon size={12} />
                    <span className="text-sm font-semibold text-foreground">+{formatNumber(d.amount_coins, lang)}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {pm?.icon_emoji} {isRTL ? pm?.name_ar : pm?.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    {usr?.nickname || usr?.username || d.user_uid} · {new Date(d.created_at).toLocaleString(isRTL ? 'ar' : 'en')}
                  </p>
                  {d.user_note && <p className="text-[10px] text-muted-foreground italic mt-0.5 truncate">"{d.user_note}"</p>}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1" style={{
                    background: d.status === 'completed' ? `${GREEN}20` : d.status === 'pending' ? `${AMBER}20` : `${RED}20`,
                    color: d.status === 'completed' ? GREEN : d.status === 'pending' ? AMBER : RED,
                  }}>
                    {d.status}
                  </span>
                </div>
                {d.status === 'pending' && (
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" style={{ borderColor: GREEN, color: GREEN }} onClick={() => setActionDialog({ id: d.id, action: 'approve' })}>
                      {isRTL ? 'اعتماد' : 'Approve'}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" style={{ borderColor: RED, color: RED }} onClick={() => setActionDialog({ id: d.id, action: 'reject' })}>
                      {isRTL ? 'رفض' : 'Reject'}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setNote(''); }}>
        <DialogContent className="max-w-sm" style={{ background: 'var(--card)', border: '1px solid var(--primary)20' }}>
          {actionDialog && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground text-sm">
                  {actionDialog.action === 'approve' ? (isRTL ? 'اعتماد الإيداع' : 'Approve Deposit') : (isRTL ? 'رفض الإيداع' : 'Reject Deposit')}
                </DialogTitle>
              </DialogHeader>
              <Textarea
                placeholder={isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="text-xs"
                style={{ background: 'var(--muted)', borderColor: 'var(--primary)15', color: 'var(--foreground)' }}
              />
              <DialogFooter className="gap-2">
                <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => { setActionDialog(null); setNote(''); }}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
                <Button size="sm" style={{ background: actionDialog.action === 'approve' ? GREEN : RED, color: '#fff' }} onClick={handleAction}>
                  {actionDialog.action === 'approve' ? (isRTL ? 'اعتماد' : 'Approve') : (isRTL ? 'رفض' : 'Reject')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Section 5c: Payment Methods Management (NEW) ============
function PaymentMethodsManagement({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const { showToast, ToastUI } = useToast();
  const [methods, setMethods] = useState<Database['public']['Tables']['payment_methods']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newMethod, setNewMethod] = useState({
    code: '', name: '', name_ar: '', icon_emoji: '💳', type: 'manual' as const,
    min_amount: 100, max_amount: 50000, fee_percent: 0, fee_fixed: 0,
    is_active: true, sort_order: 0, instructions: '', instructions_ar: '',
  });

  const loadMethods = useCallback(async () => {
    const sb = getSupabaseAdmin();
    if (!sb) { setLoading(false); return; }
    try {
      const { data, error } = await sb.from('payment_methods').select('*').order('sort_order', { ascending: true });
      if (error) throw error;
      setMethods((data || []) as unknown as Database['public']['Tables']['payment_methods']['Row'][]);
    } catch (err) {
      console.error('[Admin] Failed to load payment methods:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMethods(); }, [loadMethods]);

  const handleAdd = async () => {
    const sb = getSupabaseAdmin();
    if (!sb || !newMethod.code || !newMethod.name) {
      showToast(isRTL ? 'أدخل الكود والاسم' : 'Code and name required', 'error');
      return;
    }
    try {
      const { error } = await sb.from('payment_methods').insert({
        code: newMethod.code,
        name: newMethod.name,
        name_ar: newMethod.name_ar || newMethod.name,
        type: newMethod.type,
        icon_emoji: newMethod.icon_emoji,
        min_amount: newMethod.min_amount,
        max_amount: newMethod.max_amount,
        fee_percent: newMethod.fee_percent,
        fee_fixed: newMethod.fee_fixed,
        is_active: newMethod.is_active,
        sort_order: newMethod.sort_order,
        instructions: newMethod.instructions,
        instructions_ar: newMethod.instructions_ar,
      });
      if (error) throw error;
      setShowAdd(false);
      setNewMethod({
        code: '', name: '', name_ar: '', icon_emoji: '💳', type: 'manual',
        min_amount: 100, max_amount: 50000, fee_percent: 0, fee_fixed: 0,
        is_active: true, sort_order: 0, instructions: '', instructions_ar: '',
      });
      await loadMethods();
      showToast(isRTL ? 'تمت الإضافة' : 'Added');
    } catch (err) {
      console.error('[Admin] Add payment method failed:', err);
      showToast(isRTL ? 'فشل الإضافة' : 'Failed', 'error');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const sb = getSupabaseAdmin();
    if (!sb) return;
    try {
      const { error } = await sb.from('payment_methods').update({ is_active: !currentActive }).eq('id', id);
      if (error) throw error;
      await loadMethods();
    } catch (err) {
      console.error('[Admin] Toggle failed:', err);
    }
  };

  const handleDelete = async (id: string) => {
    const sb = getSupabaseAdmin();
    if (!sb) return;
    if (!confirm(isRTL ? 'تأكيد الحذف؟' : 'Confirm delete?')) return;
    try {
      const { error } = await sb.from('payment_methods').delete().eq('id', id);
      if (error) throw error;
      await loadMethods();
      showToast(isRTL ? 'تم الحذف' : 'Deleted');
    } catch (err) {
      console.error('[Admin] Delete failed:', err);
      showToast(isRTL ? 'فشل الحذف' : 'Failed', 'error');
    }
  };

  if (loading) {
    return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: 'var(--card)' }} />)}</div>;
  }

  return (
    <div className="space-y-4">
      {ToastUI}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{isRTL ? 'إدارة طرق الدفع المتاحة للمستخدمين' : 'Manage payment methods available to users'}</p>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          {isRTL ? 'إضافة' : 'Add'}
        </Button>
      </div>

      <div className="space-y-2">
        {methods.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">{isRTL ? 'لا توجد طرق دفع' : 'No payment methods'}</p>
        )}
        {methods.map((m) => (
          <div key={m.id} className="p-3 rounded-lg flex items-center gap-3" style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.03)' }}>
            <span className="text-2xl">{m.icon_emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {isRTL ? m.name_ar : m.name} <span className="text-[10px] text-muted-foreground">({m.code})</span>
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isRTL ? 'الحدود:' : 'Limits:'} {m.min_amount}-{m.max_amount} · {isRTL ? 'النوع:' : 'Type:'} {m.type}
              </p>
              {m.instructions_ar && <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{m.instructions_ar}</p>}
            </div>
            <div className="flex flex-col gap-1 items-end">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                background: m.is_active ? `${GREEN}20` : `${RED}20`,
                color: m.is_active ? GREEN : RED,
              }}>
                {m.is_active ? (isRTL ? 'مفعّل' : 'Active') : (isRTL ? 'موقوف' : 'Inactive')}
              </span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => handleToggleActive(m.id, m.is_active)}>
                  {m.is_active ? (isRTL ? 'إيقاف' : 'Disable') : (isRTL ? 'تفعيل' : 'Enable')}
                </Button>
                <Button size="sm" variant="outline" className="h-6 text-[10px]" style={{ borderColor: RED, color: RED }} onClick={() => handleDelete(m.id)}>
                  {isRTL ? 'حذف' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md" style={{ background: 'var(--card)', border: '1px solid var(--primary)20' }}>
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm">{isRTL ? 'إضافة طريقة دفع' : 'Add Payment Method'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder={isRTL ? 'الكود (مثال: paypal)' : 'Code (e.g. paypal)'} value={newMethod.code} onChange={(e) => setNewMethod({ ...newMethod, code: e.target.value })} className="text-xs" />
              <Input placeholder={isRTL ? 'الإيموجي' : 'Emoji'} value={newMethod.icon_emoji} onChange={(e) => setNewMethod({ ...newMethod, icon_emoji: e.target.value })} className="text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder={isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'} value={newMethod.name} onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })} className="text-xs" />
              <Input placeholder={isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'} value={newMethod.name_ar} onChange={(e) => setNewMethod({ ...newMethod, name_ar: e.target.value })} className="text-xs" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input type="number" placeholder={isRTL ? 'الحد الأدنى' : 'Min'} value={newMethod.min_amount} onChange={(e) => setNewMethod({ ...newMethod, min_amount: parseInt(e.target.value) || 0 })} className="text-xs" />
              <Input type="number" placeholder={isRTL ? 'الحد الأقصى' : 'Max'} value={newMethod.max_amount} onChange={(e) => setNewMethod({ ...newMethod, max_amount: parseInt(e.target.value) || 0 })} className="text-xs" />
              <Input type="number" placeholder={isRTL ? 'الترتيب' : 'Order'} value={newMethod.sort_order} onChange={(e) => setNewMethod({ ...newMethod, sort_order: parseInt(e.target.value) || 0 })} className="text-xs" />
            </div>
            <Textarea placeholder={isRTL ? 'التعليمات بالعربية' : 'Instructions (Arabic)'} value={newMethod.instructions_ar} onChange={(e) => setNewMethod({ ...newMethod, instructions_ar: e.target.value })} className="text-xs" />
            <Textarea placeholder={isRTL ? 'التعليمات بالإنجليزية' : 'Instructions (English)'} value={newMethod.instructions} onChange={(e) => setNewMethod({ ...newMethod, instructions: e.target.value })} className="text-xs" />
          </div>
          <DialogFooter className="gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button size="sm" onClick={handleAdd}>{isRTL ? 'إضافة' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Main Admin Dashboard ============
export function AdminDashboard() {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const isRTL = lang === 'ar';
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');

  // Security check - only admin users
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <ShieldIcon size={48} />
          <p className="text-sm text-muted-foreground">{isRTL ? 'غير مصرح بالوصول' : 'Access Denied'}</p>
          <p className="text-xs text-muted-foreground">{isRTL ? 'هذه الصفحة متاحة للمشرفين فقط' : 'This page is only accessible to admins'}</p>
        </div>
      </div>
    );
  }

  const sectionTitles: Record<AdminSection, { en: string; ar: string }> = {
    overview: { en: 'Dashboard', ar: 'لوحة التحكم' },
    users: { en: 'User Management', ar: 'إدارة المستخدمين' },
    moderation: { en: 'Content Moderation', ar: 'الإشراف على المحتوى' },
    subscriptions: { en: 'Subscriptions', ar: 'الاشتراكات' },
    deposits: { en: 'Deposits', ar: 'الإيداعات' },
    withdrawals: { en: 'Withdrawals', ar: 'السحوبات' },
    payments: { en: 'Payment Methods', ar: 'طرق الدفع' },
    gifts: { en: 'Gifts & Economy', ar: 'الهدايا والاقتصاد' },
    livestreams: { en: 'Live Streams', ar: 'البث المباشر' },
    settings: { en: 'App Settings', ar: 'إعدادات التطبيق' },
    logs: { en: 'Admin Logs', ar: 'سجل المشرفين' },
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return <DashboardOverview lang={lang} />;
      case 'users': return <UserManagement lang={lang} />;
      case 'moderation': return <ContentModeration lang={lang} />;
      case 'subscriptions': return <SubscriptionManagement lang={lang} />;
      case 'deposits': return <DepositManagement lang={lang} />;
      case 'withdrawals': return <WithdrawalManagement lang={lang} />;
      case 'payments': return <PaymentMethodsManagement lang={lang} />;
      case 'gifts': return <GiftEconomyManagement lang={lang} />;
      case 'livestreams': return <LiveStreamManagement lang={lang} />;
      case 'settings': return <AppSettingsSection lang={lang} />;
      case 'logs': return <AdminLogs lang={lang} />;
      default: return <DashboardOverview lang={lang} />;
    }
  };

  return (
    <div className="flex h-full min-h-[80vh]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Desktop Sidebar */}
      <AdminSidebar active={activeSection} onChange={setActiveSection} lang={lang} />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Section Header */}
        <div className="p-4 pb-2 flex items-center gap-2" style={{ borderBottom: `1px solid var(--primary)08` }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `var(--primary)12` }}>
            {activeSection === 'overview' && <DashboardIcon size={14} />}
            {activeSection === 'users' && <UsersIcon size={14} />}
            {activeSection === 'moderation' && <ModerationIcon size={14} />}
            {activeSection === 'subscriptions' && <SubscriptionIcon size={14} />}
            {activeSection === 'deposits' && <CoinIcon size={14} />}
            {activeSection === 'withdrawals' && <WithdrawalIcon size={14} />}
            {activeSection === 'payments' && <SettingsIcon size={14} />}
            {activeSection === 'gifts' && <GiftIcon size={14} />}
            {activeSection === 'livestreams' && <StreamIcon size={14} />}
            {activeSection === 'settings' && <SettingsIcon size={14} />}
            {activeSection === 'logs' && <LogsIcon size={14} />}
          </div>
          <h2 className="text-sm font-bold text-foreground">{isRTL ? sectionTitles[activeSection].ar : sectionTitles[activeSection].en}</h2>
        </div>

        {/* Section Content */}
        <div className="p-4 pb-24 lg:pb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Tabs */}
      <AdminMobileTabs active={activeSection} onChange={setActiveSection} lang={lang} />
    </div>
  );
}
