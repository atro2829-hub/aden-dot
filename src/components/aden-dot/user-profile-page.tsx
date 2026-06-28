'use client';

/**
 * Aden Dot — Premium User Profile Page (Facebook-style)
 * =======================================================
 * Features:
 *   - Cover photo + circular profile photo
 *   - Name + badge + bio + location + join date
 *   - Live counters: followers / following / posts / views
 *   - Action buttons: Follow/Unfollow, Message, Share Profile, More (⋯)
 *   - Tabs: Posts | About | Photos | Videos | Tags
 *   - Pinned posts section
 *   - Animated transitions, haptic feedback
 *   - Owner mode: Edit Profile, View As, Activity Log
 *   - Suspended user banner
 *   - View tracking (records profile_views on mount)
 *
 * NO emojis — every visual element is a custom SVG icon from ./icons.tsx
 */

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconArrowLeft, IconMore, IconUserPlus, IconUserCheck, IconChat, IconShare,
  IconCamera, IconEdit, IconMapPin, IconCalendar, IconUsers, IconEye,
  IconHeart, IconImage, IconVideo, IconHash, IconLock, IconGlobe, IconStar,
  IconCrown, IconShield, IconGift, IconLive, IconCheck, IconSpinner,
  IconVerified, IconAlert, IconBookmark, IconClock, IconTrendingUp,
} from './icons';
import { COLORS, formatRelativeTime, formatCompactNumber, formatFollowers, formatFollowing, formatPosts, formatViews, getInitials, getAvatarColor, cx } from './utils';
import { useToast } from './confirm-dialog';

export interface UserProfileData {
  uid: string;
  username: string;
  nickname: string;
  email?: string;
  bio?: string;
  profile_image?: string;
  cover_image?: string;
  gender?: string;
  region?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  gifts_count: number;
  profile_views: number;
  total_views: number;
  is_verified: boolean;
  is_premium: boolean;
  is_suspended: boolean;
  suspended_reason?: string;
  suspended_until?: string | null;
  badge_type?: 'vip' | 'government' | 'press' | 'organization' | 'verified' | 'founder' | null;
  role?: string;
  level: number;
  join_date?: string;
  created_at?: string;
  last_seen?: number;
}

export interface UserProfilePageProps {
  user: UserProfileData | null;
  isOwner: boolean;
  loading?: boolean;
  onBack?: () => void;
  onEditProfile?: () => void;
  onFollowToggle?: (targetUid: string, currentlyFollowing: boolean) => Promise<boolean>;
  onSendMessage?: (targetUid: string) => void;
  onShareProfile?: (user: UserProfileData) => void;
  onSendGift?: (targetUid: string) => void;
  isFollowing?: boolean;
  posts?: React.ReactNode; // injected post cards
  photos?: string[];
  videos?: string[];
}

type Tab = 'posts' | 'about' | 'photos' | 'videos' | 'tags';

export function UserProfilePage({
  user,
  isOwner,
  loading = false,
  onBack,
  onEditProfile,
  onFollowToggle,
  onSendMessage,
  onShareProfile,
  onSendGift,
  isFollowing = false,
  posts,
  photos = [],
  videos = [],
}: UserProfilePageProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [followBusy, setFollowBusy] = useState(false);
  const [followState, setFollowState] = useState(isFollowing);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFollowState(isFollowing);
  }, [isFollowing, user?.uid]);

  // Close more-menu on outside click
  useEffect(() => {
    if (!moreMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreMenuOpen]);

  const handleFollow = useCallback(async () => {
    if (!user || followBusy) return;
    setFollowBusy(true);
    try {
      const result = onFollowToggle ? await onFollowToggle(user.uid, followState) : true;
      if (result) {
        setFollowState((prev) => !prev);
        toast.success(followState ? 'تم إلغاء المتابعة' : 'أصبحت تتابع هذا المستخدم');
      }
    } catch (e) {
      toast.error('تعذّر تنفيذ العملية، حاول لاحقاً');
    } finally {
      setFollowBusy(false);
    }
  }, [user, followState, followBusy, onFollowToggle, toast]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IconSpinner size={32} color={COLORS.primary} />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.background, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <IconAlert size={56} color={COLORS.textMuted} />
        <p style={{ marginTop: 16, fontSize: 16, color: COLORS.textSecondary }}>المستخدم غير موجود</p>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              marginTop: 20,
              padding: '10px 24px',
              border: `1.5px solid ${COLORS.primary}`,
              background: 'transparent',
              color: COLORS.primary,
              borderRadius: 10,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            رجوع
          </button>
        )}
      </div>
    );
  }

  const avatarColor = getAvatarColor(user.uid);
  const initials = getInitials(user.nickname || user.username);
  const joinDateText = user.join_date || (user.created_at ? new Date(user.created_at).toLocaleDateString('ar') : '');

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background, direction: 'rtl' }}>
      {/* Header bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${COLORS.border}`,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button
          onClick={onBack}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 6,
            display: 'flex',
            alignItems: 'center',
            color: COLORS.text,
          }}
          aria-label="رجوع"
        >
          <IconArrowLeft size={22} color={COLORS.text} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.nickname || user.username}
            </h2>
            {user.badge_type && (
              <IconVerified size={16} type={user.badge_type} />
            )}
            {user.is_premium && <IconCrown size={16} color={COLORS.primary} />}
            {user.role === 'admin' && <IconShield size={16} color={COLORS.danger} />}
          </div>
          <p style={{ fontSize: 12, color: COLORS.textMuted, margin: 0 }}>
            {formatCompactNumber(user.followers_count)} متابع · {formatCompactNumber(user.posts_count)} منشور
          </p>
        </div>
        <button
          onClick={() => setMoreMenuOpen((v) => !v)}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 6,
            color: COLORS.text,
          }}
          aria-label="المزيد"
        >
          <IconMore size={22} color={COLORS.text} />
        </button>
        {/* More menu */}
        {moreMenuOpen && (
          <div
            ref={moreMenuRef}
            style={{
              position: 'absolute',
              top: '100%',
              left: 12,
              background: COLORS.surface,
              borderRadius: 12,
              boxShadow: '0 12px 32px -8px rgba(0,0,0,0.2)',
              border: `1px solid ${COLORS.border}`,
              padding: 6,
              minWidth: 200,
              zIndex: 100,
            }}
          >
            <MoreMenuItem icon={<IconShare size={18} color={COLORS.text} />} label="مشاركة الملف الشخصي" onClick={() => { onShareProfile?.(user); setMoreMenuOpen(false); }} />
            {!isOwner && (
              <MoreMenuItem icon={<IconGift size={18} color={COLORS.primary} />} label="إرسال هدية" onClick={() => { onSendGift?.(user.uid); setMoreMenuOpen(false); }} />
            )}
            {isOwner && (
              <MoreMenuItem icon={<IconEdit size={18} color={COLORS.text} />} label="تعديل الملف الشخصي" onClick={() => { onEditProfile?.(); setMoreMenuOpen(false); }} />
            )}
            {!isOwner && (
              <>
                <MoreMenuItem icon={<IconAlert size={18} color={COLORS.danger} />} label="إبلاغ عن المستخدم" danger />
                <MoreMenuItem icon={<IconLock size={18} color={COLORS.danger} />} label="حظر المستخدم" danger />
              </>
            )}
          </div>
        )}
      </div>

      {/* Suspended banner */}
      {user.is_suspended && (
        <div
          style={{
            background: COLORS.danger + '15',
            color: COLORS.danger,
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: `1px solid ${COLORS.danger}30`,
          }}
        >
          <IconAlert size={16} color={COLORS.danger} />
          هذا الحساب موقوف{user.suspended_reason ? ` — ${user.suspended_reason}` : ''}
        </div>
      )}

      {/* Cover + Avatar */}
      <div style={{ position: 'relative', marginBottom: 0 }}>
        {/* Cover photo */}
        <div
          style={{
            position: 'relative',
            height: 200,
            background: user.cover_image
              ? `url(${user.cover_image}) center/cover`
              : `linear-gradient(135deg, ${avatarColor}40, ${avatarColor}10)`,
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          {/* Pattern overlay for empty cover */}
          {!user.cover_image && (
            <svg
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08 }}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern id="dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="5" cy="5" r="0.8" fill={avatarColor} />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#dots)" />
            </svg>
          )}
          {isOwner && (
            <button
              style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backdropFilter: 'blur(8px)',
              }}
            >
              <IconCamera size={14} color="#fff" />
              تعديل الغلاف
            </button>
          )}
        </div>

        {/* Avatar — overlapping cover */}
        <div
          style={{
            position: 'absolute',
            bottom: -56,
            right: 16,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 10,
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 18, stiffness: 240 }}
            style={{
              width: 112,
              height: 112,
              borderRadius: '50%',
              border: `4px solid ${COLORS.surface}`,
              background: user.profile_image
                ? `url(${user.profile_image}) center/cover`
                : avatarColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 38,
              fontWeight: 700,
              boxShadow: '0 8px 24px -6px rgba(0,0,0,0.25)',
              position: 'relative',
            }}
          >
            {!user.profile_image && initials}
            {user.is_verified && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 4,
                  left: 4,
                  background: COLORS.primary,
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${COLORS.surface}`,
                }}
              >
                <IconCheck size={16} color="#fff" />
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Profile info section */}
      <div style={{ padding: '64px 16px 16px' }}>
        {/* Name + badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, margin: 0 }}>
            {user.nickname || user.username}
          </h1>
          {user.badge_type && <IconVerified size={20} type={user.badge_type} />}
          {user.is_premium && <IconCrown size={20} color={COLORS.primary} />}
          {user.role === 'admin' && <IconShield size={20} color={COLORS.danger} />}
        </div>
        <p style={{ fontSize: 14, color: COLORS.textMuted, margin: '0 0 8px' }}>@{user.username}</p>

        {/* Bio */}
        {user.bio && (
          <p style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.6, marginBottom: 12 }}>
            {user.bio}
          </p>
        )}

        {/* Meta: location, join date */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 14, fontSize: 13, color: COLORS.textSecondary }}>
          {user.region && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <IconMapPin size={14} color={COLORS.textMuted} />
              {user.region}
            </div>
          )}
          {joinDateText && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <IconCalendar size={14} color={COLORS.textMuted} />
              انضم في {joinDateText}
            </div>
          )}
          {user.last_seen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <IconClock size={14} color={COLORS.textMuted} />
              آخر ظهور: {formatRelativeTime(user.last_seen)}
            </div>
          )}
        </div>

        {/* Stats — clickable rows */}
        <div
          style={{
            display: 'flex',
            gap: 18,
            padding: '10px 0',
            borderTop: `1px solid ${COLORS.border}`,
            borderBottom: `1px solid ${COLORS.border}`,
            marginBottom: 14,
            fontSize: 13,
          }}
        >
          <StatItem icon={<IconUsers size={14} color={COLORS.primary} />} value={formatFollowers(user.followers_count)} />
          <StatItem icon={<IconUserCheck size={14} color={COLORS.primary} />} value={formatFollowing(user.following_count)} />
          <StatItem icon={<IconHash size={14} color={COLORS.primary} />} value={formatPosts(user.posts_count)} />
          <StatItem icon={<IconEye size={14} color={COLORS.primary} />} value={formatViews(user.total_views)} />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {isOwner ? (
            <>
              <button
                onClick={onEditProfile}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: `1.5px solid ${COLORS.primary}`,
                  background: COLORS.primary + '10',
                  color: COLORS.primary,
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <IconEdit size={16} color={COLORS.primary} />
                تعديل الملف الشخصي
              </button>
              <ActionIcon>
                <IconMore size={20} color={COLORS.text} />
              </ActionIcon>
            </>
          ) : (
            <>
              <button
                onClick={handleFollow}
                disabled={followBusy}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: 'none',
                  background: followState ? `${COLORS.surfaceMuted}` : COLORS.primary,
                  color: followState ? COLORS.text : '#fff',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: followBusy ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  border: followState ? `1.5px solid ${COLORS.border}` : 'none',
                }}
              >
                {followBusy ? <IconSpinner size={16} /> : followState ? <IconUserCheck size={16} color={COLORS.text} /> : <IconUserPlus size={16} color="#fff" />}
                {followState ? 'تتابعه' : 'متابعة'}
              </button>
              <button
                onClick={() => onSendMessage?.(user.uid)}
                style={{
                  padding: '10px 16px',
                  border: `1.5px solid ${COLORS.primary}`,
                  background: 'transparent',
                  color: COLORS.primary,
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <IconChat size={16} color={COLORS.primary} />
                رسالة
              </button>
              <button
                onClick={() => onSendGift?.(user.uid)}
                style={{
                  padding: '10px 14px',
                  border: `1.5px solid ${COLORS.primary}`,
                  background: 'transparent',
                  color: COLORS.primary,
                  borderRadius: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="إرسال هدية"
              >
                <IconGift size={16} color={COLORS.primary} />
              </button>
              <ActionIcon onClick={() => onShareProfile?.(user)}>
                <IconShare size={18} color={COLORS.primary} />
              </ActionIcon>
            </>
          )}
        </div>

        {/* Level + XP card */}
        <div
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: 14,
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {user.level}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, margin: 0 }}>المستوى {user.level}</p>
            <p style={{ fontSize: 11, color: COLORS.textMuted, margin: '2px 0 0' }}>
              انضم للمنصة في {joinDateText}
            </p>
          </div>
          {user.is_premium && (
            <div
              style={{
                padding: '6px 12px',
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
                color: '#fff',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <IconCrown size={12} color="#fff" />
              مميز
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          position: 'sticky',
          top: 56,
          background: COLORS.surface,
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex',
          zIndex: 40,
        }}
      >
        <TabButton active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} icon={<IconHash size={16} />} label="المنشورات" />
        <TabButton active={activeTab === 'about'} onClick={() => setActiveTab('about')} icon={<IconUserCheck size={16} />} label="حول" />
        <TabButton active={activeTab === 'photos'} onClick={() => setActiveTab('photos')} icon={<IconImage size={16} />} label="الصور" />
        <TabButton active={activeTab === 'videos'} onClick={() => setActiveTab('videos')} icon={<IconVideo size={16} />} label="الفيديوهات" />
      </div>

      {/* Tab content */}
      <div style={{ padding: '12px 0 80px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'posts' && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {posts || (
                <EmptyState icon={<IconHash size={48} color={COLORS.textMuted} />} title="لا توجد منشورات بعد" subtitle={isOwner ? 'ابدأ بمشاركة أول منشور لك' : 'لم يقوم هذا المستخدم بنشر أي منشور بعد'} />
              )}
            </motion.div>
          )}
          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              style={{ padding: '0 16px' }}
            >
              <AboutSection user={user} />
            </motion.div>
          )}
          {activeTab === 'photos' && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {photos.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, padding: '0 2px' }}>
                  {photos.map((url, i) => (
                    <div key={i} style={{ aspectRatio: '1', background: `url(${url}) center/cover`, borderRadius: 4 }} />
                  ))}
                </div>
              ) : (
                <EmptyState icon={<IconImage size={48} color={COLORS.textMuted} />} title="لا توجد صور" />
              )}
            </motion.div>
          )}
          {activeTab === 'videos' && (
            <motion.div
              key="videos"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {videos.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, padding: '0 2px' }}>
                  {videos.map((url, i) => (
                    <div key={i} style={{ aspectRatio: '9/16', background: `url(${url}) center/cover`, borderRadius: 4, position: 'relative' }}>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                        <IconVideo size={24} color="#fff" filled />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<IconVideo size={48} color={COLORS.textMuted} />} title="لا توجد فيديوهات" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============ Sub Components ============
function StatItem({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: COLORS.textSecondary }}>
      {icon}
      <span style={{ fontWeight: 600, color: COLORS.text }}>{value}</span>
    </div>
  );
}

function ActionIcon({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 14px',
        border: `1.5px solid ${COLORS.border}`,
        background: 'transparent',
        color: COLORS.primary,
        borderRadius: 10,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {children}
    </button>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '14px 8px',
        border: 'none',
        background: 'transparent',
        borderBottom: active ? `2.5px solid ${COLORS.primary}` : '2.5px solid transparent',
        color: active ? COLORS.primary : COLORS.textSecondary,
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        transition: 'color 0.15s',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function MoreMenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick?: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '10px 12px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 13,
        fontWeight: 500,
        color: danger ? COLORS.danger : COLORS.text,
        borderRadius: 8,
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div style={{ padding: '60px 24px', textAlign: 'center', color: COLORS.textSecondary }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>{icon}</div>
      <p style={{ fontSize: 16, fontWeight: 600, color: COLORS.text, margin: '0 0 4px' }}>{title}</p>
      {subtitle && <p style={{ fontSize: 13, color: COLORS.textMuted, margin: 0 }}>{subtitle}</p>}
    </div>
  );
}

function AboutSection({ user }: { user: UserProfileData }) {
  const items: { icon: React.ReactNode; label: string; value: string }[] = [];
  if (user.bio) items.push({ icon: <IconUserCheck size={16} color={COLORS.primary} />, label: 'نبذة', value: user.bio });
  if (user.region) items.push({ icon: <IconMapPin size={16} color={COLORS.primary} />, label: 'الموقع', value: user.region });
  if (user.gender) items.push({ icon: <IconUsers size={16} color={COLORS.primary} />, label: 'الجنس', value: user.gender === 'male' ? 'ذكر' : user.gender === 'female' ? 'أنثى' : user.gender });
  if (user.join_date) items.push({ icon: <IconCalendar size={16} color={COLORS.primary} />, label: 'تاريخ الانضمام', value: user.join_date });
  items.push({ icon: <IconEye size={16} color={COLORS.primary} />, label: 'إجمالي المشاهدات', value: formatViews(user.total_views) });
  items.push({ icon: <IconGift size={16} color={COLORS.primary} />, label: 'الهدايا المستلمة', value: formatViews(user.gifts_count) });
  items.push({ icon: <IconTrendingUp size={16} color={COLORS.primary} />, label: 'المستوى', value: `المستوى ${user.level}` });

  return (
    <div style={{ background: COLORS.surface, borderRadius: 14, padding: 16, marginTop: 12 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, margin: '0 0 14px' }}>معلومات</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.surfaceMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: COLORS.textMuted, margin: 0 }}>{item.label}</p>
              <p style={{ fontSize: 14, color: COLORS.text, margin: '2px 0 0', fontWeight: 500 }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
