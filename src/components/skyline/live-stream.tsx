'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Video, VideoOff, Mic, MicOff, Heart, Send, Eye, Crown,
  Gift, Users, X, Settings, Radio, MessageCircle, Share2,
  ArrowLeft, Sparkles, Flame, TrendingUp, Clock, Play, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLiveStreamStore, useGiftsStore, useAuthStore, useAppStore, formatCount } from '@/lib/store';
import type { LiveStream, LiveStreamComment, GiftType, Gift as GiftType_, User } from '@/types/skyline';
import { toast } from 'sonner';

// ============ Live Stream Card (for browsing) ============
interface LiveStreamCardProps {
  stream: LiveStream;
  onClick: (stream: LiveStream) => void;
}

export function LiveStreamCard({ stream, onClick }: LiveStreamCardProps) {
  return (
    <Card
      className="relative overflow-hidden cursor-pointer group hover:ring-2 hover:ring-red-500 transition-all"
      onClick={() => onClick(stream)}
    >
      <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 relative">
        {stream.thumbnailBase64 ? (
          <img src={stream.thumbnailBase64} alt={stream.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-12 h-12 text-gray-600" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <Badge variant="destructive" className="text-xs flex items-center gap-1 animate-pulse">
            <Radio className="w-3 h-3" /> LIVE
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs bg-black/60 text-white flex items-center gap-1">
            <Eye className="w-3 h-3" /> {formatCount(stream.viewerCount)}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="text-white text-sm font-medium truncate">{stream.title}</p>
        </div>
      </div>
      <div className="p-3 flex items-center gap-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src={stream.hostUser?.profileImage} />
          <AvatarFallback>{stream.hostUser?.nickname?.charAt(0) || 'H'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{stream.hostUser?.nickname || 'Host'}</p>
          <p className="text-xs text-gray-500 truncate">{stream.category}</p>
        </div>
        {stream.hostUser?.isVerified && (
          <Badge variant="default" className="text-[10px] bg-blue-500">✓</Badge>
        )}
      </div>
    </Card>
  );
}

// ============ Gift Shop Grid ============
interface GiftShopGridProps {
  giftTypes: GiftType[];
  userCoins: number;
  onSendGift: (giftTypeId: string, message?: string) => void;
}

export function GiftShopGrid({ giftTypes, userCoins, onSendGift }: GiftShopGridProps) {
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [giftMessage, setGiftMessage] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'الكل' },
    { value: 'basic', label: 'أساسي' },
    { value: 'premium', label: 'مميز' },
    { value: 'luxury', label: 'فاخر' },
    { value: 'exclusive', label: 'حصري' },
  ];

  const filteredGifts = filterCategory === 'all'
    ? giftTypes
    : giftTypes.filter(g => g.category === filterCategory);

  return (
    <div className="space-y-3">
      {/* Coins Balance */}
      <div className="flex items-center justify-between px-2">
        <span className="text-yellow-500 text-sm font-medium">🪙 رصيدك: {userCoins} عملة</span>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setFilterCategory(cat.value)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
              filterCategory === cat.value
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Gifts Grid */}
      <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
        {filteredGifts.map(gift => (
          <button
            key={gift.id}
            onClick={() => setSelectedGift(gift.id)}
            className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
              selectedGift === gift.id
                ? 'bg-yellow-500/20 ring-2 ring-yellow-500'
                : 'bg-gray-800 hover:bg-gray-700'
            } ${userCoins < gift.coinCost ? 'opacity-50' : ''}`}
          >
            <span className="text-2xl">{gift.emoji}</span>
            <span className="text-white text-[10px] truncate w-full text-center">{gift.nameAr || gift.name}</span>
            <span className="text-yellow-500 text-[10px]">🪙 {gift.coinCost}</span>
          </button>
        ))}
      </div>

      {/* Send Section */}
      {selectedGift && (
        <div className="space-y-2 border-t border-gray-700 pt-3">
          <Input
            placeholder="رسالة مع الهدية (اختياري)..."
            value={giftMessage}
            onChange={e => setGiftMessage(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white text-sm"
          />
          <Button
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            onClick={() => {
              onSendGift(selectedGift, giftMessage || undefined);
              setSelectedGift(null);
              setGiftMessage('');
            }}
          >
            <Gift className="w-4 h-4 mr-2" /> إرسال الهدية
          </Button>
        </div>
      )}
    </div>
  );
}

// ============ Live Stream Viewer (Full Screen) ============
interface LiveStreamViewerProps {
  stream: LiveStream;
  currentUser: User | null;
  onLeave: () => void;
}

export function LiveStreamViewer({ stream, currentUser, onLeave }: LiveStreamViewerProps) {
  const streamComments = useLiveStreamStore((s) => s.streamComments);
  const addComment = useLiveStreamStore((s) => s.addComment);
  const fetchComments = useLiveStreamStore((s) => s.fetchComments);
  const leaveStream = useLiveStreamStore((s) => s.leaveStream);
  const giftTypes = useGiftsStore((s) => s.giftTypes);
  const fetchGiftTypes = useGiftsStore((s) => s.fetchGiftTypes);
  const sendGift = useGiftsStore((s) => s.sendGift);

  const [newComment, setNewComment] = useState('');
  const [likeCount, setLikeCount] = useState(stream.likeCount);
  const [showGiftShop, setShowGiftShop] = useState(false);
  const [floatingGifts, setFloatingGifts] = useState<Array<{ id: string; emoji: string; senderName: string }>>([]);
  const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number }>>([]);
  const commentEndRef = useRef<HTMLDivElement>(null);
  const heartIdRef = useRef(0);

  // Load comments and gift types on mount
  useEffect(() => {
    fetchComments(stream.id);
    fetchGiftTypes();
  }, [stream.id, fetchComments, fetchGiftTypes]);

  useEffect(() => {
    commentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [streamComments]);

  const handleSendComment = useCallback(async () => {
    if (!newComment.trim() || !currentUser) return;
    await addComment(stream.id, newComment.trim());
    setNewComment('');
  }, [newComment, currentUser, stream.id, addComment]);

  const handleLike = useCallback(() => {
    setLikeCount(prev => prev + 1);
    const id = heartIdRef.current++;
    setFloatingHearts(prev => [...prev, { id }]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== id));
    }, 3000);
  }, []);

  const handleGiftSend = useCallback(async (giftTypeId: string, message?: string) => {
    const gift = giftTypes.find(g => g.id === giftTypeId);
    if (!gift || !currentUser) return;

    // Send gift via store
    const success = await sendGift({
      receiverUID: stream.hostUID,
      giftTypeId,
      message,
      liveStreamID: stream.id,
    });

    if (success) {
      const floatingGift = {
        id: `g_${Date.now()}`,
        emoji: gift.emoji,
        senderName: currentUser.nickname || currentUser.username,
      };
      setFloatingGifts(prev => [...prev, floatingGift]);
      setTimeout(() => {
        setFloatingGifts(prev => prev.filter(g => g.id !== floatingGift.id));
      }, 4000);
    }
  }, [giftTypes, currentUser, sendGift, stream.id, stream.hostUID]);

  const handleLeave = useCallback(async () => {
    await leaveStream(stream.id);
    onLeave();
  }, [leaveStream, stream.id, onLeave]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Stream Video Area */}
      <div className="relative flex-1 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        {/* Host Info Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
            <Avatar className="w-8 h-8 border-2 border-red-500">
              <AvatarImage src={stream.hostUser?.profileImage} />
              <AvatarFallback>{stream.hostUser?.nickname?.charAt(0) || 'H'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white text-sm font-medium">{stream.hostUser?.nickname || 'Host'}</p>
              <p className="text-gray-300 text-xs">{stream.hostUser?.followersCount || 0} followers</p>
            </div>
            <Badge variant="destructive" className="text-[10px] ml-2 animate-pulse">LIVE</Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-white" />
              <span className="text-white text-sm">{formatCount(stream.viewerCount)}</span>
            </div>
            <Button variant="ghost" size="icon" className="bg-black/50 text-white hover:bg-black/70" onClick={handleLeave}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Stream Title */}
        {stream.title && (
          <div className="absolute top-20 left-4 z-10">
            <p className="text-white text-lg font-bold drop-shadow-lg">{stream.title}</p>
            {stream.description && (
              <p className="text-gray-300 text-sm mt-1 drop-shadow-lg max-w-xs">{stream.description}</p>
            )}
          </div>
        )}

        {/* Live Stream Placeholder */}
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Radio className="w-12 h-12 text-red-500" />
          </div>
          <p className="text-white/50 text-sm">Live Stream Preview</p>
        </div>

        {/* Floating Hearts */}
        <div className="absolute right-4 bottom-40 flex flex-col items-center gap-2">
          {floatingHearts.map(heart => (
            <div
              key={heart.id}
              className="text-3xl animate-bounce"
              style={{
                animation: 'floatUp 3s ease-out forwards',
                opacity: 0,
              }}
            >
              ❤️
            </div>
          ))}
        </div>

        {/* Floating Gifts */}
        {floatingGifts.map(gift => (
          <div
            key={gift.id}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ animation: 'giftFloat 4s ease-out forwards' }}
          >
            <span className="text-6xl">{gift.emoji}</span>
            <span className="text-white text-sm font-medium mt-2">{gift.senderName}</span>
          </div>
        ))}
      </div>

      {/* Comments Section */}
      <div className="bg-black/90 backdrop-blur-sm">
        <div className="max-h-48 overflow-y-auto px-4 py-2 space-y-2">
          {streamComments.map(comment => (
            <div key={comment.id} className="flex items-start gap-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-[10px]">
                  {comment.user?.nickname?.charAt(0) || comment.userUID.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="text-xs text-gray-400">{comment.user?.nickname || comment.userUID.slice(0, 8)}</span>
                <p className="text-white text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
          <div ref={commentEndRef} />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 p-3 border-t border-gray-800">
          <Input
            placeholder="اكتب تعليقاً..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendComment()}
            className="flex-1 bg-gray-800 border-gray-700 text-white text-sm"
          />
          <Button size="icon" variant="ghost" onClick={handleSendComment} className="text-white">
            <Send className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleLike} className="text-red-500">
            <Heart className="w-5 h-5" />
          </Button>
          <Dialog open={showGiftShop} onOpenChange={setShowGiftShop}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="text-yellow-500">
                <Gift className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800 max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-white text-center">🎁 متجر الهدايا</DialogTitle>
              </DialogHeader>
              <GiftShopGrid
                giftTypes={giftTypes}
                userCoins={currentUser?.coinsBalance || 0}
                onSendGift={handleGiftSend}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-200px); opacity: 0; }
        }
        @keyframes giftFloat {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          20% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
          80% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -70%) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ============ Start Live Stream Dialog ============
interface StartLiveStreamProps {
  onStart: (params: { title: string; description: string; category: string }) => void;
  onClose: () => void;
}

export function StartLiveStreamDialog({ onStart, onClose }: StartLiveStreamProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');

  const categories = [
    { value: 'general', label: 'عام', icon: '🌐' },
    { value: 'gaming', label: 'ألعاب', icon: '🎮' },
    { value: 'music', label: 'موسيقى', icon: '🎵' },
    { value: 'talk', label: 'حوار', icon: '💬' },
    { value: 'education', label: 'تعليم', icon: '📚' },
    { value: 'cooking', label: 'طبخ', icon: '🍳' },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="text-center mb-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
          <Radio className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold">بدء البث المباشر</h2>
        <p className="text-gray-500 text-sm">ابدأ بثك المباشر وتواصل مع متابعيك</p>
      </div>

      <Input
        placeholder="عنوان البث..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="bg-gray-100"
      />

      <Input
        placeholder="وصف البث (اختياري)..."
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="bg-gray-100"
      />

      <div>
        <p className="text-sm font-medium mb-2">الفئة</p>
        <div className="grid grid-cols-3 gap-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`p-2 rounded-lg text-sm flex flex-col items-center gap-1 transition-all ${
                category === cat.value
                  ? 'bg-red-500 text-white ring-2 ring-red-500'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1 bg-red-500 hover:bg-red-600"
          onClick={() => onStart({ title, description, category })}
          disabled={!title.trim()}
        >
          <Radio className="w-4 h-4 mr-2" /> ابدأ البث
        </Button>
        <Button variant="outline" onClick={onClose}>إلغاء</Button>
      </div>
    </div>
  );
}

// ============ Live Streams Page (Browse) ============
export function LiveStreamsPage() {
  const liveStreams = useLiveStreamStore((s) => s.liveStreams);
  const currentStream = useLiveStreamStore((s) => s.currentStream);
  const fetchLiveStreams = useLiveStreamStore((s) => s.fetchLiveStreams);
  const createStream = useLiveStreamStore((s) => s.createStream);
  const joinStream = useLiveStreamStore((s) => s.joinStream);
  const isLoading = useLiveStreamStore((s) => s.isLoading);
  const giftTypes = useGiftsStore((s) => s.giftTypes);
  const fetchGiftTypes = useGiftsStore((s) => s.fetchGiftTypes);
  const user = useAuthStore((s) => s.user);

  const [showStartDialog, setShowStartDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('live');
  const [viewingStream, setViewingStream] = useState<LiveStream | null>(null);

  // Load streams on mount
  useEffect(() => {
    fetchLiveStreams();
    fetchGiftTypes();
  }, [fetchLiveStreams, fetchGiftTypes]);

  const handleStartStream = useCallback(async (params: { title: string; description: string; category: string }) => {
    const stream = await createStream(params);
    if (stream) {
      setViewingStream(stream);
      setShowStartDialog(false);
      toast.success('تم بدء البث المباشر!');
    } else {
      toast.error('فشل في بدء البث');
    }
  }, [createStream]);

  const handleJoinStream = useCallback(async (stream: LiveStream) => {
    await joinStream(stream.id);
    setViewingStream(stream);
  }, [joinStream]);

  const handleLeaveStream = useCallback(() => {
    setViewingStream(null);
  }, []);

  // If viewing a stream, show the viewer
  if (viewingStream) {
    return (
      <LiveStreamViewer
        stream={viewingStream}
        currentUser={user}
        onLeave={handleLeaveStream}
      />
    );
  }

  const scheduledStreams = liveStreams.filter(s => s.status === 'scheduled');
  const activeLiveStreams = liveStreams.filter(s => s.status === 'live');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Radio className="w-6 h-6 text-red-500" /> البث المباشر
          </h1>
          <Button
            className="bg-red-500 hover:bg-red-600"
            onClick={() => setShowStartDialog(true)}
          >
            <Video className="w-4 h-4 mr-2" /> ابدأ البث
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {isLoading && liveStreams.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Featured Live Stream */}
            {activeLiveStreams.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-500" /> البث الأكثر مشاهدة
                </h2>
                <Card
                  className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
                  onClick={() => handleJoinStream(activeLiveStreams[0])}
                >
                  <div className="aspect-video bg-gradient-to-br from-red-900 to-purple-900 relative">
                    <div className="absolute top-3 left-3">
                      <Badge variant="destructive" className="animate-pulse">
                        <Radio className="w-3 h-3 mr-1" /> LIVE
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-black/60 text-white">
                        <Eye className="w-3 h-3 mr-1" /> {formatCount(activeLiveStreams[0].viewerCount)}
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h3 className="text-white text-lg font-bold">{activeLiveStreams[0].title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={activeLiveStreams[0].hostUser?.profileImage} />
                          <AvatarFallback>{activeLiveStreams[0].hostUser?.nickname?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-white text-sm">{activeLiveStreams[0].hostUser?.nickname}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="live" className="flex-1">
                  <Radio className="w-4 h-4 mr-1" /> مباشر ({activeLiveStreams.length})
                </TabsTrigger>
                <TabsTrigger value="scheduled" className="flex-1">
                  <Clock className="w-4 h-4 mr-1" /> مجدول ({scheduledStreams.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="live">
                {activeLiveStreams.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600">لا يوجد بث مباشر حالياً</h3>
                    <p className="text-gray-400 text-sm mt-1">كن أول من يبدأ البث!</p>
                    <Button className="mt-4 bg-red-500 hover:bg-red-600" onClick={() => setShowStartDialog(true)}>
                      <Video className="w-4 h-4 mr-2" /> ابدأ البث الآن
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {activeLiveStreams.map(stream => (
                      <LiveStreamCard key={stream.id} stream={stream} onClick={handleJoinStream} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="scheduled">
                {scheduledStreams.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600">لا يوجد بث مجدول</h3>
                  </div>
                ) : (
                  <div className="space-y-3 mt-4">
                    {scheduledStreams.map(stream => (
                      <Card key={stream.id} className="p-4 flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={stream.hostUser?.profileImage} />
                          <AvatarFallback>{stream.hostUser?.nickname?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{stream.title}</p>
                          <p className="text-sm text-gray-500">{stream.hostUser?.nickname}</p>
                          {stream.scheduledAt && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" /> {new Date(stream.scheduledAt).toLocaleString('ar')}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                          <Clock className="w-3 h-3 mr-1" /> مجدول
                        </Badge>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Start Stream Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="sm:max-w-md">
          <StartLiveStreamDialog
            onStart={handleStartStream}
            onClose={() => setShowStartDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
