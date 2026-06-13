'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useAppStore, useWalletStore, useAchievementStore } from '@/lib/store';
import { t, formatNumber } from '@/lib/i18n';
import {
  CoinIcon, DiamondCurrencyIcon, GiftIcon, WalletIcon,
  StarIcon, TrophyIcon, FireIcon, ShieldIcon, LightningIcon, HeartIcon, DiamondGemIcon,
} from '@/components/icons/aden-dot-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { GiftShopGrid, GiftSendAnimation, useGiftSend } from './animated-gifts';
import type { Transaction } from '@/types/skyline';

// ============ Wallet Page ============
export function WalletPage() {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);

  const walletStore = useWalletStore();
  const transactions = walletStore.transactions;
  const loadingTransactions = walletStore.isLoading;

  // Load transactions from Supabase on mount
  useEffect(() => {
    if (user) {
      walletStore.fetchTransactions(0);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      {/* Balance Card */}
      <motion.div
        className="rounded-2xl p-5 overflow-hidden relative bg-gradient-to-r from-primary to-primary/80"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative z-10">
          <p className="text-sm font-medium text-primary-foreground/80">{t('wallet.balance', lang)}</p>

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <CoinIcon size={28} />
              <div>
                <p className="text-2xl font-bold text-primary-foreground">{formatNumber(user?.coinsBalance || 0, lang)}</p>
                <p className="text-[10px] text-primary-foreground/70">{t('wallet.coins', lang)}</p>
              </div>
            </div>
            <div className="w-px h-10 bg-primary-foreground/20" />
            <div className="flex items-center gap-2">
              <DiamondCurrencyIcon size={28} />
              <div>
                <p className="text-2xl font-bold text-primary-foreground">{formatNumber(user?.diamondsBalance || 0, lang)}</p>
                <p className="text-[10px] text-primary-foreground/70">{t('wallet.diamonds', lang)}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button className="flex-1 h-9 rounded-xl text-sm font-semibold bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30">
              {t('wallet.deposit', lang)}
            </Button>
            <Button className="flex-1 h-9 rounded-xl text-sm font-semibold bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20">
              {t('wallet.withdraw', lang)}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: <GiftIcon size={20} color="var(--primary)" />, label: t('wallet.giftShop', lang) },
          { icon: <CoinIcon size={20} />, label: t('wallet.buyCoins', lang) },
          { icon: <DiamondCurrencyIcon size={20} />, label: t('wallet.buyDiamonds', lang) },
        ].map((action, idx) => (
          <motion.button
            key={idx}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border"
            whileTap={{ scale: 0.95 }}
          >
            {action.icon}
            <span className="text-[10px] text-muted-foreground">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Animated Gift Shop */}
      <div>
        <GiftShopGrid />
      </div>

      {/* Transactions */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">{t('wallet.history', lang)}</h3>
        {loadingTransactions ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((tx, idx) => {
              const isEarn = tx.type === 'gift_receive' || tx.type === 'earn' || tx.type === 'bonus';
              return (
                <motion.div
                  key={tx.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEarn ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    {isEarn ? (
                      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                    ) : (
                      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                    )}
                  </div>
                  <div className="flex-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                    <p className="text-sm text-foreground">{tx.description || tx.type}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {tx.currency === 'coins' ? <CoinIcon size={14} /> : <DiamondCurrencyIcon size={14} />}
                    <span className={`text-sm font-semibold ${isEarn ? 'text-green-500' : 'text-red-500'}`}>
                      {isEarn ? '+' : '-'}{tx.amount}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">{t('wallet.noTransactions', lang)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ Achievements Page ============
export function AchievementsPage() {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const achievementStore = useAchievementStore();
  const achievements = achievementStore.achievements;
  const userAchievements = achievementStore.userAchievements;
  const isLoading = achievementStore.isLoading;

  // Load achievements from Supabase on mount
  useEffect(() => {
    achievementStore.fetchAchievements();
    if (user) {
      achievementStore.fetchUserAchievements();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Map user progress onto achievements
  const userAchMap = new Map(userAchievements.map(ua => [ua.achievementID, ua]));
  const merged = achievements.map(ach => {
    const ua = userAchMap.get(ach.id);
    return {
      ...ach,
      progress: ua?.progress ?? 0,
      completed: ua?.isCompleted ?? false,
    };
  });

  // Icon lookup by achievement name/id
  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('star') || n.includes('نجم')) return <StarIcon size={24} />;
    if (n.includes('champion') || n.includes('بطل') || n.includes('trophy')) return <TrophyIcon size={24} />;
    if (n.includes('streak') || n.includes('متواصل') || n.includes('fire')) return <FireIcon size={24} />;
    if (n.includes('protect') || n.includes('حامي') || n.includes('shield')) return <ShieldIcon size={24} />;
    if (n.includes('speed') || n.includes('سريع') || n.includes('lightning')) return <LightningIcon size={24} />;
    if (n.includes('love') || n.includes('محبوب') || n.includes('heart') || n.includes('belov')) return <HeartIcon size={24} />;
    return <StarIcon size={24} />;
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-4 rounded-xl bg-card border border-border">
              <Skeleton className="h-6 w-6 mx-auto rounded-full mb-2" />
              <Skeleton className="h-4 w-20 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>
      ) : merged.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {merged.map((ach, idx) => (
            <motion.div
              key={ach.id}
              className={`p-4 rounded-xl text-center ${ach.completed ? 'bg-primary/10 border border-primary/20' : 'bg-card border border-border'}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="flex justify-center mb-2">{getIcon(ach.name)}</div>
              <p className="text-sm font-semibold text-foreground">{ach.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{lang === 'ar' ? ach.nameAr : ach.description}</p>

              {ach.completed ? (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor"><path d="M20 6L9 17l-5-5" /></svg>
                  <span className="text-[10px] font-medium text-primary">{t('achievements.completed', lang)}</span>
                </div>
              ) : (
                <div className="mt-2">
                  <div className="h-1.5 rounded-full overflow-hidden bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${ach.progress}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{ach.progress}%</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">{t('app.noResults', lang)}</p>
        </div>
      )}
    </div>
  );
}


