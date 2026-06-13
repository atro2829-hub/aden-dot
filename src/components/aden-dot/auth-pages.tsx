'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useAppStore } from '@/lib/store';
import { t, regions } from '@/lib/i18n';
import { AppLogoIcon, ArrowBackIcon, EyeIcon } from '@/components/icons/aden-dot-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ============ Shared Styles ============
const pageVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.06 },
  },
};

// ============ Login Page ============
export function LoginPage() {
  const lang = useAppStore((s) => s.language);
  const setShowAuth = useAppStore((s) => s.setShowAuth);
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col justify-center px-6 py-8 relative overflow-hidden bg-background"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--primary), transparent)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, var(--primary), transparent)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.08, 0.05] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 max-w-sm mx-auto w-full">
        {/* Logo Section */}
        <motion.div className="text-center mb-10" variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
          <motion.div
            className="mx-auto w-24 h-24 mb-5 rounded-3xl flex items-center justify-center shadow-2xl bg-primary shadow-primary/30"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          >
            <img src="/icon.png" alt="Aden Dot" className="w-16 h-16 rounded-2xl" />
          </motion.div>
          <motion.h1
            className="text-3xl font-bold text-foreground mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {t('app.name', lang)}
          </motion.h1>
          <motion.p
            className="text-sm font-medium text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t('auth.welcomeBack', lang)}
          </motion.p>
          <motion.p
            className="text-xs text-muted-foreground mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {t('auth.loginDesc', lang)}
          </motion.p>
        </motion.div>

        {/* Form */}
        <motion.form onSubmit={handleLogin} className="space-y-4" variants={stagger} initial="initial" animate="animate">
          {/* Email */}
          <motion.div className="space-y-2" variants={fadeIn}>
            <Label className="text-foreground text-sm">{t('auth.email', lang)}</Label>
            <div className="relative">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder', lang)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20"
                required
              />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div className="space-y-2" variants={fadeIn}>
            <Label className="text-foreground text-sm">{t('auth.password', lang)}</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder', lang)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl pr-10 focus:border-primary/50 focus:ring-primary/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 -translate-y-1/2 right-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <EyeIcon size={18} color="var(--muted-foreground)" />
              </button>
            </div>
          </motion.div>

          {/* Forgot Password */}
          <motion.div className="text-left" variants={fadeIn}>
            <button
              type="button"
              onClick={() => setShowAuth('forgot-password')}
              className="text-sm hover:underline transition-colors text-primary"
            >
              {t('auth.forgotPassword', lang)}
            </button>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -5, height: 0 }}
                className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-xl"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.div variants={fadeIn}>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-5 h-5 border-2 rounded-full border-primary-foreground/30 border-t-primary-foreground"
                />
              ) : (
                t('auth.login', lang)
              )}
            </Button>
          </motion.div>
        </motion.form>

        {/* Social Login */}
        <motion.div className="mt-6" variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{t('auth.orContinueWith', lang)}</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="flex gap-3">
            <motion.button
              className="flex-1 h-11 rounded-xl bg-card border border-border text-foreground text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors"
              whileTap={{ scale: 0.97 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </motion.button>
            <motion.button
              className="flex-1 h-11 rounded-xl bg-card border border-border text-foreground text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors"
              whileTap={{ scale: 0.97 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Apple
            </motion.button>
          </div>
        </motion.div>

        {/* Register Link */}
        <motion.div className="text-center mt-8" variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.4 }}>
          <span className="text-muted-foreground text-sm">{t('auth.noAccount', lang)} </span>
          <button
            onClick={() => setShowAuth('register')}
            className="text-sm font-semibold hover:underline transition-colors text-primary"
          >
            {t('auth.signUp', lang)}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============ Register Page (Multi-step: Email → Password → Username → Nickname) ============
export function RegisterPage() {
  const lang = useAppStore((s) => s.language);
  const setShowAuth = useAppStore((s) => s.setShowAuth);
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);

  const [step, setStep] = useState(1); // 1: email, 2: password, 3: username, 4: nickname
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validateStep = (): boolean => {
    setLocalError(null);
    if (step === 1) {
      if (!email || !email.includes('@')) {
        setLocalError(t('auth.invalidEmail', lang));
        return false;
      }
    } else if (step === 2) {
      if (password.length < 6) {
        setLocalError(t('auth.passwordTooShort', lang));
        return false;
      }
      if (password !== confirmPassword) {
        setLocalError(t('auth.passwordsNoMatch', lang));
        return false;
      }
    } else if (step === 3) {
      if (!username || username.length < 3) {
        setLocalError(lang === 'ar' ? 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' : 'Username must be at least 3 characters');
        return false;
      }
    } else if (step === 4) {
      if (!nickname) {
        setLocalError(lang === 'ar' ? 'اللقب مطلوب' : 'Nickname is required');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < 4) {
        setStep(step + 1);
      } else {
        handleRegister();
      }
    }
  };

  const handleRegister = async () => {
    await register(email, password, username, nickname);
  };

  const stepTitles = [
    t('auth.stepEmail', lang),
    t('auth.stepPassword', lang),
    t('auth.stepUsername', lang),
    t('auth.stepNickname', lang),
  ];

  return (
    <motion.div
      className="min-h-screen flex flex-col justify-center px-6 py-8 relative overflow-hidden bg-background"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--primary), transparent)' }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 max-w-sm mx-auto w-full">
        {/* Back Button */}
        <motion.button
          onClick={() => {
            if (step > 1) setStep(step - 1);
            else setShowAuth('login');
          }}
          className="mb-4 p-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowBackIcon size={24} color="var(--primary)" />
        </motion.button>

        {/* Progress Steps */}
        <div className="flex gap-1.5 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className={`flex-1 h-1.5 rounded-full ${step >= s ? 'bg-primary' : 'bg-muted'}`}
              animate={{ scaleX: step >= s ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Step Title */}
        <motion.div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-primary/10 text-primary">
              {step}
            </div>
            <h1 className="text-2xl font-bold text-foreground">{stepTitles[step - 1]}</h1>
          </div>
          <p className="text-sm text-primary">{t('auth.registerDesc', lang)}</p>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground text-sm">{t('auth.email', lang)}</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder', lang)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20"
                  autoFocus
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground text-sm">{t('auth.password', lang)}</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder', lang)}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl pr-10 focus:border-primary/50 focus:ring-primary/20"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 right-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <EyeIcon size={18} color="var(--muted-foreground)" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground text-sm">{t('auth.confirmPassword', lang)}</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.confirmPassword', lang)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20"
                />
              </div>
              {/* Password strength indicator */}
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className="flex-1 h-1 rounded-full transition-all"
                    style={{
                      background: password.length >= level * 2
                        ? level <= 1 ? '#EF4444' : level <= 2 ? '#F59E0B' : '#10B981'
                        : 'var(--muted)',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground text-sm">{t('auth.username', lang)}</Label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder={t('auth.usernamePlaceholder', lang)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20"
                  autoFocus
                />
                <p className="text-[10px] text-muted-foreground">{lang === 'ar' ? 'أحرف إنجليزية وأرقام و _ فقط' : 'Letters, numbers, and _ only'}</p>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground text-sm">{t('auth.nickname', lang)}</Label>
                <Input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={t('auth.nicknamePlaceholder', lang)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20"
                  autoFocus
                />
              </div>
              {/* Preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                    {nickname?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{nickname || '...'}</p>
                  <p className="text-xs text-muted-foreground">@{username}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {(error || localError) && (
            <motion.div
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -5, height: 0 }}
              className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-xl mt-4"
            >
              {localError || error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="mt-6">
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="w-full h-12 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
              />
            ) : step === 4 ? (
              t('auth.register', lang)
            ) : (
              t('app.next', lang)
            )}
          </Button>
        </div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <span className="text-muted-foreground text-sm">{t('auth.hasAccount', lang)} </span>
          <button
            onClick={() => setShowAuth('login')}
            className="text-sm font-semibold hover:underline transition-colors text-primary"
          >
            {t('auth.signIn', lang)}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============ Verify Email Page ============
export function VerifyEmailPage() {
  const lang = useAppStore((s) => s.language);
  const setShowAuth = useAppStore((s) => s.setShowAuth);
  const isEmailVerified = useAuthStore((s) => s.isEmailVerified);
  const verifyEmail = useAuthStore((s) => s.verifyEmail);

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits entered
    if (newCode.every((d) => d !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (codeStr: string) => {
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 1500));
    verifyEmail();
    setIsVerifying(false);
  };

  const handleResend = () => {
    setResendTimer(60);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col justify-center px-6 py-8 relative overflow-hidden bg-background"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, var(--primary), transparent)', opacity: 0.06 }} />

      <div className="relative z-10 max-w-sm mx-auto w-full">
        {/* Back */}
        <motion.button
          onClick={() => setShowAuth('login')}
          className="mb-6 p-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowBackIcon size={24} color="var(--primary)" />
        </motion.button>

        {/* Icon */}
        <motion.div className="text-center mb-8" variants={fadeIn} initial="initial" animate="animate">
          <motion.div
            className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-4 bg-primary/10 border border-primary/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4L12 13 2 4" />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('auth.verifyEmail', lang)}</h1>
          <p className="text-sm text-muted-foreground">{t('auth.enterCode', lang)}</p>
        </motion.div>

        {/* OTP Input */}
        <motion.div className="flex gap-2.5 justify-center mb-8" variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
          {code.map((digit, i) => (
            <motion.input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-[52px] h-[60px] text-center text-xl font-bold rounded-xl border focus:outline-none focus:ring-2 transition-all bg-muted text-foreground caret-primary"
              style={{
                borderColor: digit ? 'var(--primary)' : 'var(--border)',
                boxShadow: digit ? '0 0 12px var(--primary) / 0.2' : 'none',
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            />
          ))}
        </motion.div>

        {/* Verifying */}
        <AnimatePresence>
          {isVerifying && (
            <motion.div className="text-center mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-8 h-8 mx-auto rounded-full border-2 border-primary/30 border-t-primary"
              />
              <p className="text-sm text-muted-foreground mt-2">{t('app.loading', lang)}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resend */}
        <motion.div className="text-center" variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
          {resendTimer > 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('auth.resendIn', lang)} <span className="text-primary">{resendTimer}</span> {t('auth.seconds', lang)}
            </p>
          ) : (
            <button onClick={handleResend} className="text-sm font-semibold hover:underline transition-colors text-primary">
              {t('auth.resendCode', lang)}
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============ Complete Profile Page ============
export function CompleteProfilePage() {
  const lang = useAppStore((s) => s.language);
  const completeProfile = useAuthStore((s) => s.completeProfile);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('unspecified');
  const [region, setRegion] = useState('');
  const [step, setStep] = useState(1); // 1: avatar, 2: details

  const handleComplete = async () => {
    await completeProfile({
      username: user?.username || '',
      nickname: user?.nickname || '',
      bio,
      gender,
      profileImage: user?.profileImage || '',
    });
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col justify-center px-6 py-8 relative overflow-hidden bg-background"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="relative z-10 max-w-sm mx-auto w-full">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map((s) => (
            <motion.div
              key={s}
              className={`flex-1 h-1.5 rounded-full ${step >= s ? 'bg-primary' : 'bg-muted'}`}
              animate={{ scaleX: step >= s ? 1 : 0.5 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-2xl font-bold text-foreground mb-2">{t('auth.avatar', lang)}</h1>
              <p className="text-sm text-muted-foreground mb-8">{t('auth.completeProfile', lang)}</p>

              <div className="flex justify-center mb-8">
                <motion.div
                  className="relative"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="w-32 h-32 rounded-full p-[3px] bg-primary">
                    <Avatar className="w-full h-full border-4 border-background">
                      <AvatarImage src={user?.profileImage || '/avatar.png'} />
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {user?.nickname?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <motion.button
                    className="absolute bottom-1 right-1 w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-primary text-primary-foreground"
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </motion.button>
                </motion.div>
              </div>

              <Button
                onClick={() => setStep(2)}
                className="w-full h-12 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
              >
                {t('app.next', lang)}
              </Button>
            </motion.div>
          ) : (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-2xl font-bold text-foreground mb-2">{t('auth.completeProfile', lang)}</h1>
              <p className="text-sm text-muted-foreground mb-6">{t('auth.bio', lang)}</p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground text-sm">{t('auth.bio', lang)}</Label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={t('auth.bioPlaceholder', lang)}
                    className="w-full bg-background border border-border text-foreground placeholder:text-muted-foreground h-24 rounded-xl p-3 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground text-sm">{t('auth.gender', lang)}</Label>
                  <div className="flex gap-2">
                    {(['male', 'female', 'unspecified'] as const).map((g) => (
                      <motion.button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`flex-1 h-11 rounded-xl text-sm font-medium transition-all ${gender === g ? 'bg-primary/10 text-primary border border-primary' : 'bg-muted text-muted-foreground border border-transparent'}`}
                        whileTap={{ scale: 0.96 }}
                      >
                        {t(`auth.${g}`, lang)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground text-sm">{t('auth.region', lang)}</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="bg-background border-border text-foreground h-12 rounded-xl">
                      <SelectValue placeholder={t('auth.selectRegion', lang)} />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {regions.map((r) => (
                        <SelectItem key={r.id} value={r.id} className="text-foreground focus:bg-muted focus:text-foreground">
                          {lang === 'ar' ? r.ar : r.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12 rounded-xl text-foreground border border-border hover:bg-muted"
                  >
                    {t('app.back', lang)}
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="flex-1 h-12 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isLoading ? '...' : t('app.done', lang)}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ============ Forgot Password Page ============
export function ForgotPasswordPage() {
  const lang = useAppStore((s) => s.language);
  const setShowAuth = useAppStore((s) => s.setShowAuth);

  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col justify-center px-6 py-8 relative overflow-hidden bg-background"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="relative z-10 max-w-sm mx-auto w-full">
        <motion.button
          onClick={() => setShowAuth('login')}
          className="mb-6 p-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowBackIcon size={24} color="var(--primary)" />
        </motion.button>

        <AnimatePresence mode="wait">
          {!isSent ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-primary/10 border border-primary/20"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{t('auth.resetPassword', lang)}</h1>
              <p className="text-sm text-muted-foreground mb-6">{t('auth.forgotDesc', lang)}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground text-sm">{t('auth.email', lang)}</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder', lang)}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                >
                  {t('auth.resetPassword', lang)}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <motion.div
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 bg-primary/10 border-2 border-primary"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{t('auth.resetLinkSent', lang)}</h1>
              <p className="text-sm text-muted-foreground mb-6">{t('auth.verificationSent', lang)}</p>
              <Button
                onClick={() => setShowAuth('login')}
                className="w-full h-12 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
              >
                {t('auth.signIn', lang)}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
