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
const GOLD = '#D4A853';
const GOLD_LIGHT = '#F5C542';
const NAVY = '#1A1F36';
const NAVY_LIGHT = '#242A45';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
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
      className="min-h-screen flex flex-col justify-center px-6 py-8"
      style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 50%, #0F1225 100%)` }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${GOLD}, transparent)` }} />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full opacity-5" style={{ background: `radial-gradient(circle, ${GOLD_LIGHT}, transparent)` }} />
      </div>

      <div className="relative z-10 max-w-sm mx-auto w-full">
        {/* Logo */}
        <motion.div className="text-center mb-10" variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
          <div className="mx-auto w-20 h-20 mb-4">
            <AppLogoIcon size={80} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{t('app.name', lang)}</h1>
          <p className="text-sm" style={{ color: GOLD }}>{t('auth.welcomeBack', lang)}</p>
        </motion.div>

        {/* Form */}
        <motion.form onSubmit={handleLogin} className="space-y-4" variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
          {/* Email */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">{t('auth.email', lang)}</Label>
            <div className="relative">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder', lang)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-amber-500/50 focus:ring-amber-500/20"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">{t('auth.password', lang)}</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder', lang)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl pr-10 focus:border-amber-500/50 focus:ring-amber-500/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 hover:text-white"
              >
                <EyeIcon size={18} color="#9CA3AF" />
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-left">
            <button
              type="button"
              onClick={() => setShowAuth('forgot-password')}
              className="text-sm hover:underline"
              style={{ color: GOLD }}
            >
              {t('auth.forgotPassword', lang)}
            </button>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl"
            >
              {error}
            </motion.div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl text-base font-semibold transition-all"
            style={{
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
              color: NAVY,
            }}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full"
                style={{ borderColor: `${NAVY}40`, borderTopColor: NAVY }}
              />
            ) : (
              t('auth.login', lang)
            )}
          </Button>
        </motion.form>

        {/* Social Login Placeholder */}
        <motion.div className="mt-6" variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500">{t('auth.orContinueWith', lang)}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="flex gap-3">
            <button className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 text-white text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 text-white text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Apple
            </button>
          </div>
        </motion.div>

        {/* Register Link */}
        <motion.div className="text-center mt-8" variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.4 }}>
          <span className="text-gray-400 text-sm">{t('auth.noAccount', lang)} </span>
          <button
            onClick={() => setShowAuth('register')}
            className="text-sm font-semibold hover:underline"
            style={{ color: GOLD }}
          >
            {t('auth.signUp', lang)}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============ Register Page ============
export function RegisterPage() {
  const lang = useAppStore((s) => s.language);
  const setShowAuth = useAppStore((s) => s.setShowAuth);
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError(lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    await register(email, password, username, nickname);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col justify-center px-6 py-8"
      style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 50%, #0F1225 100%)` }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${GOLD}, transparent)` }} />
      </div>

      <div className="relative z-10 max-w-sm mx-auto w-full">
        {/* Back Button */}
        <motion.button
          onClick={() => setShowAuth('login')}
          className="mb-6 p-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowBackIcon size={24} color={GOLD} />
        </motion.button>

        {/* Header */}
        <motion.div className="mb-8" variants={fadeIn} initial="initial" animate="animate">
          <h1 className="text-2xl font-bold text-white mb-1">{t('auth.welcomeNew', lang)}</h1>
          <p className="text-sm" style={{ color: GOLD }}>{t('auth.registerDesc', lang)}</p>
        </motion.div>

        {/* Form */}
        <motion.form onSubmit={handleRegister} className="space-y-4" variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">{t('auth.username', lang)}</Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('auth.usernamePlaceholder', lang)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-amber-500/50 focus:ring-amber-500/20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">{t('auth.nickname', lang)}</Label>
            <Input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t('auth.nicknamePlaceholder', lang)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-amber-500/50 focus:ring-amber-500/20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">{t('auth.email', lang)}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder', lang)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-amber-500/50 focus:ring-amber-500/20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">{t('auth.password', lang)}</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder', lang)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl pr-10 focus:border-amber-500/50 focus:ring-amber-500/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400"
              >
                <EyeIcon size={18} color="#9CA3AF" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">{t('auth.confirmPassword', lang)}</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.confirmPassword', lang)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-amber-500/50 focus:ring-amber-500/20"
              required
            />
          </div>

          {/* Error */}
          {(error || localError) && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl"
            >
              {localError || error}
            </motion.div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl text-base font-semibold"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: NAVY }}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 rounded-full"
                style={{ border: `2px solid ${NAVY}30`, borderTopColor: NAVY }}
              />
            ) : (
              t('auth.register', lang)
            )}
          </Button>
        </motion.form>

        {/* Login Link */}
        <motion.div className="text-center mt-6" variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.3 }}>
          <span className="text-gray-400 text-sm">{t('auth.hasAccount', lang)} </span>
          <button
            onClick={() => setShowAuth('login')}
            className="text-sm font-semibold hover:underline"
            style={{ color: GOLD }}
          >
            {t('auth.signIn', lang)}
          </button>
        </motion.div>
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

  const handleVerify = async (codeStr: string) => {
    setIsVerifying(true);
    // Simulate verification
    await new Promise((r) => setTimeout(r, 1500));
    verifyEmail();
    setIsVerifying(false);
  };

  const handleResend = () => {
    setResendTimer(60);
    // Resend code logic
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col justify-center px-6 py-8"
      style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 50%, #0F1225 100%)` }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="relative z-10 max-w-sm mx-auto w-full">
        {/* Back */}
        <motion.button
          onClick={() => setShowAuth('login')}
          className="mb-6 p-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowBackIcon size={24} color={GOLD} />
        </motion.button>

        {/* Icon */}
        <motion.div className="text-center mb-8" variants={fadeIn} initial="initial" animate="animate">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}30` }}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4L12 13 2 4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('auth.verifyEmail', lang)}</h1>
          <p className="text-sm text-gray-400">{t('auth.enterCode', lang)}</p>
        </motion.div>

        {/* OTP Input */}
        <motion.div className="flex gap-2 justify-center mb-8" variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(i, e.target.value)}
              className="w-12 h-14 text-center text-xl font-bold rounded-xl border focus:outline-none focus:ring-2 transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderColor: digit ? GOLD : 'rgba(255,255,255,0.1)',
                color: 'white',
                boxShadow: digit ? `0 0 10px ${GOLD}30` : 'none',
              }}
            />
          ))}
        </motion.div>

        {/* Verifying */}
        {isVerifying && (
          <motion.div className="text-center mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-8 h-8 mx-auto rounded-full"
              style={{ border: `2px solid ${GOLD}30`, borderTopColor: GOLD }}
            />
          </motion.div>
        )}

        {/* Resend */}
        <motion.div className="text-center" variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
          {resendTimer > 0 ? (
            <p className="text-sm text-gray-400">
              {t('auth.resendIn', lang)} {resendTimer} {t('auth.seconds', lang)}
            </p>
          ) : (
            <button onClick={handleResend} className="text-sm font-semibold hover:underline" style={{ color: GOLD }}>
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
      className="min-h-screen flex flex-col justify-center px-6 py-8"
      style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 50%, #0F1225 100%)` }}
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
            <div key={s} className="flex-1 h-1 rounded-full transition-all" style={{ background: step >= s ? GOLD : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-2xl font-bold text-white mb-2">{t('auth.avatar', lang)}</h1>
              <p className="text-sm text-gray-400 mb-8">{t('auth.completeProfile', lang)}</p>

              <div className="flex justify-center mb-8">
                <div className="relative">
                  <Avatar className="w-28 h-28 border-4" style={{ borderColor: GOLD }}>
                    <AvatarImage src={user?.profileImage || '/avatar.png'} />
                    <AvatarFallback className="text-2xl" style={{ background: `${GOLD}20`, color: GOLD }}>
                      {user?.nickname?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center shadow-lg" style={{ background: GOLD }}>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </button>
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                className="w-full h-12 rounded-xl text-base font-semibold"
                style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: NAVY }}
              >
                {t('app.next', lang)}
              </Button>
            </motion.div>
          ) : (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-2xl font-bold text-white mb-2">{t('auth.completeProfile', lang)}</h1>
              <p className="text-sm text-gray-400 mb-6">{t('auth.bio', lang)}</p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">{t('auth.bio', lang)}</Label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={t('auth.bioPlaceholder', lang)}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-gray-500 h-24 rounded-xl p-3 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">{t('auth.gender', lang)}</Label>
                  <div className="flex gap-2">
                    {(['male', 'female', 'unspecified'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className="flex-1 h-11 rounded-xl text-sm font-medium transition-all"
                        style={{
                          background: gender === g ? `${GOLD}20` : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${gender === g ? GOLD : 'rgba(255,255,255,0.1)'}`,
                          color: gender === g ? GOLD : '#9CA3AF',
                        }}
                      >
                        {t(`auth.${g}`, lang)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">{t('auth.region', lang)}</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl">
                      <SelectValue placeholder={t('auth.selectRegion', lang)} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1F36] border-white/10">
                      {regions.map((r) => (
                        <SelectItem key={r.id} value={r.id} className="text-white focus:bg-white/10 focus:text-white">
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
                    className="flex-1 h-12 rounded-xl text-white border border-white/10 hover:bg-white/5"
                  >
                    {t('app.back', lang)}
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="flex-1 h-12 rounded-xl text-base font-semibold"
                    style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: NAVY }}
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
      className="min-h-screen flex flex-col justify-center px-6 py-8"
      style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 50%, #0F1225 100%)` }}
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
          <ArrowBackIcon size={24} color={GOLD} />
        </motion.button>

        <AnimatePresence mode="wait">
          {!isSent ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}30` }}>
                <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{t('auth.resetPassword', lang)}</h1>
              <p className="text-sm text-gray-400 mb-6">{t('auth.forgotDesc', lang)}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">{t('auth.email', lang)}</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder', lang)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold"
                  style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: NAVY }}
                >
                  {t('auth.resetPassword', lang)}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6" style={{ background: `${GOLD}15`, border: `2px solid ${GOLD}` }}>
                <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{t('auth.resetLinkSent', lang)}</h1>
              <p className="text-sm text-gray-400 mb-6">{t('auth.verificationSent', lang)}</p>
              <Button
                onClick={() => setShowAuth('login')}
                className="w-full h-12 rounded-xl text-base font-semibold"
                style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: NAVY }}
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
