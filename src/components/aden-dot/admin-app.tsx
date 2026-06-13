'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { getActiveSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, validateSupabaseConfig, type SupabaseConfig } from '@/lib/supabase-config';
import { resetSupabaseBrowser, getSupabaseBrowser } from '@/lib/supabase-browser';
import { AdminDashboard } from './admin-dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ============ Supabase Setup for Admin ============
function AdminSetupScreen({ onConfigured }: { onConfigured: () => void }) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    const trimmedUrl = url.trim();
    const trimmedKey = anonKey.trim();

    if (!trimmedUrl || !trimmedKey) {
      setError('يرجى إدخال عنوان URL ومفتاح API');
      return;
    }

    try { new URL(trimmedUrl); } catch {
      setError('عنوان URL غير صالح');
      return;
    }

    setIsValidating(true);
    try {
      const config: SupabaseConfig = { url: trimmedUrl, anonKey: trimmedKey };
      const result = await validateSupabaseConfig(config);
      if (result.valid) {
        saveSupabaseConfig(config);
        resetSupabaseBrowser();
        onConfigured();
      } else {
        setError(result.error || 'فشل التحقق من الاتصال');
      }
    } catch {
      setError('حدث خطأ أثناء التحقق');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg mb-4">
            <img src="/icon.png" alt="Aden Dot Admin" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Aden Dot Admin</h1>
          <p className="text-gray-500 text-sm mt-1">لوحة تحكم المسؤول</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-5">
          <div className="text-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800">الاتصال بـ Supabase</h2>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">عنوان URL للمشروع</Label>
            <Input type="url" placeholder="https://xxxxx.supabase.co" value={url} onChange={(e) => setUrl(e.target.value)} className="text-left" dir="ltr" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">مفتاح anon public</Label>
            <Input type="text" placeholder="eyJhbGci..." value={anonKey} onChange={(e) => setAnonKey(e.target.value)} className="text-left text-xs" dir="ltr" />
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm text-red-600">{error}</p></div>}

          <Button onClick={handleSave} disabled={isValidating || !url.trim() || !anonKey.trim()} className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-xl">
            {isValidating ? 'جاري التحقق...' : 'اتصال وتحقق'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ============ Admin Login ============
function AdminLoginScreen({ onLogin }: { onLogin: (client: ReturnType<typeof createClient>) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const client = getSupabaseBrowser();
      if (!client) {
        setError('قاعدة البيانات غير مُعدة');
        setIsLoading(false);
        return;
      }

      const { data, error: authError } = await client.auth.signInWithPassword({ email, password });
      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        } else {
          setError(authError.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Check if user is admin
        const { data: profile } = await client.from('users').select('role').eq('uid', data.user.id).single();
        if (profile?.role === 'admin') {
          onLogin(client);
        } else {
          setError('هذا الحساب ليس مسؤول - يرجى استخدام حساب المسؤول');
          await client.auth.signOut();
        }
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg mb-4">
            <img src="/icon.png" alt="Aden Dot Admin" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Aden Dot Admin</h1>
          <p className="text-gray-500 text-sm mt-1">تسجيل دخول المسؤول</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">البريد الإلكتروني</Label>
            <Input type="email" placeholder="admin@adendot.app" value={email} onChange={(e) => setEmail(e.target.value)} className="text-left" dir="ltr" required />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">كلمة المرور</Label>
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="text-left" dir="ltr" required />
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm text-red-600">{error}</p></div>}

          <Button type="submit" disabled={isLoading} className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-xl">
            {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

// ============ Main Admin App ============
export default function AdminApp() {
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [supabaseClient, setSupabaseClient] = useState<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    const init = async () => {
      const config = getActiveSupabaseConfig();
      if (!config) {
        setSupabaseConfigured(false);
        setIsChecking(false);
        return;
      }

      // Validate config
      try {
        const response = await fetch(`${config.url}/auth/v1/settings`, {
          headers: { 'apikey': config.anonKey },
        });
        if (!response.ok) {
          setSupabaseConfigured(false);
          setIsChecking(false);
          return;
        }
      } catch {
        // Network error, try anyway
      }

      setSupabaseConfigured(true);

      // Check if already logged in
      const client = getSupabaseBrowser();
      if (client) {
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          const { data: profile } = await client.from('users').select('role').eq('uid', session.user.id).single();
          if (profile?.role === 'admin') {
            setSupabaseClient(client);
            setIsLoggedIn(true);
          }
        }
      }
      setIsChecking(false);
    };
    init();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!supabaseConfigured) {
    return <AdminSetupScreen onConfigured={() => { resetSupabaseBrowser(); setSupabaseConfigured(true); }} />;
  }

  if (!isLoggedIn) {
    return <AdminLoginScreen onLogin={(client) => { setSupabaseClient(client); setIsLoggedIn(true); }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Admin Header */}
      <div className="bg-red-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src="/icon.png" alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Aden Dot Admin</h1>
              <p className="text-red-200 text-xs">لوحة تحكم المسؤول</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="text-red-600 border-white bg-white hover:bg-red-50"
            onClick={async () => {
              if (supabaseClient) await supabaseClient.auth.signOut();
              setIsLoggedIn(false);
            }}
          >
            تسجيل الخروج
          </Button>
        </div>
      </div>

      {/* Admin Dashboard */}
      <div className="max-w-6xl mx-auto p-4">
        <AdminDashboard />
      </div>
    </div>
  );
}
