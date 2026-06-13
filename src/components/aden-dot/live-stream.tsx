'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { t, formatNumber } from '@/lib/i18n';
import { liveStreamService, giftsService } from '@/lib/supabase-service';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { LiveIcon, GiftIcon, VerifiedIcon } from '@/components/icons/aden-dot-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { GiftShopGrid, useGiftSend } from '@/components/aden-dot/animated-gifts';
import type { LiveStream, LiveStreamComment } from '@/types/skyline';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ============ Constants ============

const CATEGORIES = [
  { value: 'art', labelAr: 'فن', labelEn: 'Art' },
  { value: 'music', labelAr: 'موسيقى', labelEn: 'Music' },
  { value: 'talk', labelAr: 'حديث', labelEn: 'Talk' },
  { value: 'gaming', labelAr: 'ألعاب', labelEn: 'Gaming' },
  { value: 'education', labelAr: 'تعليم', labelEn: 'Education' },
  { value: 'cooking', labelAr: 'طبخ', labelEn: 'Cooking' },
  { value: 'travel', labelAr: 'سفر', labelEn: 'Travel' },
  { value: 'general', labelAr: 'عام', labelEn: 'General' },
] as const;

// ============ Heart Animation Type ============

interface FloatingHeart {
  id: number;
  x: number;
}

// ============ Skeleton Loader ============

function StreamCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-card border border-border">
      <Skeleton className="h-40 w-full" />
      <div className="p-3 flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
    </div>
  );
}

// ============ Live Stream Card ============

function LiveStreamCard({
  stream,
  onClick,
  lang,
}: {
  stream: LiveStream;
  onClick: () => void;
  lang: 'ar' | 'en';
}) {
  const colors = ['#EF4444', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

  return (
    <motion.button
      onClick={onClick}
      className="w-full rounded-2xl overflow-hidden bg-card border border-border text-left"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Thumbnail */}
      <div
        className="relative h-40"
        style={{
          background: `linear-gradient(135deg, var(--card), ${colors[Math.abs(hashCode(stream.id)) % colors.length]}20)`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <LiveIcon size={48} color="#EF4444" />
        </div>

        {/* Live badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-white">LIVE</span>
        </div>

        {/* Viewers */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm">
          <svg width={12} height={12} viewBox="0 0 24 24" fill="white">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
          <span className="text-[10px] text-white font-medium">
            {formatNumber(stream.viewerCount, lang)}
          </span>
        </div>

        {/* Category */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm">
          <span className="text-[10px] text-white/80 font-medium">
            {getCategoryLabel(stream.category, lang)}
          </span>
        </div>

        {/* Gifts total */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm">
          <GiftIcon size={12} color="var(--primary)" />
          <span className="text-[10px] font-medium text-primary">
            {formatNumber(stream.giftsCoinsTotal, lang)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex items-center gap-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Avatar className="w-10 h-10">
          {stream.hostUser?.profileImage && (
            <AvatarImage src={stream.hostUser.profileImage} alt={stream.hostUser?.nickname || ''} />
          )}
          <AvatarFallback className="bg-primary/10 text-primary">
            {stream.hostUser?.nickname?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-foreground truncate">
              {stream.hostUser?.nickname || stream.hostUser?.username || '...'}
            </span>
            {stream.hostUser?.isVerified && <VerifiedIcon size={12} />}
          </div>
          <p className="text-xs text-muted-foreground truncate">{stream.title}</p>
        </div>
      </div>
    </motion.button>
  );
}

// ============ Start Live Dialog ============

function StartLiveDialog({
  open,
  onOpenChange,
  lang,
  onStreamCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lang: 'ar' | 'en';
  onStreamCreated: (stream: LiveStream) => void;
}) {
  const user = useAppStore((s) => s.user);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [isCreating, setIsCreating] = useState(false);

  const handleStart = async () => {
    if (!user || !title.trim()) return;
    setIsCreating(true);
    try {
      const stream = await liveStreamService.createStream({
        hostUID: user.uid,
        title: title.trim(),
        category,
      });
      if (stream) {
        onStreamCreated(stream);
        setTitle('');
        setCategory('general');
        onOpenChange(false);
      }
    } catch (err) {
      console.error('[StartLive] Error creating stream:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={lang === 'ar' ? 'rtl' : 'ltr'} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LiveIcon size={20} color="#EF4444" />
            {t('live.startLive', lang)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Camera Preview Placeholder */}
          <div className="relative h-40 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #1a1a2e80, #16213e80)',
              }}
            />
            <div className="relative flex flex-col items-center gap-2">
              <LiveIcon size={40} color="#EF4444" />
              <span className="text-xs text-muted-foreground">
                {lang === 'ar' ? 'معاينة الكاميرا' : 'Camera Preview'}
              </span>
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {lang === 'ar' ? 'عنوان البث' : 'Stream Title'}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                lang === 'ar' ? 'أدخل عنوان البث...' : 'Enter stream title...'
              }
              maxLength={100}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {lang === 'ar' ? 'الفئة' : 'Category'}
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {lang === 'ar' ? cat.labelAr : cat.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            {t('app.cancel', lang)}
          </Button>
          <Button
            onClick={handleStart}
            disabled={!title.trim() || isCreating}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isCreating ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {lang === 'ar' ? 'جاري البدء...' : 'Starting...'}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LiveIcon size={16} color="white" />
                {t('live.startLive', lang)}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ Live Stream Viewer ============

function LiveStreamViewer({
  stream: initialStream,
  onBack,
}: {
  stream: LiveStream;
  onBack: () => void;
}) {
  const lang = useAppStore((s) => s.language);
  const user = useAppStore((s) => s.user);
  const [stream, setStream] = useState<LiveStream>(initialStream);
  const [viewerCount, setViewerCount] = useState(initialStream.viewerCount);
  const [likeCount, setLikeCount] = useState(initialStream.likeCount);
  const [chatMessage, setChatMessage] = useState('');
  const [comments, setComments] = useState<LiveStreamComment[]>([]);
  const [showGiftSheet, setShowGiftSheet] = useState(false);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [giftNotification, setGiftNotification] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { sendGift, activeGift, senderName, showAnimation, complete } = useGiftSend();

  // Load initial comments
  useEffect(() => {
    let cancelled = false;
    liveStreamService.getStreamComments(initialStream.id).then((msgs) => {
      if (!cancelled) setComments(msgs);
    });
    return () => {
      cancelled = true;
    };
  }, [initialStream.id]);

  // Join stream and subscribe to realtime
  useEffect(() => {
    if (user) {
      liveStreamService.joinStream(initialStream.id, user.uid).catch(() => {});
    }

    const channel = liveStreamService.subscribeToStream(initialStream.id, {
      onComment: (comment) => {
        setComments((prev) => [...prev, comment]);
      },
      onViewerUpdate: (count) => {
        setViewerCount(count);
      },
      onGift: (gift) => {
        setGiftNotification(
          lang === 'ar'
            ? `🎁 هدية جديدة من ${gift.senderUID}!`
            : `🎁 New gift from ${gift.senderUID}!`
        );
        setTimeout(() => setGiftNotification(null), 3000);
        // Update stream gifts total from realtime
        setStream((prev) => ({
          ...prev,
          giftsCoinsTotal: prev.giftsCoinsTotal + (gift.quantity || 0),
        }));
      },
      onEnd: () => {
        onBack();
      },
    });

    if (channel) {
      channelRef.current = channel;
    }

    // Also subscribe to like count changes via the stream update
    const client = getSupabaseBrowser();
    let likesChannel: RealtimeChannel | null = null;
    if (client) {
      likesChannel = client
        .channel(`live_likes:${initialStream.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'live_streams',
            filter: `id=eq.${initialStream.id}`,
          },
          (payload) => {
            const row = payload.new as Record<string, unknown>;
            if (typeof row.like_count === 'number') {
              setLikeCount(row.like_count as number);
            }
            if (typeof row.gifts_coins_total === 'number') {
              setStream((prev) => ({
                ...prev,
                giftsCoinsTotal: row.gifts_coins_total as number,
              }));
            }
          }
        )
        .subscribe();
    }

    // Presence channel for viewer tracking
    let presenceChannel: RealtimeChannel | null = null;
    if (client && user) {
      presenceChannel = client
        .channel(`presence:${initialStream.id}`)
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel?.presenceState();
          if (state) {
            const count = Object.keys(state).length;
            if (count > 0) setViewerCount(count);
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED' && user) {
            await presenceChannel?.track({
              uid: user.uid,
              nickname: user.nickname,
              online_at: Date.now(),
            });
          }
        });
    }

    return () => {
      // Leave stream
      if (user) {
        liveStreamService.leaveStream(initialStream.id, user.uid).catch(() => {});
      }
      // Unsubscribe
      if (channelRef.current) {
        liveStreamService.unsubscribeFromStream(channelRef.current);
      }
      if (likesChannel && client) {
        client.removeChannel(likesChannel);
      }
      if (presenceChannel && client) {
        client.removeChannel(presenceChannel);
      }
    };
  }, [initialStream.id, user, lang, onBack]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  // Handle like
  const handleLike = useCallback(() => {
    setLikeCount((prev) => prev + 1);
    const id = Date.now();
    const x = 20 + Math.random() * 60;
    setHearts((prev) => [...prev, { id, x }]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
    }, 2500);
    liveStreamService.likeStream(initialStream.id).catch(() => {});
  }, [initialStream.id]);

  // Handle send chat
  const handleSendChat = useCallback(async () => {
    if (!chatMessage.trim() || !user) return;
    const msg = chatMessage.trim();
    setChatMessage('');
    await liveStreamService.addStreamComment(initialStream.id, user.uid, msg);
  }, [chatMessage, user, initialStream.id]);

  // Handle gift
  const handleGiftBuy = useCallback(
    async (gift: Parameters<typeof sendGift>[0]) => {
      if (!user) return;
      sendGift(gift, user.nickname || user.username);
      // Send gift via service which also updates gifts_coins_total
      await giftsService.sendGift({
        senderUID: user.uid,
        receiverUID: initialStream.hostUID,
        giftTypeId: gift.id,
        liveStreamID: initialStream.id,
      });
      setShowGiftSheet(false);
    },
    [user, initialStream.id, initialStream.hostUID, sendGift]
  );

  // Handle share
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: stream.title,
        text: `${lang === 'ar' ? 'شاهد البث المباشر' : 'Watch live stream'}: ${stream.title}`,
        url: window.location.href,
      });
    }
  }, [stream.title, lang]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Video area placeholder */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #1a1a2e80, #000)' }}
      >
        <LiveIcon size={64} color="#EF4444" />
      </div>

      {/* Gift animation overlay */}
      <AnimatePresence>
        {showAnimation && activeGift && (
          <motion.div
            key="gift-anim"
            className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onAnimationComplete={complete}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="animate-bounce">{activeGift.svgRenderer(96)}</div>
              <span className="text-white text-sm font-bold drop-shadow-lg">
                {senderName}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gift notification */}
      <AnimatePresence>
        {giftNotification && (
          <motion.div
            key="gift-notif"
            className="absolute top-20 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-yellow-500/90 backdrop-blur-sm text-white text-sm font-bold shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {giftNotification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col justify-between">
        {/* Top bar */}
        <div
          className="flex items-center justify-between p-3"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.6), transparent)',
          }}
        >
          <button onClick={onBack} className="p-2" aria-label={t('app.back', lang)}>
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {/* Viewer count */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-white font-medium">
                {formatNumber(viewerCount, lang)}
              </span>
            </div>
            {/* Like count */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm">
              <svg width={12} height={12} viewBox="0 0 24 24" fill="#EF4444">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              <span className="text-xs text-white font-medium">
                {formatNumber(likeCount, lang)}
              </span>
            </div>
            {/* Host info */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
              <Avatar className="w-7 h-7">
                {stream.hostUser?.profileImage && (
                  <AvatarImage
                    src={stream.hostUser.profileImage}
                    alt={stream.hostUser?.nickname || ''}
                  />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                  {stream.hostUser?.nickname?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-white font-medium max-w-[80px] truncate">
                {stream.hostUser?.nickname || '...'}
              </span>
              {stream.hostUser?.isVerified && <VerifiedIcon size={10} />}
            </div>
          </div>
        </div>

        {/* Stream title */}
        <AnimatePresence>
          <motion.div
            className="absolute top-14 left-3 right-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-white text-sm font-medium drop-shadow-md truncate">
              {stream.title}
            </p>
            <p className="text-white/60 text-xs drop-shadow-md">
              {getCategoryLabel(stream.category, lang)}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Bottom area */}
        <div
          className="p-3 space-y-3"
          style={{
            background: 'linear-gradient(0deg, rgba(0,0,0,0.6), transparent)',
          }}
        >
          {/* Chat messages area */}
          <div className="max-h-32 overflow-y-auto space-y-1 scrollbar-thin">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-center gap-2">
                <span className="text-xs font-medium text-primary truncate max-w-[80px]">
                  {comment.user?.nickname || comment.userUID.slice(0, 6)}:
                </span>
                <span className="text-xs text-gray-300 truncate">
                  {comment.content}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input and actions */}
          <div className="flex items-center gap-2">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChat();
                }
              }}
              placeholder={t('live.commentLive', lang)}
              className="flex-1 h-9 rounded-full bg-white/10 border-white/10 text-white placeholder:text-gray-500 text-sm"
              style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
            />
            <motion.button
              onClick={handleLike}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-red-500/20"
              whileTap={{ scale: 1.3 }}
              aria-label={t('live.likeStream', lang)}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="#EF4444">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </motion.button>
            <button
              onClick={() => setShowGiftSheet(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-primary/20"
              aria-label={t('live.sendGift', lang)}
            >
              <GiftIcon size={18} color="var(--primary)" />
            </button>
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10"
              aria-label={t('post.share', lang)}
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Floating hearts */}
      <div className="absolute bottom-24 right-4 pointer-events-none z-10">
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            className="absolute"
            style={{ left: `${heart.x}%` }}
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -250, scale: 1.5 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="#EF4444">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Gift Sheet */}
      <Sheet open={showGiftSheet} onOpenChange={setShowGiftSheet}>
        <SheetContent
          side="bottom"
          className="h-[70vh] rounded-t-2xl bg-gray-950 border-t border-white/10 p-0"
        >
          <SheetHeader className="px-4 pt-4">
            <SheetTitle className="text-white">
              {t('live.sendGift', lang)}
            </SheetTitle>
          </SheetHeader>
          <div className="h-[calc(70vh-60px)] overflow-y-auto">
            <GiftShopGrid
              onBuy={handleGiftBuy}
              balance={user?.coinsBalance || 0}
              lang={lang}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ============ Host Live View ============

function HostLiveView({
  stream: initialStream,
  onEnd,
}: {
  stream: LiveStream;
  onEnd: () => void;
}) {
  const lang = useAppStore((s) => s.language);
  const user = useAppStore((s) => s.user);
  const [stream, setStream] = useState<LiveStream>(initialStream);
  const [viewerCount, setViewerCount] = useState(initialStream.viewerCount);
  const [comments, setComments] = useState<LiveStreamComment[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [giftNotification, setGiftNotification] = useState<string | null>(null);
  const [isEnding, setIsEnding] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Timer
  useEffect(() => {
    const startTime = initialStream.startedAt || Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [initialStream.startedAt]);

  // Load initial comments
  useEffect(() => {
    let cancelled = false;
    liveStreamService.getStreamComments(initialStream.id).then((msgs) => {
      if (!cancelled) setComments(msgs);
    });
    return () => {
      cancelled = true;
    };
  }, [initialStream.id]);

  // Subscribe to realtime
  useEffect(() => {
    const channel = liveStreamService.subscribeToStream(initialStream.id, {
      onComment: (comment) => {
        setComments((prev) => [...prev, comment]);
      },
      onViewerUpdate: (count) => {
        setViewerCount(count);
      },
      onGift: (gift) => {
        setGiftNotification(
          lang === 'ar'
            ? `🎁 هدية من ${gift.senderUID}!`
            : `🎁 Gift from ${gift.senderUID}!`
        );
        setTimeout(() => setGiftNotification(null), 3000);
        setStream((prev) => ({
          ...prev,
          giftsCoinsTotal: prev.giftsCoinsTotal + (gift.quantity || 0),
        }));
      },
    });

    if (channel) {
      channelRef.current = channel;
    }

    return () => {
      if (channelRef.current) {
        liveStreamService.unsubscribeFromStream(channelRef.current);
      }
    };
  }, [initialStream.id, lang]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  // Handle end stream
  const handleEndStream = async () => {
    setIsEnding(true);
    try {
      const success = await liveStreamService.endStream(initialStream.id);
      if (success) {
        onEnd();
      }
    } catch (err) {
      console.error('[HostLive] Error ending stream:', err);
    } finally {
      setIsEnding(false);
    }
  };

  // Handle send chat (host can also chat)
  const handleSendChat = async () => {
    if (!chatMessage.trim() || !user) return;
    const msg = chatMessage.trim();
    setChatMessage('');
    await liveStreamService.addStreamComment(initialStream.id, user.uid, msg);
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Video area placeholder */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #1a1a2e80, #000)' }}
      >
        {cameraOn ? (
          <LiveIcon size={64} color="#EF4444" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg
              width={64}
              height={64}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#666"
              strokeWidth="1.5"
            >
              <path d="M1 1l22 22M17 5.5A5 5 0 0012.5.5M12 17a5 5 0 005-5V7m-5 10a5 5 0 01-5-5V7m5 10v3m-4 0h8" />
            </svg>
            <span className="text-xs text-gray-500">
              {lang === 'ar' ? 'الكاميرا مغلقة' : 'Camera off'}
            </span>
          </div>
        )}
      </div>

      {/* Gift notification */}
      <AnimatePresence>
        {giftNotification && (
          <motion.div
            key="host-gift-notif"
            className="absolute top-20 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-yellow-500/90 backdrop-blur-sm text-white text-sm font-bold shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {giftNotification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col justify-between">
        {/* Top bar */}
        <div
          className="flex items-center justify-between p-3"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.6), transparent)',
          }}
        >
          <div className="flex items-center gap-2">
            {/* Live badge + timer */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-xs text-white font-bold">LIVE</span>
              <span className="text-xs text-white/80 font-mono ml-1">
                {formatDuration(elapsed)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Viewers */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm">
              <svg width={12} height={12} viewBox="0 0 24 24" fill="white">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
              <span className="text-xs text-white font-medium">
                {formatNumber(viewerCount, lang)}
              </span>
            </div>
            {/* Gifts total */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm">
              <GiftIcon size={12} color="var(--primary)" />
              <span className="text-xs font-medium text-primary">
                {formatNumber(stream.giftsCoinsTotal, lang)}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom area */}
        <div
          className="p-3 space-y-3"
          style={{
            background: 'linear-gradient(0deg, rgba(0,0,0,0.6), transparent)',
          }}
        >
          {/* Chat messages */}
          <div className="max-h-32 overflow-y-auto space-y-1 scrollbar-thin">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-center gap-2">
                <span className="text-xs font-medium text-primary truncate max-w-[80px]">
                  {comment.user?.nickname || comment.userUID.slice(0, 6)}:
                </span>
                <span className="text-xs text-gray-300 truncate">
                  {comment.content}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input and controls */}
          <div className="flex items-center gap-2">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChat();
                }
              }}
              placeholder={t('live.commentLive', lang)}
              className="flex-1 h-9 rounded-full bg-white/10 border-white/10 text-white placeholder:text-gray-500 text-sm"
              style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
            />
            {/* Camera toggle */}
            <button
              onClick={() => setCameraOn((p) => !p)}
              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                cameraOn ? 'bg-white/10' : 'bg-red-500/30'
              }`}
              aria-label={lang === 'ar' ? 'تبديل الكاميرا' : 'Toggle camera'}
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </button>
            {/* Mic toggle */}
            <button
              onClick={() => setMicOn((p) => !p)}
              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                micOn ? 'bg-white/10' : 'bg-red-500/30'
              }`}
              aria-label={lang === 'ar' ? 'تبديل الميكروفون' : 'Toggle mic'}
            >
              {micOn ? (
                <svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              ) : (
                <svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
                  <path d="M17 16.95A7 7 0 015 12v-2m14 0v2c0 .87-.16 1.71-.46 2.49" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
            </button>
            {/* End stream */}
            <Button
              onClick={handleEndStream}
              disabled={isEnding}
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white rounded-full px-4 h-9"
            >
              {isEnding ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t('live.endLive', lang)
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Live Streams List ============

function LiveStreamList({
  onSelectStream,
  onStartLive,
}: {
  onSelectStream: (stream: LiveStream) => void;
  onStartLive: () => void;
}) {
  const lang = useAppStore((s) => s.language);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const streamsChannelRef = useRef<RealtimeChannel | null>(null);

  // Load streams
  const loadStreams = useCallback(async () => {
    try {
      const data = await liveStreamService.getLiveStreams();
      setStreams(data);
    } catch (err) {
      console.error('[LiveStreamList] Error loading streams:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStreams();
  }, [loadStreams]);

  // Realtime subscription for new streams
  useEffect(() => {
    const client = getSupabaseBrowser();
    if (!client) return;

    const channel = client
      .channel('live_streams_list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_streams',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // New stream started - reload to get with host relation
            loadStreams();
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new as Record<string, unknown>;
            if (row.status === 'ended') {
              // Remove ended stream from list
              setStreams((prev) => prev.filter((s) => s.id !== row.id));
            } else {
              // Update counts
              setStreams((prev) =>
                prev.map((s) =>
                  s.id === row.id
                    ? {
                        ...s,
                        viewerCount:
                          typeof row.viewer_count === 'number'
                            ? row.viewer_count
                            : s.viewerCount,
                        likeCount:
                          typeof row.like_count === 'number'
                            ? row.like_count
                            : s.likeCount,
                        giftsCoinsTotal:
                          typeof row.gifts_coins_total === 'number'
                            ? row.gifts_coins_total
                            : s.giftsCoinsTotal,
                      }
                    : s
                )
              );
            }
          } else if (payload.eventType === 'DELETE') {
            const row = payload.old as Record<string, unknown>;
            setStreams((prev) => prev.filter((s) => s.id !== row.id));
          }
        }
      )
      .subscribe();

    streamsChannelRef.current = channel;

    return () => {
      if (streamsChannelRef.current && client) {
        client.removeChannel(streamsChannelRef.current);
      }
    };
  }, [loadStreams]);

  // Pull to refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadStreams();
  };

  return (
    <div className="space-y-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">
          {t('live.liveNow', lang)}
        </h2>
        <div className="flex items-center gap-2">
          {/* Refresh */}
          <motion.button
            onClick={handleRefresh}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-muted"
            whileTap={{ scale: 0.9, rotate: 180 }}
            disabled={isRefreshing}
            aria-label={lang === 'ar' ? 'تحديث' : 'Refresh'}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={isRefreshing ? 'animate-spin' : ''}
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" />
            </svg>
          </motion.button>
          {/* Start Live */}
          <motion.button
            onClick={onStartLive}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-red-500 text-white"
            whileTap={{ scale: 0.95 }}
          >
            <LiveIcon size={16} color="white" />
            {t('live.startLive', lang)}
          </motion.button>
        </div>
      </div>

      {/* Loading skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <StreamCardSkeleton key={i} />
          ))}
        </div>
      ) : streams.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-red-500/10">
            <LiveIcon size={40} color="#EF4444" />
          </div>
          <p className="text-base font-medium text-foreground mb-1">
            {t('live.noLiveStreams', lang)}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {lang === 'ar'
              ? 'ابدأ بثك المباشر الآن!'
              : 'Start your live stream now!'}
          </p>
          <motion.button
            onClick={onStartLive}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-red-500 text-white"
            whileTap={{ scale: 0.95 }}
          >
            <LiveIcon size={18} color="white" />
            {t('live.startLive', lang)}
          </motion.button>
        </div>
      ) : (
        /* Streams grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {streams.map((stream, idx) => (
            <motion.div
              key={stream.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <LiveStreamCard
                stream={stream}
                onClick={() => onSelectStream(stream)}
                lang={lang}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ Main Page Export ============

export function LiveStreamsPage() {
  const user = useAppStore((s) => s.user);
  const lang = useAppStore((s) => s.language);
  const [view, setView] = useState<'list' | 'viewer' | 'host'>('list');
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [hostingStream, setHostingStream] = useState<LiveStream | null>(null);
  const [startDialogOpen, setStartDialogOpen] = useState(false);

  // Handle selecting a stream to view
  const handleSelectStream = (stream: LiveStream) => {
    setSelectedStream(stream);
    setView('viewer');
  };

  // Handle starting a live (open dialog)
  const handleStartLive = () => {
    setStartDialogOpen(true);
  };

  // Handle stream created from dialog
  const handleStreamCreated = (stream: LiveStream) => {
    setHostingStream(stream);
    setView('host');
  };

  // Handle ending hosted stream
  const handleEndHostStream = () => {
    setHostingStream(null);
    setView('list');
  };

  // Handle leaving viewer
  const handleLeaveViewer = () => {
    setSelectedStream(null);
    setView('list');
  };

  // Render current view
  if (view === 'host' && hostingStream) {
    return <HostLiveView stream={hostingStream} onEnd={handleEndHostStream} />;
  }

  if (view === 'viewer' && selectedStream) {
    return (
      <LiveStreamViewer stream={selectedStream} onBack={handleLeaveViewer} />
    );
  }

  return (
    <>
      <LiveStreamList
        onSelectStream={handleSelectStream}
        onStartLive={handleStartLive}
      />
      {user && (
        <StartLiveDialog
          open={startDialogOpen}
          onOpenChange={setStartDialogOpen}
          lang={lang}
          onStreamCreated={handleStreamCreated}
        />
      )}
    </>
  );
}

// ============ Utility Functions ============

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

function getCategoryLabel(category: string, lang: 'ar' | 'en'): string {
  const cat = CATEGORIES.find((c) => c.value === category);
  if (!cat) return category;
  return lang === 'ar' ? cat.labelAr : cat.labelEn;
}
