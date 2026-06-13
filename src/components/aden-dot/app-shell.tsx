'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useAppStore, usePostsStore } from '@/lib/store';
import { authService, userService } from '@/lib/supabase-service';
import { t, getDirection } from '@/lib/i18n';
import {
  HomeIcon, ExploreIcon, CreateIcon, LiveIcon, ChatIcon, ProfileIcon,
  AppLogoIcon, BellIcon, CoinIcon, DiamondCurrencyIcon, VerifiedIcon, SettingsIcon,
} from '@/components/icons/aden-dot-icons';
import { LoginPage, RegisterPage, CompleteProfilePage, VerifyEmailPage, ForgotPasswordPage } from './auth-pages';
import { HomeFeed } from './home-feed';
import { ExplorePage } from './explore-page';
import { ProfilePage } from './profile-page';
import { ChatPage } from './chat-page';
import { LiveStreamsPage } from './live-stream';
import { WalletPage, AchievementsPage, DailyRewardCard } from './gifts-wallet';
import { SettingsPage } from './settings-page';
import { EarningsPage } from './earnings-page';
import { AdminDashboard } from './admin-dashboard';
import { DatabaseSetupPage } from '@/components/skyline/database-setup';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const GOLD = '#D4A853';
const GOLD_LIGHT = '#F5C542';
const NAVY = '#1A1F36';

// ============ Bottom Navigation ============
function BottomNav() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const user = useAuthStore((s) => s.user);
  const lang = useAppStore((s) => s.language);
  const isRTL = lang === 'ar';

  const tabs = [
    { id: 'home' as const, icon: HomeIcon, label: t('nav.home', lang) },
    { id: 'explore' as const, icon: ExploreIcon, label: t('nav.explore', lang) },
    { id: 'create' as const, icon: CreateIcon, label: t('nav.create', lang) },
    { id: 'live' as const, icon: LiveIcon, label: t('nav.live', lang) },
    { id: 'chat' as const, icon: ChatIcon, label: t('nav.chat', lang) },
    { id: 'profile' as const, icon: null, label: t('nav.profile', lang) },
    ...(user?.role === 'admin' ? [{ id: 'admin' as const, icon: null, label: t('nav.admin', lang) }] : []),
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(26, 31, 54, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(212, 168, 83, 0.1)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-around py-1.5 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-0.5 py-1 px-2 transition-all relative"
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1.5 w-6 h-0.5 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})` }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              {tab.id === 'admin' ? (
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: isActive ? `${GOLD}20` : 'rgba(255,255,255,0.05)' }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={isActive ? GOLD : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
              ) : tab.id === 'profile' ? (
                <div className="relative">
                  <Avatar className={`w-6 h-6 transition-all ${isActive ? 'ring-2 scale-110' : ''}`} style={{ borderColor: isActive ? GOLD : 'transparent' }}>
                    <AvatarImage src={user?.profileImage || '/avatar.png'} className="object-cover" />
                    <AvatarFallback className="text-[9px]" style={{ background: `${GOLD}20`, color: GOLD }}>
                      {user?.nickname?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <div className="relative">
                  <tab.icon
                    size={22}
                    color={isActive ? (tab.id === 'live' ? '#EF4444' : GOLD) : '#6B7280'}
                  />
                  {tab.id === 'live' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                  {tab.id === 'chat' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: GOLD }} />
                  )}
                </div>
              )}

              <span
                className="text-[9px] font-medium transition-colors"
                style={{ color: isActive ? GOLD : '#6B7280' }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ============ Top Bar ============
function TopBar() {
  const activeTab = useAppStore((s) => s.activeTab);
  const user = useAuthStore((s) => s.user);
  const lang = useAppStore((s) => s.language);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  const getTitle = () => {
    switch (activeTab) {
      case 'home': return t('app.name', lang);
      case 'explore': return t('nav.explore', lang);
      case 'create': return t('home.createPost', lang);
      case 'live': return t('nav.live', lang);
      case 'chat': return t('nav.chat', lang);
      case 'profile': return t('nav.profile', lang);
      case 'wallet': return t('nav.wallet', lang);
      case 'achievements': return t('nav.achievements', lang);
      case 'settings': return t('nav.settings', lang);
      case 'earnings': return t('nav.earnings', lang);
      case 'admin': return t('nav.admin', lang);
      default: return t('app.name', lang);
    }
  };

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: 'rgba(26, 31, 54, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(212, 168, 83, 0.08)',
      }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {activeTab === 'home' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}
            >
              <AppLogoIcon size={22} />
            </motion.div>
          )}
          <h1 className="text-lg font-bold text-white">{getTitle()}</h1>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'home' && user && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}30` }}>
                <CoinIcon size={14} />
                <span className="text-xs font-semibold" style={{ color: GOLD }}>{user.coinsBalance || 0}</span>
              </div>
              <button onClick={() => setActiveTab('settings')} className="relative p-1">
                <BellIcon size={20} color={GOLD} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ============ Loading Screen ============
function LoadingScreen() {
  const lang = useAppStore((s) => s.language);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #242A45 50%, #0F1225 100%)` }}
    >
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <AppLogoIcon size={48} />
        </motion.div>
        <div className="flex items-center justify-center gap-2">
          <motion.div
            className="w-5 h-5 rounded-full"
            style={{ border: `2px solid ${GOLD}30`, borderTopColor: GOLD }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
          <span className="text-sm" style={{ color: GOLD }}>{t('app.loading', lang)}</span>
        </div>
      </motion.div>
    </div>
  );
}

// ============ Profile Sub-Pages ============
function ProfileSubMenu() {
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const user = useAuthStore((s) => s.user);
  const lang = useAppStore((s) => s.language);

  const menuItems = [
    { id: 'wallet' as const, emoji: '💰', label: t('nav.wallet', lang), desc: `🪙 ${user?.coinsBalance || 0} | 💎 ${user?.diamondsBalance || 0}` },
    { id: 'achievements' as const, emoji: '🏆', label: t('nav.achievements', lang), desc: `${t('profile.level', lang)} ${user?.level || 1}` },
    { id: 'earnings' as const, emoji: '📊', label: t('nav.earnings', lang), desc: lang === 'ar' ? 'أرباحك وإيراداتك' : 'Your revenue & earnings' },
    { id: 'settings' as const, emoji: '⚙️', label: t('nav.settings', lang), desc: lang === 'ar' ? 'إعدادات التطبيق' : 'App settings' },
  ];

  return (
    <div className="space-y-2 mt-4">
      {menuItems.map((item, idx) => (
        <motion.button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className="w-full p-3.5 rounded-xl flex items-center gap-3 transition-all"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(212, 168, 83, 0.08)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          whileHover={{ background: 'rgba(212, 168, 83, 0.06)' }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl" style={{ background: `${GOLD}10` }}>
            {item.emoji}
          </div>
          <div className="flex-1 text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <p className="font-medium text-sm text-white">{item.label}</p>
            <p className="text-xs text-gray-500">{item.desc}</p>
          </div>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" style={{ transform: lang === 'ar' ? 'scaleX(-1)' : 'none' }}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </motion.button>
      ))}
    </div>
  );
}

// ============ Main App ============
export default function AdenDotApp() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isEmailVerified = useAuthStore((s) => s.isEmailVerified);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const showAuth = useAppStore((s) => s.showAuth);
  const setShowAuth = useAppStore((s) => s.setShowAuth);
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const lang = useAppStore((s) => s.language);

  const [isInitializing, setIsInitializing] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  // Check database setup status
  useEffect(() => {
    fetch('/api/setup')
      .then((r) => r.json())
      .then((data) => {
        if (data.database && !data.database.isSetup) {
          setNeedsSetup(true);
        }
      })
      .catch(() => {});
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    let authSubscription: { data: { subscription: { unsubscribe: () => void } } } | null = null;

    const init = async () => {
      try {
        await useAuthStore.getState().initializeAuth();

        authSubscription = authService.onAuthStateChange(async (event, session) => {
          const s = session as { user?: { id?: string; email_confirmed_at?: string } } | null;

          if (event === 'SIGNED_IN' && s?.user?.id) {
            const profile = await userService.getUserProfile(s.user.id!);
            if (profile) {
              useAuthStore.setState({
                user: profile,
                isAuthenticated: true,
                isEmailVerified: s.user.email_confirmed_at != null,
              });
            }
          } else if (event === 'SIGNED_OUT') {
            useAuthStore.setState({
              user: null,
              isAuthenticated: false,
              isEmailVerified: false,
              error: null,
            });
            usePostsStore.setState({ posts: [], currentPage: 0, hasMore: true });
          } else if (event === 'TOKEN_REFRESHED' && s?.user?.id) {
            const currentState = useAuthStore.getState();
            if (!currentState.user) {
              const profile = await userService.getUserProfile(s.user.id!);
              if (profile) {
                useAuthStore.setState({
                  user: profile,
                  isAuthenticated: true,
                  isEmailVerified: s.user.email_confirmed_at != null,
                });
              }
            }
          } else if (event === 'USER_UPDATED' && s?.user?.id) {
            const profile = await userService.getUserProfile(s.user.id!);
            if (profile) {
              useAuthStore.setState({ user: profile });
            }
          }
        });
      } catch (error) {
        console.error('[AdenDotApp] Auth initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    init();

    return () => {
      if (authSubscription) {
        authSubscription.data.subscription.unsubscribe();
      }
    };
  }, []);

  // Show loading
  if (isInitializing) {
    return <LoadingScreen />;
  }

  // Show setup
  if (needsSetup) {
    return <DatabaseSetupPage />;
  }

  // Show auth pages
  if (!isAuthenticated || showAuth) {
    if (showAuth === 'register') return <RegisterPage />;
    if (showAuth === 'complete-profile') return <CompleteProfilePage />;
    if (showAuth === 'verify-email') return <VerifyEmailPage />;
    if (showAuth === 'forgot-password') return <ForgotPasswordPage />;
    return <LoginPage />;
  }

  // Profile incomplete
  if (isAuthenticated && !user?.username) {
    return <CompleteProfilePage />;
  }

  // Email not verified
  if (!isEmailVerified) {
    return <VerifyEmailPage />;
  }

  // Main app
  return (
    <div
      className="min-h-screen"
      style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #0F1225 100%)` }}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {activeTab !== 'live' && <TopBar />}
      <main className={activeTab === 'live' ? '' : 'max-w-lg mx-auto px-4 pt-4 pb-24'}>
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <DailyRewardCard />
              <HomeFeed />
            </motion.div>
          )}
          {activeTab === 'explore' && (
            <motion.div key="explore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ExplorePage />
            </motion.div>
          )}
          {activeTab === 'create' && (
            <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HomeFeed />
            </motion.div>
          )}
          {activeTab === 'live' && (
            <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LiveStreamsPage />
            </motion.div>
          )}
          {activeTab === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ChatPage />
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProfilePage />
              <ProfileSubMenu />
            </motion.div>
          )}
          {activeTab === 'wallet' && (
            <motion.div key="wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WalletPage />
            </motion.div>
          )}
          {activeTab === 'achievements' && (
            <motion.div key="achievements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AchievementsPage />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SettingsPage />
            </motion.div>
          )}
          {activeTab === 'earnings' && (
            <motion.div key="earnings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EarningsPage />
            </motion.div>
          )}
          {activeTab === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="-mx-4 -pt-4">
              <AdminDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
