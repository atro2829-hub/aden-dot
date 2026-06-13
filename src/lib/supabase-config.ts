/**
 * Supabase Configuration Manager
 * Supports both hardcoded (env) and user-configured credentials
 * Stores custom config in localStorage for persistence
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const STORAGE_KEY = 'adendot_supabase_config';

/** Get hardcoded config from environment variables or embedded defaults */
function getEnvConfig(): SupabaseConfig | null {
  // Try environment variables first
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (url && anonKey) return { url, anonKey };

  // Fallback: embedded default config for Capacitor/Android builds
  // This ensures the app always has valid Supabase credentials
  const DEFAULT_URL = 'https://zjdkfzemrosdgkgtzhtg.supabase.co';
  const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGtmemVtcm9zZGdrZ3R6aHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNzU4NTcsImV4cCI6MjA5Njk1MTg1N30.ldIKtc8JsfSrZUHniFgAF7DZPcC-6DIMlfue_8xMPn8';
  if (DEFAULT_URL && DEFAULT_ANON_KEY) return { url: DEFAULT_URL, anonKey: DEFAULT_ANON_KEY };

  return null;
}

/** Get user-configured config from localStorage */
function getStoredConfig(): SupabaseConfig | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.url && parsed.anonKey) return parsed as SupabaseConfig;
  } catch {
    // ignore parse errors
  }
  return null;
}

/** Save user-configured config to localStorage */
export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore storage errors
  }
}

/** Clear user-configured config */
export function clearSupabaseConfig(): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Get the active Supabase config (stored > env) */
export function getActiveSupabaseConfig(): SupabaseConfig | null {
  return getStoredConfig() || getEnvConfig();
}

/** Check if Supabase is configured */
export function isSupabaseConfigured(): boolean {
  return getActiveSupabaseConfig() !== null;
}

/** Validate Supabase credentials by making a test request */
export async function validateSupabaseConfig(config: SupabaseConfig): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(`${config.url}/auth/v1/settings`, {
      headers: {
        'apikey': config.anonKey,
      },
    });
    
    if (response.ok) {
      return { valid: true };
    }
    
    const data = await response.json();
    if (data.message?.includes('Invalid API key')) {
      return { valid: false, error: 'مفتاح API غير صالح - تأكد من نسخ المفتاح الصحيح من لوحة تحكم Supabase' };
    }
    
    return { valid: false, error: data.message || 'فشل الاتصال بقاعدة البيانات' };
  } catch (error) {
    return { valid: false, error: 'لا يمكن الوصول إلى الخادم - تأكد من عنوان URL' };
  }
}
