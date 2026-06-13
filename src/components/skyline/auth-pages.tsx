'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useAuthStore, useAppStore, fileToBase64 } from '@/lib/store';
import { authService } from '@/lib/supabase-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Mail, Lock, User, Globe, Sparkles, ArrowRight, RefreshCw, Send, AlertCircle, Loader2 } from 'lucide-react';

function getArabicErrorMessage(error: string): string {
  const lower = error.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('wrong password') || lower.includes('invalid password')) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
  }
  if (lower.includes('user not found') || lower.includes('no user found')) {
    return 'لم يتم العثور على حساب بهذا البريد الإلكتروني';
  }
  if (lower.includes('email already registered') || lower.includes('already registered') || lower.includes('user already exists')) {
    return 'البريد الإلكتروني مسجل بالفعل';
  }
  if (lower.includes('password') && (lower.includes('weak') || lower.includes('short') || lower.includes('6 characters') || lower.includes('too short'))) {
    return 'كلمة المرور ضعيفة، يجب أن تكون 6 أحرف على الأقل';
  }
  if (lower.includes('email') && lower.includes('invalid')) {
    return 'البريد الإلكتروني غير صالح';
  }
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('connection')) {
    return 'خطأ في الاتصال بالشبكة';
  }
  if (lower.includes('too many requests') || lower.includes('rate limit')) {
    return 'طلبات كثيرة جداً، يرجى المحاولة لاحقاً';
  }
  if (lower.includes('email not confirmed')) {
    return 'يرجى تأكيد بريدك الإلكتروني أولاً';
  }
  return error || 'حدث خطأ غير متوقع';
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const setShowAuth = useAppStore((s) => s.setShowAuth);

  const handleLogin = useCallback(async () => {
    if (!email || !password) return;
    await login(email, password);
  }, [email, password, login]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && email && password) handleLogin();
  }, [email, password, handleLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-rose-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back 👋</CardTitle>
          <CardDescription>Login to your Skyline account now.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{getArabicErrorMessage(error)}</span>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} className="pl-10" disabled={isLoading} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} className="pl-10" disabled={isLoading} />
            </div>
          </div>
          <div className="text-right">
            <button className="text-sm text-violet-600 hover:underline">Forgot password?</button>
          </div>
          <Button className="w-full bg-gradient-to-r from-violet-500 to-rose-500 hover:from-violet-600 hover:to-rose-600" onClick={handleLogin} disabled={isLoading || !email || !password}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
          </Button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => {}}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign in with Google
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <button onClick={() => setShowAuth('register')} className="text-violet-600 font-medium hover:underline">Create Account</button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [accepted, setAccepted] = useState(false);
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const setShowAuth = useAppStore((s) => s.setShowAuth);

  const handleRegister = useCallback(async () => {
    if (!email || !password || !accepted) return;
    const success = await register(email, password, username || undefined, nickname || undefined);
    if (success) {
      const user = useAuthStore.getState().user;
      if (!user?.isProfileComplete) {
        setShowAuth('complete-profile');
      } else {
        setShowAuth(null);
      }
    }
  }, [email, password, accepted, register, setShowAuth, username, nickname]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && email && password && accepted) handleRegister();
  }, [email, password, accepted, handleRegister]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-rose-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Account 🎉</CardTitle>
          <CardDescription>Join the Skyline community by creating your account now 😊</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{getArabicErrorMessage(error)}</span>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="reg-email">E-Mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="reg-email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" disabled={isLoading} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-username">Username (optional)</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="reg-username" type="text" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))} className="pl-10" disabled={isLoading} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-nickname">Nickname (optional)</Label>
            <Input id="reg-nickname" type="text" placeholder="Your display name" value={nickname} onChange={(e) => setNickname(e.target.value)} disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="reg-password" type="password" placeholder="Create a password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} className="pl-10" disabled={isLoading} />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" checked={accepted} onCheckedChange={(v) => setAccepted(v as boolean)} disabled={isLoading} />
            <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">I accept all terms and conditions</label>
          </div>
          <Button className="w-full bg-gradient-to-r from-violet-500 to-rose-500 hover:from-violet-600 hover:to-rose-600" onClick={handleRegister} disabled={isLoading || !email || !password || !accepted}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button onClick={() => setShowAuth('login')} className="text-violet-600 font-medium hover:underline">Sign In</button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function CompleteProfilePage() {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unspecified'>('unspecified');
  const [profileImage, setProfileImage] = useState('');
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const completeProfile = useAuthStore((s) => s.completeProfile);
  const setShowAuth = useAppStore((s) => s.setShowAuth);

  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setProfileImage(base64);
      setProfileImagePreview(base64);
    } catch {
      setCompletionError('فشل في معالجة الصورة');
    }
  }, []);

  const handleComplete = useCallback(async () => {
    if (!username) return;
    setIsCompleting(true);
    setCompletionError(null);
    try {
      await completeProfile({ username, nickname, bio, gender, profileImage });
      setShowAuth(null);
    } catch (error) {
      setCompletionError(error instanceof Error ? error.message : 'فشل في حفظ الملف الشخصي');
    } finally {
      setIsCompleting(false);
    }
  }, [username, nickname, bio, gender, profileImage, completeProfile, setShowAuth]);

  const handleSkip = useCallback(async () => {
    setIsCompleting(true);
    setCompletionError(null);
    try {
      // Skip with minimal profile - just mark as complete
      await completeProfile({ username: username || `user_${Date.now()}`, nickname: nickname || '', bio: '', gender: 'unspecified', profileImage: '' });
      setShowAuth(null);
    } catch (error) {
      setCompletionError(error instanceof Error ? error.message : 'فشل في حفظ الملف الشخصي');
    } finally {
      setIsCompleting(false);
    }
  }, [username, nickname, completeProfile, setShowAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-rose-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>Finish account creation by completing your profile or skip using the skip button.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {completionError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{completionError}</span>
            </div>
          )}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-violet-100">
                <AvatarImage src={profileImagePreview || '/avatar.png'} />
                <AvatarFallback><User className="w-10 h-10" /></AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center cursor-pointer hover:bg-violet-600 transition-colors">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))} className="pl-10" disabled={isCompleting} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Nickname</Label>
            <Input placeholder="Your display name" value={nickname} onChange={(e) => setNickname(e.target.value)} disabled={isCompleting} />
          </div>
          <div className="space-y-2">
            <Label>Biography</Label>
            <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" rows={3} placeholder="Tell us about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} maxLength={250} disabled={isCompleting} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Globe className="h-4 w-4" /> Gender</Label>
            <div className="flex gap-2">
              {(['male', 'female', 'unspecified'] as const).map((g) => (
                <button key={g} onClick={() => setGender(g)} disabled={isCompleting} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${gender === g ? 'bg-violet-500 text-white' : 'bg-muted text-muted-foreground hover:bg-violet-50'}`}>
                  {g === 'male' ? '♂ Male' : g === 'female' ? '♀ Female' : 'Unspecified'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleSkip} disabled={isCompleting}>
              {isCompleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Skip
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-violet-500 to-rose-500 hover:from-violet-600 hover:to-rose-600" onClick={handleComplete} disabled={!username || isCompleting}>
              {isCompleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Complete <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function VerifyEmailPage() {
  // Email verification is no longer required - redirect to main app
  const setShowAuth = useAppStore((s) => s.setShowAuth);

  React.useEffect(() => {
    setShowAuth(null);
  }, [setShowAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-rose-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </CardContent>
      </Card>
    </div>
  );
}
