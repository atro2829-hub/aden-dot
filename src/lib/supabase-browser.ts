/**
 * Supabase Client - Browser Side
 * Uses dynamic configuration from supabase-config.ts
 * Supports both hardcoded (env) and user-configured credentials
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';
import { getActiveSupabaseConfig } from './supabase-config';

let browserClient: SupabaseClient<Database> | null = null;
let lastConfigUrl: string | null = null;
let lastConfigKey: string | null = null;

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
    browserClient = createClient<Database>(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      global: {
        headers: {},
      },
      db: {
        schema: 'public',
      },
    });
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
