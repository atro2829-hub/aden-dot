'use client';

import { useState, useEffect, useCallback } from 'react';
import { Database, CheckCircle, AlertCircle, Copy, ExternalLink, Loader2, ArrowRight, RefreshCw, Zap, Shield, Users, MessageCircle, Radio, Gift, Award, Key } from 'lucide-react';

interface TableStatus {
  exists: boolean;
  count?: number;
}

interface SetupData {
  configured: boolean;
  supabaseUrl?: string;
  database?: {
    totalTables: number;
    existingTables: number;
    missingTables: string[];
    tableStatus: Record<string, TableStatus>;
    isSetup: boolean;
  };
}

export function DatabaseSetupPage() {
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [executing, setExecuting] = useState(false);
  const [execResult, setExecResult] = useState<{ success: boolean; message: string } | null>(null);
  const [setupMethod, setSetupMethod] = useState<'auto' | 'manual'>('auto');

  const fetchSetup = useCallback(async () => {
    try {
      const res = await fetch('/api/setup');
      const data = await res.json();
      setSetupData(data);
    } catch {
      setSetupData({ configured: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSetup();
  }, [fetchSetup]);

  async function copySQL() {
    try {
      const res = await fetch('/api/setup-db');
      const data = await res.json();
      if (data.sql) {
        await navigator.clipboard.writeText(data.sql);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      setCopied(false);
    }
  }

  async function verifySetup() {
    setVerifying(true);
    await fetchSetup();
    setVerifying(false);
  }

  async function executeSQLAuto() {
    if (!accessToken.trim()) return;
    setExecuting(true);
    setExecResult(null);

    try {
      // Get the SQL from the setup-db API
      const sqlRes = await fetch('/api/setup-db');
      const sqlData = await sqlRes.json();
      
      if (!sqlData.sql) {
        setExecResult({ success: false, message: 'Could not load SQL schema' });
        return;
      }

      // Split SQL into manageable chunks (separate statements)
      const statements = sqlData.sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))
        .map(s => s + ';');

      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      // Execute in batches of 5 statements
      for (let i = 0; i < statements.length; i += 5) {
        const batch = statements.slice(i, i + 5).join('\n');
        
        const res = await fetch('/api/execute-sql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: accessToken.trim(), sql: batch }),
        });

        const data = await res.json();
        
        if (data.success) {
          successCount++;
        } else {
          failCount++;
          if (errors.length < 5) {
            errors.push(data.error || data.details || 'Unknown error');
          }
        }
      }

      if (failCount === 0) {
        setExecResult({ success: true, message: `تم إنشاء قاعدة البيانات بنجاح! (${statements.length} أمر SQL)` });
        // Verify the setup
        await fetchSetup();
      } else if (successCount > 0) {
        setExecResult({ success: true, message: `تم تنفيذ معظم الأوامر. ${successCount} نجح، ${failCount} فشل. تحقق من الحالة.` });
        await fetchSetup();
      } else {
        setExecResult({ success: false, message: `فشل التنفيذ: ${errors[0]}` });
      }
    } catch (err) {
      setExecResult({ success: false, message: err instanceof Error ? err.message : 'حدث خطأ غير متوقع' });
    } finally {
      setExecuting(false);
    }
  }

  const progress = setupData?.database
    ? Math.round((setupData.database.existingTables / setupData.database.totalTables) * 100)
    : 0;

  const isReady = setupData?.database?.isSetup;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">جاري التحقق من حالة قاعدة البيانات...</p>
        </div>
      </div>
    );
  }

  // Database is fully set up
  if (isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/30 to-gray-900 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30 animate-bounce">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">قاعدة البيانات جاهزة! ✅</h1>
          <p className="text-gray-300 mb-2">تم إعداد جميع الجداول والسياسات بنجاح</p>
          <p className="text-green-400 text-sm mb-6">
            {setupData?.database?.existingTables} / {setupData?.database?.totalTables} جدول
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-green-500/30 transition-all"
          >
            ابدأ استخدام Skyline
            <ArrowRight className="w-5 h-5 inline-block mr-2" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
            <Database className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">إعداد Supabase</h1>
          <p className="text-gray-400">Skyline Social Media — Database Setup</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/5 rounded-full h-3 mb-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-center text-sm text-gray-400 mb-8">
          {setupData?.database?.existingTables || 0} من {setupData?.database?.totalTables || 0} جدول — {progress}%
        </div>

        {/* Setup Method Toggle */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setSetupMethod('auto')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              setupMethod === 'auto'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            <Zap className="w-4 h-4" />
            تلقائي (Personal Access Token)
          </button>
          <button
            onClick={() => setSetupMethod('manual')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              setupMethod === 'manual'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            <Copy className="w-4 h-4" />
            يدوي (نسخ SQL)
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 mb-6">

          {/* AUTO METHOD */}
          {setupMethod === 'auto' && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Key className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">الإعداد التلقائي</h2>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                أدخل Personal Access Token من Supabase وسيتم إنشاء كل شيء تلقائياً
              </p>

              {/* Step 1: Get Token */}
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-purple-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                  <span className="text-white font-medium text-sm">احصل على Access Token</span>
                </div>
                <p className="text-gray-400 text-xs mb-2 mr-9">
                  اذهب إلى إعدادات الحساب في Supabase وأنشئ رمز وصول جديد
                </p>
                <a
                  href="https://supabase.com/dashboard/account/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-xs mr-9"
                >
                  <ExternalLink className="w-3 h-3" />
                  فتح Account Tokens
                </a>
              </div>

              {/* Step 2: Enter Token */}
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-purple-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                  <span className="text-white font-medium text-sm">أدخل الرمز</span>
                </div>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="sbp_0102..."
                  className="w-full mt-2 mr-9 px-4 py-2.5 bg-black/30 border border-white/20 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  dir="ltr"
                />
              </div>

              {/* Step 3: Execute */}
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-purple-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">3</span>
                  <span className="text-white font-medium text-sm">نفذ SQL تلقائياً</span>
                </div>
                <button
                  onClick={executeSQLAuto}
                  disabled={executing || !accessToken.trim()}
                  className="w-full mr-9 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
                >
                  {executing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري إنشاء الجداول...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      إنشاء قاعدة البيانات الآن
                    </>
                  )}
                </button>
              </div>

              {/* Execution Result */}
              {execResult && (
                <div className={`rounded-xl p-4 mb-4 ${
                  execResult.success 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : 'bg-red-500/10 border border-red-500/30'
                }`}>
                  <div className="flex items-center gap-2">
                    {execResult.success 
                      ? <CheckCircle className="w-5 h-5 text-green-400" />
                      : <AlertCircle className="w-5 h-5 text-red-400" />
                    }
                    <span className={`text-sm font-medium ${
                      execResult.success ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {execResult.message}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MANUAL METHOD */}
          {setupMethod === 'manual' && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Copy className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">الإعداد اليدوي</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-white/5 rounded-xl p-4">
                  <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</span>
                  <div>
                    <p className="text-white font-medium">افتح SQL Editor</p>
                    <a
                      href="https://supabase.com/dashboard/project/ocjcbowrewenogrkexmr/sql/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 mt-1"
                    >
                      فتح SQL Editor <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 rounded-xl p-4">
                  <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</span>
                  <div>
                    <p className="text-white font-medium">انسخ SQL والصقه في المحرر</p>
                    <button
                      onClick={copySQL}
                      className={`mt-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        copied
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30'
                      }`}
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'تم النسخ!' : 'نسخ SQL كاملاً'}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 rounded-xl p-4">
                  <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</span>
                  <div>
                    <p className="text-white font-medium">اضغط &quot;Run&quot; لتنفيذ SQL</p>
                    <p className="text-gray-400 text-xs mt-1">سيتم إنشاء 26 جدول + سياسات + بيانات أولية</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Verify Button */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={verifySetup}
              disabled={verifying}
              className="flex items-center gap-2 text-green-400 text-sm font-medium hover:text-green-300 transition-colors disabled:opacity-50"
            >
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {verifying ? 'جاري التحقق...' : 'تحقق من حالة قاعدة البيانات'}
            </button>
            <span className="text-gray-500 text-xs">
              {setupData?.database?.existingTables || 0}/{setupData?.database?.totalTables || 0} جدول
            </span>
          </div>
        </div>

        {/* Tables Status Grid */}
        {setupData?.database?.tableStatus && Object.keys(setupData.database.tableStatus).length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 mb-6">
            <h3 className="text-white font-bold text-lg mb-4">حالة الجداول</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.entries(setupData.database.tableStatus).map(([table, status]) => (
                <div
                  key={table}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                    status.exists
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
                >
                  {status.exists ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">{table}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-center text-gray-500 text-sm pb-8">
          <p>Skyline v2.0 — Supabase Integration</p>
        </div>
      </div>
    </div>
  );
}
