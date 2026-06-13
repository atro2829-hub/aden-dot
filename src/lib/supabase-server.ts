/**
 * Supabase Client - Server Side
 * Service role key bypasses RLS - use ONLY in API routes
 * Server client uses anon key, respects RLS
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Create a service-role Supabase client that bypasses RLS.
 * Use ONLY in server-side API routes where admin access is needed.
 * Never expose this client to the browser.
 */
export function createServiceClient(): SupabaseClient<Database> | null {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[Supabase] Missing service role configuration');
    return null;
  }

  try {
    return createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: 'public',
      },
    });
  } catch (error) {
    console.error('[Supabase] Failed to create service client:', error);
    return null;
  }
}

/**
 * Create a server-side Supabase client that respects RLS.
 * Use in API routes that need user-context access.
 */
export function createServerClient(): SupabaseClient<Database> | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing server configuration');
    return null;
  }

  try {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: 'public',
      },
    });
  } catch (error) {
    console.error('[Supabase] Failed to create server client:', error);
    return null;
  }
}

/**
 * Create an authenticated server client using a user's access token.
 * This ensures RLS policies are applied in the context of the user.
 */
export function createAuthenticatedServerClient(accessToken: string): SupabaseClient<Database> | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing server configuration');
    return null;
  }

  try {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      db: {
        schema: 'public',
      },
    });
  } catch (error) {
    console.error('[Supabase] Failed to create authenticated server client:', error);
    return null;
  }
}
