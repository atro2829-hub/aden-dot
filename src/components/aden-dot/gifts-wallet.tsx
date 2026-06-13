'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore, useAppStore } from '@/lib/store';
import { t, formatNumber } from '@/lib/i18n';
import {
  CoinIcon, DiamondCurrencyIcon, GiftIcon, WalletIcon,
  StarIcon, TrophyIcon, FireIcon, ShieldIcon, LightningIcon, HeartIcon, DiamondGemIcon,
} from '@/components/icons/aden-dot-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GiftShopGrid, GiftSendAnimation, useGiftSend } from './animated-gifts';

// ============ Wallet Page ============
export function WalletPage() {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);

  const transactions = [
    { id: '1', type: 'earn', desc: lang === 'ar' ? 'هدية من أحمد' : 'Gift from Ahmed', amount: 500, currency: 'coins', time: Date.now() - 3600000 },
    { id: '2', type: 'spend', desc: lang === 'ar' ? 'إرسال هدية' : 'Sent gift', amount: 200, currency: 'coins', time: Date.now() - 7200000 },
    { id: '3', type: 'earn', desc: lang === 'ar' ? 'مكافأة يومية' : 'Daily reward', amount: 100, currency: 'coins', time: Date.now() - 86400000 },
    { id: '4', type: 'earn', desc: lang === 'ar' ? 'ألماس من البث' : 'Diamonds from live', amount: 50, currency: 'diamonds', time: Date.now() - 172800000 },
  ];

  return (
    <div className="space-y-4">
      {/* Balance Card */}
      <motion.div
        className="rounded-2xl p-5 overflow-hidden relative bg-gradient-to-r from-primary to-primary/80"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative z-10">
          <p className="text-sm font-medium text-primary-foreground/80">{t('wallet.balance', lang)}</p>

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <CoinIcon size={28} />
              <div>
                <p className="text-2xl font-bold text-primary-foreground">{formatNumber(user?.coinsBalance || 0, lang)}</p>
                <p className="text-[10px] text-primary-foreground/70">{t('wallet.coins', lang)}</p>
              </div>
            </div>
            <div className="w-px h-10 bg-primary-foreground/20" />
            <div className="flex items-center gap-2">
              <DiamondCurrencyIcon size={28} />
              <div>
                <p className="text-2xl font-bold text-primary-foreground">{formatNumber(user?.diamondsBalance || 0, lang)}</p>
                <p className="text-[10px] text-primary-foreground/70">{t('wallet.diamonds', lang)}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button className="flex-1 h-9 rounded-xl text-sm font-semibold bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30">
              {t('wallet.deposit', lang)}
            </Button>
            <Button className="flex-1 h-9 rounded-xl text-sm font-semibold bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20">
              {t('wallet.withdraw', lang)}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: <GiftIcon size={20} color="var(--primary)" />, label: t('wallet.giftShop', lang) },
          { icon: <CoinIcon size={20} />, label: t('wallet.buyCoins', lang) },
          { icon: <DiamondCurrencyIcon size={20} />, label: t('wallet.buyDiamonds', lang) },
        ].map((action, idx) => (
          <motion.button
            key={idx}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border"
            whileTap={{ scale: 0.95 }}
          >
            {action.icon}
            <span className="text-[10px] text-muted-foreground">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Animated Gift Shop */}
      <div>
        <GiftShopGrid />
      </div>

      {/* Transactions */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">{t('wallet.history', lang)}</h3>
        <div className="space-y-2">
          {transactions.map((tx, idx) => (
            <motion.div
              key={tx.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'earn' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {tx.type === 'earn' ? (
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                ) : (
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                )}
              </div>
              <div className="flex-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <p className="text-sm text-foreground">{tx.desc}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(tx.time).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}</p>
              </div>
              <div className="flex items-center gap-1">
                {tx.currency === 'coins' ? <CoinIcon size={14} /> : <DiamondCurrencyIcon size={14} />}
                <span className={`text-sm font-semibold ${tx.type === 'earn' ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ Achievements Page ============
export function AchievementsPage() {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);

  const achievements = [
    { icon: <StarIcon size={24} />, name: lang === 'ar' ? 'نجمة أولى' : 'First Star', desc: lang === 'ar' ? 'احصل على 100 إعجاب' : 'Get 100 likes', progress: 75, completed: false },
    { icon: <TrophyIcon size={24} />, name: lang === 'ar' ? 'بطل' : 'Champion', desc: lang === 'ar' ? 'فز بـ 10 مسابقات' : 'Win 10 contests', progress: 100, completed: true },
    { icon: <FireIcon size={24} />, name: lang === 'ar' ? 'متواصل' : 'Streak Master', desc: lang === 'ar' ? 'سجل دخول 7 أيام متتالية' : 'Login 7 days in a row', progress: 57, completed: false },
    { icon: <ShieldIcon size={24} />, name: lang === 'ar' ? 'حامي' : 'Protector', desc: lang === 'ar' ? 'أبلغ عن 5 محتويات' : 'Report 5 contents', progress: 40, completed: false },
    { icon: <LightningIcon size={24} />, name: lang === 'ar' ? 'سريع' : 'Speedster', desc: lang === 'ar' ? 'كن أول من يعلق 10 مرات' : 'Be first to comment 10 times', progress: 100, completed: true },
    { icon: <HeartIcon size={24} />, name: lang === 'ar' ? 'محبوب' : 'Beloved', desc: lang === 'ar' ? 'احصل على 1000 متابع' : 'Get 1000 followers', progress: 30, completed: false },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {achievements.map((ach, idx) => (
          <motion.div
            key={idx}
            className={`p-4 rounded-xl text-center ${ach.completed ? 'bg-primary/10 border border-primary/20' : 'bg-card border border-border'}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className="flex justify-center mb-2">{ach.icon}</div>
            <p className="text-sm font-semibold text-foreground">{ach.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{ach.desc}</p>

            {ach.completed ? (
              <div className="flex items-center justify-center gap-1 mt-2">
                <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor"><path d="M20 6L9 17l-5-5" /></svg>
                <span className="text-[10px] font-medium text-primary">{t('achievements.completed', lang)}</span>
              </div>
            ) : (
              <div className="mt-2">
                <div className="h-1.5 rounded-full overflow-hidden bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${ach.progress}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground">{ach.progress}%</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}


