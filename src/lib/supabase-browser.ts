/**
 * Supabase Client - Browser Side
 * Uses dynamic configuration from supabase-config.ts
 * Supports both hardcoded (env) and user-configured credentials
 *
 * CRITICAL: Uses native fetch (CapacitorHttp) on Android to bypass WebView CORS.
 * On Web, falls back to standard fetch.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import type { Database } from './supabase-types';
import { getActiveSupabaseConfig } from './supabase-config';

let browserClient: SupabaseClient<Database> | null = null;
let lastConfigUrl: string | null = null;
let lastConfigKey: string | null = null;

/**
 * Build a custom fetch wrapper that:
 * - On native (Capacitor), prefers the patched window.fetch (CapacitorHttp) for CORS-free requests.
 * - Implements retry with exponential backoff for transient network errors.
 * - Adds detailed error info for better user-facing messages.
 */
function makeResilientFetch(): typeof fetch {
  const nativeFetch = typeof window !== 'undefined' ? window.fetch.bind(window) : fetch;

  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const MAX_RETRIES = 3;
    const BASE_DELAY = 800; // ms
    let lastError: unknown = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await nativeFetch(input as RequestInfo, init);

        // Retry on 5xx server errors (Supabase may be temporarily unavailable)
        if (response.status >= 500 && response.status < 600 && attempt < MAX_RETRIES - 1) {
          await delay(BASE_DELAY * Math.pow(2, attempt));
          continue;
        }

        return response;
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);

        // Network-level errors (Failed to fetch, network, timeout, aborted)
        // Retry these up to MAX_RETRIES
        const isNetworkError =
          /failed to fetch|network|timeout|aborted|err_(network|connection|name_resolution)/i.test(msg);

        if (isNetworkError && attempt < MAX_RETRIES - 1) {
          await delay(BASE_DELAY * Math.pow(2, attempt));
          continue;
        }

        // Non-retriable or out of retries — rethrow with enriched info
        const enriched = new Error(msg);
        (enriched as Error & { isNetworkError?: boolean }).isNetworkError = isNetworkError;
        (enriched as Error & { attempt?: number }).attempt = attempt + 1;
        throw enriched;
      }
    }

    throw lastError ?? new Error('Network request failed after retries');
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get or create the Supabase browser client.
 * Automatically re-creates if configuration changes.
 */
export function getSupabaseBrowser(): SupabaseClient<Database> | null {
  const config = getActiveSupabaseConfig();

  if (!config) {
    console.warn('[Supabase] No configuration found. Please set up Supabase credentials.');
    return null;
  }

  // Re-create client if config changed
  if (browserClient && lastConfigUrl === config.url && lastConfigKey === config.anonKey) {
    return browserClient;
  }

  try {
    const isNative = Capacitor.isNativePlatform();
    const resilientFetch = makeResilientFetch();

    // Use 'as any' for the fetch option because the @supabase/supabase-js typings
    // don't expose it as a configurable property on `global`, but the runtime
    // accepts it and uses it for ALL HTTP traffic (auth + REST + storage + realtime).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientOptions: any = {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        fetch: resilientFetch,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      global: {
        headers: {},
        fetch: resilientFetch,
      },
      db: {
        schema: 'public',
      },
    };

    // Cast to SupabaseClient<Database> to satisfy the linter; the runtime type is compatible.
    browserClient = createClient<Database>(config.url, config.anonKey, clientOptions) as SupabaseClient<Database>;

    if (isNative) {
      console.log('[Supabase] Client initialized with native fetch (CapacitorHttp enabled)');
    } else {
      console.log('[Supabase] Client initialized with web fetch');
    }

    lastConfigUrl = config.url;
    lastConfigKey = config.anonKey;
  } catch (error) {
    console.error('[Supabase] Failed to create browser client:', error);
    return null;
  }

  return browserClient;
}

/**
 * Check if the Supabase browser client is available and configured.
 */
export function isSupabaseConfigured(): boolean {
  return getActiveSupabaseConfig() !== null;
}

/**
 * Reset the browser client (useful after config changes).
 */
export function resetSupabaseBrowser(): void {
  browserClient = null;
  lastConfigUrl = null;
  lastConfigKey = null;
}

/**
 * Test the Supabase connection by hitting the health endpoint.
 * Returns { ok, status, latencyMs, error }
 */
export async function testSupabaseConnection(): Promise<{
  ok: boolean;
  status: number;
  latencyMs: number;
  error?: string;
}> {
  const config = getActiveSupabaseConfig();
  if (!config) {
    return { ok: false, status: 0, latencyMs: 0, error: 'Supabase not configured' };
  }

  const start = Date.now();
  try {
    const response = await fetch(`${config.url}/auth/v1/health`, {
      method: 'GET',
      headers: {
        apikey: config.anonKey,
      },
    });

    const latencyMs = Date.now() - start;
    return {
      ok: response.ok,
      status: response.status,
      latencyMs,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (err) {
    const latencyMs = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      status: 0,
      latencyMs,
      error: /failed to fetch|network/i.test(msg)
        ? 'تعذّر الوصول إلى الخادم - تحقق من الإنترنت أو أن الخادم يعمل'
        : msg,
    };
  }
}
