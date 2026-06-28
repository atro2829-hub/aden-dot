'use client';

/**
 * Aden Dot — Feature Flag Hook (admin-controlled UI gating)
 * ==============================================
 * Fetches all feature flags on mount and subscribes to realtime
 * changes so the admin can toggle sections and they instantly
 * hide/show for users without a re-login.
 *
 * Usage:
 *   const { isEnabled, isLoading } = useFeatureFlag('live_streaming');
 *   if (!isEnabled('live_streaming')) return null; // hide section
 *
 *   const { flags } = useAllFeatureFlags();
 */

import { useEffect, useState, useCallback } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { useToast } from '../confirm-dialog';

export interface FeatureFlag {
  code: string;
  name: string;
  name_ar: string;
  is_enabled: boolean;
  category: string;
}

// Module-level cache so multiple components share the same fetch
let cachedFlags: Record<string, boolean> = {};
let cachedAt: number | null = null;
const CACHE_TTL = 60_000; // 1 minute

export function useAllFeatureFlags() {
  const [flags, setFlags] = useState<Record<string, boolean>>(cachedFlags);
  const [loading, setLoading] = useState(!cachedAt);

  useEffect(() => {
    let mounted = true;
    let channel: any = null;

    const load = async () => {
      // Use cache if fresh
      if (cachedAt && Date.now() - cachedAt < CACHE_TTL) {
        setFlags(cachedFlags);
        setLoading(false);
        return;
      }
      try {
        const client = getSupabaseBrowser();
        const { data, error } = await client.from('feature_flags').select('code, is_enabled');
        if (error) throw error;
        const map: Record<string, boolean> = {};
        for (const f of (data || [])) {
          map[f.code] = f.is_enabled;
        }
        if (mounted) {
          cachedFlags = map;
          cachedAt = Date.now();
          setFlags(map);
          setLoading(false);
        }
      } catch (e) {
        // Fail-open: if we can't load flags, assume all enabled
        if (mounted) setLoading(false);
      }
    };

    load();

    // Subscribe to realtime updates
    try {
      const client = getSupabaseBrowser();
      channel = client
        .channel('feature_flags_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'feature_flags' }, (payload: any) => {
          const newFlags = { ...cachedFlags };
          if (payload.new && payload.new.code) {
            newFlags[payload.new.code] = payload.new.is_enabled;
          }
          cachedFlags = newFlags;
          cachedAt = Date.now();
          setFlags(newFlags);
        })
        .subscribe();
    } catch {}

    return () => {
      mounted = false;
      if (channel) {
        try {
          const client = getSupabaseBrowser();
          client.removeChannel(channel);
        } catch {}
      }
    };
  }, []);

  const isEnabled = useCallback((code: string): boolean => {
    // Default to true if flag is not in our cache (fail-open)
    return flags[code] !== false;
  }, [flags]);

  return { flags, isEnabled, loading };
}

export function useFeatureFlag(code: string) {
  const { flags, loading } = useAllFeatureFlags();
  // Default to true if flag is not in our cache (fail-open)
  const isEnabled = flags[code] !== false;
  return { isEnabled, loading };
}

// Admin-side: set a flag value
export function useFeatureFlagAdmin() {
  const toast = useToast();
  const setFlag = useCallback(async (code: string, enabled: boolean): Promise<boolean> => {
    try {
      const client = getSupabaseBrowser();
      const { data, error } = await client.rpc('set_feature_flag', { p_code: code, p_enabled: enabled });
      if (error) throw error;
      // Update local cache immediately
      cachedFlags = { ...cachedFlags, [code]: enabled };
      cachedAt = Date.now();
      toast.success(enabled ? `تم تفعيل القسم` : `تم تعطيل القسم`);
      return true;
    } catch (e: any) {
      toast.error('تعذّر تحديث الإعداد — تحقق من صلاحياتك');
      return false;
    }
  }, [toast]);

  return { setFlag };
}
