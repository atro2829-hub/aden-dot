/**
 * Supabase Client - Browser Side
 * Uses anon key, respects RLS policies
 * Singleton pattern with robust error handling
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Get or create the singleton Supabase browser client.
 * Safe to call from any client-side component.
 * Returns null if environment variables are missing.
 */
export function getSupabaseBrowser(): SupabaseClient<Database> | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return null;
  }

  if (!browserClient) {
    try {
      browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
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
    } catch (error) {
      console.error('[Supabase] Failed to create browser client:', error);
      return null;
    }
  }

  return browserClient;
}

/**
 * Check if the Supabase browser client is available and configured.
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Reset the browser client (useful for testing or after auth state changes).
 */
export function resetSupabaseBrowser(): void {
  browserClient = null;
}
