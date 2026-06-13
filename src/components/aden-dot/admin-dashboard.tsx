'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const GOLD = '#D4A853';
const NAVY = '#1A1F36';
const RED = '#EF4444';
const GREEN = '#22C55E';

type AdminSection = 'overview' | 'users' | 'moderation' | 'subscriptions' | 'withdrawals' | 'gifts' | 'livestreams' | 'settings' | 'logs';

// ============ API Helper ============
async function adminFetch(path: string, options?: RequestInit) {
  const user = useAuthStore.getState().user;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-admin-uid': user?.uid || '',
    ...(options?.headers as Record<string, string> || {}),
  };
  const res = await fetch(path, { ...options, headers });
  return res.json();
}

// ============ Custom Icons for Admin ============
function DashboardIcon({ size = 20, color = GOLD }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function UsersIcon({ size = 20, color = GOLD }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function ModerationIcon({ size = 20, color = GOLD }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function SubscriptionIcon({ size = 20, color = GOLD }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20" /><path d="M6 16h4" />
    </svg>
  );
}

function WithdrawalIcon({ size = 20, color = GOLD }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}

function ActivityIcon({ size = 20, color = GOLD }: { size?: number; color?: string }) {
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

function LogsIcon({ size = 20, color = GOLD }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
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
    { id: 'withdrawals', icon: <WithdrawalIcon />, labelEn: 'Withdrawals', labelAr: 'السحوبات' },
    { id: 'gifts', icon: <GiftIcon size={20} />, labelEn: 'Gifts & Economy', labelAr: 'الهدايا والاقتصاد' },
    { id: 'livestreams', icon: <StreamIcon />, labelEn: 'Live Streams', labelAr: 'البث المباشر' },
    { id: 'settings', icon: <SettingsIcon size={20} />, labelEn: 'App Settings', labelAr: 'إعدادات التطبيق' },
    { id: 'logs', icon: <LogsIcon />, labelEn: 'Admin Logs', labelAr: 'سجل المشرفين' },
  ];

  return (
    <div
      className="hidden lg:flex flex-col w-56 shrink-0 border-r"
      style={{
        background: 'rgba(26, 31, 54, 0.95)',
        borderColor: `${GOLD}15`,
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      <div className="p-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${GOLD}15` }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${GOLD}20` }}>
          <ShieldIcon size={18} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">{isRTL ? 'لوحة المشرف' : 'Admin Panel'}</h2>
          <p className="text-[10px]" style={{ color: GOLD }}>{isRTL ? 'عدن دوت' : 'Aden Dot'}</p>
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
                background: active === item.id ? `${GOLD}15` : 'transparent',
                color: active === item.id ? GOLD : '#9CA3AF',
                border: active === item.id ? `1px solid ${GOLD}25` : '1px solid transparent',
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
          background: 'rgba(26, 31, 54, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: `1px solid ${GOLD}15`,
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
                <motion.div layoutId="adminTab" className="absolute -top-1.5 w-6 h-0.5 rounded-full" style={{ background: GOLD }} />
              )}
              <div style={{ color: active === tab.id ? GOLD : '#6B7280' }}>{tab.icon}</div>
              <span className="text-[9px] font-medium" style={{ color: active === tab.id ? GOLD : '#6B7280' }}>{tab.label}</span>
            </button>
          ))}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="flex flex-col items-center gap-0.5 py-1 px-2"
          >
            <div style={{ color: moreOpen ? GOLD : '#6B7280' }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
              </svg>
            </div>
            <span className="text-[9px] font-medium" style={{ color: moreOpen ? GOLD : '#6B7280' }}>{isRTL ? 'المزيد' : 'More'}</span>
          </button>
        </div>
      </nav>

      {/* More menu */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="lg:hidden fixed bottom-16 left-2 right-2 z-50 rounded-xl p-3 space-y-1"
            style={{ background: 'rgba(26, 31, 54, 0.98)', border: `1px solid ${GOLD}20` }}
          >
            {moreItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { onChange(item.id); setMoreOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                style={{
                  background: active === item.id ? `${GOLD}15` : 'transparent',
                  color: active === item.id ? GOLD : '#9CA3AF',
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
function StatCard({ icon, label, value, subValue, color = GOLD, delay = 0 }: {
  icon: React.ReactNode; label: string; value: string | number; subValue?: string; color?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-4 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}12` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}12` }}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      {subValue && <p className="text-[10px] text-gray-500 mt-0.5">{subValue}</p>}
    </motion.div>
  );
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

  useEffect(() => {
    adminFetch('/api/admin/stats')
      .then((data) => {
        if (data.stats) setStats(data.stats);
        if (data.monthlyRevenue) setMonthlyRevenue(data.monthlyRevenue);
        if (data.userGrowth) setUserGrowth(data.userGrowth);
        if (data.recentActivity) setRecentActivity(data.recentActivity);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
          ))}
        </div>
      </div>
    );
  }

  const quickActions = [
    { icon: <UsersIcon size={16} color={GOLD} />, label: isRTL ? 'إدارة المستخدمين' : 'Manage Users', section: 'users' as AdminSection },
    { icon: <ModerationIcon size={16} color={GOLD} />, label: isRTL ? 'مراجعة البلاغات' : 'Review Reports', section: 'moderation' as AdminSection },
    { icon: <WithdrawalIcon size={16} color={GOLD} />, label: isRTL ? 'طلبات السحب' : 'Withdrawals', section: 'withdrawals' as AdminSection },
    { icon: <SettingsIcon size={16} />, label: isRTL ? 'إعدادات التطبيق' : 'App Settings', section: 'settings' as AdminSection },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<UsersIcon size={16} color={GOLD} />} label={isRTL ? 'إجمالي المستخدمين' : 'Total Users'} value={formatNumber(stats?.totalUsers || 0, lang)} subValue={`${formatNumber(stats?.newUsersToday || 0, lang)} ${isRTL ? 'جدد اليوم' : 'new today'}`} delay={0} />
        <StatCard icon={<OnlineIcon size={16} />} label={isRTL ? 'المستخدمون النشطون' : 'Active Users'} value={formatNumber(stats?.activeUsers || 0, lang)} color={GREEN} delay={0.05} />
        <StatCard icon={<SubscriptionIcon size={16} color={GOLD} />} label={isRTL ? 'المشتركون المميزون' : 'Premium Subs'} value={formatNumber(stats?.premiumUsers || 0, lang)} delay={0.1} />
        <StatCard icon={<CoinIcon size={16} />} label={isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'} value={formatNumber(stats?.totalPurchaseRevenue || 0, lang)} subValue={isRTL ? 'عملات' : 'coins'} delay={0.15} />
        <StatCard icon={<GiftIcon size={16} color={GREEN} />} label={isRTL ? 'الهدايا المرسلة' : 'Gifts Sent'} value={formatNumber(stats?.totalGifts || 0, lang)} color={GREEN} delay={0.2} />
        <StatCard icon={<StreamIcon size={16} />} label={isRTL ? 'البثوث النشطة' : 'Active Streams'} value={stats?.activeStreams || 0} color={RED} delay={0.25} />
        <StatCard icon={<WithdrawalIcon size={16} color="#F59E0B" />} label={isRTL ? 'إجمالي المسحوبات' : 'Total Payouts'} value={formatNumber(stats?.totalWithdrawals || 0, lang)} color="#F59E0B" delay={0.3} />
        <StatCard icon={<LogsIcon size={16} color="#8B5CF6" />} label={isRTL ? 'طلبات سحب معلقة' : 'Pending Payouts'} value={stats?.pendingWithdrawals || 0} color="#8B5CF6" delay={0.35} />
      </div>

      {/* Revenue Chart */}
      <Card style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}10` }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-white">
            {isRTL ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 10 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: NAVY, border: `1px solid ${GOLD}30`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: GOLD }} />
                <Area type="monotone" dataKey="revenue" stroke={GOLD} fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* User Growth Chart */}
      <Card style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}10` }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-white">
            {isRTL ? 'نمو المستخدمين (7 أيام)' : 'User Growth (7 days)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 9 }} tickFormatter={(v: string) => v.split('-').slice(1).join('/')} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: NAVY, border: `1px solid ${GOLD}30`, borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="newUsers" fill={GOLD} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">{isRTL ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, i) => (
            <motion.button
              key={i}
              className="p-3 rounded-xl flex items-center gap-2 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}08` }}
              whileHover={{ background: `${GOLD}08` }}
              whileTap={{ scale: 0.98 }}
            >
              {action.icon}
              <span className="text-xs text-gray-300">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">{isRTL ? 'النشاط الأخير' : 'Recent Activity'}</h3>
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {recentActivity.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">{isRTL ? 'لا يوجد نشاط' : 'No recent activity'}</p>
          )}
          {recentActivity.map((activity, i) => (
            <motion.div
              key={activity.id + i}
              className="flex items-center gap-2 p-2.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.03)` }}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: activity.type === 'gift' ? `${GREEN}15` : `${GOLD}15` }}>
                {activity.type === 'gift' ? <GiftIcon size={14} color={GREEN} /> : <ActivityIcon size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 truncate">{activity.description}</p>
                <p className="text-[10px] text-gray-600">{new Date(activity.timestamp).toLocaleString(isRTL ? 'ar' : 'en')}</p>
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
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Record<string, unknown> | null>(null);
  const [selectedUids, setSelectedUids] = useState<Set<string>>(new Set());
  const [actionDialog, setActionDialog] = useState<{ user: Record<string, unknown>; action: string } | null>(null);
  const [noteText, setNoteText] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const data = await adminFetch(`/api/admin/users?${params}`);
      if (data.users) setUsers(data.users);
      if (data.total) setTotal(data.total);
    } catch { /* empty */ } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const performAction = async (uid: string, action: string, extra?: Record<string, unknown>) => {
    try {
      const res = await adminFetch('/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({ uid, action, ...extra }),
      });
      if (res.success) {
        setActionDialog(null);
        setNoteText('');
        loadUsers();
      }
    } catch { /* empty */ }
  };

  const bulkAction = async (action: string, extra?: Record<string, unknown>) => {
    if (selectedUids.size === 0) return;
    try {
      await adminFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ uids: Array.from(selectedUids), action, ...extra }),
      });
      setSelectedUids(new Set());
      loadUsers();
    } catch { /* empty */ }
  };

  const toggleSelect = (uid: string) => {
    const next = new Set(selectedUids);
    if (next.has(uid)) next.delete(uid); else next.add(uid);
    setSelectedUids(next);
  };

  const totalPages = Math.ceil(total / 20);

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = { admin: GOLD, moderator: '#8B5CF6', supporter: '#3B82F6', user: '#6B7280' };
    const c = colors[role] || '#6B7280';
    return <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${c}15`, color: c }}>{role}</span>;
  };

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[150px]">
          <Input
            placeholder={isRTL ? 'بحث عن مستخدم...' : 'Search users...'}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="text-xs h-9"
            style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${GOLD}15`, color: 'white' }}
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-28 h-9 text-xs" style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${GOLD}15`, color: 'white' }}>
            <SelectValue placeholder={isRTL ? 'الدور' : 'Role'} />
          </SelectTrigger>
          <SelectContent style={{ background: NAVY, borderColor: `${GOLD}20` }}>
            <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="supporter">Supporter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedUids.size > 0 && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}20` }}>
          <span className="text-xs" style={{ color: GOLD }}>{selectedUids.size} {isRTL ? 'محدد' : 'selected'}</span>
          <Button size="sm" variant="outline" className="h-7 text-[10px]" style={{ borderColor: RED, color: RED }} onClick={() => bulkAction('ban')}>{isRTL ? 'حظر' : 'Ban'}</Button>
          <Button size="sm" variant="outline" className="h-7 text-[10px]" style={{ borderColor: GREEN, color: GREEN }} onClick={() => bulkAction('verify')}>{isRTL ? 'توثيق' : 'Verify'}</Button>
          <Button size="sm" variant="outline" className="h-7 text-[10px]" style={{ borderColor: GOLD, color: GOLD }} onClick={() => bulkAction('change_role', { role: 'moderator' })}>{isRTL ? 'ترقية لمشرف' : 'Make Mod'}</Button>
          <Button size="sm" variant="ghost" className="h-7 text-[10px] text-gray-400" onClick={() => setSelectedUids(new Set())}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
        </motion.div>
      )}

      {/* User List */}
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />)}</div>
      ) : (
        <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
          {users.map((u, i) => {
            const uid = u.uid as string;
            const status = u.status as string;
            const isBanned = status === 'banned';
            return (
              <motion.div
                key={uid}
                className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all"
                style={{
                  background: selectedUids.has(uid) ? `${GOLD}08` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selectedUids.has(uid) ? `${GOLD}20` : 'rgba(255,255,255,0.03)'}`,
                  opacity: isBanned ? 0.6 : 1,
                }}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: isBanned ? 0.6 : 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setSelectedUser(u)}
              >
                <input
                  type="checkbox"
                  checked={selectedUids.has(uid)}
                  onChange={(e) => { e.stopPropagation(); toggleSelect(uid); }}
                  className="w-3.5 h-3.5 rounded accent-amber-500"
                  onClick={(e) => e.stopPropagation()}
                />
                <Avatar className="w-8 h-8">
                  <AvatarFallback style={{ background: `${GOLD}20`, color: GOLD }} className="text-[10px]">
                    {(u.nickname as string)?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0" dir={isRTL ? 'rtl' : 'ltr'}>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-white truncate">{u.nickname as string}</span>
                    {u.is_verified && <VerifiedIcon size={10} />}
                    {isBanned && <Badge variant="destructive" className="text-[8px] h-3.5 px-1">{isRTL ? 'محظور' : 'Banned'}</Badge>}
                  </div>
                  <span className="text-[10px] text-gray-500">@{u.username as string}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {roleBadge(u.role as string)}
                  <div className="flex items-center gap-0.5">
                    <CoinIcon size={10} />
                    <span className="text-[9px] text-gray-500">{formatNumber((u.coins_balance as number) || 0, lang)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-[10px] text-gray-500">{isRTL ? `${total} مستخدم` : `${total} users`}</span>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</Button>
          <span className="text-[10px] text-gray-400">{page}/{totalPages || 1}</span>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</Button>
        </div>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md" style={{ background: NAVY, border: `1px solid ${GOLD}20` }}>
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback style={{ background: `${GOLD}20`, color: GOLD }}>{(selectedUser.nickname as string)?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      {selectedUser.nickname as string}
                      {selectedUser.is_verified && <VerifiedIcon size={12} />}
                    </div>
                    <span className="text-xs text-gray-500 font-normal">@{selectedUser.username as string}</span>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 py-2" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-[10px] text-gray-500">{isRTL ? 'البريد' : 'Email'}</span>
                    <p className="text-xs text-white truncate">{selectedUser.email as string}</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-[10px] text-gray-500">{isRTL ? 'الدور' : 'Role'}</span>
                    <p className="text-xs">{roleBadge(selectedUser.role as string)}</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-[10px] text-gray-500">{isRTL ? 'المتابعون' : 'Followers'}</span>
                    <p className="text-xs text-white">{formatNumber((selectedUser.followers_count as number) || 0, lang)}</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-[10px] text-gray-500">{isRTL ? 'المستوى' : 'Level'}</span>
                    <p className="text-xs text-white">{selectedUser.level as number}</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-[10px] text-gray-500">{isRTL ? 'العملات' : 'Coins'}</span>
                    <div className="flex items-center gap-1"><CoinIcon size={12} /><span className="text-xs text-white">{formatNumber((selectedUser.coins_balance as number) || 0, lang)}</span></div>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-[10px] text-gray-500">{isRTL ? 'الألماس' : 'Diamonds'}</span>
                    <div className="flex items-center gap-1"><DiamondCurrencyIcon size={12} /><span className="text-xs text-white">{formatNumber((selectedUser.diamonds_balance as number) || 0, lang)}</span></div>
                  </div>
                </div>

                <Separator style={{ background: `${GOLD}15` }} />

                <div className="grid grid-cols-2 gap-1.5">
                  <Button size="sm" variant="outline" className="h-8 text-[10px]" style={{ borderColor: RED, color: RED }} onClick={() => setActionDialog({ user: selectedUser, action: selectedUser.status === 'banned' ? 'unban' : 'ban' })}>
                    {selectedUser.status === 'banned' ? (isRTL ? 'إلغاء الحظر' : 'Unban') : (isRTL ? 'حظر' : 'Ban')}
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-[10px]" style={{ borderColor: GOLD, color: GOLD }} onClick={() => setActionDialog({ user: selectedUser, action: selectedUser.is_verified ? 'unverify' : 'verify' })}>
                    {selectedUser.is_verified ? (isRTL ? 'إلغاء التوثيق' : 'Unverify') : (isRTL ? 'توثيق' : 'Verify')}
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-[10px]" style={{ borderColor: '#8B5CF6', color: '#8B5CF6' }} onClick={() => setActionDialog({ user: selectedUser, action: 'give_premium' })}>
                    {isRTL ? 'إعطاء مميز' : 'Give Premium'}
                  </Button>
                  <Select onValueChange={(role) => { performAction(selectedUser.uid as string, 'change_role', { role }); setSelectedUser(null); }}>
                    <SelectTrigger className="h-8 text-[10px]" style={{ borderColor: '#3B82F6', color: '#3B82F6', background: 'transparent' }}>
                      <SelectValue placeholder={isRTL ? 'تغيير الدور' : 'Change Role'} />
                    </SelectTrigger>
                    <SelectContent style={{ background: NAVY }}>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setNoteText(''); }}>
        <DialogContent className="max-w-sm" style={{ background: NAVY, border: `1px solid ${GOLD}20` }}>
          {actionDialog && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white text-sm">
                  {isRTL ? 'تأكيد الإجراء' : 'Confirm Action'}
                </DialogTitle>
              </DialogHeader>
              <p className="text-xs text-gray-400">
                {isRTL ? 'هل أنت متأكد من' : 'Are you sure you want to '}
                <span className="font-semibold text-white">{actionDialog.action}</span>
                {isRTL ? ` على ${(actionDialog.user.nickname as string)}` : ` ${(actionDialog.user.nickname as string)}`}?
              </p>
              <Textarea
                placeholder={isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="text-xs"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${GOLD}15`, color: 'white' }}
              />
              <DialogFooter className="gap-2">
                <Button size="sm" variant="ghost" className="text-gray-400" onClick={() => { setActionDialog(null); setNoteText(''); }}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
                <Button size="sm" style={{ background: GOLD, color: NAVY }} onClick={() => performAction(actionDialog.user.uid as string, actionDialog.action)}>
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
  const [tab, setTab] = useState<'reports' | 'flagged' | 'log'>('reports');

  // Simulated reported content
  const reportedPosts = [
    { id: '1', type: 'post', reporter: 'user_123', target: 'post_456', reason: 'spam', description: isRTL ? 'محتوى مزعج متكرر' : 'Repeated spam content', status: 'pending', timestamp: Date.now() - 3600000 },
    { id: '2', type: 'comment', reporter: 'user_789', target: 'comment_012', reason: 'harassment', description: isRTL ? 'تعليق مسيء' : 'Harassing comment', status: 'pending', timestamp: Date.now() - 7200000 },
    { id: '3', type: 'user', reporter: 'user_345', target: 'user_678', reason: 'hate_speech', description: isRTL ? 'خطاب كراهية' : 'Hate speech in profile', status: 'pending', timestamp: Date.now() - 10800000 },
    { id: '4', type: 'post', reporter: 'user_abc', target: 'post_def', reason: 'nudity', description: isRTL ? 'محتوى غير لائق' : 'Inappropriate content', status: 'reviewed', timestamp: Date.now() - 86400000 },
  ];

  const autoFlagged = [
    { id: '5', type: 'post', target: 'post_999', reason: isRTL ? 'كلمات مفتاحية محظورة' : 'Banned keywords detected', confidence: 0.92, timestamp: Date.now() - 1800000 },
    { id: '6', type: 'comment', target: 'comment_888', reason: isRTL ? 'نمط مزعج' : 'Spam pattern detected', confidence: 0.85, timestamp: Date.now() - 5400000 },
  ];

  const moderationLog = [
    { id: '1', admin: 'admin_1', action: isRTL ? 'إزالة منشور' : 'Removed post', target: 'post_123', timestamp: Date.now() - 1800000 },
    { id: '2', admin: 'admin_1', action: isRTL ? 'تحذير مستخدم' : 'Warned user', target: 'user_456', timestamp: Date.now() - 7200000 },
    { id: '3', admin: 'admin_2', action: isRTL ? 'حظر مستخدم' : 'Banned user', target: 'user_789', timestamp: Date.now() - 86400000 },
  ];

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = { pending: '#F59E0B', reviewed: '#3B82F6', resolved: GREEN, dismissed: '#6B7280' };
    const c = colors[status] || '#6B7280';
    return <Badge className="text-[9px] h-4" style={{ background: `${c}15`, color: c, borderColor: 'transparent' }}>{status}</Badge>;
  };

  const reasonBadge = (reason: string) => {
    const colors: Record<string, string> = { spam: '#F59E0B', harassment: RED, hate_speech: '#8B5CF6', nudity: '#EC4899', violence: '#EF4444', other: '#6B7280' };
    const c = colors[reason] || '#6B7280';
    return <Badge className="text-[9px] h-4" style={{ background: `${c}15`, color: c, borderColor: 'transparent' }}>{reason}</Badge>;
  };

  return (
    <div className="space-y-3">
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="w-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <TabsTrigger value="reports" className="flex-1 text-[10px]" style={{ color: tab === 'reports' ? GOLD : '#6B7280' }}>
            {isRTL ? 'البلاغات' : 'Reports'} ({reportedPosts.filter(r => r.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="flagged" className="flex-1 text-[10px]" style={{ color: tab === 'flagged' ? GOLD : '#6B7280' }}>
            {isRTL ? 'محتوى مُعلم' : 'Auto-Flagged'}
          </TabsTrigger>
          <TabsTrigger value="log" className="flex-1 text-[10px]" style={{ color: tab === 'log' ? GOLD : '#6B7280' }}>
            {isRTL ? 'السجل' : 'Log'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <div className="space-y-2">
            {reportedPosts.map((report, i) => (
              <motion.div
                key={report.id}
                className="p-3 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${report.status === 'pending' ? `${GOLD}15` : 'rgba(255,255,255,0.03)'}` }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {reasonBadge(report.reason)}
                    {statusBadge(report.status)}
                  </div>
                  <span className="text-[9px] text-gray-600">{new Date(report.timestamp).toLocaleString(isRTL ? 'ar' : 'en')}</span>
                </div>
                <p className="text-xs text-gray-300 mb-2">{report.description}</p>
                {report.status === 'pending' && (
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" style={{ borderColor: GREEN, color: GREEN }}>{isRTL ? 'موافقة' : 'Approve'}</Button>
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" style={{ borderColor: RED, color: RED }}>{isRTL ? 'إزالة' : 'Remove'}</Button>
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" style={{ borderColor: '#F59E0B', color: '#F59E0B' }}>{isRTL ? 'تحذير' : 'Warn'}</Button>
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" style={{ borderColor: '#8B5CF6', color: '#8B5CF6' }}>{isRTL ? 'حظر' : 'Ban'}</Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flagged">
          <div className="space-y-2">
            {autoFlagged.map((item, i) => (
              <motion.div
                key={item.id}
                className="p-3 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${RED}12` }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">{item.reason}</span>
                  <Badge className="text-[9px] h-4" style={{ background: `${RED}15`, color: RED, borderColor: 'transparent' }}>
                    {Math.round(item.confidence * 100)}%
                  </Badge>
                </div>
                <div className="flex gap-1.5 mt-2">
                  <Button size="sm" variant="outline" className="h-7 text-[10px]" style={{ borderColor: GREEN, color: GREEN }}>{isRTL ? 'موافقة' : 'Approve'}</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]" style={{ borderColor: RED, color: RED }}>{isRTL ? 'إزالة' : 'Remove'}</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="log">
          <div className="space-y-1.5">
            {moderationLog.map((entry) => (
              <div key={entry.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${GOLD}10` }}>
                  <ShieldIcon size={12} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-300">{entry.action} — <span className="text-gray-500">{entry.target}</span></p>
                  <p className="text-[9px] text-gray-600">{entry.admin} · {new Date(entry.timestamp).toLocaleString(isRTL ? 'ar' : 'en')}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============ Section 4: Subscription Management ============
function SubscriptionManagement({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const [data, setData] = useState<{
    plans: { id: string; name: string; nameAr: string; price: number; features: string[]; subscribersCount: number }[];
    monthlyRevenue: { month: string; revenue: number; subscribers: number }[];
    totalSubscribers: number;
    churnRate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<{ id: string; name: string; price: number; features: string[] } | null>(null);

  useEffect(() => {
    adminFetch('/api/admin/subscriptions')
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const planColors: Record<string, string> = { free: '#6B7280', premium: GOLD, vip: '#8B5CF6' };

  if (loading) {
    return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />)}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<SubscriptionIcon size={16} color={GOLD} />} label={isRTL ? 'إجمالي المشتركين' : 'Total Subscribers'} value={data?.totalSubscribers || 0} delay={0} />
        <StatCard icon={<ActivityIcon size={16} color={RED} />} label={isRTL ? 'معدل الفقد' : 'Churn Rate'} value={`${data?.churnRate || 0}%`} color={RED} delay={0.05} />
      </div>

      {/* Plans */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">{isRTL ? 'خطط الاشتراك' : 'Subscription Plans'}</h3>
        <div className="space-y-2">
          {data?.plans.map((plan, i) => {
            const color = planColors[plan.id] || GOLD;
            return (
              <motion.div
                key={plan.id}
                className="p-3.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}15` }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                      {plan.id === 'vip' ? <CrownIcon size={16} /> : plan.id === 'premium' ? <StarIcon size={16} /> : <UsersIcon size={16} color={color} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{isRTL ? plan.nameAr : plan.name}</p>
                      <p className="text-[10px] text-gray-500">${plan.price}/mo · {plan.subscribersCount} {isRTL ? 'مشترك' : 'subs'}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]" style={{ borderColor: color, color }} onClick={() => setEditingPlan(plan)}>
                    {isRTL ? 'تعديل' : 'Edit'}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {plan.features.map((f, fi) => (
                    <Badge key={fi} className="text-[8px] h-4" style={{ background: `${color}10`, color, borderColor: 'transparent' }}>{f}</Badge>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Revenue Chart */}
      {data?.monthlyRevenue && (
        <Card style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}10` }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white">{isRTL ? 'إيرادات الاشتراكات' : 'Subscription Revenue'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: NAVY, border: `1px solid ${GOLD}30`, borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="revenue" fill={GOLD} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Plan Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
        <DialogContent className="max-w-sm" style={{ background: NAVY, border: `1px solid ${GOLD}20` }}>
          {editingPlan && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white text-sm">{isRTL ? 'تعديل الخطة' : 'Edit Plan'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-400">{isRTL ? 'الاسم' : 'Name'}</Label>
                  <Input value={editingPlan.name} className="text-xs h-8 mt-1" style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${GOLD}15`, color: 'white' }} onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs text-gray-400">{isRTL ? 'السعر (USD/شهر)' : 'Price (USD/month)'}</Label>
                  <Input type="number" value={editingPlan.price} className="text-xs h-8 mt-1" style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${GOLD}15`, color: 'white' }} onChange={(e) => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) })} />
                </div>
              </div>
              <DialogFooter>
                <Button size="sm" style={{ background: GOLD, color: NAVY }} onClick={() => setEditingPlan(null)}>{isRTL ? 'حفظ' : 'Save'}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Section 5: Withdrawal Management ============
function WithdrawalManagement({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const [data, setData] = useState<{ withdrawals: Record<string, unknown>[]; totalPayouts: number; pendingAmount: number; approvedPayouts: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);
  const [note, setNote] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const d = await adminFetch('/api/admin/withdrawals');
      setData(d);
    } catch { /* empty */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAction = async () => {
    if (!actionDialog) return;
    try {
      await adminFetch('/api/admin/withdrawals', {
        method: 'PATCH',
        body: JSON.stringify({ transactionId: actionDialog.id, action: actionDialog.action, note }),
      });
      setActionDialog(null);
      setNote('');
      loadData();
    } catch { /* empty */ }
  };

  if (loading) {
    return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />)}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<WithdrawalIcon size={16} color={GOLD} />} label={isRTL ? 'إجمالي المدفوعات' : 'Total Payouts'} value={formatNumber(data?.totalPayouts || 0, lang)} subValue={isRTL ? 'عملات' : 'coins'} />
        <StatCard icon={<LightningIcon size={16} />} label={isRTL ? 'معلق' : 'Pending'} value={formatNumber(data?.pendingAmount || 0, lang)} color="#F59E0B" />
        <StatCard icon={<CoinIcon size={16} />} label={isRTL ? 'تمت الموافقة' : 'Approved'} value={formatNumber(data?.approvedPayouts || 0, lang)} color={GREEN} />
      </div>

      {/* Withdrawal List */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">{isRTL ? 'طلبات السحب' : 'Withdrawal Requests'}</h3>
        <div className="space-y-1.5 max-h-[55vh] overflow-y-auto">
          {(data?.withdrawals || []).length === 0 && (
            <p className="text-xs text-gray-500 text-center py-8">{isRTL ? 'لا توجد طلبات سحب' : 'No withdrawal requests'}</p>
          )}
          {(data?.withdrawals || []).map((w, i) => (
            <motion.div
              key={w.id as string}
              className="p-3 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.03)` }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    {w.currency === 'coins' ? <CoinIcon size={12} /> : <DiamondCurrencyIcon size={12} />}
                    <span className="text-sm font-semibold text-white">{formatNumber(w.amount as number, lang)}</span>
                    <span className="text-[10px] text-gray-500">{w.currency as string}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">{w.user_uid as string} · {new Date(w.created_at as number).toLocaleString(isRTL ? 'ar' : 'en')}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-7 text-[10px]" style={{ borderColor: GREEN, color: GREEN }} onClick={() => setActionDialog({ id: w.id as string, action: 'approve' })}>
                    {isRTL ? 'موافقة' : 'Approve'}
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]" style={{ borderColor: RED, color: RED }} onClick={() => setActionDialog({ id: w.id as string, action: 'reject' })}>
                    {isRTL ? 'رفض' : 'Reject'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setNote(''); }}>
        <DialogContent className="max-w-sm" style={{ background: NAVY, border: `1px solid ${GOLD}20` }}>
          {actionDialog && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white text-sm">
                  {actionDialog.action === 'approve' ? (isRTL ? 'موافقة على السحب' : 'Approve Withdrawal') : (isRTL ? 'رفض السحب' : 'Reject Withdrawal')}
                </DialogTitle>
              </DialogHeader>
              <Textarea
                placeholder={isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="text-xs"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${GOLD}15`, color: 'white' }}
              />
              <DialogFooter className="gap-2">
                <Button size="sm" variant="ghost" className="text-gray-400" onClick={() => { setActionDialog(null); setNote(''); }}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
                <Button size="sm" style={{ background: actionDialog.action === 'approve' ? GREEN : RED, color: 'white' }} onClick={handleAction}>
                  {actionDialog.action === 'approve' ? (isRTL ? 'موافقة' : 'Approve') : (isRTL ? 'رفض' : 'Reject')}
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
  const [giftTypes, setGiftTypes] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editGift, setEditGift] = useState<Record<string, unknown> | null>(null);
  const [showAddGift, setShowAddGift] = useState(false);
  const [newGift, setNewGift] = useState({ name: '', nameAr: '', emoji: '🎁', coinCost: 10, diamondValue: 1, category: 'basic' });

  useEffect(() => {
    // Load gift types from Supabase client-side
    import('@/lib/supabase-service').then(({ giftsService }) => {
      giftsService.getGiftTypes().then((types) => {
        setGiftTypes(types || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }).catch(() => setLoading(false));
  }, []);

  const categoryColors: Record<string, string> = { basic: '#6B7280', premium: GOLD, luxury: '#8B5CF6', seasonal: GREEN, exclusive: RED };
  const categories = ['basic', 'premium', 'luxury', 'seasonal', 'exclusive'];

  const economySettings = [
    { key: 'coinToDiamondRate', label: isRTL ? 'سعر العملة إلى ألماس' : 'Coin→Diamond Rate', value: 100, icon: <CoinIcon size={14} /> },
    { key: 'minWithdrawal', label: isRTL ? 'الحد الأدنى للسحب' : 'Min Withdrawal', value: 1000, icon: <WithdrawalIcon size={14} /> },
    { key: 'platformFeePercent', label: isRTL ? 'عمولة المنصة' : 'Platform Fee %', value: 30, icon: <WalletIcon size={14} /> },
    { key: 'bonusDailyCoins', label: isRTL ? 'مكافأة العملات اليومية' : 'Daily Bonus Coins', value: 50, icon: <StarIcon size={14} /> },
  ];

  return (
    <div className="space-y-4">
      {/* Economy Settings */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">{isRTL ? 'إعدادات الاقتصاد' : 'Economy Settings'}</h3>
        <div className="grid grid-cols-2 gap-2">
          {economySettings.map((setting) => (
            <div key={setting.key} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}08` }}>
              <div className="flex items-center gap-1.5 mb-1">
                {setting.icon}
                <span className="text-[10px] text-gray-500">{setting.label}</span>
              </div>
              <p className="text-lg font-bold" style={{ color: GOLD }}>{setting.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Gift Types */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">{isRTL ? 'أنواع الهدايا' : 'Gift Types'}</h3>
          <Button size="sm" className="h-7 text-[10px]" style={{ background: GOLD, color: NAVY }} onClick={() => setShowAddGift(true)}>
            {isRTL ? '+ إضافة هدية' : '+ Add Gift'}
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />)}</div>
        ) : (
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {giftTypes.map((gift, i) => {
              const category = (gift.category as string) || 'basic';
              const color = categoryColors[category] || '#6B7280';
              return (
                <motion.div
                  key={gift.id as string}
                  className="flex items-center gap-3 p-2.5 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}10` }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <span className="text-xl">{gift.emoji as string}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-white">{gift.name as string}</span>
                      <Badge className="text-[8px] h-3.5" style={{ background: `${color}12`, color, borderColor: 'transparent' }}>{category}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span className="flex items-center gap-0.5"><CoinIcon size={8} />{gift.coin_cost as number}</span>
                      <span className="flex items-center gap-0.5"><DiamondCurrencyIcon size={8} />{gift.diamond_value as number}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch checked={gift.is_active as boolean} className="scale-75" />
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-gray-400" onClick={() => setEditGift(gift)}>
                      <SettingsIcon size={12} />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction Revenue Summary */}
      <Card style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}10` }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-white">{isRTL ? 'إيرادات الهدايا' : 'Gift Revenue'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[
                  { name: isRTL ? 'أساسية' : 'Basic', value: 40, fill: '#6B7280' },
                  { name: isRTL ? 'مميزة' : 'Premium', value: 35, fill: GOLD },
                  { name: isRTL ? 'فاخرة' : 'Luxury', value: 15, fill: '#8B5CF6' },
                  { name: isRTL ? 'حصرية' : 'Exclusive', value: 10, fill: RED },
                ]} dataKey="value" innerRadius={35} outerRadius={55} paddingAngle={2}>
                  {[ '#6B7280', GOLD, '#8B5CF6', RED ].map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip contentStyle={{ background: NAVY, border: `1px solid ${GOLD}30`, borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Add Gift Dialog */}
      <Dialog open={showAddGift} onOpenChange={setShowAddGift}>
        <DialogContent className="max-w-sm" style={{ background: NAVY, border: `1px solid ${GOLD}20` }}>
          <DialogHeader>
            <DialogTitle className="text-white text-sm">{isRTL ? 'إضافة هدية جديدة' : 'Add New Gift'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-gray-400">{isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
              <Input value={newGift.name} onChange={(e) => setNewGift({ ...newGift, name: e.target.value })} className="text-xs h-8" style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${GOLD}15`, color: 'white' }} />
            </div>
            <div>
              <Label className="text-xs text-gray-400">{isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
              <Input value={newGift.nameAr} onChange={(e) => setNewGift({ ...newGift, nameAr: e.target.value })} className="text-xs h-8" style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${GOLD}15`, color: 'white' }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-400">{isRTL ? 'تكلفة العملات' : 'Coin Cost'}</Label>
                <Input type="number" value={newGift.coinCost} onChange={(e) => setNewGift({ ...newGift, coinCost: parseInt(e.target.value) })} className="text-xs h-8" style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${GOLD}15`, color: 'white' }} />
              </div>
              <div>
                <Label className="text-xs text-gray-400">{isRTL ? 'قيمة الألماس' : 'Diamond Value'}</Label>
                <Input type="number" value={newGift.diamondValue} onChange={(e) => setNewGift({ ...newGift, diamondValue: parseInt(e.target.value) })} className="text-xs h-8" style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${GOLD}15`, color: 'white' }} />
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-400">{isRTL ? 'الفئة' : 'Category'}</Label>
              <Select value={newGift.category} onValueChange={(v) => setNewGift({ ...newGift, category: v })}>
                <SelectTrigger className="h-8 text-xs" style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${GOLD}15`, color: 'white' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: NAVY }}>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" style={{ background: GOLD, color: NAVY }} onClick={() => setShowAddGift(false)}>{isRTL ? 'إضافة' : 'Add Gift'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Section 7: Live Stream Management ============
function LiveStreamManagement({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const [streams, setStreams] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('@/lib/supabase-service').then(({ liveStreamService }) => {
      liveStreamService.getActiveStreams().then((s) => {
        setStreams(s || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    });
  }, []);

  const endStream = async (streamId: string) => {
    try {
      await adminFetch('/api/admin/stats', { method: 'PATCH', body: JSON.stringify({ action: 'end_stream', streamId }) });
      setStreams(streams.filter(s => s.id !== streamId));
    } catch { /* empty */ }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<StreamIcon size={16} />} label={isRTL ? 'البثوث النشطة' : 'Active Streams'} value={streams.length} color={RED} />
        <StatCard icon={<UsersIcon size={16} color={GOLD} />} label={isRTL ? 'إجمالي المشاهدين' : 'Total Viewers'} value={formatNumber(streams.reduce((sum, s) => sum + ((s.viewer_count as number) || 0), 0), lang)} />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />)}</div>
      ) : (
        <div className="space-y-2">
          {streams.length === 0 && (
            <div className="text-center py-8">
              <StreamIcon size={32} color="#6B7280" />
              <p className="text-sm text-gray-500 mt-2">{isRTL ? 'لا توجد بثوث نشطة' : 'No active streams'}</p>
            </div>
          )}
          {streams.map((stream, i) => (
            <motion.div
              key={stream.id as string}
              className="p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${RED}10` }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-semibold text-white">{(stream.title as string) || isRTL ? 'بث مباشر' : 'Live Stream'}</span>
                </div>
                <Badge className="text-[9px] h-4" style={{ background: `${RED}15`, color: RED, borderColor: 'transparent' }}>LIVE</Badge>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <span>{isRTL ? 'المضيف' : 'Host'}: {(stream.host_uid as string)?.substring(0, 8)}</span>
                  <span className="flex items-center gap-0.5"><EyeIcon2 size={10} /> {stream.viewer_count as number}</span>
                  <span className="flex items-center gap-0.5"><GiftIcon size={10} color={GOLD} /> {stream.gifts_coins_total as number}</span>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-[10px]" style={{ borderColor: RED, color: RED }} onClick={() => endStream(stream.id as string)}>
                  {isRTL ? 'إنهاء' : 'End Stream'}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stream Analytics */}
      <Card style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}10` }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-white">{isRTL ? 'تحليلات البث' : 'Stream Analytics'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { day: 'Mon', viewers: 120, streams: 3 },
                { day: 'Tue', viewers: 85, streams: 2 },
                { day: 'Wed', viewers: 200, streams: 5 },
                { day: 'Thu', viewers: 150, streams: 4 },
                { day: 'Fri', viewers: 320, streams: 8 },
                { day: 'Sat', viewers: 450, streams: 12 },
                { day: 'Sun', viewers: 380, streams: 9 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 10 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: NAVY, border: `1px solid ${GOLD}30`, borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="viewers" stroke={RED} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="streams" stroke={GOLD} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EyeIcon2({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// ============ Section 8: App Settings ============
function AppSettingsSection({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const [settings, setSettings] = useState<{
    appName: string; appNameAr: string; version: string; maintenanceMode: boolean;
    featureFlags: Record<string, boolean>;
    rateLimits: Record<string, number>;
    contentPolicies: Record<string, unknown>;
    economy: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch('/api/admin/settings')
      .then((d) => { if (d.settings) setSettings(d.settings); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveSettings = async (updates: Record<string, unknown>) => {
    setSaving(true);
    try {
      await adminFetch('/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      setSettings((prev) => prev ? { ...prev, ...updates } as typeof settings : prev);
    } catch { /* empty */ } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />)}</div>;
  }

  const features = settings?.featureFlags || {};
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

  const rateLimitLabels: Record<string, { en: string; ar: string }> = {
    maxPostsPerHour: { en: 'Max Posts/Hour', ar: 'حد المنشورات/ساعة' },
    maxCommentsPerHour: { en: 'Max Comments/Hour', ar: 'حد التعليقات/ساعة' },
    maxGiftsPerMinute: { en: 'Max Gifts/Minute', ar: 'حد الهدايا/دقيقة' },
    maxMessagesPerMinute: { en: 'Max Messages/Minute', ar: 'حد الرسائل/دقيقة' },
  };

  return (
    <div className="space-y-4">
      {/* General */}
      <Card style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}10` }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-white">{isRTL ? 'عام' : 'General'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white">{isRTL ? 'وضع الصيانة' : 'Maintenance Mode'}</p>
              <p className="text-[10px] text-gray-500">{isRTL ? 'تعطيل التطبيق مؤقتاً' : 'Temporarily disable the app'}</p>
            </div>
            <Switch
              checked={settings?.maintenanceMode || false}
              onCheckedChange={(v) => saveSettings({ maintenanceMode: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white">{isRTL ? 'اسم التطبيق' : 'App Name'}</p>
            </div>
            <span className="text-xs" style={{ color: GOLD }}>{settings?.appName || 'Aden Dot'}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white">{isRTL ? 'إصدار التطبيق' : 'App Version'}</p>
            </div>
            <Badge style={{ background: `${GOLD}15`, color: GOLD, borderColor: 'transparent' }}>v{settings?.version || '2.1.0'}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}10` }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-white">{isRTL ? 'ميزات التطبيق' : 'Feature Flags'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {Object.entries(features).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-gray-300">{isRTL ? featureLabels[key]?.ar : featureLabels[key]?.en || key}</span>
              <Switch
                checked={enabled}
                onCheckedChange={(v) => saveSettings({ featureFlags: { ...features, [key]: v } })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}10` }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-white">{isRTL ? 'حدود المعدل' : 'Rate Limits'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(settings?.rateLimits || {}).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-gray-300">{isRTL ? rateLimitLabels[key]?.ar : rateLimitLabels[key]?.en || key}</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={value as number}
                  className="w-16 h-7 text-xs text-center"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${GOLD}15`, color: 'white' }}
                  onChange={(e) => saveSettings({ rateLimits: { ...settings?.rateLimits, [key]: parseInt(e.target.value) } })}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Content Policies */}
      <Card style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}10` }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-white">{isRTL ? 'سياسات المحتوى' : 'Content Policies'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {settings?.contentPolicies && Object.entries(settings.contentPolicies).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-gray-300">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</span>
              {typeof value === 'boolean' ? (
                <Switch checked={value} onCheckedChange={(v) => saveSettings({ contentPolicies: { ...settings.contentPolicies, [key]: v } })} />
              ) : (
                <Input
                  type="number"
                  value={value as number}
                  className="w-16 h-7 text-xs text-center"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${GOLD}15`, color: 'white' }}
                  onChange={(e) => saveSettings({ contentPolicies: { ...settings.contentPolicies, [key]: parseInt(e.target.value) } })}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {saving && (
        <div className="flex items-center gap-2 text-xs" style={{ color: GOLD }}>
          <motion.div className="w-3 h-3 rounded-full" style={{ border: `2px solid ${GOLD}30`, borderTopColor: GOLD }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} />
          {isRTL ? 'جاري الحفظ...' : 'Saving...'}
        </div>
      )}
    </div>
  );
}

// ============ Section 9: Admin Logs ============
function AdminLogs({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const [logs, setLogs] = useState<{ id: string; admin: string; action: string; target: string; timestamp: number; details?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    // Load from notifications (used as admin log)
    adminFetch('/api/admin/stats')
      .then(() => {
        // Simulate log data since we don't have a dedicated admin_logs table
        setLogs([
          { id: '1', admin: 'admin_1', action: isRTL ? 'حظر مستخدم' : 'Banned user', target: 'user_456', timestamp: Date.now() - 1800000, details: isRTL ? 'انتهاك سياسة المحتوى' : 'Content policy violation' },
          { id: '2', admin: 'admin_1', action: isRTL ? 'موافقة على سحب' : 'Approved withdrawal', target: 'tx_789', timestamp: Date.now() - 3600000 },
          { id: '3', admin: 'admin_2', action: isRTL ? 'توثيق مستخدم' : 'Verified user', target: 'user_012', timestamp: Date.now() - 7200000 },
          { id: '4', admin: 'admin_1', action: isRTL ? 'تحديث الإعدادات' : 'Updated settings', target: 'maintenance_mode', timestamp: Date.now() - 10800000 },
          { id: '5', admin: 'admin_2', action: isRTL ? 'إزالة منشور' : 'Removed post', target: 'post_345', timestamp: Date.now() - 86400000, details: isRTL ? 'محتوى غير لائق' : 'Inappropriate content' },
          { id: '6', admin: 'admin_1', action: isRTL ? 'ترقية مستخدم لمشرف' : 'Promoted user to mod', target: 'user_678', timestamp: Date.now() - 172800000 },
        ]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isRTL]);

  const filteredLogs = filter ? logs.filter(l => l.action.includes(filter) || l.target.includes(filter) || l.admin.includes(filter)) : logs;

  return (
    <div className="space-y-3">
      <Input
        placeholder={isRTL ? 'بحث في السجلات...' : 'Search logs...'}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="text-xs h-9"
        style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${GOLD}15`, color: 'white' }}
      />

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />)}</div>
      ) : (
        <div className="space-y-1 max-h-[65vh] overflow-y-auto">
          {filteredLogs.map((log, i) => (
            <motion.div
              key={log.id}
              className="flex items-start gap-2 p-2.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{ background: `${GOLD}10` }}>
                <ShieldIcon size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white">{log.action}</span>
                  <span className="text-[9px] text-gray-600">→ {log.target}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-500">{log.admin}</span>
                  <span className="text-[10px] text-gray-600">· {new Date(log.timestamp).toLocaleString(isRTL ? 'ar' : 'en')}</span>
                </div>
                {log.details && <p className="text-[10px] text-gray-500 mt-0.5">{log.details}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
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
          <p className="text-sm text-gray-400">{isRTL ? 'غير مصرح بالوصول' : 'Access Denied'}</p>
          <p className="text-xs text-gray-600">{isRTL ? 'هذه الصفحة متاحة للمشرفين فقط' : 'This page is only accessible to admins'}</p>
        </div>
      </div>
    );
  }

  const sectionTitles: Record<AdminSection, { en: string; ar: string }> = {
    overview: { en: 'Dashboard', ar: 'لوحة التحكم' },
    users: { en: 'User Management', ar: 'إدارة المستخدمين' },
    moderation: { en: 'Content Moderation', ar: 'الإشراف على المحتوى' },
    subscriptions: { en: 'Subscriptions', ar: 'الاشتراكات' },
    withdrawals: { en: 'Withdrawals', ar: 'السحوبات' },
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
      case 'withdrawals': return <WithdrawalManagement lang={lang} />;
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
        <div className="p-4 pb-2 flex items-center gap-2" style={{ borderBottom: `1px solid ${GOLD}08` }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${GOLD}12` }}>
            {activeSection === 'overview' && <DashboardIcon size={14} />}
            {activeSection === 'users' && <UsersIcon size={14} />}
            {activeSection === 'moderation' && <ModerationIcon size={14} />}
            {activeSection === 'subscriptions' && <SubscriptionIcon size={14} />}
            {activeSection === 'withdrawals' && <WithdrawalIcon size={14} />}
            {activeSection === 'gifts' && <GiftIcon size={14} />}
            {activeSection === 'livestreams' && <StreamIcon size={14} />}
            {activeSection === 'settings' && <SettingsIcon size={14} />}
            {activeSection === 'logs' && <LogsIcon size={14} />}
          </div>
          <h2 className="text-sm font-bold text-white">{isRTL ? sectionTitles[activeSection].ar : sectionTitles[activeSection].en}</h2>
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
