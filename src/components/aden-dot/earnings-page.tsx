'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore, useAppStore } from '@/lib/store';
import { t, formatNumber } from '@/lib/i18n';
import {
  CoinIcon, DiamondCurrencyIcon, GiftIcon, TrophyIcon,
  StarIcon, CrownIcon, PremiumIcon, VerifiedIcon,
} from '@/components/icons/aden-dot-icons';

const GOLD = '#D4A853';
const GOLD_LIGHT = '#F5C542';
const NAVY = '#1A1F36';

const plans = [
  {
    id: 'free',
    name: t('earnings.free', 'ar'),
    price: 0,
    features: ['منشورات أساسية', 'محادثات محدودة', 'بث مباشر 30 دقيقة'],
    color: '#6B7280',
  },
  {
    id: 'premium',
    name: t('earnings.premium', 'ar'),
    price: 9.99,
    features: ['منشورات غير محدودة', 'محادثات غير محدودة', 'بث مباشر غير محدود', 'شارة مميز', 'هدايا حصرية'],
    color: GOLD,
    popular: true,
  },
  {
    id: 'vip',
    name: t('earnings.vip', 'ar'),
    price: 24.99,
    features: ['كل مميزات بريميوم', 'أولوية في الاستكشاف', 'دعم أولوية', 'هدايا VIP', 'شارة تاج ذهبي'],
    color: '#8B5CF6',
  },
];

export function EarningsPage() {
  const lang = useAppStore((s) => s.language);
  const user = useAuthStore((s) => s.user);
  const [activeSection, setActiveSection] = useState<'overview' | 'subscription'>('overview');

  const totalEarnings = 12500;
  const monthlyEarnings = 3200;
  const pendingBalance = 800;
  const availableBalance = 2400;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        {(['overview', 'subscription'] as const).map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-all relative"
            style={{
              background: activeSection === section ? `${GOLD}15` : 'rgba(255,255,255,0.03)',
              color: activeSection === section ? GOLD : '#6B7280',
              border: `1px solid ${activeSection === section ? GOLD + '30' : 'rgba(255,255,255,0.05)'}`,
            }}
          >
            {section === 'overview' ? t('earnings.overview', lang) : t('earnings.subscription', lang)}
          </button>
        ))}
      </div>

      {activeSection === 'overview' ? (
        <>
          {/* Earnings Overview Card */}
          <motion.div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${NAVY}, ${GOLD}20)` }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full" style={{ background: `${GOLD}08`, transform: 'translate(30%, -30%)' }} />
            <p className="text-sm text-gray-400">{t('earnings.totalEarnings', lang)}</p>
            <div className="flex items-center gap-2 mt-1">
              <CoinIcon size={24} />
              <span className="text-3xl font-bold" style={{ color: GOLD }}>{formatNumber(totalEarnings, lang)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-[10px] text-gray-500">{t('earnings.monthlyEarnings', lang)}</p>
                <p className="text-lg font-bold text-white">{formatNumber(monthlyEarnings, lang)}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-[10px] text-gray-500">{t('earnings.pendingBalance', lang)}</p>
                <p className="text-lg font-bold text-yellow-400">{formatNumber(pendingBalance, lang)}</p>
              </div>
            </div>
          </motion.div>

          {/* Breakdown */}
          <div className="space-y-2">
            {[
              { label: t('earnings.fromGifts', lang), amount: 8500, icon: <GiftIcon size={18} color={GOLD} />, color: GOLD },
              { label: t('earnings.fromLive', lang), amount: 2800, icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M8 10l4 3-4 3V10z" fill="#EF4444" /></svg>, color: '#EF4444' },
              { label: t('earnings.fromSubscriptions', lang), amount: 1200, icon: <PremiumIcon size={18} />, color: '#8B5CF6' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,168,83,0.06)' }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${item.color}10` }}>
                  {item.icon}
                </div>
                <div className="flex-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  <p className="text-sm text-white">{item.label}</p>
                </div>
                <div className="flex items-center gap-1">
                  <CoinIcon size={14} />
                  <span className="text-sm font-semibold" style={{ color: item.color }}>{formatNumber(item.amount, lang)}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Withdraw Button */}
          <motion.button
            className="w-full h-12 rounded-xl text-sm font-semibold"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: NAVY }}
            whileTap={{ scale: 0.97 }}
          >
            {t('earnings.withdraw', lang)} ({formatNumber(availableBalance, lang)} {t('wallet.coins', lang)})
          </motion.button>

          {/* Creator Settings */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,168,83,0.06)' }}>
            <h3 className="text-sm font-semibold text-white mb-3">{t('earnings.creatorSettings', lang)}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{t('earnings.monetization', lang)}</span>
                <div className="relative w-11 h-6 rounded-full" style={{ background: GOLD }}>
                  <motion.div className="absolute top-0.5 w-5 h-5 rounded-full bg-white" style={{ left: 22 }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{t('earnings.minWithdraw', lang)}</span>
                <span className="text-sm" style={{ color: GOLD }}>1,000 {t('wallet.coins', lang)}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Current Plan */}
          <div className="p-4 rounded-xl" style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}25` }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-white">{t('earnings.currentPlan', lang)}</span>
              {user?.isPremium && <PremiumIcon size={14} />}
            </div>
            <p className="text-lg font-bold" style={{ color: GOLD }}>
              {user?.isPremium ? t('earnings.premium', lang) : t('earnings.free', lang)}
            </p>
          </div>

          {/* Plans */}
          <div className="space-y-3">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                className="p-4 rounded-xl relative overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${plan.popular ? GOLD : 'rgba(212,168,83,0.06)'}`,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 px-3 py-0.5 text-[10px] font-bold rounded-bl-lg" style={{ background: GOLD, color: NAVY }}>
                    {lang === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
                  </div>
                )}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {plan.id === 'vip' ? <CrownIcon size={20} /> : plan.id === 'premium' ? <StarIcon size={20} /> : <div className="w-5 h-5 rounded-full" style={{ background: '#6B728030' }} />}
                    <span className="text-base font-bold text-white">{plan.name}</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold" style={{ color: plan.color }}>${plan.price}</span>
                    {plan.price > 0 && <span className="text-[10px] text-gray-500">/{lang === 'ar' ? 'شهر' : 'mo'}</span>}
                  </div>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <motion.button
                  className="w-full h-10 rounded-xl text-sm font-semibold"
                  style={{
                    background: plan.popular ? `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` : 'rgba(255,255,255,0.05)',
                    color: plan.popular ? NAVY : '#9CA3AF',
                    border: plan.popular ? 'none' : `1px solid rgba(255,255,255,0.1)`,
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  {plan.price === 0 ? t('earnings.currentPlan', lang) : t('earnings.upgradePlan', lang)}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
