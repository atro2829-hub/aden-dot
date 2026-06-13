'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useAuthStore, useAppStore, usePostsStore, useStoriesStore } from '@/lib/store';
import { fileToBase64, formatTimeAgo } from '@/lib/store';
import { t, formatNumber } from '@/lib/i18n';
import { postsService, commentsService } from '@/lib/supabase-service';
import {
  LikeIcon, CommentIcon, ShareIcon, VerifiedIcon,
  MoreIcon, ImageIcon, CameraIcon,
} from '@/components/icons/aden-dot-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import type { Post, Comment, Story } from '@/types/skyline';

// ============ Constants ============
const MAX_CHARS = 500;
const STORY_RING_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#F97316'];

// ============ Bilingual time-ago helper ============
function timeAgoBilingual(timestamp: number, lang: 'ar' | 'en'): string {
  if (lang === 'ar') {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'الآن';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}د`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}س`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}ي`;
    return `${Math.floor(diff / 86400000 / 7)}أسب`;
  }
  return formatTimeAgo(timestamp);
}

// ============ Bookmark Icon ============
function BookmarkIcon({ size = 20, color = 'currentColor', filled = false }: { size?: number; color?: string; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  );
}

// ============ Video Icon ============
function VideoIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

// ============ Location Icon ============
function LocationIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// ============ Globe/Lock toggle icon ============
function PrivacyIcon({ isPrivate, size = 18 }: { isPrivate: boolean; size?: number }) {
  if (isPrivate) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

// ============ X / Close Icon ============
function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

// ======================================================================
// CREATE POST MODAL
// ======================================================================

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostModal({ open, onOpenChange }: CreatePostModalProps) {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const createPost = usePostsStore((s) => s.createPost);

  const [content, setContent] = useState('');
  const [mediaBase64, setMediaBase64] = useState<string | null>(null);
  const [mediaMimeType, setMediaMimeType] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [locationTag, setLocationTag] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const charCount = content.length;
  const charLimitExceeded = charCount > MAX_CHARS;
  const canPost = content.trim().length > 0 && !charLimitExceeded && !isPosting;

  const resetForm = useCallback(() => {
    setContent('');
    setMediaBase64(null);
    setMediaMimeType(null);
    setIsPrivate(false);
    setLocationTag('');
    setIsPosting(false);
  }, []);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    try {
      const base64 = await fileToBase64(file);
      setMediaBase64(base64);
      setMediaMimeType(file.type);
    } catch (err) {
      console.error('Image upload error:', err);
    } finally {
      setUploadingMedia(false);
    }
    // Reset input so the same file can be re-selected
    e.target.value = '';
  }, []);

  const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    try {
      const base64 = await fileToBase64(file);
      setMediaBase64(base64);
      setMediaMimeType(file.type);
    } catch (err) {
      console.error('Video upload error:', err);
    } finally {
      setUploadingMedia(false);
    }
    e.target.value = '';
  }, []);

  const handleRemoveMedia = useCallback(() => {
    setMediaBase64(null);
    setMediaMimeType(null);
  }, []);

  const handlePost = useCallback(async () => {
    if (!canPost || !user) return;
    setIsPosting(true);
    try {
      const isVideo = mediaMimeType?.startsWith('video/');
      await createPost({
        type: mediaBase64 ? (isVideo ? 'VIDEO' : 'IMAGE') : 'TEXT',
        content: content.trim(),
        description: '',
        mediaBase64: mediaBase64 || undefined,
        mediaMimeType: mediaMimeType || undefined,
        isPrivate,
        isPinned: false,
        commentsDisabled: false,
        favoritesDisabled: false,
        sharesCount: 0,
        region: locationTag || user.region || '',
      });
      resetForm();
      onOpenChange(false);
    } catch (err) {
      console.error('Post creation error:', err);
    } finally {
      setIsPosting(false);
    }
  }, [canPost, user, content, mediaBase64, mediaMimeType, isPrivate, locationTag, createPost, resetForm, onOpenChange]);

  const isRtl = lang === 'ar';

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{t('home.createPost', lang)}</DialogTitle>
          <DialogDescription className="sr-only">
            {lang === 'ar' ? 'أنشئ منشوراً جديداً' : 'Create a new post'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* User info row */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 ring-1 ring-primary/10">
              <AvatarImage src={user?.profileImage || ''} />
              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                {user?.nickname?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-semibold">{user?.nickname || user?.username}</p>
              <button
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsPrivate(!isPrivate)}
              >
                <PrivacyIcon isPrivate={isPrivate} size={14} />
                <span>{isPrivate ? (lang === 'ar' ? 'خاص' : 'Private') : (lang === 'ar' ? 'عام' : 'Public')}</span>
              </button>
            </div>
          </div>

          {/* Textarea */}
          <div className="relative">
            <Textarea
              placeholder={t('home.whatsNew', lang)}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_CHARS + 50}
              rows={4}
              className="resize-none text-sm bg-transparent border-border/50 focus-visible:ring-primary/30"
              dir="auto"
            />
            <div className={`absolute bottom-2 ${isRtl ? 'left-2' : 'right-2'} flex items-center gap-1`}>
              <span className={`text-[10px] ${charLimitExceeded ? 'text-red-500' : 'text-muted-foreground'}`}>
                {charCount}/{MAX_CHARS}
              </span>
            </div>
          </div>

          {/* Media Preview */}
          <AnimatePresence>
            {mediaBase64 && (
              <motion.div
                className="relative rounded-xl overflow-hidden border border-border/50"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {mediaMimeType?.startsWith('video/') ? (
                  <video
                    src={mediaBase64}
                    className="w-full max-h-56 object-contain rounded-xl"
                    controls
                    muted
                  />
                ) : (
                  <img
                    src={mediaBase64}
                    alt=""
                    className="w-full max-h-56 object-contain rounded-xl"
                  />
                )}
                <button
                  onClick={handleRemoveMedia}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <XIcon size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload buttons */}
          <div className="flex items-center gap-2">
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadingMedia}
            >
              <ImageIcon size={18} color="var(--primary)" />
              <span className="text-xs">{lang === 'ar' ? 'صورة' : 'Photo'}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploadingMedia}
            >
              <VideoIcon size={18} color="var(--primary)" />
              <span className="text-xs">{lang === 'ar' ? 'فيديو' : 'Video'}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={() => setIsPrivate(!isPrivate)}
            >
              <PrivacyIcon isPrivate={isPrivate} size={18} />
            </Button>
          </div>

          {/* Location tag */}
          <div className="flex items-center gap-2">
            <LocationIcon size={16} color="var(--muted-foreground)" />
            <Input
              placeholder={lang === 'ar' ? 'أضف موقعاً (اختياري)' : 'Add location (optional)'}
              value={locationTag}
              onChange={(e) => setLocationTag(e.target.value)}
              className="h-8 text-xs bg-transparent border-border/50"
              dir="auto"
            />
          </div>

          {/* Uploading indicator */}
          {uploadingMedia && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <motion.div
                className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              />
              {lang === 'ar' ? 'جاري رفع الوسائط...' : 'Uploading media...'}
            </div>
          )}

          {/* Post button */}
          <Button
            onClick={handlePost}
            disabled={!canPost}
            className="w-full font-semibold"
            size="lg"
          >
            {isPosting ? (
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                />
                {lang === 'ar' ? 'جاري النشر...' : 'Posting...'}
              </div>
            ) : (
              t('post.addPost', lang)
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ======================================================================
// ADD STORY MODAL
// ======================================================================

interface AddStoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AddStoryModal({ open, onOpenChange }: AddStoryModalProps) {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const addStory = useStoriesStore((s) => s.addStory);

  const [mediaBase64, setMediaBase64] = useState<string | null>(null);
  const [mediaMimeType, setMediaMimeType] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setMediaBase64(null);
    setMediaMimeType(null);
    setIsUploading(false);
  }, []);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      setMediaBase64(base64);
      setMediaMimeType(file.type);
    } catch (err) {
      console.error('Story image upload error:', err);
    } finally {
      setIsUploading(false);
    }
    e.target.value = '';
  }, []);

  const handlePostStory = useCallback(async () => {
    if (!mediaBase64 || !mediaMimeType || !user) return;
    setIsUploading(true);
    try {
      await addStory(mediaBase64, mediaMimeType);
      resetForm();
      onOpenChange(false);
    } catch (err) {
      console.error('Story creation error:', err);
    } finally {
      setIsUploading(false);
    }
  }, [mediaBase64, mediaMimeType, user, addStory, resetForm, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-sm" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{t('home.addStory', lang)}</DialogTitle>
          <DialogDescription className="sr-only">
            {lang === 'ar' ? 'أضف قصة جديدة' : 'Add a new story'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

          {mediaBase64 ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={mediaBase64} alt="" className="w-full max-h-64 object-contain rounded-xl" />
              <button
                onClick={() => { setMediaBase64(null); setMediaMimeType(null); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <XIcon size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => imageInputRef.current?.click()}
              className="w-full h-40 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <CameraIcon size={32} />
              <span className="text-xs">{lang === 'ar' ? 'اختر صورة للقصة' : 'Select story image'}</span>
            </button>
          )}

          <Button
            onClick={handlePostStory}
            disabled={!mediaBase64 || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                />
                {lang === 'ar' ? 'جاري النشر...' : 'Posting...'}
              </div>
            ) : (
              t('post.addPost', lang)
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ======================================================================
// STORY VIEWER OVERLAY
// ======================================================================

function StoryViewer({
  story,
  onClose,
}: {
  story: Story;
  onClose: () => void;
}) {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const viewStory = useStoriesStore((s) => s.viewStory);

  useEffect(() => {
    if (user && !story.viewers.includes(user.uid)) {
      viewStory(story.id);
    }
  }, [story.id, story.viewers, user, viewStory]);

  const isVideo = story.mediaMimeType.startsWith('video/');

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 text-white">
        <Avatar className="w-9 h-9 ring-2 ring-white/30">
          <AvatarImage src={story.publisherProfileImage || ''} />
          <AvatarFallback className="text-xs bg-white/20 text-white">
            {story.publisherNickname?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-semibold">{story.publisherNickname || story.publisherUsername}</p>
          <p className="text-[10px] text-white/60">{timeAgoBilingual(story.createdAt, lang)}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <XIcon size={22} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/20 mx-4">
        <motion.div
          className="h-full bg-white"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 5, ease: 'linear' }}
          onAnimationComplete={onClose}
        />
      </div>

      {/* Media */}
      <div className="flex-1 flex items-center justify-center p-4">
        {isVideo ? (
          <video
            src={story.mediaBase64.startsWith('data:') ? story.mediaBase64 : `data:${story.mediaMimeType};base64,${story.mediaBase64}`}
            className="max-w-full max-h-full object-contain rounded-xl"
            autoPlay
            muted
            controls
          />
        ) : (
          <img
            src={story.mediaBase64.startsWith('data:') ? story.mediaBase64 : `data:${story.mediaMimeType};base64,${story.mediaBase64}`}
            alt=""
            className="max-w-full max-h-full object-contain rounded-xl"
          />
        )}
      </div>

      {/* Views */}
      <div className="p-4 text-white/60 text-xs text-center">
        {formatNumber(story.viewsCount, lang)} {t('post.views', lang)}
      </div>
    </motion.div>
  );
}

// ======================================================================
// STORY CIRCLES
// ======================================================================

function StoryCircles() {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const stories = useStoriesStore((s) => s.stories);
  const isLoading = useStoriesStore((s) => s.isLoading);
  const fetchStories = useStoriesStore((s) => s.fetchStories);

  const [showAddStory, setShowAddStory] = useState(false);
  const [viewingStory, setViewingStory] = useState<Story | null>(null);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Group stories by publisher
  const groupedStories = useCallback(() => {
    const map = new Map<string, Story[]>();
    for (const story of stories) {
      const existing = map.get(story.publisherUID) || [];
      existing.push(story);
      map.set(story.publisherUID, existing);
    }
    return map;
  }, [stories]);

  const storyGroups = groupedStories();
  const ownStories = user ? (storyGroups.get(user.uid) || []) : [];

  return (
    <>
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-3 pt-1 px-1 scroll-momentum scrollbar-hide">
          {/* Add Story circle */}
          <motion.button
            className="flex flex-col items-center gap-1.5 min-w-[68px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowAddStory(true)}
          >
            <div className="w-[62px] h-[62px] rounded-full p-[2.5px]" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary))' }}>
              <div className="w-full h-full rounded-full overflow-hidden bg-background p-[2px]">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-primary/10 relative">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : null}
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center ring-2 ring-background">
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground truncate w-[68px] text-center">{t('home.addStory', lang)}</span>
          </motion.button>

          {/* Own stories indicator */}
          {ownStories.length > 0 && (
            <motion.button
              className="flex flex-col items-center gap-1.5 min-w-[68px]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setViewingStory(ownStories[0])}
            >
              <div className="w-[62px] h-[62px] rounded-full p-[2.5px]" style={{ background: 'linear-gradient(135deg, var(--primary), #F59E0B)' }}>
                <div className="w-full h-full rounded-full overflow-hidden bg-background p-[2px]">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={user?.profileImage || ''} />
                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                      {user?.nickname?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-[10px] text-primary truncate w-[68px] text-center font-medium">
                {lang === 'ar' ? 'قصتك' : 'Your story'}
              </span>
            </motion.button>
          )}

          {/* Other users' stories */}
          {Array.from(storyGroups.entries())
            .filter(([uid]) => uid !== user?.uid)
            .map(([uid, userStories], idx) => {
              const firstStory = userStories[0];
              const colorIdx = idx % STORY_RING_COLORS.length;
              return (
                <motion.button
                  key={uid}
                  className="flex flex-col items-center gap-1.5 min-w-[68px]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setViewingStory(firstStory)}
                >
                  <div
                    className="w-[62px] h-[62px] rounded-full p-[2.5px]"
                    style={{ background: `linear-gradient(135deg, ${STORY_RING_COLORS[colorIdx]}, var(--primary))` }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-background p-[2px]">
                      {firstStory.publisherProfileImage ? (
                        <img
                          src={firstStory.publisherProfileImage}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full rounded-full flex items-center justify-center text-sm font-bold text-white"
                          style={{ background: `linear-gradient(135deg, ${STORY_RING_COLORS[colorIdx]}40, ${STORY_RING_COLORS[colorIdx]}20)` }}
                        >
                          {firstStory.publisherNickname?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate w-[68px] text-center">
                    {firstStory.publisherNickname || firstStory.publisherUsername}
                  </span>
                </motion.button>
              );
            })}

          {/* Loading skeleton for stories */}
          {isLoading && stories.length === 0 && (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`skel-${i}`} className="flex flex-col items-center gap-1.5 min-w-[68px]">
                  <Skeleton className="w-[62px] h-[62px] rounded-full" />
                  <Skeleton className="w-12 h-2.5 rounded" />
                </div>
              ))}
            </>
          )}
        </div>

        {/* Fade edges */}
        <div className="absolute right-0 top-0 bottom-3 w-8 pointer-events-none bg-gradient-to-l from-background to-transparent" />
        <div className="absolute left-0 top-0 bottom-3 w-8 pointer-events-none bg-gradient-to-r from-background to-transparent" />
      </div>

      {/* Story Viewer Overlay */}
      <AnimatePresence>
        {viewingStory && (
          <StoryViewer
            story={viewingStory}
            onClose={() => setViewingStory(null)}
          />
        )}
      </AnimatePresence>

      {/* Add Story Modal */}
      <AddStoryModal open={showAddStory} onOpenChange={setShowAddStory} />
    </>
  );
}

// ======================================================================
// MEDIA VIEWER (Full Screen)
// ======================================================================

function MediaViewer({
  mediaSrc,
  mediaType,
  onClose,
}: {
  mediaSrc: string;
  mediaType: string;
  onClose: () => void;
}) {
  const scale = useMotionValue(1);
  const isVideo = mediaType.startsWith('video/');

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
      >
        <XIcon size={22} />
      </button>

      {isVideo ? (
        <video
          src={mediaSrc}
          className="max-w-full max-h-full object-contain"
          controls
          autoPlay
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <motion.img
          src={mediaSrc}
          alt=""
          className="max-w-full max-h-full object-contain"
          style={{ scale }}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.1}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={() => {
            const current = scale.get();
            scale.set(current > 1 ? 1 : 2);
          }}
        />
      )}
    </motion.div>
  );
}

// ======================================================================
// COMMENTS SHEET (Bottom Sheet)
// ======================================================================

function CommentsSheet({
  postId,
  open,
  onOpenChange,
}: {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const addComment = usePostsStore((s) => s.addComment);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const loadComments = useCallback(async () => {
    setIsLoadingComments(true);
    try {
      const result = await commentsService.getPostComments(postId);
      setComments(result);
    } catch (err) {
      console.error('Load comments error:', err);
    } finally {
      setIsLoadingComments(false);
    }
  }, [postId]);

  useEffect(() => {
    if (open) {
      loadComments();
    }
  }, [open, loadComments]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  const handleSubmitComment = useCallback(async () => {
    if (!newComment.trim() || !user || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const optimisticComment: Comment = {
        id: `temp_${Date.now()}`,
        postID: postId,
        publisherUID: user.uid,
        publisherUsername: user.username,
        publisherNickname: user.nickname,
        publisherProfileImage: user.profileImage,
        content: newComment.trim(),
        likesCount: 0,
        isLiked: false,
        isLikedByPublisher: false,
        parentCommentID: null,
        repliesCount: 0,
        createdAt: Date.now(),
      };
      setComments((prev) => [...prev, optimisticComment]);
      setNewComment('');

      await addComment(postId, newComment.trim());
      // Reload to get server-generated comment with correct id
      await loadComments();
    } catch (err) {
      console.error('Submit comment error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [newComment, user, isSubmitting, postId, addComment, loadComments]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!user) return;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    try {
      await commentsService.deleteComment(commentId, user.uid);
    } catch (err) {
      console.error('Delete comment error:', err);
      loadComments(); // reload on failure
    }
  }, [user, loadComments]);

  const handleLikeComment = useCallback(async (commentId: string, currentIsLiked: boolean) => {
    if (!user) return;
    // Optimistic
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, isLiked: !currentIsLiked, likesCount: currentIsLiked ? c.likesCount - 1 : c.likesCount + 1 }
          : c
      )
    );
    try {
      await commentsService.toggleCommentLike(commentId, user.uid);
    } catch (err) {
      console.error('Like comment error:', err);
      // Revert
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, isLiked: currentIsLiked, likesCount: currentIsLiked ? c.likesCount + 1 : c.likesCount - 1 }
            : c
        )
      );
    }
  }, [user]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[75vh] max-h-[75vh] flex flex-col p-0" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <SheetHeader className="px-4 pt-4 pb-2 border-b border-border/50">
          <SheetTitle className="text-sm">{t('post.comments', lang)}</SheetTitle>
          <SheetDescription className="sr-only">{lang === 'ar' ? 'التعليقات على المنشور' : 'Post comments'}</SheetDescription>
        </SheetHeader>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoadingComments ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {lang === 'ar' ? 'لا توجد تعليقات بعد' : 'No comments yet'}
            </div>
          ) : (
            comments.map((comment) => (
              <motion.div
                key={comment.id}
                className="flex gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Avatar className="w-8 h-8 shrink-0 ring-1 ring-border/30">
                  <AvatarImage src={comment.publisherProfileImage || ''} />
                  <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                    {comment.publisherNickname?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{comment.publisherNickname || comment.publisherUsername}</span>
                    {comment.isLikedByPublisher && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {lang === 'ar' ? 'الكاتب' : 'Author'}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {timeAgoBilingual(comment.createdAt, lang)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 mt-0.5 whitespace-pre-wrap break-words">{comment.content}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <button
                      className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors"
                      onClick={() => handleLikeComment(comment.id, comment.isLiked)}
                    >
                      <LikeIcon size={12} color={comment.isLiked ? '#EF4444' : 'var(--muted-foreground)'} filled={comment.isLiked} />
                      <span className={`text-[10px] ${comment.isLiked ? 'text-red-500' : ''}`}>{comment.likesCount > 0 ? formatNumber(comment.likesCount, lang) : ''}</span>
                    </button>
                    {comment.publisherUID === user?.uid && (
                      <button
                        className="text-[10px] text-muted-foreground hover:text-red-500 transition-colors"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        {t('app.delete', lang)}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Add comment input */}
        <div className="border-t border-border/50 p-3 flex items-center gap-2">
          <Avatar className="w-7 h-7 shrink-0">
            <AvatarImage src={user?.profileImage || ''} />
            <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
              {user?.nickname?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <input
            type="text"
            placeholder={t('post.writeComment', lang)}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitComment(); } }}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            dir="auto"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
            className="text-primary hover:text-primary shrink-0"
          >
            {isSubmitting ? (
              <motion.div
                className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              />
            ) : (
              t('app.send', lang)
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ======================================================================
// POST CARD
// ======================================================================

function PostCard({ post, index }: { post: Post; index: number }) {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const toggleLike = usePostsStore((s) => s.toggleLike);
  const toggleFavorite = usePostsStore((s) => s.toggleFavorite);
  const deletePost = usePostsStore((s) => s.deletePost);

  const [showHeart, setShowHeart] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const lastTapRef = useRef(0);

  const isOwnPost = user?.uid === post.publisherUID;

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(post.id);
  }, [post.id, toggleLike]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!post.isLiked) {
        toggleLike(post.id);
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 900);
    }
    lastTapRef.current = now;
  }, [post.isLiked, post.id, toggleLike]);

  const handleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(post.id);
  }, [post.id, toggleFavorite]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}?post=${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [post.id]);

  const handleDelete = useCallback(async () => {
    await deletePost(post.id);
  }, [post.id, deletePost]);

  const mediaSrc = post.mediaBase64
    ? (post.mediaBase64.startsWith('data:') ? post.mediaBase64 : `data:${post.mediaMimeType || 'image/jpeg'};base64,${post.mediaBase64}`)
    : null;
  const isVideo = post.mediaMimeType?.startsWith('video/') ?? false;

  return (
    <>
      <motion.div
        className="rounded-2xl overflow-hidden bg-card border border-border"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.06, 0.5), type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pb-2">
          <Avatar className="w-11 h-11 ring-1 ring-primary/10">
            <AvatarImage src={post.publisherProfileImage || ''} />
            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
              {post.publisherNickname?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground">{post.publisherNickname || post.publisherUsername}</span>
              {post.publisherVerified && <VerifiedIcon size={14} />}
              {post.isPrivate && (
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" className="shrink-0">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">{timeAgoBilingual(post.createdAt, lang)}</span>
          </div>

          {/* More menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-full hover:bg-muted transition-colors" onClick={(e) => e.stopPropagation()}>
                <MoreIcon size={18} color="var(--muted-foreground)" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwnPost && (
                <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={handleDelete}>
                  {t('post.deletePost', lang)}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleShare}>
                {t('post.sharePost', lang)}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleFavorite}>
                {post.isFavorite ? (lang === 'ar' ? 'إزالة من المحفوظات' : 'Remove from saved') : t('post.savePost', lang)}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        {post.content && (
          <div className="px-4 pb-3" onClick={handleDoubleTap}>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>
        )}

        {/* Media */}
        {mediaSrc && (
          <div className="relative" onClick={handleDoubleTap}>
            {isVideo ? (
              <video
                src={mediaSrc}
                className="w-full max-h-80 object-cover"
                controls
                preload="metadata"
                onClick={(e) => { e.stopPropagation(); setMediaViewerOpen(true); }}
              />
            ) : (
              <img
                src={mediaSrc}
                alt=""
                className="w-full max-h-80 object-cover cursor-pointer"
                onClick={(e) => { e.stopPropagation(); setMediaViewerOpen(true); }}
                loading="lazy"
              />
            )}

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
            {/* Like */}
            <motion.button
              onClick={handleLike}
              whileTap={{ scale: 1.3 }}
              className="flex items-center gap-1.5"
            >
              <motion.div
                animate={post.isLiked ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <LikeIcon size={20} color={post.isLiked ? '#EF4444' : 'var(--muted-foreground)'} filled={post.isLiked} />
              </motion.div>
              <span className={`text-xs font-medium ${post.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}>
                {post.likesCount > 0 ? formatNumber(post.likesCount, lang) : ''}
              </span>
            </motion.button>

            {/* Comment */}
            <button
              className="flex items-center gap-1.5"
              onClick={(e) => { e.stopPropagation(); setCommentsOpen(true); }}
            >
              <CommentIcon size={18} color="var(--muted-foreground)" />
              <span className="text-xs text-muted-foreground">{post.commentsCount > 0 ? formatNumber(post.commentsCount, lang) : ''}</span>
            </button>

            {/* Share */}
            <button
              className="flex items-center gap-1.5"
              onClick={(e) => { e.stopPropagation(); handleShare(); }}
            >
              <ShareIcon size={18} color="var(--muted-foreground)" />
              <span className="text-xs text-muted-foreground">{post.sharesCount > 0 ? formatNumber(post.sharesCount, lang) : ''}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Views */}
            <span className="text-[10px] text-muted-foreground">{formatNumber(post.viewsCount, lang)} {t('post.views', lang)}</span>

            {/* Favorite/Bookmark */}
            <motion.button
              onClick={handleFavorite}
              whileTap={{ scale: 1.2 }}
            >
              <BookmarkIcon size={20} color={post.isFavorite ? 'var(--primary)' : 'var(--muted-foreground)'} filled={post.isFavorite} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Comments Sheet */}
      <CommentsSheet
        postId={post.id}
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
      />

      {/* Media Viewer */}
      <AnimatePresence>
        {mediaViewerOpen && mediaSrc && (
          <MediaViewer
            mediaSrc={mediaSrc}
            mediaType={post.mediaMimeType || 'image/jpeg'}
            onClose={() => setMediaViewerOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ======================================================================
// POST SKELETON
// ======================================================================

function PostSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-card border border-border p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-11 h-11 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <Skeleton className="w-full h-48 rounded-xl" />
      <div className="flex items-center gap-5">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

// ======================================================================
// PULL-TO-REFRESH INDICATOR
// ======================================================================

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

// ======================================================================
// FLOATING ACTION BUTTON (Create Post)
// ======================================================================

function CreatePostFAB({ onClick }: { onClick: () => void }) {
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
      onClick={onClick}
    >
      <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </motion.button>
  );
}

// ======================================================================
// EMPTY STATE
// ======================================================================

function EmptyFeedState() {
  const lang = useAppStore((s) => s.language);
  return (
    <motion.div
      className="text-center py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-primary/10">
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      </div>
      <p className="text-muted-foreground text-sm">{t('home.noPosts', lang)}</p>
      <p className="text-muted-foreground/60 text-xs mt-1">
        {lang === 'ar' ? 'كن أول من ينشر!' : 'Be the first to post!'}
      </p>
    </motion.div>
  );
}

// ======================================================================
// ERROR STATE
// ======================================================================

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const lang = useAppStore((s) => s.language);
  return (
    <motion.div
      className="text-center py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-red-500/10">
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <p className="text-muted-foreground text-sm">{t('app.error', lang)}</p>
      <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
        {t('app.retry', lang)}
      </Button>
    </motion.div>
  );
}

// ======================================================================
// HOME FEED (Main Component)
// ======================================================================

export function HomeFeed() {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const posts = usePostsStore((s) => s.posts);
  const isLoading = usePostsStore((s) => s.isLoading);
  const hasMore = usePostsStore((s) => s.hasMore);
  const fetchPosts = usePostsStore((s) => s.fetchPosts);
  const loadMorePosts = usePostsStore((s) => s.loadMorePosts);
  const error = usePostsStore((s) => s.error);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);

  // Initial load
  useEffect(() => {
    if (user && !initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchPosts(user.uid, user.region);
    }
  }, [user, fetchPosts]);

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      await fetchPosts(user.uid, user.region);
    } finally {
      setIsRefreshing(false);
    }
  }, [user, fetchPosts]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || !user) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          loadMorePosts(user.uid);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [user, hasMore, isLoading, loadMorePosts]);

  return (
    <>
      <div className="space-y-4 scroll-momentum" ref={feedRef}>
        {/* Stories Row */}
        <StoryCircles />

        {/* Pull to Refresh */}
        <PullRefreshIndicator isRefreshing={isRefreshing} />

        {/* Content */}
        {error && posts.length === 0 ? (
          <ErrorState onRetry={handleRefresh} />
        ) : isLoading && posts.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyFeedState />
        ) : (
          <div className="space-y-4">
            {posts.map((post, idx) => (
              <PostCard key={post.id} post={post} index={idx} />
            ))}

            {/* Load more sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="flex items-center justify-center py-4">
                {isLoading && (
                  <motion.div
                    className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <CreatePostFAB onClick={() => setCreatePostOpen(true)} />

      {/* Create Post Modal */}
      <CreatePostModal open={createPostOpen} onOpenChange={setCreatePostOpen} />
    </>
  );
}
