'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Gift, Star, Crown, Diamond, Coins, Sparkles, Heart, Send,
  ChevronRight, TrendingUp, Award, ArrowLeft, ShoppingBag,
  Wallet, Plus, Check, Flame, Zap, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useWalletStore, useAchievementStore, useAuthStore, useGiftsStore, formatCount } from '@/lib/store';
import type { GiftType, Gift as GiftType_, User, Wallet as WalletType, Transaction, Achievement, UserAchievement, DailyReward } from '@/types/skyline';
import { toast } from 'sonner';

// ============ Gift Animation Overlay ============
interface GiftAnimationProps {
  gift: GiftType;
  senderName: string;
  onAnimationEnd: () => void;
}

export function GiftAnimationOverlay({ gift, senderName, onAnimationEnd }: GiftAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(onAnimationEnd, 4000);
    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  const animationClass = {
    float: 'animate-bounce',
    burst: 'animate-ping',
    rain: 'animate-pulse',
    firework: 'animate-spin',
    heart_rain: 'animate-bounce',
  }[gift.animationType] || 'animate-bounce';

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
      <div className="flex flex-col items-center" style={{ animation: 'giftAppear 4s ease-out forwards' }}>
        <span className="text-8xl mb-4">{gift.emoji}</span>
        <div className="bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
          <Gift className="w-4 h-4 text-yellow-500" />
          <span className="text-white font-medium">{senderName}</span>
          <span className="text-yellow-500">أرسل</span>
          <span className="text-white">{gift.nameAr || gift.name}</span>
        </div>
        {gift.animationType === 'firework' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className="absolute text-2xl"
                style={{
                  transform: `rotate(${i * 30}deg) translateY(-80px)`,
                  animation: `firework 1s ease-out ${i * 0.1}s forwards`,
                }}
              >
                ✨
              </span>
            ))}
          </div>
        )}
        {gift.animationType === 'rain' && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <span
                key={i}
                className="absolute text-3xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 20}%`,
                  animation: `rain 2s ease-in ${Math.random() * 2}s infinite`,
                }}
              >
                {gift.emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ Wallet Page ============
export function WalletPage() {
  const wallet = useWalletStore((s) => s.wallet);
  const transactions = useWalletStore((s) => s.transactions);
  const fetchWallet = useWalletStore((s) => s.fetchWallet);
  const fetchTransactions = useWalletStore((s) => s.fetchTransactions);
  const purchaseCoins = useWalletStore((s) => s.purchaseCoins);
  const isLoading = useWalletStore((s) => s.isLoading);
  const [showPurchase, setShowPurchase] = useState(false);

  // Load wallet data on mount
  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, [fetchWallet, fetchTransactions]);

  const handlePurchaseCoins = useCallback(async (amount: number) => {
    const success = await purchaseCoins(amount, `purchase_${Date.now()}`);
    if (success) {
      toast.success(`تم شراء ${amount} عملة بنجاح!`);
      setShowPurchase(false);
    } else {
      toast.error('فشل في شراء العملات');
    }
  }, [purchaseCoins]);

  const coinPackages = [
    { coins: 100, price: '$0.99', bonus: 0, popular: false },
    { coins: 500, price: '$4.49', bonus: 50, popular: false },
    { coins: 1000, price: '$8.99', bonus: 150, popular: true },
    { coins: 5000, price: '$39.99', bonus: 1000, popular: false },
    { coins: 10000, price: '$74.99', bonus: 2500, popular: false },
  ];

  if (isLoading && !wallet) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-5 h-5" />
            <span className="text-sm opacity-90">العملات</span>
          </div>
          <p className="text-3xl font-bold">{wallet?.coinsBalance || 0}</p>
          <p className="text-xs opacity-75 mt-1">إجمالي مكتسب: {wallet?.totalCoinsEarned || 0}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-400 to-purple-500 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Diamond className="w-5 h-5" />
            <span className="text-sm opacity-90">الألماس</span>
          </div>
          <p className="text-3xl font-bold">{wallet?.diamondsBalance || 0}</p>
          <p className="text-xs opacity-75 mt-1">إجمالي مكتسب: {wallet?.totalDiamondsEarned || 0}</p>
        </Card>
      </div>

      {/* Purchase Button */}
      <Button
        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-lg py-6"
        onClick={() => setShowPurchase(true)}
      >
        <Plus className="w-5 h-5 mr-2" /> شراء عملات
      </Button>

      {/* Coin Packages */}
      <Dialog open={showPurchase} onOpenChange={setShowPurchase}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">🪙 شراء عملات</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {coinPackages.map(pkg => (
              <button
                key={pkg.coins}
                onClick={() => handlePurchaseCoins(pkg.coins)}
                className="w-full p-3 rounded-lg border-2 hover:border-yellow-500 transition-all flex items-center justify-between bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{pkg.coins} عملة</p>
                    {pkg.bonus > 0 && (
                      <p className="text-xs text-green-600">+ {pkg.bonus} مكافأة!</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{pkg.price}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Transactions History */}
      <div>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> سجل المعاملات
        </h3>
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              <Wallet className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>لا توجد معاملات بعد</p>
            </Card>
          ) : (
            transactions.map(tx => (
              <Card key={tx.id} className="p-3 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'gift_receive' || tx.type === 'earn' || tx.type === 'bonus' || tx.type === 'purchase'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                }`}>
                  {tx.type === 'gift_send' ? <Gift className="w-5 h-5" /> :
                   tx.type === 'gift_receive' ? <Heart className="w-5 h-5" /> :
                   tx.type === 'purchase' ? <ShoppingBag className="w-5 h-5" /> :
                   <Coins className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.createdAt).toLocaleDateString('ar')}
                  </p>
                </div>
                <div className={`font-bold text-sm ${
                  tx.type === 'gift_receive' || tx.type === 'earn' || tx.type === 'bonus' || tx.type === 'purchase'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {tx.type === 'gift_receive' || tx.type === 'earn' || tx.type === 'bonus' || tx.type === 'purchase' ? '+' : '-'}
                  {tx.amount} {tx.currency === 'coins' ? '🪙' : '💎'}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============ Achievements Page ============
export function AchievementsPage() {
  const achievements = useAchievementStore((s) => s.achievements);
  const userAchievements = useAchievementStore((s) => s.userAchievements);
  const fetchAchievements = useAchievementStore((s) => s.fetchAchievements);
  const fetchUserAchievements = useAchievementStore((s) => s.fetchUserAchievements);
  const isLoading = useAchievementStore((s) => s.isLoading);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Load achievements on mount
  useEffect(() => {
    fetchAchievements();
    fetchUserAchievements();
  }, [fetchAchievements, fetchUserAchievements]);

  const categories = [
    { value: 'all', label: 'الكل', icon: '🏆' },
    { value: 'social', label: 'اجتماعي', icon: '👥' },
    { value: 'content', label: 'محتوى', icon: '📝' },
    { value: 'live', label: 'بث مباشر', icon: '🎥' },
    { value: 'gifts', label: 'هدايا', icon: '🎁' },
    { value: 'streak', label: 'تواصل', icon: '🔥' },
  ];

  const userAchievementMap = new Map(
    userAchievements.map(ua => [ua.achievementID, ua])
  );

  const filteredAchievements = filterCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === filterCategory);

  const completedCount = userAchievements.filter(ua => ua.isCompleted).length;
  const totalCount = achievements.length;

  if (isLoading && achievements.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
      {/* Progress Header */}
      <Card className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Award className="w-8 h-8" />
          <div>
            <h2 className="text-lg font-bold">الإنجازات</h2>
            <p className="text-sm opacity-90">{completedCount} / {totalCount} مكتمل</p>
          </div>
        </div>
        <Progress value={totalCount > 0 ? (completedCount / totalCount) * 100 : 0} className="h-2 bg-white/30" />
      </Card>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setFilterCategory(cat.value)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap flex items-center gap-1 transition-all ${
              filterCategory === cat.value
                ? 'bg-purple-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredAchievements.map(achievement => {
          const userAch = userAchievementMap.get(achievement.id);
          const isCompleted = userAch?.isCompleted || false;
          const progress = userAch?.progress || 0;

          return (
            <Card
              key={achievement.id}
              className={`p-4 ${isCompleted ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  isCompleted ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  {achievement.iconEmoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{achievement.nameAr || achievement.name}</p>
                    {isCompleted && <Check className="w-4 h-4 text-green-500" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{achievement.descriptionAr || achievement.description}</p>
                  {!isCompleted && (
                    <div className="mt-2">
                      <Progress value={(progress / achievement.requirementValue) * 100} className="h-1.5" />
                      <p className="text-[10px] text-gray-400 mt-1">{progress} / {achievement.requirementValue}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {achievement.rewardCoins > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        🪙 {achievement.rewardCoins}
                      </Badge>
                    )}
                    {achievement.rewardDiamonds > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        💎 {achievement.rewardDiamonds}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <Card className="p-6 text-center text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>لا توجد إنجازات في هذه الفئة</p>
        </Card>
      )}
    </div>
  );
}

// ============ Daily Reward Component ============
export function DailyRewardCard() {
  const dailyReward = useAchievementStore((s) => s.dailyReward);
  const claimDailyReward = useAchievementStore((s) => s.claimDailyReward);
  const [isClaiming, setIsClaiming] = useState(false);

  const currentDay = dailyReward?.dayNumber || 1;
  const isClaimed = dailyReward?.isClaimed || false;

  const days = Array.from({ length: 7 }, (_, i) => i + 1);
  const rewards = [10, 20, 30, 40, 50, 60, 100];

  const handleClaim = useCallback(async () => {
    setIsClaiming(true);
    try {
      const reward = await claimDailyReward();
      if (reward) {
        toast.success(`تم استلام مكافأة اليوم! 🪙 ${rewards[currentDay - 1]}`);
      } else {
        toast.error('فشل في استلام المكافأة');
      }
    } catch {
      toast.error('فشل في استلام المكافأة');
    } finally {
      setIsClaiming(false);
    }
  }, [claimDailyReward, currentDay]);

  return (
    <Card className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
      <div className="text-center mb-3">
        <h3 className="font-bold text-lg">🔥 المكافأة اليومية</h3>
        <p className="text-sm text-gray-600">اليوم {currentDay} من 7</p>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {days.map(day => (
          <div
            key={day}
            className={`rounded-lg p-1 text-center text-xs ${
              day < currentDay
                ? 'bg-green-100 text-green-700'
                : day === currentDay
                ? 'bg-yellow-200 text-yellow-800 ring-2 ring-yellow-400'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <div className="text-lg">{day < currentDay ? '✅' : day === currentDay ? '🎁' : '🔒'}</div>
            <div>🪙 {rewards[day - 1]}</div>
          </div>
        ))}
      </div>

      <Button
        className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
        onClick={handleClaim}
        disabled={isClaimed || isClaiming}
      >
        {isClaiming ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : isClaimed ? (
          <>
            <Check className="w-4 h-4 mr-2" /> تم الاستلام
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" /> استلم المكافأة
          </>
        )}
      </Button>
    </Card>
  );
}
