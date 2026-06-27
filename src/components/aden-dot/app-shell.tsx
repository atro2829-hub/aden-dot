'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useAppStore, usePostsStore, useNotificationsStore } from '@/lib/store';
import { authService, userService } from '@/lib/supabase-service';
import { t, getDirection } from '@/lib/i18n';
import {
  HomeIcon, ExploreIcon, CreateIcon, LiveIcon, ChatIcon, ProfileIcon,
  AppLogoIcon, BellIcon, CoinIcon, DiamondCurrencyIcon, VerifiedIcon, SettingsIcon,
  ShieldIcon, HeartIcon, StarIcon, TrophyIcon, GiftIcon, LightningIcon,
  SouthYemenFlagIcon,
} from '@/components/icons/aden-dot-icons';
import { ConnectionBanner } from './connection-banner';
import { LoginPage, RegisterPage, CompleteProfilePage, ForgotPasswordPage } from './auth-pages';
import { HomeFeed, CreatePostModal } from './home-feed';
import { ExplorePage } from './explore-page';
import { ProfilePage } from './profile-page';
import { ChatPage } from './chat-page';
import { LiveStreamsPage } from './live-stream';
import { WalletPage, AchievementsPage } from './gifts-wallet';
import { SettingsPage } from './settings-page';
import { EarningsPage } from './earnings-page';
import { AdminDashboard } from './admin-dashboard';
import { SupabaseSetupScreen } from './supabase-setup';
import { getActiveSupabaseConfig } from '@/lib/supabase-config';
import { resetSupabaseBrowser } from '@/lib/supabase-browser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// ============ Notifications Panel ============
function NotificationsPanel() {
  const showNotifications = useAppStore((s) => s.showNotifications);
  const setShowNotifications = useAppStore((s) => s.setShowNotifications);
  const notifications = useNotificationsStore((s) => s.notifications);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const isLoading = useNotificationsStore((s) => s.isLoading);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);
  const markAsRead = useNotificationsStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);
  const lang = useAppStore((s) => s.language);

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications, fetchNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <HeartIcon size={16} color="#EF4444" />;
      case 'follow': return <ProfileIcon size={16} color="var(--primary)" />;
      case 'comment': return <ChatIcon size={16} color="var(--primary)" />;
      case 'gift': return <GiftIcon size={16} color="#D4A853" />;
      case 'achievement': return <TrophyIcon size={16} color="#D4A853" />;
      case 'level_up': return <StarIcon size={16} color="#D4A853" />;
      case 'live_start': return <LiveIcon size={16} color="#EF4444" />;
      case 'mention': return <ChatIcon size={16} color="var(--primary)" />;
      default: return <BellIcon size={16} color="var(--muted-foreground)" />;
    }
  };

  const getNotificationText = (type: string, fromUsername: string, content?: string) => {
    switch (type) {
      case 'like': return lang === 'ar' ? `${fromUsername} أعجب بمنشورك` : `${fromUsername} liked your post`;
      case 'follow': return lang === 'ar' ? `${fromUsername} بدأ بمتابعتك` : `${fromUsername} started following you`;
      case 'comment': return content
        ? (lang === 'ar' ? `${fromUsername}: ${content}` : `${fromUsername}: ${content}`)
        : (lang === 'ar' ? `${fromUsername} علق على منشورك` : `${fromUsername} commented on your post`);
      case 'gift': return lang === 'ar' ? `${fromUsername} أرسل لك هدية` : `${fromUsername} sent you a gift`;
      case 'achievement': return content || (lang === 'ar' ? 'إنجاز جديد!' : 'New achievement!');
      case 'level_up': return content || (lang === 'ar' ? 'ارتقيت مستوى!' : 'You leveled up!');
      case 'live_start': return lang === 'ar' ? `${fromUsername} بدأ بث مباشر` : `${fromUsername} started a live stream`;
      case 'mention': return lang === 'ar' ? `${fromUsername} ذكرك` : `${fromUsername} mentioned you`;
      default: return content || (lang === 'ar' ? 'إشعار جديد' : 'New notification');
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (minutes < 1) return lang === 'ar' ? 'الآن' : 'now';
    if (minutes < 60) return lang === 'ar' ? `منذ ${minutes} د` : `${minutes}m`;
    if (hours < 24) return lang === 'ar' ? `منذ ${hours} س` : `${hours}h`;
    return lang === 'ar' ? `منذ ${days} ي` : `${days}d`;
  };

  return (
    <AnimatePresence>
      {showNotifications && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setShowNotifications(false)}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-background border-l border-border shadow-2xl"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">
                  {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
                </h2>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary font-medium px-2 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                    >
                      {lang === 'ar' ? 'قراءة الكل' : 'Mark all read'}
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1.5 rounded-full hover:bg-muted transition-colors"
                  >
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Notifications list */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <motion.div
                      className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <BellIcon size={40} color="var(--muted-foreground)" />
                    <p className="mt-3 text-sm">{lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications yet'}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((n) => (
                      <motion.button
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`w-full flex items-start gap-3 p-3.5 text-left transition-colors hover:bg-primary/5 ${!n.isRead ? 'bg-primary/5' : ''}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="relative shrink-0">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={n.fromProfileImage || '/avatar.png'} className="object-cover" />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {n.fromUsername?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-background flex items-center justify-center">
                            {getNotificationIcon(n.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!n.isRead ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
                            {getNotificationText(n.type, n.fromUsername, n.content)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatTime(n.createdAt)}
                          </p>
                        </div>
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============ Bottom Navigation ============
function BottomNav() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const setShowCreatePost = useAppStore((s) => s.setShowCreatePost);
  const user = useAuthStore((s) => s.user);
  const lang = useAppStore((s) => s.language);

  const handleTabClick = useCallback((tabId: typeof activeTab) => {
    if (tabId === 'create') {
      // When create is tapped, stay on current tab and open the create modal
      setShowCreatePost(true);
      return;
    }
    setActiveTab(tabId);
  }, [setActiveTab, setShowCreatePost]);

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
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-around py-1.5 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id || (tab.id === 'create' && useAppStore.getState().showCreatePost);
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="flex flex-col items-center gap-0.5 py-1 px-2 transition-all relative"
            >
              {/* Active indicator */}
              {isActive && tab.id !== 'create' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1.5 w-6 h-0.5 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              {tab.id === 'admin' ? (
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                  <ShieldIcon
                    size={14}
                    color={isActive ? 'var(--primary)' : 'var(--muted-foreground)'}
                  />
                </div>
              ) : tab.id === 'profile' ? (
                <div className="relative">
                  <Avatar className={`w-6 h-6 transition-all ${isActive ? 'ring-2 ring-primary scale-110' : ''}`}>
                    <AvatarImage src={user?.profileImage || '/avatar.png'} className="object-cover" />
                    <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                      {user?.nickname?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <div className="relative">
                  <tab.icon
                    size={22}
                    color={isActive ? (tab.id === 'live' ? '#EF4444' : 'var(--primary)') : 'var(--muted-foreground)'}
                  />
                  {tab.id === 'live' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                  {tab.id === 'chat' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
              )}

              <span
                className={`text-[9px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
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
  const setShowNotifications = useAppStore((s) => s.setShowNotifications);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);
  const showNotifications = useAppStore((s) => s.showNotifications);

  // Fetch notifications count on mount
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

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

  const isWideLayout = activeTab === 'admin';

  return (
    <header
      className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border safe-top"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className={`mx-auto flex items-center justify-between px-4 py-3 ${isWideLayout ? 'max-w-6xl' : 'max-w-lg'}`}>
        <div className="flex items-center gap-2.5">
          {activeTab === 'home' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary shadow-sm"
            >
              <img src="/icon.png" alt="Aden Dot" className="w-6 h-6 rounded-md" />
            </motion.div>
          )}
          <h1 className="text-lg font-bold text-foreground tracking-tight">{getTitle()}</h1>
          {/* South Yemen flag badge - shown on home tab */}
          {activeTab === 'home' && (
            <SouthYemenFlagIcon size={22} className="shadow-sm" />
          )}
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              {/* Coins balance - shown on most pages */}
              {(activeTab === 'home' || activeTab === 'profile' || activeTab === 'wallet') && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <CoinIcon size={14} />
                  <span className="text-xs font-semibold text-primary">{user.coinsBalance || 0}</span>
                </div>
              )}
              {/* Notification bell */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <BellIcon size={20} color="var(--primary)" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[14px] h-[14px] flex items-center justify-center px-0.5 text-[8px] font-bold text-white bg-red-500 rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ============ Loading Screen (minimal - no big splash) ============
function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-background"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex flex-col items-center gap-3">
        <img src="/icon.png" alt="Aden Dot" className="w-12 h-12 rounded-xl opacity-90" />
        <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    </div>
  );
}

// ============ Profile Sub-Pages ============
function ProfileSubMenu() {
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const user = useAuthStore((s) => s.user);
  const lang = useAppStore((s) => s.language);

  const menuItems = [
    {
      id: 'wallet' as const,
      icon: <CoinIcon size={20} color="var(--primary)" />,
      label: t('nav.wallet', lang),
      desc: `${user?.coinsBalance || 0} ${lang === 'ar' ? 'عملة' : 'coins'} · ${user?.diamondsBalance || 0} ${lang === 'ar' ? 'ماس' : 'diamonds'}`,
    },
    {
      id: 'achievements' as const,
      icon: <TrophyIcon size={20} color="var(--primary)" />,
      label: t('nav.achievements', lang),
      desc: `${t('profile.level', lang)} ${user?.level || 1}`,
    },
    {
      id: 'earnings' as const,
      icon: <LightningIcon size={20} color="var(--primary)" />,
      label: t('nav.earnings', lang),
      desc: lang === 'ar' ? 'أرباحك وإيراداتك' : 'Your revenue & earnings',
    },
    {
      id: 'settings' as const,
      icon: <SettingsIcon size={20} color="var(--primary)" />,
      label: t('nav.settings', lang),
      desc: lang === 'ar' ? 'إعدادات التطبيق' : 'App settings',
    },
  ];

  return (
    <div className="space-y-2 mt-4">
      {menuItems.map((item, idx) => (
        <motion.button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className="w-full p-3.5 rounded-xl flex items-center gap-3 transition-all bg-card border border-border hover:bg-primary/5 hover:border-primary/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20">
            {item.icon}
          </div>
          <div className="flex-1 text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <p className="font-medium text-sm text-foreground">{item.label}</p>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" style={{ transform: lang === 'ar' ? 'scaleX(-1)' : 'none' }}>
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
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const showAuth = useAppStore((s) => s.showAuth);
  const setShowAuth = useAppStore((s) => s.setShowAuth);
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const lang = useAppStore((s) => s.language);
  const showCreatePost = useAppStore((s) => s.showCreatePost);
  const setShowCreatePost = useAppStore((s) => s.setShowCreatePost);

  const [isInitializing, setIsInitializing] = useState(true);

  // Set up Android lifecycle bridge so native code can notify the web layer
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__adendotLifecycle = {
      onForeground: () => {
        // Update user status to online
        const authState = useAuthStore.getState();
        if (authState.user && authState.isAuthenticated) {
          userService.updateUserProfile(authState.user.uid, {
            status: 'online',
            lastSeen: Date.now(),
          } as Record<string, unknown>).catch(() => {});
        }
      },
      onBackground: () => {
        // Update user status to offline
        const authState = useAuthStore.getState();
        if (authState.user && authState.isAuthenticated) {
          userService.updateUserProfile(authState.user.uid, {
            status: 'offline',
            lastSeen: Date.now(),
          } as Record<string, unknown>).catch(() => {});
        }
      },
    };

    return () => {
      delete (window as unknown as Record<string, unknown>).__adendotLifecycle;
    };
  }, []);

  // Initialize auth on mount - go directly to login, no splash or setup screen
  // Uses Supabase directly — no local fallback.
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        await useAuthStore.getState().initializeAuth();
      } catch (error) {
        console.error('[AdenDotApp] Auth initialization error:', error);
      } finally {
        if (mounted) setIsInitializing(false);
      }

      // Set up auth state change listener (only if Supabase is configured)
      try {
        const config = getActiveSupabaseConfig();
        if (config) {
          const subscription = authService.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            const s = session as { user?: { id?: string } } | null;

            if (event === 'SIGNED_IN' && s?.user?.id) {
              const profile = await userService.getUserProfile(s.user.id!);
              if (profile) {
                useAuthStore.setState({
                  user: profile,
                  isAuthenticated: true,
                });
                useAppStore.setState({ showAuth: null });
              }
            } else if (event === 'SIGNED_OUT') {
              useAuthStore.setState({
                user: null,
                isAuthenticated: false,
                error: null,
              });
              usePostsStore.setState({ posts: [], currentPage: 0, hasMore: true });
              useAppStore.setState({ showAuth: 'login', activeTab: 'home' });
            } else if (event === 'TOKEN_REFRESHED' && s?.user?.id) {
              const currentState = useAuthStore.getState();
              if (!currentState.user) {
                const profile = await userService.getUserProfile(s.user.id!);
                if (profile) {
                  useAuthStore.setState({
                    user: profile,
                    isAuthenticated: true,
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
          // Store subscription for cleanup
          (window as unknown as Record<string, unknown>).__adendotAuthSub = subscription;
        }
      } catch (e) {
        console.warn('[AdenDotApp] Auth state listener setup failed:', e);
      }
    };

    init();

    return () => {
      mounted = false;
      const sub = (window as unknown as Record<string, unknown>).__adendotAuthSub as
        { data: { subscription: { unsubscribe: () => void } } } | null;
      if (sub) {
        sub.data.subscription.unsubscribe();
      }
    };
  }, []);

  // Quick loading - no splash, just a brief spinner (max 800ms)
  if (isInitializing) {
    return <LoadingScreen />;
  }

  // If Supabase is not configured, show the setup screen
  const supabaseConfig = getActiveSupabaseConfig();
  if (!supabaseConfig) {
    return <SupabaseSetupScreen />;
  }

  // Show auth pages - handle all auth states properly
  if (!isAuthenticated || showAuth) {
    if (showAuth === 'register') return <RegisterPage />;
    if (showAuth === 'forgot-password') return <ForgotPasswordPage />;
    if (showAuth === 'complete-profile') return <CompleteProfilePage />;
    return <LoginPage />;
  }

  // Profile incomplete - only show complete profile if username is truly missing
  if (isAuthenticated && user && !user.username) {
    return <CompleteProfilePage />;
  }

  // Determine responsive layout
  const isWideLayout = activeTab === 'admin';

  // Main app
  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      <ConnectionBanner />
      {activeTab !== 'live' && <TopBar />}
      <main className={`flex-1 ${activeTab === 'live' ? '' : `${isWideLayout ? 'max-w-6xl' : 'max-w-lg'} mx-auto px-4 pt-4 pb-24 w-full`}`}>
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <HomeFeed />
            </motion.div>
          )}
          {activeTab === 'explore' && (
            <motion.div key="explore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ExplorePage />
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
          {activeTab === 'admin' && user?.role === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdminDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <BottomNav />

      {/* Create Post Modal - shown on top of any tab */}
      <CreatePostModal open={showCreatePost} onOpenChange={setShowCreatePost} />

      {/* Notifications Panel */}
      <NotificationsPanel />
    </div>
  );
}
