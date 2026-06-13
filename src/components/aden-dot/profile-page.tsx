'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useAppStore } from '@/lib/store';
import { t, formatNumber } from '@/lib/i18n';
import {
  VerifiedIcon, PremiumIcon, CoinIcon, DiamondCurrencyIcon,
  GoldIcon, StarIcon, ShieldIcon, FireIcon,
  CrownIcon, PlatinumIcon, DiamondIcon, BronzeIcon,
  CameraIcon, ImageIcon, ArrowBackIcon, CheckIcon,
} from '@/components/icons/aden-dot-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/types/skyline';

// ============ Yemen Flag SVG ============
function YemenFlag({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size * 2/3} viewBox="0 0 60 40" className="inline-block">
      <rect width="60" height="13.3" fill="#CE1126"/>
      <rect y="13.3" width="60" height="13.4" fill="#FFFFFF"/>
      <rect y="26.7" width="60" height="13.3" fill="#000000"/>
    </svg>
  );
}

// ============ South Arabia Flag SVG ============
function SouthArabiaFlag({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size * 2/3} viewBox="0 0 60 40" className="inline-block">
      <rect width="60" height="13.3" fill="#EF2B2D"/>
      <rect y="13.3" width="60" height="13.4" fill="#FFFFFF"/>
      <rect y="26.7" width="60" height="13.3" fill="#002868"/>
      <polygon points="15,6 17.1,12.5 24,12.5 18.5,16.5 20.6,23 15,19 9.4,23 11.5,16.5 6,12.5 12.9,12.5" fill="#FFFFFF"/>
    </svg>
  );
}

// ============ Admin Badge ============
function AdminBadge({ lang }: { lang: string }) {
  return (
    <motion.div
      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 shadow-lg shadow-red-500/20"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, delay: 0.4 }}
    >
      <svg width={12} height={12} viewBox="0 0 24 24" fill="white">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <span className="text-[9px] font-bold text-white">{lang === 'ar' ? 'مدير' : 'ADMIN'}</span>
    </motion.div>
  );
}

// ============ Edit Profile Modal ============
function EditProfileModal({ isOpen, onClose, user, lang }: { isOpen: boolean; onClose: () => void; user: User; lang: string }) {
  const updateUser = useAuthStore((s) => s.updateUser);
  const [nickname, setNickname] = useState(user.nickname || '');
  const [bio, setBio] = useState(user.bio || '');
  const [selectedFlag, setSelectedFlag] = useState<'yemen' | 'south_arabia' | 'none'>(user.region as any || 'none');
  const [profileImageBase64, setProfileImageBase64] = useState(user.profileImage || '');
  const [coverImageBase64, setCoverImageBase64] = useState(user.coverImage || '');
  const [saving, setSaving] = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'profile') setProfileImageBase64(base64);
      else setCoverImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser({
        nickname,
        bio,
        region: selectedFlag,
        profileImage: profileImageBase64,
        coverImage: coverImageBase64,
        isProfileComplete: true,
      });
      onClose();
    } catch (err) {
      console.error('Profile save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black/50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-lg bg-background rounded-t-3xl max-h-[85vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-background z-10 p-4 border-b border-border flex items-center justify-between">
              <button onClick={onClose}><ArrowBackIcon size={20} /></button>
              <h3 className="font-bold text-foreground">{lang === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}</h3>
              <button onClick={handleSave} disabled={saving} className="text-primary font-bold text-sm">
                {saving ? '...' : (lang === 'ar' ? 'حفظ' : 'Save')}
              </button>
            </div>

            <div className="p-4 space-y-5" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {/* Cover Image */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {lang === 'ar' ? 'صورة الغلاف' : 'Cover Photo'}
                </label>
                <div
                  className="h-32 rounded-xl overflow-hidden bg-card border border-dashed border-border cursor-pointer relative group"
                  onClick={() => coverInputRef.current?.click()}
                >
                  {coverImageBase64 ? (
                    <img src={coverImageBase64} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <CameraIcon size={24} color="white" />
                  </div>
                </div>
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />
              </div>

              {/* Profile Image */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {lang === 'ar' ? 'صورة الملف الشخصي' : 'Profile Photo'}
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-full overflow-hidden bg-card border-2 border-dashed border-border cursor-pointer relative group"
                    onClick={() => profileInputRef.current?.click()}
                  >
                    {profileImageBase64 ? (
                      <img src={profileImageBase64} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <CameraIcon size={24} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <CameraIcon size={20} color="white" />
                    </div>
                  </div>
                  <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'profile')} />
                </div>
              </div>

              {/* Nickname */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {lang === 'ar' ? 'الاسم المستعار' : 'Nickname'}
                </label>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder={lang === 'ar' ? 'أدخل اسمك المستعار' : 'Enter your nickname'}
                />
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {lang === 'ar' ? 'نبذة عنك' : 'Bio'}
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none h-20"
                  placeholder={lang === 'ar' ? 'أخبرنا عن نفسك...' : 'Tell us about yourself...'}
                />
              </div>

              {/* Flag Selection */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {lang === 'ar' ? 'العلم بجانب اسمك' : 'Flag next to your name'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none' as const, label: lang === 'ar' ? 'بدون' : 'None', icon: <span className="text-lg">🌐</span> },
                    { id: 'yemen' as const, label: lang === 'ar' ? 'اليمن' : 'Yemen', icon: <YemenFlag size={28} /> },
                    { id: 'south_arabia' as const, label: lang === 'ar' ? 'جنوب العربي' : 'South Arabia', icon: <SouthArabiaFlag size={28} /> },
                  ].map((flag) => (
                    <button
                      key={flag.id}
                      onClick={() => setSelectedFlag(flag.id)}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                        selectedFlag === flag.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-primary/30'
                      }`}
                    >
                      {flag.icon}
                      <span className="text-[10px] font-medium">{flag.label}</span>
                      {selectedFlag === flag.id && <CheckIcon size={14} color="var(--primary)" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============ Profile Page ============
export function ProfilePage() {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [activeTab, setLocalTab] = useState<'posts' | 'liked' | 'collections'>('posts');
  const [showEdit, setShowEdit] = useState(false);

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

  const renderFlag = () => {
    if (user.region === 'yemen') return <YemenFlag size={18} />;
    if (user.region === 'south_arabia') return <SouthArabiaFlag size={18} />;
    return null;
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
        <div className="h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-3 left-6 w-24 h-24 rounded-full" style={{ background: 'radial-gradient(circle, var(--primary), transparent)' }} />
            <div className="absolute top-10 right-10 w-16 h-16 rounded-full" style={{ background: 'radial-gradient(circle, var(--primary), transparent)' }} />
            <div className="absolute bottom-0 left-1/3 w-32 h-20 rounded-full" style={{ background: 'radial-gradient(circle, var(--primary), transparent)', opacity: 0.25 }} />
          </div>
          {user.coverImage && (
            <img src={user.coverImage} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-14 left-4">
          <div className="relative">
            <motion.div
              className="w-[92px] h-[92px] rounded-full p-[3px] bg-primary"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
            >
              <Avatar className="w-full h-full border-3 border-background">
                <AvatarImage src={user.profileImage || '/avatar.png'} className="object-cover" />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {user.nickname?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            {user.isPremium && (
              <motion.div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center bg-primary shadow-lg shadow-primary/30"
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
            {user.role === 'admin' && (
              <motion.div
                className="absolute -top-1 -left-1 w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-r from-red-500 to-orange-500 shadow-lg shadow-red-500/30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, delay: 0.35 }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="white">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </motion.div>
            )}
          </div>
        </div>

        {/* Edit Profile Button */}
        <div className="absolute bottom-3 right-3">
          <motion.button
            className="px-5 py-2 rounded-full text-xs font-semibold glass-gold text-primary"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowEdit(true)}
          >
            {t('profile.editProfile', lang)}
          </motion.button>
        </div>
      </div>

      {/* ===== Profile Info ===== */}
      <div className="mt-16 space-y-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-xl font-bold text-foreground">{user.nickname || user.username}</h2>
          {renderFlag()}
          {user.isVerified && <VerifiedIcon size={18} />}
          {user.isPremium && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary text-primary-foreground">
              {lang === 'ar' ? 'مميز' : 'PREMIUM'}
            </span>
          )}
          {user.role === 'admin' && <AdminBadge lang={lang} />}
        </div>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
        {user.bio && <p className="text-sm text-foreground/70 leading-relaxed">{user.bio}</p>}

        {/* ===== Level / XP / Rank Section ===== */}
        <motion.div
          className="p-4 rounded-2xl bg-card border border-border space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              >
                {getRankIcon(user.level)}
              </motion.div>
              <div>
                <span className="text-sm font-bold text-primary">
                  {t('profile.level', lang)} {user.level}
                </span>
                <span className="text-xs text-muted-foreground ml-2">• {getRankName(user.level)}</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {user.xp}/{xpForNextLevel} XP
            </span>
          </div>
          {/* XP Progress Bar */}
          <div className="relative h-2.5 rounded-full overflow-hidden bg-muted">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary/80"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'goldShimmer 3s ease-in-out infinite',
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* ===== Stats Grid ===== */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: t('profile.posts', lang), value: user.postsCount, icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg> },
          { label: t('profile.followers', lang), value: user.followersCount, icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> },
          { label: t('profile.following', lang), value: user.followingCount, icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg> },
          { label: t('profile.likes', lang), value: user.popularity, icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="var(--primary)"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            className="text-center p-3 rounded-2xl bg-card border border-border hover:border-primary/20 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 + 0.3 }}
            whileTap={{ scale: 0.96 }}
          >
            <div className="flex justify-center mb-1.5">{stat.icon}</div>
            <p className="text-base font-bold text-foreground">{formatNumber(stat.value, lang)}</p>
            <p className="text-[9px] text-muted-foreground font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ===== Badges ===== */}
      <div className="flex gap-2 flex-wrap">
        {user.isVerified && (
          <motion.div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-gold" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <VerifiedIcon size={12} />
            <span className="text-[10px] font-semibold text-primary">{lang === 'ar' ? 'موثّق' : 'Verified'}</span>
          </motion.div>
        )}
        {user.isPremium && (
          <motion.div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            <PremiumIcon size={12} />
            <span className="text-[10px] font-semibold text-primary">{lang === 'ar' ? 'مميز' : 'Premium'}</span>
          </motion.div>
        )}
        {user.role === 'admin' && (
          <motion.div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="var(--primary)"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span className="text-[10px] font-semibold text-primary">{lang === 'ar' ? 'مدير' : 'Admin'}</span>
          </motion.div>
        )}
        <motion.div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {getRankIcon(user.level)}
          <span className="text-[10px] font-semibold text-primary">{getRankName(user.level)}</span>
        </motion.div>
        {user.giftsCount > 0 && (
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/5 border border-pink-500/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
          >
            <span className="text-[10px] font-semibold text-pink-500">{user.giftsCount} {lang === 'ar' ? 'هدية' : 'gifts'}</span>
          </motion.div>
        )}
      </div>

      {/* ===== Profile Tabs with Sliding Indicator ===== */}
      <div>
        <div className="relative flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setLocalTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium relative transition-colors ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="profileTabIndicator"
                  className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <div className="py-4">
            {activeTab === 'posts' && (
              <motion.div key="posts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-center py-10">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center bg-primary/10">
                  <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M12 8v8M8 12h8" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">{t('profile.noPosts', lang)}</p>
              </motion.div>
            )}
            {activeTab === 'liked' && (
              <motion.div key="liked" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-center py-10">
                <svg width={28} height={28} viewBox="0 0 24 24" fill="var(--muted-foreground)" className="mx-auto mb-3" opacity="0.4">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
                <p className="text-sm text-muted-foreground">{t('profile.noLiked', lang)}</p>
              </motion.div>
            )}
            {activeTab === 'collections' && (
              <motion.div key="collections" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-center py-10">
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="1.5" className="mx-auto mb-3" opacity="0.4">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
                <p className="text-sm text-muted-foreground">{t('profile.noCollections', lang)}</p>
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
              <p className="text-xs text-muted-foreground">{t('wallet.coins', lang)}</p>
              <p className="text-sm font-bold text-primary">{formatNumber(user.coinsBalance || 0, lang)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl flex-1 bg-blue-500/5 border border-blue-500/10">
            <DiamondCurrencyIcon size={18} />
            <div>
              <p className="text-xs text-muted-foreground">{t('wallet.diamonds', lang)}</p>
              <p className="text-sm font-bold text-blue-500">{formatNumber(user.diamondsBalance || 0, lang)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal isOpen={showEdit} onClose={() => setShowEdit(false)} user={user} lang={lang} />
    </div>
  );
}
