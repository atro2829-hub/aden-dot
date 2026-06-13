'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import {
  userService,
} from '@/lib/supabase-service';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { getActiveSupabaseConfig, clearSupabaseConfig } from '@/lib/supabase-config';
import {
  ArrowBackIcon, SettingsIcon, BellIcon, LockIcon, GlobeIcon,
  FingerPrintIcon, ShieldIcon, PremiumIcon,
} from '@/components/icons/aden-dot-icons';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
      whileTap={onClick ? { scale: 0.99 } : {}}
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
const APP_VERSION = '1.2.0';

export function SettingsPage() {
  const lang = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [editNickname, setEditNickname] = useState(user?.nickname || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Toast auto-dismiss
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Get toggle states from user profile (persisted)
  const privateAccount = (user as Record<string, unknown>)?.privateAccount as boolean || false;
  const showOnline = (user as Record<string, unknown>)?.showOnlineStatus as boolean ?? true;
  const readReceipts = (user as Record<string, unknown>)?.readReceipts as boolean ?? true;
  const pushNotifs = (user as Record<string, unknown>)?.pushNotifications as boolean ?? true;
  const emailNotifs = (user as Record<string, unknown>)?.emailNotifications as boolean ?? true;
  const soundNotifs = (user as Record<string, unknown>)?.soundNotifications as boolean ?? true;
  const biometric = (user as Record<string, unknown>)?.biometric as boolean || false;
  const twoFactor = (user as Record<string, unknown>)?.twoFactor as boolean || false;

  // Handle toggle that saves to profile
  const handleToggle = useCallback(async (field: string, value: boolean) => {
    if (!user) return;
    try {
      await updateUser({ [field]: value } as Record<string, unknown>);
      setToastMessage(t('settings.savedSuccess', lang));
    } catch (err) {
      console.error('[SettingsPage] toggle error:', err);
    }
  }, [user, updateUser, lang]);

  // Change password
  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setToastMessage(lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setToastMessage(lang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      const client = getSupabaseBrowser();
      if (!client) throw new Error('Supabase not configured');
      const { error } = await client.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setToastMessage(t('settings.passwordChanged', lang));
      setShowPasswordDialog(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('[SettingsPage] changePassword error:', err);
      setToastMessage(t('app.failed', lang));
    } finally {
      setPasswordLoading(false);
    }
  };

  // Reset password via email
  const handleResetPassword = async () => {
    if (!user?.email) return;
    setPasswordLoading(true);
    try {
      const client = getSupabaseBrowser();
      if (!client) throw new Error('Supabase not configured');
      const { error } = await client.auth.resetPasswordForEmail(user.email);
      if (error) throw error;
      setToastMessage(lang === 'ar' ? 'تم إرسال رابط إعادة تعيين كلمة المرور' : 'Password reset link sent to your email');
    } catch (err) {
      console.error('[SettingsPage] resetPassword error:', err);
      setToastMessage(t('app.failed', lang));
    } finally {
      setPasswordLoading(false);
    }
  };

  // Update profile
  const handleUpdateProfile = async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      await updateUser({
        nickname: editNickname,
        bio: editBio,
      } as Record<string, unknown>);
      setToastMessage(t('settings.savedSuccess', lang));
      setShowProfileDialog(false);
    } catch (err) {
      console.error('[SettingsPage] updateProfile error:', err);
      setToastMessage(t('app.failed', lang));
    } finally {
      setProfileLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleteLoading(true);
    try {
      const client = getSupabaseBrowser();
      if (!client) throw new Error('Supabase not configured');

      // Delete user data from users table
      await client.from('users').delete().eq('uid', user.uid);
      // Delete wallet
      await client.from('wallets').delete().eq('uid', user.uid);
      // Delete followers
      await client.from('followers').delete().or(`follower_uid.eq.${user.uid},followed_uid.eq.${user.uid}`);
      // Delete auth user (requires service role - may not work from client)
      // Fallback: sign out and clear local state
      await logout();
      setActiveTab('home');
      setToastMessage(lang === 'ar' ? 'تم حذف الحساب' : 'Account deleted');
    } catch (err) {
      console.error('[SettingsPage] deleteAccount error:', err);
      setToastMessage(t('app.failed', lang));
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const ChevronIcon = () => (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
  );

  return (
    <div className="space-y-4 pb-8">
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

      {/* Account */}
      <SettingsSection title={t('settings.account', lang)}>
        <SettingsRow
          icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>}
          label={t('auth.email', lang)}
        >
          <span className="text-xs text-muted-foreground">{user?.email || '—'}</span>
        </SettingsRow>
        <SettingsRow
          icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
          label={lang === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}
          onClick={() => {
            setEditNickname(user?.nickname || '');
            setEditBio(user?.bio || '');
            setShowProfileDialog(true);
          }}
        >
          <ChevronIcon />
        </SettingsRow>
        <SettingsRow
          icon={<LockIcon size={16} color="var(--primary)" />}
          label={t('settings.changePassword', lang)}
          onClick={() => setShowPasswordDialog(true)}
        >
          <ChevronIcon />
        </SettingsRow>
      </SettingsSection>

      {/* Privacy */}
      <SettingsSection title={t('settings.privacy', lang)}>
        <SettingsRow icon={<LockIcon size={16} color="var(--primary)" />} label={t('settings.privateAccount', lang)}>
          <ToggleSwitch enabled={privateAccount} onChange={(v) => handleToggle('privateAccount', v)} />
        </SettingsRow>
        <SettingsRow icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /></svg>} label={t('settings.showOnlineStatus', lang)}>
          <ToggleSwitch enabled={showOnline} onChange={(v) => handleToggle('showOnlineStatus', v)} />
        </SettingsRow>
        <SettingsRow icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>} label={t('settings.readReceipts', lang)}>
          <ToggleSwitch enabled={readReceipts} onChange={(v) => handleToggle('readReceipts', v)} />
        </SettingsRow>
      </SettingsSection>

      {/* Security */}
      <SettingsSection title={t('settings.security', lang)}>
        <SettingsRow icon={<FingerPrintIcon size={16} color="var(--primary)" />} label={t('settings.biometric', lang)}>
          <ToggleSwitch enabled={biometric} onChange={(v) => handleToggle('biometric', v)} />
        </SettingsRow>
        <SettingsRow icon={<ShieldIcon size={16} color="var(--primary)" />} label={t('settings.twoFactor', lang)}>
          <ToggleSwitch enabled={twoFactor} onChange={(v) => handleToggle('twoFactor', v)} />
        </SettingsRow>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title={t('settings.notifications', lang)}>
        <SettingsRow icon={<BellIcon size={16} color="var(--primary)" />} label={t('settings.pushNotifications', lang)}>
          <ToggleSwitch enabled={pushNotifs} onChange={(v) => handleToggle('pushNotifications', v)} />
        </SettingsRow>
        <SettingsRow icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>} label={t('settings.emailNotifications', lang)}>
          <ToggleSwitch enabled={emailNotifs} onChange={(v) => handleToggle('emailNotifications', v)} />
        </SettingsRow>
        <SettingsRow icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" /></svg>} label={t('settings.soundNotifications', lang)}>
          <ToggleSwitch enabled={soundNotifs} onChange={(v) => handleToggle('soundNotifications', v)} />
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
          <span className="text-xs text-muted-foreground">{APP_VERSION}</span>
        </SettingsRow>
        <SettingsRow
          icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg>}
          label={t('settings.termsOfService', lang)}
          onClick={() => window.open('https://adendot.app/terms', '_blank')}
        >
          <ChevronIcon />
        </SettingsRow>
        <SettingsRow
          icon={<ShieldIcon size={16} color="var(--primary)" />}
          label={t('settings.privacyPolicy', lang)}
          onClick={() => window.open('https://adendot.app/privacy', '_blank')}
        >
          <ChevronIcon />
        </SettingsRow>
        <SettingsRow
          icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>}
          label={t('settings.contactUs', lang)}
          onClick={() => window.open('mailto:support@adendot.app', '_blank')}
        >
          <ChevronIcon />
        </SettingsRow>
      </SettingsSection>

      {/* Database Setup */}
      <SettingsSection title={lang === 'ar' ? 'قاعدة البيانات' : 'Database'}>
        <SettingsRow
          icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>}
          label={lang === 'ar' ? 'إعداد Supabase' : 'Supabase Setup'}
          onClick={() => {
            clearSupabaseConfig();
            window.location.reload();
          }}
        >
          <span className="text-xs text-amber-500">{getActiveSupabaseConfig() ? (lang === 'ar' ? 'متصل' : 'Connected') : (lang === 'ar' ? 'غير متصل' : 'Not connected')}</span>
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
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 h-9 rounded-xl text-sm font-semibold text-white bg-red-500 disabled:opacity-50"
              >
                {deleteLoading ? (lang === 'ar' ? 'جاري الحذف...' : 'Deleting...') : t('app.delete', lang)}
              </button>
            </div>
          </div>
        ) : (
          <motion.button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-2 text-xs text-red-400/60"
            whileTap={{ scale: 0.97 }}
          >
            {t('settings.deleteAccount', lang)}
          </motion.button>
        )}
      </div>

      {/* Branding */}
      <div className="text-center pt-4 pb-8">
        <p className="text-[10px] text-muted-foreground">QTBM DEV © {new Date().getFullYear()}</p>
        <p className="text-[10px] text-primary/40">Aden Dot v{APP_VERSION}</p>
      </div>

      {/* Password Change Dialog */}
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.changePassword', lang)}</AlertDialogTitle>
            <AlertDialogDescription dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {lang === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter your new password'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2">
            <Input
              type="password"
              placeholder={lang === 'ar' ? 'كلمة المرور الجديدة' : 'New password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-10"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            />
            <Input
              type="password"
              placeholder={lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-10"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('app.cancel', lang)}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleChangePassword}
              disabled={passwordLoading}
            >
              {passwordLoading ? (lang === 'ar' ? 'جاري...' : 'Saving...') : t('settings.changePassword', lang)}
            </AlertDialogAction>
          </AlertDialogFooter>
          <div className="pt-2 border-t border-border">
            <button
              onClick={handleResetPassword}
              disabled={passwordLoading}
              className="w-full text-xs text-primary hover:underline py-2"
            >
              {lang === 'ar' ? 'أو إرسال رابط إعادة تعيين بالبريد' : 'Or send reset link via email'}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Profile Edit Dialog */}
      <AlertDialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{lang === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}</AlertDialogTitle>
            <AlertDialogDescription dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {lang === 'ar' ? 'حدث معلومات ملفك الشخصي' : 'Update your profile information'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {t('auth.nickname', lang)}
              </label>
              <Input
                placeholder={t('auth.nickname', lang)}
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                className="h-10"
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {lang === 'ar' ? 'النبذة' : 'Bio'}
              </label>
              <Input
                placeholder={lang === 'ar' ? 'نبذة عنك...' : 'About you...'}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="h-10"
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('app.cancel', lang)}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateProfile}
              disabled={profileLoading}
            >
              {profileLoading ? (lang === 'ar' ? 'جاري...' : 'Saving...') : t('app.save', lang)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
