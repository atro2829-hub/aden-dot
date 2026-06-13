'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore, useAppStore } from '@/lib/store';
import { t, formatNumber } from '@/lib/i18n';
import {
  VerifiedIcon, PremiumIcon, CoinIcon, DiamondCurrencyIcon,
  GoldIcon, StarIcon, ShieldIcon, FireIcon,
} from '@/components/icons/aden-dot-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import type { User } from '@/types/skyline';

const GOLD = '#D4A853';
const GOLD_LIGHT = '#F5C542';
const NAVY = '#1A1F36';

// ============ Profile Page ============
export function ProfilePage() {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const [activeTab, setLocalTab] = useState<'posts' | 'favorites' | 'about'>('posts');

  if (!user) return null;

  const xpForNextLevel = user.level * 1000;
  const xpProgress = (user.xp / xpForNextLevel) * 100;

  const getRankIcon = (level: number) => {
    if (level >= 50) return <GoldIcon size={20} />;
    if (level >= 30) return <StarIcon size={20} />;
    if (level >= 15) return <ShieldIcon size={20} />;
    return <FireIcon size={20} color="#CD7F32" />;
  };

  return (
    <div className="space-y-4">
      {/* Cover Photo Area */}
      <div className="relative">
        <div
          className="h-32 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${NAVY}, ${GOLD}40, ${NAVY})`,
          }}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-8 w-20 h-20 rounded-full" style={{ background: GOLD }} />
            <div className="absolute top-8 right-12 w-12 h-12 rounded-full" style={{ background: GOLD_LIGHT }} />
          </div>
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-12 left-4">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4" style={{ borderColor: NAVY }}>
              <AvatarImage src={user.profileImage || '/avatar.png'} className="object-cover" />
              <AvatarFallback className="text-2xl" style={{ background: `${GOLD}20`, color: GOLD }}>
                {user.nickname?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            {user.isPremium && (
              <div className="absolute bottom-0 right-0">
                <PremiumIcon size={22} />
              </div>
            )}
            {user.isVerified && (
              <div className="absolute top-0 right-0">
                <VerifiedIcon size={18} />
              </div>
            )}
          </div>
        </div>

        {/* Edit button */}
        <div className="absolute bottom-2 right-2">
          <motion.button
            className="px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: `${GOLD}15`, color: GOLD, border: `1px solid ${GOLD}30` }}
            whileTap={{ scale: 0.95 }}
          >
            {t('profile.editProfile', lang)}
          </motion.button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-14 space-y-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white">{user.nickname || user.username}</h2>
          {user.isVerified && <VerifiedIcon size={16} />}
          {user.isPremium && <PremiumIcon size={16} />}
        </div>
        <p className="text-sm text-gray-400">@{user.username}</p>
        {user.bio && <p className="text-sm text-gray-300">{user.bio}</p>}

        {/* Level & XP */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getRankIcon(user.level)}
              <span className="text-sm font-medium" style={{ color: GOLD }}>
                {t('profile.level', lang)} {user.level}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {user.xp}/{xpForNextLevel} XP
            </span>
          </div>
          <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})` }}
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: t('profile.posts', lang), value: user.postsCount },
          { label: t('profile.followers', lang), value: user.followersCount },
          { label: t('profile.following', lang), value: user.followingCount },
          { label: t('profile.likes', lang), value: user.popularity },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,168,83,0.06)' }}>
            <p className="text-base font-bold text-white">{formatNumber(stat.value, lang)}</p>
            <p className="text-[10px] text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      {(user.isVerified || user.isPremium) && (
        <div className="flex gap-2 flex-wrap">
          {user.isVerified && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}25` }}>
              <VerifiedIcon size={12} />
              <span className="text-[10px] font-medium" style={{ color: GOLD }}>{lang === 'ar' ? 'موثّق' : 'Verified'}</span>
            </div>
          )}
          {user.isPremium && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: `#3B82F615`, border: '1px solid #3B82F625' }}>
              <PremiumIcon size={12} />
              <span className="text-[10px] font-medium text-blue-400">{lang === 'ar' ? 'مميز' : 'Premium'}</span>
            </div>
          )}
        </div>
      )}

      {/* Profile Tabs */}
      <div>
        <div className="flex border-b" style={{ borderColor: 'rgba(212,168,83,0.1)' }}>
          {(['posts', 'favorites', 'about'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setLocalTab(tab)}
              className="flex-1 py-2.5 text-sm font-medium relative transition-colors"
              style={{ color: activeTab === tab ? GOLD : '#6B7280' }}
            >
              {t(tab === 'posts' ? 'profile.myPosts' : tab === 'favorites' ? 'profile.favorites' : 'profile.about', lang)}
              {activeTab === tab && (
                <motion.div
                  layoutId="profileTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: GOLD }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="py-4">
          {activeTab === 'posts' && (
            <div className="text-center py-8">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: `${GOLD}10` }}>
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">{t('profile.noPosts', lang)}</p>
            </div>
          )}
          {activeTab === 'favorites' && (
            <div className="text-center py-8">
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5" className="mx-auto mb-3">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              <p className="text-sm text-gray-500">{lang === 'ar' ? 'لا توجد مفضلات' : 'No favorites yet'}</p>
            </div>
          )}
          {activeTab === 'about' && (
            <div className="space-y-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {user.bio && (
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-xs text-gray-500 mb-1">{t('auth.bio', lang)}</p>
                  <p className="text-sm text-gray-300">{user.bio}</p>
                </div>
              )}
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-xs text-gray-500 mb-1">{t('profile.joined', lang)}</p>
                <p className="text-sm text-gray-300">{user.joinDate || new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}</p>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: `${GOLD}10` }}>
                  <CoinIcon size={16} />
                  <span className="text-sm font-medium" style={{ color: GOLD }}>{user.coinsBalance || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: '#3B82F610' }}>
                  <DiamondCurrencyIcon size={16} />
                  <span className="text-sm font-medium text-blue-400">{user.diamondsBalance || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
