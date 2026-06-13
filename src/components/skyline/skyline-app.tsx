'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore, useAppStore, usePostsStore } from '@/lib/store';
import { authService, userService } from '@/lib/supabase-service';
import { LoginPage, RegisterPage, CompleteProfilePage } from './auth-pages';
import { HomeFeed } from './home-feed';
import { ExplorePage } from './explore-page';
import { ProfilePage } from './profile-page';
import { ChatPage } from './chat-page';
import { LiveStreamsPage } from './live-stream';
import { WalletPage, AchievementsPage, DailyRewardCard } from './gifts-wallet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home, Search, PlusCircle, MessageCircle, User, Radio,
  Gift, Wallet, Award, Bell, Settings, Loader2
} from 'lucide-react';

// ============ Bottom Navigation ============
function BottomNav() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const user = useAuthStore((s) => s.user);

  const tabs = [
    { id: 'home' as const, icon: Home, label: 'الرئيسية' },
    { id: 'explore' as const, icon: Search, label: 'استكشاف' },
    { id: 'create' as const, icon: PlusCircle, label: 'إنشاء' },
    { id: 'live' as const, icon: Radio, label: 'بث مباشر' },
    { id: 'chat' as const, icon: MessageCircle, label: 'محادثة' },
    { id: 'profile' as const, icon: User, label: 'حسابي' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t z-50 safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around py-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-2 transition-colors ${
              activeTab === tab.id
                ? tab.id === 'live'
                  ? 'text-red-500'
                  : 'text-violet-600'
                : 'text-muted-foreground hover:text-violet-400'
            }`}
          >
            {tab.id === 'profile' ? (
              <Avatar className={`w-6 h-6 ${activeTab === tab.id ? 'ring-2 ring-violet-500 ring-offset-1' : ''}`}>
                <AvatarImage src={user?.profileImage || '/avatar.png'} className="object-cover" />
                <AvatarFallback className="text-[10px]">{user?.nickname?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="relative">
                <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'stroke-[2.5px]' : ''}`} />
                {tab.id === 'live' && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
            )}
            <span className="text-[9px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ============ Top Bar ============
function TopBar() {
  const activeTab = useAppStore((s) => s.activeTab);
  const user = useAuthStore((s) => s.user);
  const setShowAuth = useAppStore((s) => s.setShowAuth);

  const getTitle = () => {
    switch (activeTab) {
      case 'home': return 'Skyline';
      case 'explore': return 'استكشاف';
      case 'create': return 'إنشاء منشور';
      case 'live': return 'بث مباشر';
      case 'chat': return 'المحادثات';
      case 'profile': return 'الملف الشخصي';
      case 'wallet': return 'المحفظة';
      case 'achievements': return 'الإنجازات';
      default: return 'Skyline';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {activeTab === 'home' && (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
          )}
          <h1 className="text-lg font-bold">{getTitle()}</h1>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'home' && user && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full">
                <span className="text-xs">🪙</span>
                <span className="text-xs font-medium text-yellow-700">{user.coinsBalance || 0}</span>
              </div>
              <span className="text-sm text-muted-foreground">مرحباً، {user.nickname || user.username} 👋</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ============ Profile Sub-Pages ============
function ProfileSubMenu() {
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const user = useAuthStore((s) => s.user);

  const menuItems = [
    { id: 'wallet' as const, icon: Wallet, label: 'المحفظة', color: 'text-yellow-500', desc: `🪙 ${user?.coinsBalance || 0} | 💎 ${user?.diamondsBalance || 0}` },
    { id: 'achievements' as const, icon: Award, label: 'الإنجازات', color: 'text-purple-500', desc: `${user?.level || 1} مستوى` },
    { id: 'live' as const, icon: Radio, label: 'البث المباشر', color: 'text-red-500', desc: 'ابدأ بثك الآن' },
  ];

  return (
    <div className="space-y-2 mt-4">
      {menuItems.map(item => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className="w-full p-3 rounded-xl bg-white border hover:shadow-md transition-all flex items-center gap-3 text-right"
        >
          <div className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center ${item.color}`}>
            <item.icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{item.label}</p>
            <p className="text-xs text-gray-500">{item.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ============ Loading Screen ============
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-rose-50">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-2xl">S</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">جاري التحميل...</span>
        </div>
      </div>
    </div>
  );
}

// ============ Main App ============
export default function SkylineApp() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const showAuth = useAppStore((s) => s.showAuth);
  const setShowAuth = useAppStore((s) => s.setShowAuth);
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  // Auth initialization state
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize auth on mount + subscribe to auth state changes
  useEffect(() => {
    let authSubscription: { data: { subscription: { unsubscribe: () => void } } } | null = null;

    const init = async () => {
      try {
        // Initialize auth state from existing Supabase session
        await useAuthStore.getState().initializeAuth();

        // Subscribe to auth state changes (login, logout, token refresh, etc.)
        authSubscription = authService.onAuthStateChange(async (event, session) => {
          const s = session as { user?: { id?: string } } | null;

          if (event === 'SIGNED_IN' && s?.user?.id) {
            // User signed in — fetch their profile and update store
            const profile = await userService.getUserProfile(s.user.id!);
            if (profile) {
              useAuthStore.setState({
                user: profile,
                isAuthenticated: true,
              });
            }
          } else if (event === 'SIGNED_OUT') {
            // User signed out — clear all Zustand stores
            useAuthStore.setState({
              user: null,
              isAuthenticated: false,
              error: null,
            });
            usePostsStore.setState({ posts: [], currentPage: 0, hasMore: true });
          } else if (event === 'TOKEN_REFRESHED' && s?.user?.id) {
            // Token refreshed — ensure profile is still available
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
            // User metadata updated — refresh profile
            const profile = await userService.getUserProfile(s.user.id!);
            if (profile) {
              useAuthStore.setState({ user: profile });
            }
          }
        });
      } catch (error) {
        console.error('[SkylineApp] Auth initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    init();

    return () => {
      // Clean up auth listener on unmount
      if (authSubscription) {
        authSubscription.data.subscription.unsubscribe();
      }
    };
  }, []);

  // Show loading screen while checking auth state
  if (isInitializing) {
    return <LoadingScreen />;
  }

  // Show auth pages
  if (!isAuthenticated || showAuth) {
    if (showAuth === 'register') return <RegisterPage />;
    if (showAuth === 'complete-profile') return <CompleteProfilePage />;
    return <LoginPage />;
  }

  // Check if profile is incomplete
  if (isAuthenticated && !user?.username) {
    return <CompleteProfilePage />;
  }

  // Main app
  return (
    <div className="min-h-screen bg-muted/30">
      {activeTab !== 'live' && <TopBar />}
      <main className={activeTab === 'live' ? '' : 'max-w-lg mx-auto px-4 pt-4 pb-20'}>
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Daily Reward Card */}
            <DailyRewardCard />
            <HomeFeed />
          </div>
        )}
        {activeTab === 'explore' && <ExplorePage />}
        {activeTab === 'create' && <HomeFeed />}
        {activeTab === 'live' && <LiveStreamsPage />}
        {activeTab === 'chat' && <ChatPage />}
        {activeTab === 'profile' && (
          <div>
            <ProfilePage />
            <ProfileSubMenu />
          </div>
        )}
        {activeTab === 'wallet' && <WalletPage />}
        {activeTab === 'achievements' && <AchievementsPage />}
      </main>
      <BottomNav />
    </div>
  );
}
