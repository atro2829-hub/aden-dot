'use client';

/**
 * Aden Dot — Premium Animated Post Card
 * =======================================
 * Features:
 *   - Author header with avatar, name, badge, time, follow button, more menu
 *   - Content with hashtag/mention highlighting (RTL-aware)
 *   - Media: single image, carousel, video, poll
 *   - Animated action bar:
 *     * Like (heart pulse + counter spring)
 *     * Comment (sheet trigger)
 *     * Share (dropdown: share to feed / copy link / share external)
 *     * Save (flip animation)
 *     * Gift (opens gift picker)
 *   - Live counters with proper Arabic pluralization
 *   - View counter (incremented via record_post_view RPC on mount)
 *   - Long-press to open quick reactions
 *   - Pinned post indicator
 *   - Hidden post detection
 *   - Suspended author banner
 *   - Haptic feedback on every interaction
 *
 * NO emojis — only SVG icons from ./icons.tsx
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  IconHeart, IconHeartPulse, IconComment, IconShare, IconBookmark,
  IconGift, IconMore, IconEye, IconClock, IconPin, IconArrowRight,
  IconUserPlus, IconUserCheck, IconChevronLeft, IconChevronRight,
  IconPlay, IconVolume, IconVolumeMute, IconStar, IconSend, IconLink,
  IconCheck, IconAlert, IconMoreVertical, IconSpinner,
} from './icons';
import { COLORS, formatRelativeTime, formatCompactNumber, formatLikes, formatComments, formatShares, formatViews, formatGifts, getInitials, getAvatarColor, cx, hapticFeedback } from './utils';
import { useToast } from './confirm-dialog';

export interface PostCardData {
  id: string;
  author_uid: string;
  author_username: string;
  author_nickname: string;
  author_profile_image?: string;
  author_badge_type?: 'vip' | 'government' | 'press' | 'organization' | 'verified' | 'founder' | null;
  author_is_verified?: boolean;
  author_is_suspended?: boolean;
  content: string;
  media_urls?: string[];
  media_type?: 'image' | 'video' | 'carousel' | 'none' | 'poll';
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  gifts_count: number;
  is_pinned?: boolean;
  is_hidden?: boolean;
  is_liked?: boolean;
  is_saved?: boolean;
  is_following_author?: boolean;
  created_at: string | number;
  // For poll posts
  poll_options?: { id: string; text: string; votes: number }[];
  poll_user_vote?: string;
}

export interface PostCardProps {
  post: PostCardData;
  isOwner?: boolean;
  isAdmin?: boolean;
  onLike?: (postId: string, liked: boolean) => Promise<boolean> | void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onSave?: (postId: string, saved: boolean) => Promise<boolean> | void;
  onGift?: (postId: string, authorUid: string) => void;
  onFollowAuthor?: (authorUid: string, currentlyFollowing: boolean) => Promise<boolean> | void;
  onViewProfile?: (authorUid: string) => void;
  onViewPost?: (postId: string) => void;
  onReport?: (postId: string) => void;
  onHide?: (postId: string) => void;
  onPin?: (postId: string, pinned: boolean) => void;
  onDelete?: (postId: string) => void;
  onViewIncrement?: (postId: string) => Promise<void> | void;
}

export function PostCard(props: PostCardProps) {
  const { post, isOwner = false, isAdmin = false } = props;
  const toast = useToast();
  const [liked, setLiked] = useState(post.is_liked || false);
  const [saved, setSaved] = useState(post.is_saved || false);
  const [likes, setLikes] = useState(post.likes_count);
  const [following, setFollowing] = useState(post.is_following_author || false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [mediaIdx, setMediaIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const [viewRecorded, setViewRecorded] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const likeControls = useAnimation();
  const moreRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external state changes
  useEffect(() => { setLiked(post.is_liked || false); setLikes(post.likes_count); }, [post.is_liked, post.likes_count]);
  useEffect(() => { setSaved(post.is_saved || false); }, [post.is_saved]);
  useEffect(() => { setFollowing(post.is_following_author || false); }, [post.is_following_author]);

  // Record view on mount (once per post per session)
  useEffect(() => {
    if (!viewRecorded && props.onViewIncrement) {
      const t = setTimeout(() => {
        props.onViewIncrement?.(post.id);
        setViewRecorded(true);
      }, 1500); // Count as view after 1.5s of visibility
      return () => clearTimeout(t);
    }
  }, [viewRecorded, post.id, props.onViewIncrement]);

  // Close menus on outside click
  useEffect(() => {
    if (!moreOpen && !shareOpen) return;
    const handler = (e: MouseEvent) => {
      if (moreOpen && moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (shareOpen && shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreOpen, shareOpen]);

  const handleLike = useCallback(async () => {
    if (likeAnimating) return;
    setLikeAnimating(true);
    await hapticFeedback(liked ? 'light' : 'medium');
    likeControls.start({ scale: [1, 1.35, 0.9, 1.1, 1], transition: { duration: 0.5, times: [0, 0.3, 0.5, 0.7, 1] } });
    setLiked((prev) => {
      const next = !prev;
      setLikes((l) => l + (next ? 1 : -1));
      props.onLike?.(post.id, next);
      return next;
    });
    setTimeout(() => setLikeAnimating(false), 600);
  }, [liked, likeAnimating, likeControls, props, post.id]);

  const handleSave = useCallback(async () => {
    await hapticFeedback('light');
    setSaved((prev) => {
      const next = !prev;
      props.onSave?.(post.id, next);
      toast.success(next ? 'تم حفظ المنشور' : 'تم إزالة المنشور من المحفوظات');
      return next;
    });
  }, [props, post.id, toast]);

  const handleFollowAuthor = useCallback(async () => {
    await hapticFeedback('light');
    setFollowing((prev) => {
      const next = !prev;
      props.onFollowAuthor?.(post.author_uid, prev);
      toast.success(next ? `تتابع ${post.author_nickname} الآن` : `ألغيت متابعة ${post.author_nickname}`);
      return next;
    });
  }, [props, post, toast]);

  const handleLongPress = useCallback(() => {
    hapticFeedback('medium');
    // Could open quick-reaction panel — for now just trigger like
    if (!liked) handleLike();
  }, [liked, handleLike]);

  const startLongPress = useCallback(() => {
    longPressTimer.current = setTimeout(handleLongPress, 500);
  }, [handleLongPress]);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Don't render hidden posts unless owner/admin
  if (post.is_hidden && !isOwner && !isAdmin) return null;
  if (post.author_is_suspended && !isOwner && !isAdmin) {
    return (
      <div style={{ padding: 20, textAlign: 'center', background: COLORS.surfaceMuted, borderRadius: 14, color: COLORS.textMuted, fontSize: 13 }}>
        هذا المنشور من حساب موقوف.
      </div>
    );
  }

  const avatarColor = getAvatarColor(post.author_uid);
  const initials = getInitials(post.author_nickname || post.author_username);
  const media = post.media_urls || [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: COLORS.surface,
        borderRadius: 14,
        marginBottom: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        border: `1px solid ${COLORS.border}`,
        overflow: 'hidden',
      }}
    >
      {/* Pinned banner */}
      {post.is_pinned && (
        <div
          style={{
            background: COLORS.primary + '12',
            color: COLORS.primary,
            padding: '8px 16px',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            borderBottom: `1px solid ${COLORS.primary}25`,
          }}
        >
          <IconPin size={14} color={COLORS.primary} />
          منشور مثبّت
        </div>
      )}

      {/* Author header */}
      <div
        style={{
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <button
          onClick={() => props.onViewProfile?.(post.author_uid)}
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            border: 'none',
            background: post.author_profile_image ? `url(${post.author_profile_image}) center/cover` : avatarColor,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {!post.author_profile_image && initials}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <button
            onClick={() => props.onViewProfile?.(post.author_uid)}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{post.author_nickname || post.author_username}</span>
            {post.author_badge_type && <IconVerified size={15} type={post.author_badge_type} />}
            {post.author_is_verified && !post.author_badge_type && <IconVerified size={15} type="verified" />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
            <IconClock size={11} color={COLORS.textMuted} />
            {formatRelativeTime(post.created_at)}
            <span>·</span>
            <IconEye size={11} color={COLORS.textMuted} />
            {formatCompactNumber(post.views_count)}
          </div>
        </div>

        {/* Follow button (compact) — hidden if owner */}
        {!isOwner && (
          <button
            onClick={handleFollowAuthor}
            style={{
              padding: '6px 12px',
              border: following ? `1px solid ${COLORS.border}` : 'none',
              background: following ? 'transparent' : COLORS.primary,
              color: following ? COLORS.textSecondary : '#fff',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {following ? <IconUserCheck size={13} color={COLORS.textSecondary} /> : <IconUserPlus size={13} color="#fff" />}
            {following ? 'تتابعه' : 'متابعة'}
          </button>
        )}

        {/* More menu */}
        <div ref={moreRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMoreOpen((v) => !v)}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 6,
              color: COLORS.textSecondary,
            }}
            aria-label="المزيد"
          >
            <IconMore size={18} color={COLORS.textSecondary} />
          </button>
          <AnimatePresence>
            {moreOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: COLORS.surface,
                  borderRadius: 12,
                  boxShadow: '0 12px 32px -8px rgba(0,0,0,0.2)',
                  border: `1px solid ${COLORS.border}`,
                  padding: 6,
                  minWidth: 200,
                  zIndex: 50,
                }}
              >
                <MoreItem icon={<IconBookmark size={16} color={COLORS.text} />} label={saved ? 'إزالة من المحفوظات' : 'حفظ المنشور'} onClick={() => { handleSave(); setMoreOpen(false); }} />
                <MoreItem icon={<IconLink size={16} color={COLORS.text} />} label="نسخ الرابط" onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/post/${post.id}`); toast.success('تم نسخ الرابط'); setMoreOpen(false); }} />
                {!isOwner && <MoreItem icon={<IconAlert size={16} color={COLORS.danger} />} label="إبلاغ عن المنشور" danger onClick={() => { props.onReport?.(post.id); setMoreOpen(false); }} />}
                {isAdmin && (
                  <>
                    <MoreItem icon={<IconPin size={16} color={COLORS.primary} />} label={post.is_pinned ? 'إلغاء التثبيت' : 'تثبيت المنشور'} onClick={() => { props.onPin?.(post.id, !post.is_pinned); setMoreOpen(false); }} />
                    <MoreItem icon={<IconEye size={16} color={COLORS.warning} />} label="إخفاء المنشور" danger onClick={() => { props.onHide?.(post.id); setMoreOpen(false); }} />
                  </>
                )}
                {(isOwner || isAdmin) && <MoreItem icon={<IconAlert size={16} color={COLORS.danger} />} label="حذف المنشور" danger onClick={() => { props.onDelete?.(post.id); setMoreOpen(false); }} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content (text) */}
      {post.content && (
        <div
          style={{
            padding: '0 14px 12px',
            fontSize: 14,
            lineHeight: 1.65,
            color: COLORS.text,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            cursor: 'pointer',
          }}
          onClick={() => props.onViewPost?.(post.id)}
          onTouchStart={startLongPress}
          onTouchEnd={cancelLongPress}
          onTouchMove={cancelLongPress}
        >
          <RichText text={post.content} />
        </div>
      )}

      {/* Media */}
      {media.length > 0 && (
        <div style={{ position: 'relative', background: '#000' }}>
          {post.media_type === 'video' ? (
            <div
              style={{
                aspectRatio: '9/16',
                maxHeight: 600,
                background: `url(${media[mediaIdx]}) center/cover`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setMuted((m) => !m)}
            >
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <IconPlay size={28} color="#fff" />
              </motion.button>
              <button
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(8px)',
                }}
                onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}
              >
                {muted ? <IconVolumeMute size={16} color="#fff" /> : <IconVolume size={16} color="#fff" />}
              </button>
            </div>
          ) : media.length === 1 ? (
            <div
              style={{
                width: '100%',
                maxHeight: 600,
                background: `url(${media[0]}) center/cover`,
                aspectRatio: '4/3',
                cursor: 'pointer',
              }}
              onClick={() => props.onViewPost?.(post.id)}
            />
          ) : (
            <>
              <div
                style={{
                  width: '100%',
                  maxHeight: 500,
                  background: `url(${media[mediaIdx]}) center/cover`,
                  aspectRatio: '1',
                  cursor: 'pointer',
                }}
                onClick={() => props.onViewPost?.(post.id)}
              />
              {/* Carousel arrows */}
              {mediaIdx > 0 && (
                <button
                  onClick={() => setMediaIdx((i) => i - 1)}
                  style={carouselArrowStyle('right')}
                >
                  <IconChevronRight size={22} color="#fff" />
                </button>
              )}
              {mediaIdx < media.length - 1 && (
                <button
                  onClick={() => setMediaIdx((i) => i + 1)}
                  style={carouselArrowStyle('left')}
                >
                  <IconChevronLeft size={22} color="#fff" />
                </button>
              )}
              {/* Dots */}
              <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
                {media.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: i === mediaIdx ? '#fff' : 'rgba(255,255,255,0.5)',
                    }}
                  />
                ))}
              </div>
              {/* Counter */}
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 600,
                  backdropFilter: 'blur(8px)',
                }}
              >
                    {mediaIdx + 1} / {media.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Stats bar (above action bar) */}
      <div
        style={{
          padding: '10px 14px 4px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: COLORS.textSecondary,
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {likes > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: COLORS.danger, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconHeart size={10} color="#fff" filled />
              </div>
              {formatCompactNumber(likes)}
            </div>
          )}
          {post.gifts_count > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <IconGift size={14} color={COLORS.primary} filled />
              {formatCompactNumber(post.gifts_count)}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {post.comments_count > 0 && <span>{formatComments(post.comments_count)}</span>}
          {post.shares_count > 0 && <span>{formatShares(post.shares_count)}</span>}
          {post.views_count > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <IconEye size={11} />
              {formatViews(post.views_count)}
            </span>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div
        style={{
          display: 'flex',
          padding: '4px 8px 8px',
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <ActionButton
          onClick={handleLike}
          active={liked}
          activeColor={COLORS.danger}
          icon={
            <motion.span animate={likeControls}>
              <IconHeart size={20} color={liked ? COLORS.danger : COLORS.textSecondary} filled={liked} />
            </motion.span>
          }
          label={liked ? 'أعجبني' : 'إعجاب'}
        />
        <ActionButton
          onClick={() => props.onComment?.(post.id)}
          icon={<IconComment size={20} color={COLORS.textSecondary} />}
          label="تعليق"
        />

        {/* Share dropdown */}
        <div ref={shareRef} style={{ position: 'relative', flex: 1 }}>
          <ActionButton
            onClick={() => setShareOpen((v) => !v)}
            icon={<IconShare size={20} color={COLORS.textSecondary} />}
            label="مشاركة"
          />
          <AnimatePresence>
            {shareOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  marginBottom: 4,
                  background: COLORS.surface,
                  borderRadius: 12,
                  boxShadow: '0 12px 32px -8px rgba(0,0,0,0.2)',
                  border: `1px solid ${COLORS.border}`,
                  padding: 6,
                  minWidth: 180,
                  zIndex: 50,
                }}
              >
                <MoreItem icon={<IconShare size={16} color={COLORS.primary} />} label="مشاركة في فيديو" onClick={() => { props.onShare?.(post.id); setShareOpen(false); }} />
                <MoreItem icon={<IconLink size={16} color={COLORS.text} />} label="نسخ الرابط" onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/post/${post.id}`); toast.success('تم نسخ الرابط'); setShareOpen(false); }} />
                <MoreItem icon={<IconSend size={16} color={COLORS.text} />} label="إرسال عبر رسالة" onClick={() => { props.onShare?.(post.id); setShareOpen(false); }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ActionButton
          onClick={() => props.onGift?.(post.id, post.author_uid)}
          icon={<IconGift size={20} color={COLORS.primary} />}
          label="هدية"
          activeColor={COLORS.primary}
        />
        <ActionButton
          onClick={handleSave}
          active={saved}
          activeColor={COLORS.primary}
          icon={<IconBookmark size={20} color={saved ? COLORS.primary : COLORS.textSecondary} filled={saved} />}
          label={saved ? 'محفوظ' : 'حفظ'}
        />
      </div>

      {/* Quick comment preview (last comment) */}
      {post.comments_count > 0 && (
        <button
          onClick={() => props.onComment?.(post.id)}
          style={{
            width: '100%',
            padding: '10px 14px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            textAlign: 'right',
            fontSize: 12,
            color: COLORS.textMuted,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'inherit',
          }}
        >
          عرض كل التعليقات ({formatCompactNumber(post.comments_count)})
          <IconArrowRight size={12} color={COLORS.textMuted} />
        </button>
      )}
    </motion.article>
  );
}

// ============ Sub Components ============
function ActionButton({
  onClick,
  icon,
  label,
  active,
  activeColor,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  activeColor?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      style={{
        flex: 1,
        padding: '10px 4px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        color: active ? activeColor : COLORS.textSecondary,
        fontFamily: 'inherit',
      }}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}

function MoreItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick?: () => void; danger?: boolean }) {
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
        fontFamily: 'inherit',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// Renders text with highlighted hashtags (#x) and mentions (@y) as inline chips
function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /(#[\u0600-\u06FF\w]+|@[\u0600-\u06FF\w]+|https?:\/\/\S+)/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push(<span key={key++}>{text.slice(lastIdx, m.index)}</span>);
    const token = m[0];
    if (token.startsWith('#')) {
      parts.push(
        <span key={key++} style={{ color: COLORS.primary, fontWeight: 600, cursor: 'pointer' }}>
          {token}
        </span>
      );
    } else if (token.startsWith('@')) {
      parts.push(
        <span key={key++} style={{ color: COLORS.info, fontWeight: 600, cursor: 'pointer' }}>
          {token}
        </span>
      );
    } else {
      parts.push(
        <a key={key++} href={token} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.info, textDecoration: 'underline' }}>
          {token}
        </a>
      );
    }
    lastIdx = m.index + token.length;
  }
  if (lastIdx < text.length) parts.push(<span key={key++}>{text.slice(lastIdx)}</span>);
  return <>{parts}</>;
}

function carouselArrowStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [side]: 8,
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.55)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(8px)',
  };
}
