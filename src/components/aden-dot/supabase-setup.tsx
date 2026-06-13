'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  saveSupabaseConfig, 
  validateSupabaseConfig, 
  type SupabaseConfig 
} from '@/lib/supabase-config';
import { resetSupabaseBrowser } from '@/lib/supabase-browser';
import { AppLogoIcon } from '@/components/icons/aden-dot-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SupabaseSetupScreenProps {
  onConfigured: () => void;
}

export function SupabaseSetupScreen({ onConfigured }: SupabaseSetupScreenProps) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    const trimmedUrl = url.trim();
    const trimmedKey = anonKey.trim();

    if (!trimmedUrl || !trimmedKey) {
      setError('يرجى إدخال عنوان URL ومفتاح API');
      return;
    }

    // Validate URL format
    try {
      new URL(trimmedUrl);
    } catch {
      setError('عنوان URL غير صالح - تأكد من أنه يبدأ بـ https://');
      return;
    }

    setIsValidating(true);

    try {
      const config: SupabaseConfig = { url: trimmedUrl, anonKey: trimmedKey };
      const result = await validateSupabaseConfig(config);

      if (result.valid) {
        saveSupabaseConfig(config);
        resetSupabaseBrowser();
        setSuccess(true);
        setTimeout(() => onConfigured(), 500);
      } else {
        setError(result.error || 'فشل التحقق من الاتصال');
      }
    } catch {
      setError('حدث خطأ أثناء التحقق من الاتصال');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg mb-4">
            <img src="/icon.png" alt="Aden Dot" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Aden Dot</h1>
          <p className="text-gray-500 text-sm mt-1">إعداد قاعدة البيانات</p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-5">
          <div className="text-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800">الاتصال بـ Supabase</h2>
            <p className="text-sm text-gray-500 mt-1">
              أدخل بيانات الاتصال الخاصة بمشروع Supabase الخاص بك
            </p>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="supabase-url" className="text-sm font-medium text-gray-700">
              عنوان URL للمشروع
            </Label>
            <Input
              id="supabase-url"
              type="url"
              placeholder="https://xxxxx.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="text-left"
              dir="ltr"
            />
            <p className="text-xs text-gray-400">
              تجده في: Project Settings → API → Project URL
            </p>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="supabase-key" className="text-sm font-medium text-gray-700">
              مفتاح anon public
            </Label>
            <Input
              id="supabase-key"
              type="text"
              placeholder="eyJhbGciOiJIUzI1NiIs..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="text-left text-xs"
              dir="ltr"
            />
            <p className="text-xs text-gray-400">
              تجده في: Project Settings → API → anon public
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-green-50 border border-green-200 rounded-lg p-3"
            >
              <p className="text-sm text-green-600">تم الاتصال بنجاح! جاري التحميل...</p>
            </motion.div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isValidating || !url.trim() || !anonKey.trim()}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 rounded-xl"
          >
            {isValidating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري التحقق...
              </div>
            ) : (
              'اتصال وتحقق'
            )}
          </Button>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">كيف تحصل على هذه البيانات؟</h3>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>اذهب إلى supabase.com وسجل الدخول</li>
              <li>أنشئ مشروع جديد أو اختر مشروعك</li>
              <li>اذهب إلى Project Settings ← API</li>
              <li>انسخ Project URL والصقه في الحقل الأول</li>
              <li>انسخ anon public key والصقه في الحقل الثاني</li>
              <li>اضغط &quot;اتصال وتحقق&quot;</li>
            </ol>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
