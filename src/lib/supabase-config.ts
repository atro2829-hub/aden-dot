/**
 * Supabase Configuration — Aden Dot
 * Production-ready hardcoded configuration (no setup screen).
 * The project URL and anon key are baked in at build time so the app
 * boots directly into the auth flow without any user configuration.
 *
 * These credentials belong to the official Aden Dot Supabase project.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const STORAGE_KEY = 'adendot_supabase_config';

/** Official Aden Dot Supabase project credentials (hardcoded primary connection). */
const PRIMARY_CONFIG: SupabaseConfig = {
  url: 'https://zjdkfzemrosdgkgtzhtg.supabase.co',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGtmemVtcm9zZGdrZ3R6aHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNzU4NTcsImV4cCI6MjA5Njk1MTg1N30.ldIKtc8JsfSrZUHniFgAF7DZPcC-6DIMlfue_8xMPn8',
};

/** Get config from environment variables (build-time override if ever needed). */
function getEnvConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (url && anonKey) return { url, anonKey };
  return null;
}

/** Get user-overridden config from localStorage (optional, for advanced users). */
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

/** Save user-configured config to localStorage (optional override). */
export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore storage errors
  }
}

/** Clear user-configured config override. */
export function clearSupabaseConfig(): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Get the active Supabase config.
 * Priority: localStorage override (if any) → env vars (if any) → hardcoded primary config.
 * The hardcoded primary config is ALWAYS available, so the app never needs a setup screen.
 */
export function getActiveSupabaseConfig(): SupabaseConfig {
  return getStoredConfig() || getEnvConfig() || PRIMARY_CONFIG;
}

/** Supabase is always configured (hardcoded primary credentials). */
export function isSupabaseConfigured(): boolean {
  return true;
}

/** Validate Supabase credentials by making a test request. */
export async function validateSupabaseConfig(config: SupabaseConfig): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(`${config.url}/auth/v1/settings`, {
      headers: {
        apikey: config.anonKey,
      },
    });

    if (response.ok) {
      return { valid: true };
    }

    const data = await response.json().catch(() => ({}));
    if (data.message?.includes('Invalid API key')) {
      return { valid: false, error: 'مفتاح API غير صالح - تأكد من نسخ المفتاح الصحيح من لوحة تحكم Supabase' };
    }

    return { valid: false, error: data.message || `فشل الاتصال بقاعدة البيانات (HTTP ${response.status})` };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (/failed to fetch|network|name_resolution|err_name_resolution/i.test(msg)) {
      return { valid: false, error: 'تعذّر الوصول إلى الخادم - تأكد من عنوان URL ومن أن المشروع يعمل في لوحة تحكم Supabase' };
    }
    return { valid: false, error: 'لا يمكن الوصول إلى الخادم - ' + msg };
  }
}
