'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useAppStore, usePostsStore } from '@/lib/store';
import { t, formatNumber } from '@/lib/i18n';
import {
  LikeIcon, CommentIcon, ShareIcon, VerifiedIcon,
  CoinIcon, MoreIcon, ImageIcon, CameraIcon,
} from '@/components/icons/aden-dot-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Post } from '@/types/skyline';

const GOLD = '#D4A853';
const NAVY = '#1A1F36';

// ============ Story Circles ============
function StoryCircles() {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);

  const demoStories = [
    { id: 'add', name: t('home.addStory', lang), avatar: user?.profileImage || '/avatar.png', isAdd: true },
    { id: '1', name: 'أحمد', avatar: '', color: '#EF4444' },
    { id: '2', name: 'سارة', avatar: '', color: '#3B82F6' },
    { id: '3', name: 'محمد', avatar: '', color: '#8B5CF6' },
    { id: '4', name: 'نورة', avatar: '', color: '#10B981' },
    { id: '5', name: 'خالد', avatar: '', color: '#F59E0B' },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
      {demoStories.map((story) => (
        <button key={story.id} className="flex flex-col items-center gap-1 min-w-[64px]">
          <div
            className="w-14 h-14 rounded-full p-0.5"
            style={{
              background: story.isAdd
                ? `${GOLD}30`
                : `linear-gradient(135deg, ${story.color}, ${GOLD})`,
            }}
          >
            <div className="w-full h-full rounded-full overflow-hidden" style={{ background: NAVY, padding: '2px' }}>
              {story.isAdd ? (
                <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: `${GOLD}15` }}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: `${story.color}30` }}>
                  {story.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
          <span className="text-[10px] text-gray-400 truncate w-14 text-center">{story.name}</span>
        </button>
      ))}
    </div>
  );
}

// ============ Create Post Input ============
function CreatePostInput() {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,168,83,0.08)' }}
    >
      <Avatar className="w-10 h-10">
        <AvatarImage src={user?.profileImage || '/avatar.png'} />
        <AvatarFallback style={{ background: `${GOLD}20`, color: GOLD }}>{user?.nickname?.charAt(0) || '?'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 text-gray-500 text-sm">{t('home.whatsNew', lang)}</div>
      <div className="flex gap-2">
        <ImageIcon size={20} color={GOLD} />
        <CameraIcon size={20} color={GOLD} />
      </div>
    </div>
  );
}

// ============ Post Card ============
function PostCard({ post, index }: { post: Post; index: number }) {
  const lang = useAppStore((s) => s.language);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showHeart, setShowHeart] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikesCount(likesCount + 1);
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

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
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,168,83,0.08)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onDoubleClick={handleDoubleTap}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.publisherProfileImage || '/avatar.png'} />
          <AvatarFallback className="text-xs" style={{ background: `${GOLD}20`, color: GOLD }}>
            {post.publisherNickname?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-white">{post.publisherNickname || post.publisherUsername}</span>
            {post.publisherVerified && <VerifiedIcon size={14} />}
          </div>
          <span className="text-[10px] text-gray-500">{timeAgo(post.createdAt)}</span>
        </div>
        <button className="p-1">
          <MoreIcon size={18} color="#6B7280" />
        </button>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-3 pb-2">
          <p className="text-sm text-gray-200 leading-relaxed">{post.content}</p>
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
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.4 }}
              >
                <svg width={80} height={80} viewBox="0 0 24 24" fill="white" opacity={0.9}>
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-5">
          <motion.button
            onClick={handleLike}
            whileTap={{ scale: 1.3 }}
            className="flex items-center gap-1.5"
          >
            <LikeIcon size={20} color={isLiked ? '#EF4444' : '#9CA3AF'} filled={isLiked} />
            <span className={`text-xs ${isLiked ? 'text-red-400' : 'text-gray-500'}`}>
              {formatNumber(likesCount, lang)}
            </span>
          </motion.button>

          <button className="flex items-center gap-1.5">
            <CommentIcon size={18} color="#9CA3AF" />
            <span className="text-xs text-gray-500">{formatNumber(post.commentsCount, lang)}</span>
          </button>

          <button className="flex items-center gap-1.5">
            <ShareIcon size={18} color="#9CA3AF" />
            <span className="text-xs text-gray-500">{formatNumber(post.sharesCount, lang)}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-600">{formatNumber(post.viewsCount, lang)} {t('post.views', lang)}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ============ Home Feed ============
export function HomeFeed() {
  const lang = useAppStore((s) => s.language);
  const posts = usePostsStore((s) => s.posts);
  const isLoading = usePostsStore((s) => s.isLoading);
  const hasMore = usePostsStore((s) => s.hasMore);

  // Demo posts if no real ones
  const demoPosts: Post[] = posts.length > 0 ? posts : [
    {
      id: '1',
      publisherUID: '1',
      publisherUsername: 'ahmed',
      publisherNickname: 'أحمد العلي',
      publisherProfileImage: '',
      publisherVerified: true,
      type: 'TEXT',
      content: 'مرحباً بكم في عدن دوت! 🌟 المنصة الاجتماعية الجديدة كلياً. شاركونا أفكاركم وتفاعلوا مع المجتمع. #عدن_دوت #منصة_اجتماعية',
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
      publisherNickname: 'سارة الأحمد',
      publisherProfileImage: '',
      publisherVerified: false,
      type: 'TEXT',
      content: 'اليوم كان يوماً رائعاً! 🌸 ما هي أهدافكم لهذا الأسبوع؟',
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
      publisherNickname: 'خالد المحمدي',
      publisherProfileImage: '',
      publisherVerified: true,
      type: 'TEXT',
      content: '📢 تحديث جديد في عدن دوت! الآن يمكنكم بث الفيديو المباشر وإرسال الهدايا لأصدقائكم. جرّبوا الميزات الجديدة الآن!',
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

  return (
    <div className="space-y-4">
      <StoryCircles />
      <CreatePostInput />

      {demoPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: `${GOLD}10` }}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">{t('home.noPosts', lang)}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {demoPosts.map((post, idx) => (
            <PostCard key={post.id} post={post} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
