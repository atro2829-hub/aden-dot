'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useAuthStore, useAppStore, usePostsStore } from '@/lib/store';
import { t, formatNumber } from '@/lib/i18n';
import {
  LikeIcon, CommentIcon, ShareIcon, VerifiedIcon,
  CoinIcon, MoreIcon, ImageIcon, CameraIcon,
} from '@/components/icons/aden-dot-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Post } from '@/types/skyline';

// ============ Story Circles ============
function StoryCircles() {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);

  const demoStories = [
    { id: 'add', name: t('home.addStory', lang), avatar: user?.profileImage || '/avatar.png', isAdd: true },
    { id: '1', name: lang === 'ar' ? 'أحمد' : 'Ahmed', avatar: '', color: '#EF4444', hasNew: true },
    { id: '2', name: lang === 'ar' ? 'سارة' : 'Sara', avatar: '', color: '#3B82F6', hasNew: true },
    { id: '3', name: lang === 'ar' ? 'محمد' : 'Mohammed', avatar: '', color: '#8B5CF6', hasNew: true },
    { id: '4', name: lang === 'ar' ? 'نورة' : 'Noura', avatar: '', color: '#10B981', hasNew: false },
    { id: '5', name: lang === 'ar' ? 'خالد' : 'Khaled', avatar: '', color: '#F59E0B', hasNew: true },
    { id: '6', name: lang === 'ar' ? 'ليلى' : 'Layla', avatar: '', color: '#EC4899', hasNew: false },
  ];

  return (
    <div className="relative">
      <div className="flex gap-3 overflow-x-auto pb-3 pt-1 px-1 scroll-momentum scrollbar-hide">
        {demoStories.map((story, idx) => (
          <motion.button
            key={story.id}
            className="flex flex-col items-center gap-1.5 min-w-[68px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300 }}
            whileTap={{ scale: 0.92 }}
          >
            <div
              className="w-[62px] h-[62px] rounded-full p-[2.5px]"
              style={{
                background: story.isAdd
                  ? 'linear-gradient(135deg, var(--primary), var(--primary))'
                  : `linear-gradient(135deg, ${story.color}, var(--primary), var(--primary))`,
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-background p-[2px]">
                {story.isAdd ? (
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-primary/10">
                    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                ) : (
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${story.color}40, ${story.color}20)` }}
                  >
                    {story.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground truncate w-[68px] text-center">{story.name}</span>
          </motion.button>
        ))}
      </div>
      {/* Fade edges */}
      <div className="absolute right-0 top-0 bottom-3 w-8 pointer-events-none bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}

// ============ Create Post Input ============
function CreatePostInput() {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);

  return (
    <motion.div
      className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border"
      whileTap={{ scale: 0.98 }}
    >
      <Avatar className="w-11 h-11 ring-2 ring-primary/20 ring-offset-1 ring-offset-background">
        <AvatarImage src={user?.profileImage || '/avatar.png'} />
        <AvatarFallback className="bg-primary/10 text-primary">{user?.nickname?.charAt(0) || '?'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 text-muted-foreground text-sm">{t('home.whatsNew', lang)}</div>
      <div className="flex gap-2.5">
        <motion.div whileTap={{ scale: 0.85 }}>
          <ImageIcon size={20} color="var(--primary)" />
        </motion.div>
        <motion.div whileTap={{ scale: 0.85 }}>
          <CameraIcon size={20} color="var(--primary)" />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============ Floating Action Button ============
function CreatePostFAB() {
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  return (
    <motion.button
      className="fixed z-30 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl safe-bottom bg-primary text-primary-foreground"
      style={{
        bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
        right: 'max(1rem, calc((100vw - 32rem) / 2 + 1rem))',
        boxShadow: '0 4px 20px var(--primary) / 0.4',
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.5 }}
      onClick={() => setActiveTab('create')}
    >
      <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </motion.button>
  );
}

// ============ Post Card ============
function PostCard({ post, index }: { post: Post; index: number }) {
  const lang = useAppStore((s) => s.language);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef(0);

  const handleLike = useCallback(() => {
    setIsLiked((prev) => {
      setLikesCount((c) => prev ? c - 1 : c + 1);
      return !prev;
    });
  }, []);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) {
        setIsLiked(true);
        setLikesCount((c) => c + 1);
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 900);
    }
    lastTapRef.current = now;
  }, [isLiked]);

  const timeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 60000) return lang === 'ar' ? 'الآن' : 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}${lang === 'ar' ? 'د' : 'm'}`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}${lang === 'ar' ? 'س' : 'h'}`;
    return `${Math.floor(diff / 86400000)}${lang === 'ar' ? 'ي' : 'd'}`;
  };

  return (
    <motion.div
      className="rounded-2xl overflow-hidden bg-card border border-border"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 30 }}
      onClick={handleDoubleTap}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <Avatar className="w-11 h-11 ring-1 ring-primary/10">
          <AvatarImage src={post.publisherProfileImage || '/avatar.png'} />
          <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
            {post.publisherNickname?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground">{post.publisherNickname || post.publisherUsername}</span>
            {post.publisherVerified && <VerifiedIcon size={14} />}
          </div>
          <span className="text-[10px] text-muted-foreground">{timeAgo(post.createdAt)}</span>
        </div>
        <button className="p-1 rounded-full hover:bg-muted transition-colors">
          <MoreIcon size={18} color="var(--muted-foreground)" />
        </button>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {/* Image */}
      {post.mediaBase64 && (
        <div className="relative">
          <img
            src={post.mediaBase64.startsWith('data:') ? post.mediaBase64 : `data:${post.mediaMimeType || 'image/jpeg'};base64,${post.mediaBase64}`}
            alt=""
            className="w-full max-h-80 object-cover"
          />
          {/* Heart burst animation */}
          <AnimatePresence>
            {showHeart && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.8 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <motion.svg
                  width={90}
                  height={90}
                  viewBox="0 0 24 24"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <path
                    d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                    fill="white"
                    opacity={0.9}
                  />
                </motion.svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between p-4 pt-3">
        <div className="flex items-center gap-5">
          <motion.button
            onClick={(e) => { e.stopPropagation(); handleLike(); }}
            whileTap={{ scale: 1.3 }}
            className="flex items-center gap-1.5"
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <LikeIcon size={20} color={isLiked ? '#EF4444' : 'var(--muted-foreground)'} filled={isLiked} />
            </motion.div>
            <span className={`text-xs font-medium ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}>
              {formatNumber(likesCount, lang)}
            </span>
          </motion.button>

          <button className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <CommentIcon size={18} color="var(--muted-foreground)" />
            <span className="text-xs text-muted-foreground">{formatNumber(post.commentsCount, lang)}</span>
          </button>

          <button className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <ShareIcon size={18} color="var(--muted-foreground)" />
            <span className="text-xs text-muted-foreground">{formatNumber(post.sharesCount, lang)}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground">{formatNumber(post.viewsCount, lang)} {t('post.views', lang)}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ============ Pull-to-refresh Indicator ============
function PullRefreshIndicator({ isRefreshing }: { isRefreshing: boolean }) {
  const lang = useAppStore((s) => s.language);

  return (
    <AnimatePresence>
      {isRefreshing && (
        <motion.div
          className="flex items-center justify-center py-3 gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <motion.div
            className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          />
          <span className="text-xs text-primary">{t('home.refreshFeed', lang)}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============ Home Feed ============
export function HomeFeed() {
  const lang = useAppStore((s) => s.language);
  const posts = usePostsStore((s) => s.posts);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Demo posts if no real ones
  const demoPosts: Post[] = posts.length > 0 ? posts : [
    {
      id: '1',
      publisherUID: '1',
      publisherUsername: 'ahmed',
      publisherNickname: lang === 'ar' ? 'أحمد العلي' : 'Ahmed Al-Ali',
      publisherProfileImage: '',
      publisherVerified: true,
      type: 'TEXT',
      content: lang === 'ar'
        ? 'مرحباً بكم في عدن دوت! 🌟 المنصة الاجتماعية الجديدة كلياً. شاركونا أفكاركم وتفاعلوا مع المجتمع. #عدن_دوت #منصة_اجتماعية'
        : 'Welcome to Aden Dot! 🌟 The brand new social platform. Share your thoughts and engage with the community. #AdenDot #SocialPlatform',
      description: '',
      likesCount: 234,
      commentsCount: 45,
      viewsCount: 1250,
      sharesCount: 18,
      isLiked: false,
      isFavorite: false,
      isPrivate: false,
      isPinned: false,
      commentsDisabled: false,
      favoritesDisabled: false,
      createdAt: Date.now() - 3600000,
      region: 'middle-east',
    },
    {
      id: '2',
      publisherUID: '2',
      publisherUsername: 'sara',
      publisherNickname: lang === 'ar' ? 'سارة الأحمد' : 'Sara Al-Ahmad',
      publisherProfileImage: '',
      publisherVerified: false,
      type: 'TEXT',
      content: lang === 'ar'
        ? 'اليوم كان يوماً رائعاً! 🌸 ما هي أهدافكم لهذا الأسبوع؟'
        : 'Today was an amazing day! 🌸 What are your goals for this week?',
      description: '',
      likesCount: 89,
      commentsCount: 23,
      viewsCount: 456,
      sharesCount: 5,
      isLiked: true,
      isFavorite: false,
      isPrivate: false,
      isPinned: false,
      commentsDisabled: false,
      favoritesDisabled: false,
      createdAt: Date.now() - 7200000,
      region: 'gcc',
    },
    {
      id: '3',
      publisherUID: '3',
      publisherUsername: 'khaled',
      publisherNickname: lang === 'ar' ? 'خالد المحمدي' : 'Khaled Al-Mohammadi',
      publisherProfileImage: '',
      publisherVerified: true,
      type: 'TEXT',
      content: lang === 'ar'
        ? '📢 تحديث جديد في عدن دوت! الآن يمكنكم بث الفيديو المباشر وإرسال الهدايا لأصدقائكم. جرّبوا الميزات الجديدة الآن!'
        : '📢 New update in Aden Dot! You can now live stream and send gifts to your friends. Try the new features now!',
      description: '',
      likesCount: 567,
      commentsCount: 89,
      viewsCount: 3200,
      sharesCount: 45,
      isLiked: false,
      isFavorite: true,
      isPrivate: false,
      isPinned: true,
      commentsDisabled: false,
      favoritesDisabled: false,
      createdAt: Date.now() - 14400000,
      region: 'yemen',
    },
  ];

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsRefreshing(false);
  }, []);

  return (
    <>
      <div className="space-y-4 scroll-momentum">
        {/* Stories Row */}
        <StoryCircles />

        {/* Pull to Refresh */}
        <PullRefreshIndicator isRefreshing={isRefreshing} />

        {/* Create Post Input */}
        <CreatePostInput />

        {/* Posts */}
        {demoPosts.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center bg-primary/10">
              <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm">{t('home.noPosts', lang)}</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {demoPosts.map((post, idx) => (
              <PostCard key={post.id} post={post} index={idx} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <CreatePostFAB />
    </>
  );
}
