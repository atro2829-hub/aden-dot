'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { t, formatNumber } from '@/lib/i18n';
import { LiveIcon, GiftIcon, CoinIcon, VerifiedIcon, OnlineIcon } from '@/components/icons/aden-dot-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import type { LiveStream } from '@/types/skyline';

const GOLD = '#D4A853';
const NAVY = '#1A1F36';

const demoStreams: LiveStream[] = [
  {
    id: '1',
    hostUID: '1',
    hostUser: { uid: '1', email: '', username: 'ahmed', nickname: 'أحمد الفنان', bio: '', gender: 'male', profileImage: '', coverImage: '', status: 'online', role: 'user', isVerified: true, isPremium: true, region: '', followersCount: 12000, followingCount: 200, postsCount: 80, level: 35, xp: 25000, popularity: 10000, giftsCount: 500, subscribers: 300, coinsBalance: 50000, diamondsBalance: 5000, isProfileComplete: true, isEmailVerified: true, joinDate: '', lastSeen: Date.now() },
    title: '🎨 رسم مباشر - فن عربي',
    description: '',
    thumbnailBase64: '',
    category: 'art',
    viewerCount: 1250,
    peakViewerCount: 2000,
    likeCount: 5000,
    giftsCoinsTotal: 15000,
    status: 'live',
    isRecording: false,
    recordingUrl: '',
    startedAt: Date.now() - 3600000,
  },
  {
    id: '2',
    hostUID: '2',
    hostUser: { uid: '2', email: '', username: 'sara', nickname: 'سارة المطربة', bio: '', gender: 'female', profileImage: '', coverImage: '', status: 'online', role: 'user', isVerified: true, isPremium: false, region: '', followersCount: 8000, followingCount: 150, postsCount: 60, level: 28, xp: 18000, popularity: 7000, giftsCount: 300, subscribers: 200, coinsBalance: 30000, diamondsBalance: 3000, isProfileComplete: true, isEmailVerified: true, joinDate: '', lastSeen: Date.now() },
    title: '🎵 غناء مباشر - أغاني عربية',
    description: '',
    thumbnailBase64: '',
    category: 'music',
    viewerCount: 890,
    peakViewerCount: 1500,
    likeCount: 3500,
    giftsCoinsTotal: 10000,
    status: 'live',
    isRecording: false,
    recordingUrl: '',
    startedAt: Date.now() - 1800000,
  },
];

// ============ Live Stream Card ============
function LiveStreamCard({ stream, onClick, lang }: { stream: LiveStream; onClick: () => void; lang: 'ar' | 'en' }) {
  const colors = ['#EF4444', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

  return (
    <motion.button
      onClick={onClick}
      className="w-full rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,168,83,0.08)' }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Thumbnail */}
      <div className="relative h-40" style={{ background: `linear-gradient(135deg, ${NAVY}, ${colors[Number(stream.id) % colors.length]}30)` }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <LiveIcon size={48} color="#EF4444" />
        </div>

        {/* Live badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-white">LIVE</span>
        </div>

        {/* Viewers */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="white">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
          <span className="text-[10px] text-white font-medium">{formatNumber(stream.viewerCount, lang)}</span>
        </div>

        {/* Gifts total */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <GiftIcon size={12} color={GOLD} />
          <span className="text-[10px] font-medium" style={{ color: GOLD }}>{formatNumber(stream.giftsCoinsTotal, lang)}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback style={{ background: `${GOLD}20`, color: GOLD }}>
            {stream.hostUser?.nickname?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-white">{stream.hostUser?.nickname}</span>
            {stream.hostUser?.isVerified && <VerifiedIcon size={12} />}
          </div>
          <p className="text-xs text-gray-500 truncate">{stream.title}</p>
        </div>
      </div>
    </motion.button>
  );
}

// ============ Live Stream Viewer ============
function LiveStreamViewer({ stream, onBack }: { stream: LiveStream; onBack: () => void }) {
  const lang = useAppStore((s) => s.language);
  const [chatMessage, setChatMessage] = useState('');
  const [viewerCount, setViewerCount] = useState(stream.viewerCount);
  const [likeCount, setLikeCount] = useState(stream.likeCount);
  const [showHearts, setShowHearts] = useState<{ id: number; x: number }[]>([]);

  // Simulate viewer count
  React.useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLike = () => {
    setLikeCount((prev) => prev + 1);
    const id = Date.now();
    const x = 30 + Math.random() * 40;
    setShowHearts((prev) => [...prev, { id, x }]);
    setTimeout(() => {
      setShowHearts((prev) => prev.filter((h) => h.id !== id));
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50" style={{ background: '#000' }}>
      {/* Video area placeholder */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: `linear-gradient(180deg, ${NAVY}80, #000)` }}>
        <LiveIcon size={64} color="#EF4444" />
      </div>

      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col justify-between">
        {/* Top bar */}
        <div className="flex items-center justify-between p-3" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.6), transparent)' }}>
          <button onClick={onBack} className="p-2">
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {/* Viewer count with pulse */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-white font-medium">{formatNumber(viewerCount, lang)}</span>
            </div>
            {/* Host info */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <Avatar className="w-7 h-7">
                <AvatarFallback style={{ background: `${GOLD}20`, color: GOLD }} className="text-[10px]">
                  {stream.hostUser?.nickname?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-white font-medium">{stream.hostUser?.nickname}</span>
              {stream.hostUser?.isVerified && <VerifiedIcon size={10} />}
            </div>
          </div>
        </div>

        {/* Bottom area */}
        <div className="p-3 space-y-3" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.6), transparent)' }}>
          {/* Chat messages area */}
          <div className="max-h-32 overflow-y-auto space-y-1">
            {[
              { user: 'محمد', msg: 'مرحباً 👋' },
              { user: 'فاطمة', msg: 'رائع جداً! 🌟' },
              { user: 'عبدالله', msg: 'أحسنت يا أستاذ 💪' },
            ].map((chat, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-medium" style={{ color: GOLD }}>{chat.user}:</span>
                <span className="text-xs text-gray-300">{chat.msg}</span>
              </div>
            ))}
          </div>

          {/* Input and actions */}
          <div className="flex items-center gap-2">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder={t('live.commentLive', lang)}
              className="flex-1 h-9 rounded-full bg-white/10 border-white/10 text-white placeholder:text-gray-500 text-sm"
              style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
            />
            <motion.button
              onClick={handleLike}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.2)' }}
              whileTap={{ scale: 1.3 }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="#EF4444">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </motion.button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${GOLD}20` }}>
              <GiftIcon size={18} color={GOLD} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating hearts */}
      <div className="absolute bottom-24 right-4 pointer-events-none">
        {showHearts.map((heart) => (
          <motion.div
            key={heart.id}
            className="absolute"
            style={{ left: `${heart.x}%` }}
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -200, scale: 1.5 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="#EF4444">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============ Live Streams Page ============
export function LiveStreamsPage() {
  const lang = useAppStore((s) => s.language);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);

  if (selectedStream) {
    return <LiveStreamViewer stream={selectedStream} onBack={() => setSelectedStream(null)} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">{t('live.liveNow', lang)}</h2>
        <motion.button
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: 'white' }}
          whileTap={{ scale: 0.95 }}
        >
          <LiveIcon size={16} color="white" />
          {t('live.startLive', lang)}
        </motion.button>
      </div>

      {/* Streams */}
      {demoStreams.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: '#EF444415' }}>
            <LiveIcon size={32} color="#EF4444" />
          </div>
          <p className="text-sm text-gray-500">{t('live.noLiveStreams', lang)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {demoStreams.map((stream, idx) => (
            <motion.div
              key={stream.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <LiveStreamCard stream={stream} onClick={() => setSelectedStream(stream)} lang={lang} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
