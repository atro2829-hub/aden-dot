'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Loader2, Database, Copy, Check, ExternalLink } from 'lucide-react';

interface TableStatus {
  exists: boolean;
  count?: number;
}

interface SetupStatus {
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

export default function SetupPage() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/setup');
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to check setup status:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function copySQL() {
    try {
      const res = await fetch('/supabase-schema.sql');
      const sql = await res.text();
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback: open the SQL file
      window.open('/supabase-schema.sql', '_blank');
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
          <p className="text-muted-foreground">جاري فحص حالة قاعدة البيانات...</p>
        </div>
      </div>
    );
  }

  const progress = status?.database
    ? Math.round((status.database.existingTables / status.database.totalTables) * 100)
    : 0;

  const isSetup = status?.database?.isSetup ?? false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-violet-950/20 p-4 md:p-8" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-rose-500 bg-clip-text text-transparent">
            Skyline Setup
          </h1>
          <p className="text-muted-foreground">
            إعداد البنية التحتية لقاعدة البيانات
          </p>
        </div>

        {/* Status Card */}
        <Card className="border-violet-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-violet-500" />
              حالة قاعدة البيانات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">اتصال Supabase</span>
              <Badge variant={status?.configured ? 'default' : 'destructive'}>
                {status?.configured ? (
                  <><CheckCircle2 className="w-3 h-3 ml-1" /> متصل</>
                ) : (
                  <><XCircle className="w-3 h-3 ml-1" /> غير متصل</>
                )}
              </Badge>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>الجداول المنشأة</span>
                <span className="text-muted-foreground">
                  {status?.database?.existingTables ?? 0} / {status?.database?.totalTables ?? 0}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Setup Status */}
            {isSetup ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-medium text-green-500">قاعدة البيانات جاهزة!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  جميع الجداول منشأة ويمكنك استخدام التطبيق
                </p>
                <Button className="mt-3" onClick={() => window.location.href = '/'}>
                  العودة للتطبيق
                </Button>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-center">
                <Database className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="font-medium text-amber-500">قاعدة البيانات تحتاج إعداد</p>
                <p className="text-sm text-muted-foreground mt-1">
                  يرجى اتباع الخطوات أدناه لإعداد البنية التحتية
                </p>
              </div>
            )}

            {/* Table List */}
            {status?.database?.tableStatus && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                {Object.entries(status.database.tableStatus).map(([table, info]) => (
                  <div
                    key={table}
                    className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded ${
                      info.exists
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {info.exists ? (
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3 h-3 flex-shrink-0" />
                    )}
                    <span className="truncate">{table}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        {!isSetup && (
          <Card className="border-violet-500/20">
            <CardHeader>
              <CardTitle>خطوات الإعداد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">1</Badge>
                  <h3 className="font-medium">افتح محرر SQL في Supabase</h3>
                </div>
                <p className="text-sm text-muted-foreground mr-8">
                  اذهب إلى لوحة تحكم Supabase وافتح محرر SQL
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-8"
                  onClick={() => window.open('https://supabase.com/dashboard/project/ocjcbowrewenogrkexmr/sql', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 ml-1" />
                  فتح لوحة التحكم
                </Button>
              </div>

              {/* Step 2 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">2</Badge>
                  <h3 className="font-medium">انسخ كود SQL</h3>
                </div>
                <p className="text-sm text-muted-foreground mr-8">
                  انسخ كود إنشاء الجداول بالكامل
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-8"
                  onClick={copySQL}
                >
                  {copied ? (
                    <><Check className="w-4 h-4 ml-1" /> تم النسخ!</>
                  ) : (
                    <><Copy className="w-4 h-4 ml-1" /> نسخ SQL</>
                  )}
                </Button>
              </div>

              {/* Step 3 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">3</Badge>
                  <h3 className="font-medium">الصق الكود وشغّله</h3>
                </div>
                <p className="text-sm text-muted-foreground mr-8">
                  الصق الكود في محرر SQL واضغط على زر التشغيل (Run). سيتم إنشاء جميع الجداول والسياسات والدوال والبيانات الأولية.
                </p>
              </div>

              {/* Step 4 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">4</Badge>
                  <h3 className="font-medium">تحقق من الحالة</h3>
                </div>
                <p className="text-sm text-muted-foreground mr-8">
                  بعد تشغيل SQL، اضغط على الزر أدناه للتحقق من أن كل شيء يعمل
                </p>
                <Button
                  size="sm"
                  className="mr-8"
                  onClick={checkStatus}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 ml-1 animate-spin" /> جاري الفحص...</>
                  ) : (
                    'تحقق من الحالة'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-400">
              💡 <strong>ملاحظة:</strong> يتضمن كود SQL إنشاء 30 جدول، سياسات الأمان (RLS)، الدوال التلقائية، البيانات الأولية للهدايا والإنجازات. العملية تستغرق أقل من دقيقة واحدة.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
