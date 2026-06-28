'use client';

/**
 * Aden Dot — Admin: Feature Flags Management Panel
 * =================================================
 * Lets the admin toggle any section of the user app on/off in real time.
 * Toggles include: live streaming, gifts, stories, explore, chat,
 * wallet, comments, post creation, badges, south flag, dark mode, etc.
 *
 * When admin toggles a flag, the user app's UI updates instantly via
 * Supabase Realtime (no re-login required).
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAllFeatureFlags, useFeatureFlagAdmin } from './use-feature-flags';
import { IconLive, IconGift, IconCamera, IconCompass, IconChat, IconWallet, IconComment, IconCreatePost, IconVerified, IconSouthFlag, IconMoon, IconSearch, IconHash, IconStar, IconUsers, IconShield, IconChart, IconAlert, IconCheck, IconSpinner } from './icons';
import { COLORS } from './utils';
import { useToast } from './confirm-dialog';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

interface FlagMeta {
  code: string;
  name_ar: string;
  description_ar: string;
  icon: React.ReactNode;
  category: string;
}

const FLAG_META: FlagMeta[] = [
  { code: 'live_streaming', name_ar: 'البث المباشر', description_ar: 'السماح للمستخدمين ببدء بث مباشر', icon: <IconLive size={20} />, category: 'المحتوى' },
  { code: 'live_gifts', name_ar: 'هدايا البث المباشر', description_ar: 'إرسال هدايا أثناء البث', icon: <IconGift size={20} />, category: 'المحتوى' },
  { code: 'gifts', name_ar: 'نظام الهدايا', description_ar: 'إرسال واستقبال الهدايا على المنشورات', icon: <IconGift size={20} />, category: 'المحتوى' },
  { code: 'stories', name_ar: 'القصص', description_ar: 'قصص تختفي خلال ٢٤ ساعة', icon: <IconCamera size={20} />, category: 'المحتوى' },
  { code: 'comments', name_ar: 'التعليقات', description_ar: 'السماح بالتعليق على المنشورات', icon: <IconComment size={20} />, category: 'المحتوى' },
  { code: 'posts_creation', name_ar: 'إنشاء المنشورات', description_ar: 'السماح بإنشاء منشورات جديدة', icon: <IconCreatePost size={20} />, category: 'المحتوى' },
  { code: 'hashtags', name_ar: 'الوسوم', description_ar: 'تفعيل نظام الوسوم والترند', icon: <IconHash size={20} />, category: 'المحتوى' },
  { code: 'subscriptions', name_ar: 'الاشتراكات المدفوعة', description_ar: 'اشتراكات في المبدعين', icon: <IconStar size={20} />, category: 'المحتوى' },
  { code: 'explore', name_ar: 'صفحة الاستكشاف', description_ar: 'استكشاف المحتوى الرائج', icon: <IconCompass size={20} />, category: 'التنقل' },
  { code: 'chat', name_ar: 'الرسائل الخاصة', description_ar: 'محادثات بين المستخدمين', icon: <IconChat size={20} />, category: 'التنقل' },
  { code: 'user_search', name_ar: 'البحث عن المستخدمين', description_ar: 'إمكانية البحث عن مستخدمين', icon: <IconSearch size={20} />, category: 'التنقل' },
  { code: 'wallet', name_ar: 'المحفظة والمدفوعات', description_ar: 'الإيداع والسحب وإدارة المحفظة', icon: <IconWallet size={20} />, category: 'المالية' },
  { code: 'verified_badges', name_ar: 'شارات التحقق', description_ar: 'إظهار الشارات على الملفات الشخصية', icon: <IconVerified size={20} />, category: 'الملف الشخصي' },
  { code: 'south_flag', name_ar: 'علم الجنوب العربي', description_ar: 'إظهار العلم في التطبيق', icon: <IconSouthFlag size={20} />, category: 'الهوية' },
  { code: 'dark_mode', name_ar: 'الوضع الليلي', description_ar: 'السماح بتبديل الوضع الليلي', icon: <IconMoon size={20} />, category: 'المظهر' },
];

export function FeatureFlagsPanel() {
  const toast = useToast();
  const { flags, loading } = useAllFeatureFlags();
  const { setFlag } = useFeatureFlagAdmin();
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'enabled' | 'disabled'>('all');

  const handleToggle = useCallback(async (code: string, current: boolean) => {
    setBusyCode(code);
    await setFlag(code, !current);
    setBusyCode(null);
  }, [setFlag]);

  // Group by category
  const grouped: Record<string, FlagMeta[]> = {};
  for (const meta of FLAG_META) {
    if (!grouped[meta.category]) grouped[meta.category] = [];
    grouped[meta.category].push(meta);
  }

  const filtered = (items: FlagMeta[]) => items.filter((m) => {
    if (filter === 'all') return true;
    const enabled = flags[m.code] !== false;
    return filter === 'enabled' ? enabled : !enabled;
  });

  const enabledCount = FLAG_META.filter((m) => flags[m.code] !== false).length;
  const disabledCount = FLAG_META.length - enabledCount;

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Header summary */}
      <div
        style={{
          background: COLORS.surface,
          borderRadius: 14,
          padding: 18,
          marginBottom: 16,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: COLORS.primary + '15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconShield size={26} color={COLORS.primary} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0 }}>التحكم في الأقسام</h2>
            <p style={{ fontSize: 12, color: COLORS.textMuted, margin: '2px 0 0' }}>
              فعّل أو عطّل أي قسم في تطبيق المستخدمين — التغيير فوري
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
          <div style={{ flex: 1, background: COLORS.surfaceMuted, borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.success }}>{enabledCount}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>قسم مفعّل</div>
          </div>
          <div style={{ flex: 1, background: COLORS.surfaceMuted, borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.danger }}>{disabledCount}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>قسم معطّل</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {(['all', 'enabled', 'disabled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                border: filter === f ? 'none' : `1px solid ${COLORS.border}`,
                background: filter === f ? COLORS.primary : 'transparent',
                color: filter === f ? '#fff' : COLORS.textSecondary,
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {f === 'all' ? 'الكل' : f === 'enabled' ? 'المفعّلة' : 'المعطّلة'}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <IconSpinner size={28} color={COLORS.primary} />
        </div>
      )}

      {/* Categories */}
      {!loading && Object.entries(grouped).map(([category, items]) => {
        const filteredItems = filtered(items);
        if (filteredItems.length === 0) return null;
        return (
          <div key={category} style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMuted, margin: '0 4px 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {category}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredItems.map((meta) => {
                const enabled = flags[meta.code] !== false;
                const busy = busyCode === meta.code;
                return (
                  <div
                    key={meta.code}
                    style={{
                      background: COLORS.surface,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 12,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: (enabled ? COLORS.primary : COLORS.textMuted) + '15',
                        color: enabled ? COLORS.primary : COLORS.textMuted,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {meta.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, margin: 0 }}>{meta.name_ar}</p>
                        {busy && <IconSpinner size={12} color={COLORS.textMuted} />}
                      </div>
                      <p style={{ fontSize: 12, color: COLORS.textMuted, margin: '2px 0 0' }}>{meta.description_ar}</p>
                    </div>
                    <ToggleSwitch checked={enabled} disabled={busy} onChange={() => handleToggle(meta.code, enabled)} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============ Toggle Switch (animated) ============
function ToggleSwitch({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: () => void }) {
  return (
    <button
      onClick={() => !disabled && onChange()}
      disabled={disabled}
      style={{
        position: 'relative',
        width: 48,
        height: 28,
        borderRadius: 14,
        border: 'none',
        background: checked ? COLORS.success : COLORS.border,
        cursor: disabled ? 'wait' : 'pointer',
        padding: 0,
        flexShrink: 0,
        transition: 'background 0.2s',
      }}
      role="switch"
      aria-checked={checked}
    >
      <motion.div
        animate={{ x: checked ? -22 : 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 320 }}
        style={{
          position: 'absolute',
          top: 3,
          right: 3,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  );
}
