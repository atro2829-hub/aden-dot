/**
 * Supabase Configuration Manager
 * Reads credentials from env vars OR from localStorage (set via the in-app setup screen).
 *
 * NOTE: No hardcoded default URL/key — the user MUST configure their own Supabase project
 * either by setting NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY env vars
 * (for CI builds) or by entering them in the SupabaseSetupScreen on first launch.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const STORAGE_KEY = 'adendot_supabase_config';

/** Get config from environment variables (build-time) */
function getEnvConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (url && anonKey) return { url, anonKey };
  return null;
}

/** Get user-configured config from localStorage (runtime, in-app setup) */
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
