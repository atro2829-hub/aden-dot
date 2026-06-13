'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore, useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import {
  ArrowBackIcon, SettingsIcon, BellIcon, LockIcon, GlobeIcon,
  FingerPrintIcon, ShieldIcon, VerifiedIcon, PremiumIcon,
} from '@/components/icons/aden-dot-icons';

// ============ Toggle Switch ============
function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
        animate={{ left: enabled ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

// ============ Settings Section ============
function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">{title}</h3>
      <div className="rounded-xl overflow-hidden bg-card border border-border">
        {children}
      </div>
    </div>
  );
}

// ============ Settings Row ============
function SettingsRow({ icon, label, children, onClick, destructive }: {
  icon: React.ReactNode;
  label: string;
  children?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors border-b border-border last:border-b-0 hover:bg-primary/5"
      whileTap={{ scale: 0.99 }}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${destructive ? 'bg-red-500/10' : 'bg-primary/10'}`}>
        {icon}
      </div>
      <span className={`flex-1 text-left text-sm ${destructive ? 'text-red-500' : 'text-foreground'}`} dir="auto">
        {label}
      </span>
      {children}
    </motion.button>
  );
}

// ============ Settings Page ============
export function SettingsPage() {
  const lang = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const [biometric, setBiometric] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [showOnline, setShowOnline] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [soundNotifs, setSoundNotifs] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="space-y-4 pb-8">
      {/* Account */}
      <SettingsSection title={t('settings.account', lang)}>
        <SettingsRow
          icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>}
          label={t('auth.email', lang)}
        >
          <span className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</span>
        </SettingsRow>
        <SettingsRow
          icon={<LockIcon size={16} color="var(--primary)" />}
          label={t('settings.changePassword', lang)}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </SettingsRow>
        <SettingsRow
          icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M16 2v4M8 2v4M2 10h20" /></svg>}
          label={t('settings.loginHistory', lang)}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </SettingsRow>
      </SettingsSection>

      {/* Privacy */}
      <SettingsSection title={t('settings.privacy', lang)}>
        <SettingsRow icon={<LockIcon size={16} color="var(--primary)" />} label={t('settings.privateAccount', lang)}>
          <ToggleSwitch enabled={privateAccount} onChange={setPrivateAccount} />
        </SettingsRow>
        <SettingsRow icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /></svg>} label={t('settings.showOnlineStatus', lang)}>
          <ToggleSwitch enabled={showOnline} onChange={setShowOnline} />
        </SettingsRow>
        <SettingsRow icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>} label={t('settings.readReceipts', lang)}>
          <ToggleSwitch enabled={readReceipts} onChange={setReadReceipts} />
        </SettingsRow>
        <SettingsRow icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M4.93 4.93l14.14 14.14" /></svg>} label={t('settings.blockedUsers', lang)}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </SettingsRow>
      </SettingsSection>

      {/* Security */}
      <SettingsSection title={t('settings.security', lang)}>
        <SettingsRow icon={<FingerPrintIcon size={16} color="var(--primary)" />} label={t('settings.biometric', lang)}>
          <ToggleSwitch enabled={biometric} onChange={setBiometric} />
        </SettingsRow>
        <SettingsRow icon={<ShieldIcon size={16} color="var(--primary)" />} label={t('settings.twoFactor', lang)}>
          <ToggleSwitch enabled={twoFactor} onChange={setTwoFactor} />
        </SettingsRow>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title={t('settings.notifications', lang)}>
        <SettingsRow icon={<BellIcon size={16} color="var(--primary)" />} label={t('settings.pushNotifications', lang)}>
          <ToggleSwitch enabled={pushNotifs} onChange={setPushNotifs} />
        </SettingsRow>
        <SettingsRow icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>} label={t('settings.emailNotifications', lang)}>
          <ToggleSwitch enabled={emailNotifs} onChange={setEmailNotifs} />
        </SettingsRow>
        <SettingsRow icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" /></svg>} label={t('settings.soundNotifications', lang)}>
          <ToggleSwitch enabled={soundNotifs} onChange={setSoundNotifs} />
        </SettingsRow>
      </SettingsSection>

      {/* Language & Theme */}
      <SettingsSection title={lang === 'ar' ? 'المظهر واللغة' : 'Appearance & Language'}>
        <SettingsRow icon={<GlobeIcon size={16} color="var(--primary)" />} label={t('settings.language', lang)}>
          <div className="flex gap-1">
            <button
              onClick={() => setLanguage('ar')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                lang === 'ar' ? 'bg-primary/10 text-primary border border-primary' : 'text-muted-foreground'
              }`}
            >
              {t('settings.arabic', lang)}
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                lang === 'en' ? 'bg-primary/10 text-primary border border-primary' : 'text-muted-foreground'
              }`}
            >
              {t('settings.english', lang)}
            </button>
          </div>
        </SettingsRow>
        <SettingsRow icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>} label={t('settings.darkMode', lang)}>
          <ToggleSwitch enabled={theme === 'dark'} onChange={toggleTheme} />
        </SettingsRow>
      </SettingsSection>

      {/* About */}
      <SettingsSection title={t('settings.about', lang)}>
        <SettingsRow icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>} label={t('settings.appVersion', lang)}>
          <span className="text-xs text-muted-foreground">1.0.0</span>
        </SettingsRow>
        <SettingsRow icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg>} label={t('settings.termsOfService', lang)}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </SettingsRow>
        <SettingsRow icon={<ShieldIcon size={16} color="var(--primary)" />} label={t('settings.privacyPolicy', lang)}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </SettingsRow>
        <SettingsRow icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>} label={t('settings.contactUs', lang)}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </SettingsRow>
      </SettingsSection>

      {/* Logout */}
      <div className="pt-2">
        <motion.button
          onClick={async () => { await logout(); setActiveTab('home'); }}
          className="w-full h-12 rounded-xl text-sm font-semibold text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15"
          whileTap={{ scale: 0.97 }}
        >
          {t('auth.logout', lang)}
        </motion.button>
      </div>

      {/* Delete Account */}
      <div className="pt-2">
        {showDeleteConfirm ? (
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <p className="text-sm text-red-500 mb-3">{t('auth.deleteAccountConfirm', lang)}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-9 rounded-xl text-sm text-muted-foreground bg-muted"
              >
                {t('app.cancel', lang)}
              </button>
              <button
                className="flex-1 h-9 rounded-xl text-sm font-semibold text-white bg-red-500"
              >
                {t('app.delete', lang)}
              </button>
            </div>
          </div>
        ) : (
          <motion.button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-2 text-xs text-red-400/60"
            whileTap={{ scale: 0.97 }}
          >
            {t('auth.deleteAccount', lang)}
          </motion.button>
        )}
      </div>

      {/* Branding */}
      <div className="text-center pt-4 pb-8">
        <p className="text-[10px] text-muted-foreground">QTBM DEV © 2024</p>
        <p className="text-[10px] text-primary/40">Aden Dot v1.0.0</p>
      </div>
    </div>
  );
}
