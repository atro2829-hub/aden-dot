'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useAppStore } from '@/lib/store';
import { t, formatNumber } from '@/lib/i18n';
import {
  walletService,
} from '@/lib/supabase-service';
import {
  CoinIcon, DiamondCurrencyIcon, GiftIcon,
  StarIcon, CrownIcon, PremiumIcon,
} from '@/components/icons/aden-dot-icons';
import { Skeleton } from '@/components/ui/skeleton';
import type { Wallet, Transaction } from '@/types/skyline';

const plans = [
  {
    id: 'free',
    nameAr: 'مجاني',
    nameEn: 'Free',
    price: 0,
    featuresAr: ['منشورات أساسية', 'محادثات محدودة', 'بث مباشر 30 دقيقة'],
    featuresEn: ['Basic posts', 'Limited chats', '30 min live stream'],
    color: 'var(--muted-foreground)',
  },
  {
    id: 'premium',
    nameAr: 'مميز',
    nameEn: 'Premium',
    price: 9.99,
    featuresAr: ['منشورات غير محدودة', 'محادثات غير محدودة', 'بث مباشر غير محدود', 'شارة مميز', 'هدايا حصرية'],
    featuresEn: ['Unlimited posts', 'Unlimited chats', 'Unlimited live stream', 'Premium badge', 'Exclusive gifts'],
    color: 'var(--primary)',
    popular: true,
  },
  {
    id: 'vip',
    nameAr: 'VIP',
    nameEn: 'VIP',
    price: 24.99,
    featuresAr: ['كل مميزات بريميوم', 'أولوية في الاستكشاف', 'دعم أولوية', 'هدايا VIP', 'شارة تاج ذهبي'],
    featuresEn: ['All Premium features', 'Explore priority', 'Priority support', 'VIP gifts', 'Gold crown badge'],
    color: 'var(--primary)',
  },
];

export function EarningsPage() {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [activeSection, setActiveSection] = useState<'overview' | 'subscription'>('overview');

  // Data state
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [monetizationEnabled, setMonetizationEnabled] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Computed earnings breakdown from transactions
  const earningsBreakdown = useCallback(() => {
    let fromGifts = 0;
    let fromLive = 0;
    let fromSubscriptions = 0;
    for (const tx of transactions) {
      if (tx.type === 'gift_receive') fromGifts += tx.amount;
      if (tx.type === 'bonus' && tx.description?.toLowerCase().includes('live')) fromLive += tx.amount;
      if (tx.type === 'bonus' && tx.description?.toLowerCase().includes('subscription')) fromSubscriptions += tx.amount;
    }
    // For live: also count any transactions with 'live' reference
    for (const tx of transactions) {
      if (tx.type === 'earn' || tx.type === 'bonus') {
        if (tx.description?.toLowerCase().includes('live')) fromLive += tx.amount;
        if (tx.description?.toLowerCase().includes('sub')) fromSubscriptions += tx.amount;
      }
    }
    return { fromGifts, fromLive, fromSubscriptions };
  }, [transactions]);

  const breakdown = earningsBreakdown();

  // Monthly earnings: sum of earn/gift_receive transactions from last 30 days
  const monthlyEarnings = transactions
    .filter(tx => {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return tx.createdAt >= thirtyDaysAgo && (tx.type === 'gift_receive' || tx.type === 'earn' || tx.type === 'bonus');
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Pending balance: transactions of type 'withdraw' that are recent
  const pendingBalance = transactions
    .filter(tx => tx.type === 'withdraw' && tx.description?.includes('pending'))
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const totalEarnings = wallet?.totalCoinsEarned || 0;
  const availableBalance = wallet?.coinsBalance || 0;

  // Load wallet
  const loadWallet = useCallback(async () => {
    if (!user) return;
    setLoadingWallet(true);
    try {
      const w = await walletService.getWallet(user.uid);
      setWallet(w);
      if (w) {
        setMonetizationEnabled(w.totalCoinsEarned > 0);
      }
    } catch (err) {
      console.error('[EarningsPage] loadWallet error:', err);
    } finally {
      setLoadingWallet(false);
    }
  }, [user]);

  // Load transactions
  const loadTransactions = useCallback(async () => {
    if (!user) return;
    setLoadingTransactions(true);
    try {
      const txs = await walletService.getTransactions(user.uid, 0, 50);
      setTransactions(txs);
    } catch (err) {
      console.error('[EarningsPage] loadTransactions error:', err);
    } finally {
      setLoadingTransactions(false);
    }
  }, [user]);

  useEffect(() => {
    loadWallet();
    loadTransactions();
  }, [loadWallet, loadTransactions]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Withdraw handler
  const handleWithdraw = async () => {
    if (!user || availableBalance < 1000) {
      setToastMessage(t('wallet.insufficientBalance', lang));
      return;
    }
    setWithdrawing(true);
    try {
      const tx = await walletService.createTransaction({
        userUID: user.uid,
        type: 'withdraw',
        currency: 'coins',
        amount: availableBalance,
        description: `${lang === 'ar' ? 'طلب سحب معلق' : 'Pending withdrawal request'} - ${availableBalance} coins`,
      });
      if (tx) {
        setToastMessage(t('earnings.withdrawSuccess', lang));
        // Reload wallet and transactions
        await loadWallet();
        await loadTransactions();
      } else {
        setToastMessage(t('app.failed', lang));
      }
    } catch (err) {
      console.error('[EarningsPage] withdraw error:', err);
      setToastMessage(t('app.failed', lang));
    } finally {
      setWithdrawing(false);
    }
  };

  // Toggle monetization
  const handleToggleMonetization = async () => {
    const newVal = !monetizationEnabled;
    setMonetizationEnabled(newVal);
    if (user) {
      try {
        await updateUser({ isPremium: newVal } as Record<string, unknown>);
      } catch (err) {
        console.error('[EarningsPage] toggleMonetization error:', err);
        setMonetizationEnabled(!newVal); // Revert
      }
    }
  };

  // Transaction type icon
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'gift_send':
      case 'gift_receive':
        return <GiftIcon size={18} />;
      case 'purchase':
        return <CoinIcon size={18} />;
      case 'withdraw':
        return <CoinIcon size={18} />;
      case 'earn':
      case 'bonus':
        return <CoinIcon size={18} />;
      default:
        return <CoinIcon size={18} />;
    }
  };

  // Transaction type color
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'gift_receive':
      case 'earn':
      case 'bonus':
        return '#10B981';
      case 'gift_send':
      case 'spend':
      case 'withdraw':
        return '#EF4444';
      case 'purchase':
        return 'var(--primary)';
      default:
        return 'var(--muted-foreground)';
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className="fixed top-4 left-4 right-4 z-50 p-3 rounded-xl bg-card border border-border shadow-lg text-sm text-foreground text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['overview', 'subscription'] as const).map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              activeSection === section
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-muted text-muted-foreground border border-transparent'
            }`}
          >
            {section === 'overview' ? t('earnings.overview', lang) : t('earnings.subscription', lang)}
          </button>
        ))}
      </div>

      {activeSection === 'overview' ? (
        <>
          {/* Earnings Overview Card */}
          <motion.div
            className="rounded-2xl p-5 relative overflow-hidden bg-card border border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full" style={{ background: 'var(--primary)', opacity: 0.03, transform: 'translate(30%, -30%)' }} />
            <p className="text-sm text-muted-foreground">{t('earnings.totalEarnings', lang)}</p>
            {loadingWallet ? (
              <Skeleton className="h-9 w-32 mt-1" />
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <CoinIcon size={24} />
                <span className="text-3xl font-bold text-primary">{formatNumber(totalEarnings, lang)}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-muted">
                <p className="text-[10px] text-muted-foreground">{t('earnings.monthlyEarnings', lang)}</p>
                {loadingWallet ? (
                  <Skeleton className="h-6 w-16 mt-1" />
                ) : (
                  <p className="text-lg font-bold text-foreground">{formatNumber(monthlyEarnings, lang)}</p>
                )}
              </div>
              <div className="p-3 rounded-xl bg-muted">
                <p className="text-[10px] text-muted-foreground">{t('earnings.pendingBalance', lang)}</p>
                {loadingWallet ? (
                  <Skeleton className="h-6 w-16 mt-1" />
                ) : (
                  <p className="text-lg font-bold text-yellow-500">{formatNumber(pendingBalance, lang)}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Breakdown */}
          <div className="space-y-2">
            {[
              { label: t('earnings.fromGifts', lang), amount: breakdown.fromGifts, icon: <GiftIcon size={18} />, color: 'var(--primary)' },
              { label: t('earnings.fromLive', lang), amount: breakdown.fromLive, icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M8 10l4 3-4 3V10z" fill="#EF4444" /></svg>, color: '#EF4444' },
              { label: t('earnings.fromSubscriptions', lang), amount: breakdown.fromSubscriptions, icon: <PremiumIcon size={18} />, color: 'var(--primary)' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${item.color}10` }}>
                  {item.icon}
                </div>
                <div className="flex-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  <p className="text-sm text-foreground">{item.label}</p>
                </div>
                <div className="flex items-center gap-1">
                  <CoinIcon size={14} />
                  <span className="text-sm font-semibold" style={{ color: item.color }}>{formatNumber(item.amount, lang)}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Transaction History */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">{t('wallet.history', lang)}</h3>
            {loadingTransactions ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                {transactions.map((tx, idx) => (
                  <motion.div
                    key={tx.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${getTransactionColor(tx.type)}10` }}>
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="flex-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                      <p className="text-sm text-foreground">{tx.description || tx.type}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: getTransactionColor(tx.type) }}>
                      {tx.type === 'gift_receive' || tx.type === 'earn' || tx.type === 'bonus' ? '+' : '-'}{tx.amount}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">{t('wallet.noTransactions', lang)}</p>
              </div>
            )}
          </div>

          {/* Withdraw Button */}
          <motion.button
            className="w-full h-12 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            whileTap={{ scale: 0.97 }}
            onClick={handleWithdraw}
            disabled={withdrawing || availableBalance < 1000}
          >
            {withdrawing
              ? (lang === 'ar' ? 'جاري المعالجة...' : 'Processing...')
              : `${t('earnings.withdraw', lang)} (${formatNumber(availableBalance, lang)} ${t('wallet.coins', lang)})`}
          </motion.button>

          {/* Creator Settings */}
          <div className="p-4 rounded-xl bg-card border border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">{t('earnings.creatorSettings', lang)}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('earnings.monetization', lang)}</span>
                <button
                  onClick={handleToggleMonetization}
                  className={`relative w-11 h-6 rounded-full transition-colors ${monetizationEnabled ? 'bg-primary' : 'bg-muted'}`}
                >
                  <motion.div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                    animate={{ left: monetizationEnabled ? 22 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('earnings.minWithdraw', lang)}</span>
                <span className="text-sm text-primary">1,000 {t('wallet.coins', lang)}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Current Plan */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/25">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-foreground">{t('earnings.currentPlan', lang)}</span>
              {user?.isPremium && <PremiumIcon size={14} />}
            </div>
            <p className="text-lg font-bold text-primary">
              {user?.isPremium ? t('earnings.premium', lang) : t('earnings.free', lang)}
            </p>
          </div>

          {/* Plans */}
          <div className="space-y-3">
            {plans.map((plan, idx) => {
              const isCurrentPlan = (plan.id === 'free' && !user?.isPremium) || (plan.id === 'premium' && user?.isPremium);
              return (
                <motion.div
                  key={plan.id}
                  className={`p-4 rounded-xl relative overflow-hidden ${
                    plan.popular ? 'bg-card border-2 border-primary' : 'bg-card border border-border'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 px-3 py-0.5 text-[10px] font-bold rounded-bl-lg bg-primary text-primary-foreground">
                      {lang === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {plan.id === 'vip' ? <CrownIcon size={20} /> : plan.id === 'premium' ? <StarIcon size={20} /> : <div className="w-5 h-5 rounded-full bg-muted" />}
                      <span className="text-base font-bold text-foreground">{lang === 'ar' ? plan.nameAr : plan.nameEn}</span>
                    </div>
                    <div>
                      <span className="text-xl font-bold" style={{ color: plan.color }}>${plan.price}</span>
                      {plan.price > 0 && <span className="text-[10px] text-muted-foreground">/{lang === 'ar' ? 'شهر' : 'mo'}</span>}
                    </div>
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {(lang === 'ar' ? plan.featuresAr : plan.featuresEn).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground/70" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <motion.button
                    className={`w-full h-10 rounded-xl text-sm font-semibold ${
                      isCurrentPlan
                        ? 'bg-muted text-muted-foreground cursor-default'
                        : plan.popular
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'bg-muted text-muted-foreground'
                    }`}
                    whileTap={isCurrentPlan ? {} : { scale: 0.97 }}
                    onClick={() => {
                      if (!isCurrentPlan && plan.id === 'premium' && user) {
                        updateUser({ isPremium: true } as Record<string, unknown>);
                        setToastMessage(lang === 'ar' ? 'تم الترقية إلى المميز!' : 'Upgraded to Premium!');
                      }
                    }}
                  >
                    {isCurrentPlan ? t('earnings.currentPlan', lang) : t('earnings.upgradePlan', lang)}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
