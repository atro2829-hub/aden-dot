'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useAppStore } from '@/lib/store';
import { t, formatNumber } from '@/lib/i18n';
import {
  VerifiedIcon, PremiumIcon, CoinIcon, DiamondCurrencyIcon,
  GoldIcon, StarIcon, ShieldIcon, FireIcon,
  CrownIcon, PlatinumIcon, DiamondIcon, BronzeIcon,
} from '@/components/icons/aden-dot-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/types/skyline';

const GOLD = '#D4A853';
const GOLD_LIGHT = '#F5C542';
const NAVY = '#1A1F36';

// ============ Profile Page ============
export function ProfilePage() {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const [activeTab, setLocalTab] = useState<'posts' | 'liked' | 'collections'>('posts');

  if (!user) return null;

  const xpForNextLevel = user.level * 1000;
  const xpProgress = Math.min((user.xp / xpForNextLevel) * 100, 100);

  const getRankIcon = (level: number) => {
    if (level >= 50) return <CrownIcon size={22} />;
    if (level >= 40) return <DiamondIcon size={22} />;
    if (level >= 30) return <PlatinumIcon size={22} />;
    if (level >= 15) return <GoldIcon size={22} />;
    if (level >= 5) return <StarIcon size={22} />;
    return <BronzeIcon size={22} />;
  };

  const getRankName = (level: number) => {
    if (level >= 50) return t('rank.crown', lang);
    if (level >= 40) return t('rank.diamond', lang);
    if (level >= 30) return t('rank.platinum', lang);
    if (level >= 15) return t('rank.gold', lang);
    if (level >= 5) return t('rank.silver', lang);
    return t('rank.bronze', lang);
  };

  const tabs = [
    { id: 'posts' as const, label: t('profile.myPosts', lang) },
    { id: 'liked' as const, label: t('profile.liked', lang) },
    { id: 'collections' as const, label: t('profile.collections', lang) },
  ];

  return (
    <div className="space-y-4">
      {/* ===== Cover Photo Section ===== */}
      <div className="relative">
        <div
          className="h-36 rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${NAVY} 0%, ${GOLD}30 40%, ${GOLD_LIGHT}20 70%, ${NAVY} 100%)`,
          }}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-3 left-6 w-24 h-24 rounded-full" style={{ background: `radial-gradient(circle, ${GOLD}, transparent)` }} />
            <div className="absolute top-10 right-10 w-16 h-16 rounded-full" style={{ background: `radial-gradient(circle, ${GOLD_LIGHT}, transparent)` }} />
            <div className="absolute bottom-0 left-1/3 w-32 h-20 rounded-full" style={{ background: `radial-gradient(circle, ${GOLD}40, transparent)` }} />
          </div>
          {/* Cover image if exists */}
          {user.coverImage && (
            <img src={user.coverImage} alt="" className="w-full h-full object-cover opacity-60" />
          )}
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-14 left-4">
          <div className="relative">
            <div
              className="w-[88px] h-[88px] rounded-full p-[3px]"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}
            >
              <Avatar className="w-full h-full border-3" style={{ borderColor: NAVY }}>
                <AvatarImage src={user.profileImage || '/avatar.png'} className="object-cover" />
                <AvatarFallback className="text-2xl font-bold" style={{ background: `${GOLD}20`, color: GOLD }}>
                  {user.nickname?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            </div>
            {user.isPremium && (
              <motion.div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, boxShadow: `0 2px 8px ${GOLD}50` }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, delay: 0.3 }}
              >
                <PremiumIcon size={16} />
              </motion.div>
            )}
            {user.isVerified && (
              <motion.div
                className="absolute top-0 right-0"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, delay: 0.2 }}
              >
                <VerifiedIcon size={20} />
              </motion.div>
            )}
          </div>
        </div>

        {/* Edit Profile Button */}
        <div className="absolute bottom-3 right-3">
          <motion.button
            className="px-5 py-2 rounded-full text-xs font-semibold glass-gold"
            style={{ color: GOLD }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
          >
            {t('profile.editProfile', lang)}
          </motion.button>
        </div>
      </div>

      {/* ===== Profile Info ===== */}
      <div className="mt-16 space-y-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white">{user.nickname || user.username}</h2>
          {user.isVerified && <VerifiedIcon size={18} />}
          {user.isPremium && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: NAVY }}>
              {lang === 'ar' ? 'مميز' : 'PREMIUM'}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400">@{user.username}</p>
        {user.bio && <p className="text-sm text-gray-300 leading-relaxed">{user.bio}</p>}

        {/* ===== Level / XP / Rank Section ===== */}
        <div className="p-4 rounded-2xl glass-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {getRankIcon(user.level)}
              <div>
                <span className="text-sm font-bold" style={{ color: GOLD }}>
                  {t('profile.level', lang)} {user.level}
                </span>
                <span className="text-xs text-gray-500 ml-2">• {getRankName(user.level)}</span>
              </div>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              {user.xp}/{xpForNextLevel} XP
            </span>
          </div>
          {/* XP Progress Bar */}
          <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})` }}
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)`,
                backgroundSize: '200% 100%',
                animation: 'goldShimmer 3s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </div>

      {/* ===== Stats Grid ===== */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: t('profile.posts', lang), value: user.postsCount, icon: '📝' },
          { label: t('profile.followers', lang), value: user.followersCount, icon: '👥' },
          { label: t('profile.following', lang), value: user.followingCount, icon: '👤' },
          { label: t('profile.likes', lang), value: user.popularity, icon: '❤️' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            className="text-center p-3 rounded-2xl glass-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileTap={{ scale: 0.96 }}
          >
            <div className="text-lg mb-1">{stat.icon}</div>
            <p className="text-base font-bold text-white">{formatNumber(stat.value, lang)}</p>
            <p className="text-[9px] text-gray-500 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ===== Badges ===== */}
      {(user.isVerified || user.isPremium) && (
        <div className="flex gap-2 flex-wrap">
          {user.isVerified && (
            <motion.div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-gold"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <VerifiedIcon size={12} />
              <span className="text-[10px] font-semibold" style={{ color: GOLD }}>{lang === 'ar' ? 'موثّق' : 'Verified'}</span>
            </motion.div>
          )}
          {user.isPremium && (
            <motion.div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}30` }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <PremiumIcon size={12} />
              <span className="text-[10px] font-semibold" style={{ color: GOLD }}>{lang === 'ar' ? 'مميز' : 'Premium'}</span>
            </motion.div>
          )}
          {/* Rank badge */}
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}20` }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {getRankIcon(user.level)}
            <span className="text-[10px] font-semibold" style={{ color: GOLD }}>{getRankName(user.level)}</span>
          </motion.div>
        </div>
      )}

      {/* ===== Profile Tabs with Sliding Indicator ===== */}
      <div>
        <div className="relative flex border-b" style={{ borderColor: 'rgba(212,168,83,0.1)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setLocalTab(tab.id)}
              className="flex-1 py-3 text-sm font-medium relative transition-colors"
              style={{ color: activeTab === tab.id ? GOLD : '#6B7280' }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="profileTabIndicator"
                  className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full"
                  style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})` }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <div className="py-4">
            {activeTab === 'posts' && (
              <motion.div
                key="posts"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-center py-10"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: `${GOLD}10` }}>
                  <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M12 8v8M8 12h8" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">{t('profile.noPosts', lang)}</p>
              </motion.div>
            )}
            {activeTab === 'liked' && (
              <motion.div
                key="liked"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-center py-10"
              >
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5" className="mx-auto mb-3">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
                <p className="text-sm text-gray-500">{t('profile.noLiked', lang)}</p>
              </motion.div>
            )}
            {activeTab === 'collections' && (
              <motion.div
                key="collections"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-center py-10"
              >
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5" className="mx-auto mb-3">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
                <p className="text-sm text-gray-500">{t('profile.noCollections', lang)}</p>
              </motion.div>
            )}
          </div>
        </AnimatePresence>
      </div>

      {/* ===== About Section (Wallet Balances) ===== */}
      <div className="space-y-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-gold flex-1">
            <CoinIcon size={18} />
            <div>
              <p className="text-xs text-gray-500">{t('wallet.coins', lang)}</p>
              <p className="text-sm font-bold" style={{ color: GOLD }}>{formatNumber(user.coinsBalance || 0, lang)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl flex-1" style={{ background: '#3B82F610', border: '1px solid #3B82F620' }}>
            <DiamondCurrencyIcon size={18} />
            <div>
              <p className="text-xs text-gray-500">{t('wallet.diamonds', lang)}</p>
              <p className="text-sm font-bold text-blue-400">{formatNumber(user.diamondsBalance || 0, lang)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
