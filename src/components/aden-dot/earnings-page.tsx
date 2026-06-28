'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useAppStore } from '@/lib/store';
import { t, formatNumber } from '@/lib/i18n';
import {
  walletService,
  paymentService,
  type PaymentMethod,
  type DepositRequest,
  type WithdrawalRequest,
} from '@/lib/supabase-service';
import {
  CoinIcon, DiamondCurrencyIcon, GiftIcon,
  StarIcon, CrownIcon, PremiumIcon,
} from '@/components/icons/aden-dot-icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
  const [activeSection, setActiveSection] = useState<'overview' | 'wallet' | 'subscription'>('overview');

  // Data state
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [monetizationEnabled, setMonetizationEnabled] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dialog state
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [destinationAccount, setDestinationAccount] = useState<string>('');
  const [userNote, setUserNote] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Computed earnings breakdown
  const breakdown = useCallback(() => {
    let fromGifts = 0;
    let fromLive = 0;
    let fromSubscriptions = 0;
    for (const tx of transactions) {
      if (tx.type === 'gift_receive') fromGifts += tx.amount;
      if (tx.type === 'bonus' && tx.description?.toLowerCase().includes('live')) fromLive += tx.amount;
      if (tx.type === 'bonus' && tx.description?.toLowerCase().includes('subscription')) fromSubscriptions += tx.amount;
    }
    return { fromGifts, fromLive, fromSubscriptions };
  }, [transactions]);

  const earningsData = breakdown();

  const monthlyEarnings = transactions
    .filter(tx => {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return tx.createdAt >= thirtyDaysAgo && (tx.type === 'gift_receive' || tx.type === 'earn' || tx.type === 'bonus');
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  const pendingDeposits = depositRequests.filter(d => d.status === 'pending').length;
  const pendingWithdrawals = withdrawalRequests.filter(w => w.status === 'pending').length;

  const totalEarnings = wallet?.totalCoinsEarned || 0;
  const availableCoins = wallet?.coinsBalance || 0;
  const availableDiamonds = wallet?.diamondsBalance || 0;

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

  // Load payment methods
  const loadPaymentMethods = useCallback(async () => {
    setLoadingMethods(true);
    try {
      const methods = await paymentService.getActiveMethods();
      setPaymentMethods(methods);
      if (methods.length > 0 && !selectedMethod) {
        setSelectedMethod(methods[0].id);
      }
    } catch (err) {
      console.error('[EarningsPage] loadPaymentMethods error:', err);
    } finally {
      setLoadingMethods(false);
    }
  }, [selectedMethod]);

  // Load user deposits & withdrawals
  const loadRequests = useCallback(async () => {
    if (!user) return;
    try {
      const [deps, wdrs] = await Promise.all([
        paymentService.getUserDeposits(user.uid),
        paymentService.getUserWithdrawals(user.uid),
      ]);
      setDepositRequests(deps);
      setWithdrawalRequests(wdrs);
    } catch (err) {
      console.error('[EarningsPage] loadRequests error:', err);
    }
  }, [user]);

  useEffect(() => {
    loadWallet();
    loadTransactions();
    loadPaymentMethods();
    loadRequests();
  }, [loadWallet, loadTransactions, loadPaymentMethods, loadRequests]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Deposit handler
  const handleDeposit = async () => {
    if (!user || !selectedMethod) return;
    const amount = parseInt(amountInput, 10);
    if (!amount || amount <= 0) {
      setToastMessage(lang === 'ar' ? 'أدخل مبلغاً صحيحاً' : 'Enter a valid amount');
      return;
    }
    const method = paymentMethods.find(m => m.id === selectedMethod);
    if (method && (amount < method.minAmount || amount > method.maxAmount)) {
      setToastMessage(
        lang === 'ar'
          ? `المبلغ يجب أن يكون بين ${method.minAmount} و ${method.maxAmount}`
          : `Amount must be between ${method.minAmount} and ${method.maxAmount}`
      );
      return;
    }
    setSubmitting(true);
    try {
      const result = await paymentService.createDepositRequest({
        paymentMethodId: selectedMethod,
        amountCoins: amount,
        userNote,
      });
      if (result.ok) {
        setToastMessage(
          lang === 'ar'
            ? `تم إنشاء طلب الإيداع بنجاح. المرجع: ${result.reference}`
            : `Deposit request created. Ref: ${result.reference}`
        );
        setDepositOpen(false);
        setAmountInput('');
        setUserNote('');
        await loadRequests();
      } else {
        setToastMessage(result.error || t('app.failed', lang));
      }
    } catch (err) {
      console.error('[EarningsPage] deposit error:', err);
      setToastMessage(t('app.failed', lang));
    } finally {
      setSubmitting(false);
    }
  };

  // Withdraw handler
  const handleWithdraw = async () => {
    if (!user || !selectedMethod) return;
    const amount = parseInt(amountInput, 10);
    if (!amount || amount <= 0) {
      setToastMessage(lang === 'ar' ? 'أدخل مبلغاً صحيحاً' : 'Enter a valid amount');
      return;
    }
    if (amount > availableDiamonds) {
      setToastMessage(lang === 'ar' ? 'رصيد الألماس غير كافٍ' : 'Insufficient diamond balance');
      return;
    }
    if (!destinationAccount.trim()) {
      setToastMessage(lang === 'ar' ? 'أدخل حساب الوجهة' : 'Enter destination account');
      return;
    }
    const method = paymentMethods.find(m => m.id === selectedMethod);
    if (method && (amount < method.minAmount || amount > method.maxAmount)) {
      setToastMessage(
        lang === 'ar'
          ? `المبلغ يجب أن يكون بين ${method.minAmount} و ${method.maxAmount}`
          : `Amount must be between ${method.minAmount} and ${method.maxAmount}`
      );
      return;
    }
    setSubmitting(true);
    try {
      const result = await paymentService.createWithdrawalRequest({
        paymentMethodId: selectedMethod,
        amountCoins: amount,
        destinationAccount: destinationAccount.trim(),
        userNote,
      });
      if (result.ok) {
        setToastMessage(
          lang === 'ar'
            ? `تم إنشاء طلب السحب. المرجع: ${result.reference}`
            : `Withdrawal created. Ref: ${result.reference}`
        );
        setWithdrawOpen(false);
        setAmountInput('');
        setDestinationAccount('');
        setUserNote('');
        await loadRequests();
        await loadWallet();
      } else {
        setToastMessage(result.error || t('app.failed', lang));
      }
    } catch (err) {
      console.error('[EarningsPage] withdraw error:', err);
      setToastMessage(t('app.failed', lang));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleMonetization = async () => {
    const newVal = !monetizationEnabled;
    setMonetizationEnabled(newVal);
    if (user) {
      try {
        await updateUser({ isPremium: newVal } as Record<string, unknown>);
      } catch (err) {
        console.error('[EarningsPage] toggleMonetization error:', err);
        setMonetizationEnabled(!newVal);
      }
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'gift_send':
      case 'gift_receive':
        return <GiftIcon size={18} />;
      case 'deposit':
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

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'gift_receive':
      case 'earn':
      case 'bonus':
      case 'deposit':
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

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#F59E0B',
      approved: '#10B981',
      completed: '#10B981',
      rejected: '#EF4444',
      cancelled: '#6B7280',
    };
    const labels: Record<string, { ar: string; en: string }> = {
      pending: { ar: 'قيد الانتظار', en: 'Pending' },
      approved: { ar: 'موافق عليه', en: 'Approved' },
      completed: { ar: 'مكتمل', en: 'Completed' },
      rejected: { ar: 'مرفوض', en: 'Rejected' },
      cancelled: { ar: 'ملغى', en: 'Cancelled' },
    };
    return (
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
        style={{ background: `${colors[status]}20`, color: colors[status] }}
      >
        {labels[status]?.[lang] || status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
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
        {(['overview', 'wallet', 'subscription'] as const).map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
              activeSection === section
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-muted text-muted-foreground border border-transparent'
            }`}
          >
            {section === 'overview'
              ? t('earnings.overview', lang)
              : section === 'wallet'
                ? (lang === 'ar' ? 'المحفظة' : 'Wallet')
                : t('earnings.subscription', lang)}
          </button>
        ))}
      </div>

      {activeSection === 'overview' && (
        <>
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
                <p className="text-[10px] text-muted-foreground">{lang === 'ar' ? 'الطلبات المعلقة' : 'Pending Requests'}</p>
                {loadingWallet ? (
                  <Skeleton className="h-6 w-16 mt-1" />
                ) : (
                  <p className="text-lg font-bold text-yellow-500">{pendingDeposits + pendingWithdrawals}</p>
                )}
              </div>
            </div>
          </motion.div>

          <div className="space-y-2">
            {[
              { label: t('earnings.fromGifts', lang), amount: earningsData.fromGifts, icon: <GiftIcon size={18} />, color: 'var(--primary)' },
              { label: t('earnings.fromLive', lang), amount: earningsData.fromLive, icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M8 10l4 3-4 3V10z" fill="#EF4444" /></svg>, color: '#EF4444' },
              { label: t('earnings.fromSubscriptions', lang), amount: earningsData.fromSubscriptions, icon: <PremiumIcon size={18} />, color: 'var(--primary)' },
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

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center gap-1"
              whileTap={{ scale: 0.97 }}
              onClick={() => { setDepositOpen(true); loadPaymentMethods(); }}
            >
              <CoinIcon size={22} />
              <span className="text-sm font-semibold text-primary">{lang === 'ar' ? 'إيداع' : 'Deposit'}</span>
              <span className="text-[10px] text-muted-foreground text-center">{lang === 'ar' ? 'أضف عملات' : 'Add coins'}</span>
            </motion.button>
            <motion.button
              className="p-4 rounded-xl bg-card border border-border flex flex-col items-center gap-1"
              whileTap={{ scale: 0.97 }}
              onClick={() => { setWithdrawOpen(true); loadPaymentMethods(); }}
            >
              <DiamondCurrencyIcon size={22} />
              <span className="text-sm font-semibold text-foreground">{lang === 'ar' ? 'سحب' : 'Withdraw'}</span>
              <span className="text-[10px] text-muted-foreground text-center">{lang === 'ar' ? 'اسحب ألماسك' : 'Cash out diamonds'}</span>
            </motion.button>
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
                      {['gift_receive', 'earn', 'bonus', 'deposit'].includes(tx.type) ? '+' : '-'}{tx.amount}
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
      )}

      {activeSection === 'wallet' && (
        <>
          {/* Wallet balances */}
          <motion.div
            className="rounded-2xl p-5 bg-card border border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'رصيد العملات' : 'Coins Balance'}</p>
            {loadingWallet ? (
              <Skeleton className="h-9 w-32 mt-1" />
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <CoinIcon size={24} />
                <span className="text-3xl font-bold text-primary">{formatNumber(availableCoins, lang)}</span>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-1">
              {lang === 'ar' ? 'تستخدم لإرسال الهدايا والشراء داخل التطبيق' : 'Used for sending gifts and in-app purchases'}
            </p>
          </motion.div>

          <motion.div
            className="rounded-2xl p-5 bg-card border border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'رصيد الألماس' : 'Diamonds Balance'}</p>
            {loadingWallet ? (
              <Skeleton className="h-9 w-32 mt-1" />
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <DiamondCurrencyIcon size={24} />
                <span className="text-3xl font-bold text-primary">{formatNumber(availableDiamonds, lang)}</span>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-1">
              {lang === 'ar' ? 'تستقبلها من الهدايا ويمكنك سحبها كمال' : 'Received from gifts, withdrawable as cash'}
            </p>
          </motion.div>

          {/* Pending Requests */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {lang === 'ar' ? 'طلباتي' : 'My Requests'}
            </h3>
            {(depositRequests.length === 0 && withdrawalRequests.length === 0) ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'لا توجد طلبات بعد' : 'No requests yet'}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
                {depositRequests.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-lg">
                      {d.paymentMethod?.iconEmoji || '💰'}
                    </div>
                    <div className="flex-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                      <p className="text-sm text-foreground">
                        {lang === 'ar' ? 'إيداع' : 'Deposit'} · {d.paymentMethod?.nameAr || d.paymentMethod?.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(d.createdAt).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                        {d.referenceCode ? ` · ${d.referenceCode}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-bold text-primary">+{d.amountCoins}</span>
                      {statusBadge(d.status)}
                    </div>
                  </div>
                ))}
                {withdrawalRequests.map((w) => (
                  <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/10 text-lg">
                      {w.paymentMethod?.iconEmoji || '💸'}
                    </div>
                    <div className="flex-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                      <p className="text-sm text-foreground">
                        {lang === 'ar' ? 'سحب' : 'Withdraw'} · {w.paymentMethod?.nameAr || w.paymentMethod?.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(w.createdAt).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                        {w.referenceCode ? ` · ${w.referenceCode}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-bold text-red-500">-{w.amountCoins}</span>
                      {statusBadge(w.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => { setDepositOpen(true); loadPaymentMethods(); }}>
              <CoinIcon size={16} /> {lang === 'ar' ? 'إيداع جديد' : 'New Deposit'}
            </Button>
            <Button variant="outline" onClick={() => { setWithdrawOpen(true); loadPaymentMethods(); }}>
              <DiamondCurrencyIcon size={16} /> {lang === 'ar' ? 'سحب جديد' : 'New Withdraw'}
            </Button>
          </div>
        </>
      )}

      {activeSection === 'subscription' && (
        <>
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/25">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-foreground">{t('earnings.currentPlan', lang)}</span>
              {user?.isPremium && <PremiumIcon size={14} />}
            </div>
            <p className="text-lg font-bold text-primary">
              {user?.isPremium ? t('earnings.premium', lang) : t('earnings.free', lang)}
            </p>
          </div>
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

      {/* Deposit Dialog */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{lang === 'ar' ? 'إيداع عملات' : 'Deposit Coins'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Payment method selection */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                {lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
              </label>
              {loadingMethods ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto scrollbar-hide">
                  {paymentMethods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      className={`p-2 rounded-lg border text-right transition-all ${
                        selectedMethod === m.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{m.iconEmoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{lang === 'ar' ? m.nameAr : m.name}</p>
                          <p className="text-[9px] text-muted-foreground">
                            {m.minAmount}-{m.maxAmount}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Instructions */}
            {selectedMethod && (() => {
              const m = paymentMethods.find(x => x.id === selectedMethod);
              if (!m) return null;
              return (
                <div className="p-3 rounded-lg bg-muted text-[11px] text-muted-foreground leading-relaxed" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  {lang === 'ar' ? m.instructionsAr : m.instructions}
                </div>
              );
            })()}

            {/* Amount */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                {lang === 'ar' ? 'عدد العملات' : 'Coins Amount'}
              </label>
              <Input
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="1000"
              />
              {selectedMethod && (() => {
                const m = paymentMethods.find(x => x.id === selectedMethod);
                if (!m) return null;
                return (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {lang === 'ar'
                      ? `الحد الأدنى: ${m.minAmount} · الحد الأقصى: ${m.maxAmount}`
                      : `Min: ${m.minAmount} · Max: ${m.maxAmount}`}
                  </p>
                );
              })()}
            </div>

            {/* Note */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                {lang === 'ar' ? 'ملاحظة (رقم العملية / TXID)' : 'Note (TXID / Reference)'}
              </label>
              <Input
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder={lang === 'ar' ? 'أدخل رقم العملية' : 'Enter transaction ID'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositOpen(false)} disabled={submitting}>
              {t('app.cancel', lang)}
            </Button>
            <Button onClick={handleDeposit} disabled={submitting || !selectedMethod}>
              {submitting ? (lang === 'ar' ? 'جاري...' : 'Submitting...') : (lang === 'ar' ? 'إنشاء الطلب' : 'Submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{lang === 'ar' ? 'سحب الألماس' : 'Withdraw Diamonds'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">
                {lang === 'ar' ? 'رصيدك الحالي:' : 'Current balance:'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <DiamondCurrencyIcon size={18} />
                <span className="text-lg font-bold text-primary">{formatNumber(availableDiamonds, lang)}</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                {lang === 'ar' ? 'طريقة الاستلام' : 'Payout Method'}
              </label>
              {loadingMethods ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto scrollbar-hide">
                  {paymentMethods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      className={`p-2 rounded-lg border text-right transition-all ${
                        selectedMethod === m.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{m.iconEmoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{lang === 'ar' ? m.nameAr : m.name}</p>
                          <p className="text-[9px] text-muted-foreground">
                            {m.minAmount}-{m.maxAmount}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                {lang === 'ar' ? 'عدد الألماس' : 'Diamonds Amount'}
              </label>
              <Input
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="1000"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                {lang === 'ar' ? 'حساب الوجهة' : 'Destination Account'}
              </label>
              <Input
                value={destinationAccount}
                onChange={(e) => setDestinationAccount(e.target.value)}
                placeholder={lang === 'ar' ? ' PayPal@ البريد / IBAN / محفظة' : 'PayPal email / IBAN / Wallet address'}
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                {lang === 'ar' ? 'ملاحظة' : 'Note'}
              </label>
              <Input
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder={lang === 'ar' ? 'ملاحظات إضافية' : 'Additional notes'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawOpen(false)} disabled={submitting}>
              {t('app.cancel', lang)}
            </Button>
            <Button onClick={handleWithdraw} disabled={submitting || !selectedMethod}>
              {submitting ? (lang === 'ar' ? 'جاري...' : 'Submitting...') : (lang === 'ar' ? 'إنشاء الطلب' : 'Submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
