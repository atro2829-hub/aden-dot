'use client';

/**
 * ConnectionBanner
 * Shows a top banner when Supabase is unreachable.
 * Provides a "Retry" button that re-checks the connection.
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { connectionHealth, type ConnectionState } from '@/lib/connection-health';
import { WifiOffIcon, RefreshIcon } from '@/components/icons/aden-dot-icons';

export function ConnectionBanner() {
  const [state, setState] = useState<ConnectionState>(connectionHealth.getState());
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const unsub = connectionHealth.subscribe(setState);
    connectionHealth.start(30000); // check every 30s
    return () => {
      unsub();
      connectionHealth.stop();
    };
  }, []);

  const handleRetry = async () => {
    setRetrying(true);
    await connectionHealth.check();
    setRetrying(false);
  };

  const visible = state.status === 'offline';
  const message =
    state.errorMessage && state.errorMessage !== 'Supabase not configured'
      ? state.errorMessage
      : 'تعذّر الاتصال بالخادم - تحقق من الإنترنت أو أن الخادم يعمل';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="fixed top-0 inset-x-0 z-[100] bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
          }}
          dir="rtl"
        >
          <div className="px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <WifiOffIcon size={18} color="#FFFFFF" />
              <span className="text-sm font-medium truncate">{message}</span>
            </div>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 transition-colors text-xs font-semibold whitespace-nowrap"
              aria-label="إعادة المحاولة"
            >
              <RefreshIcon
                size={14}
                color="#FFFFFF"
                className={retrying ? 'animate-spin' : ''}
              />
              {retrying ? 'جارٍ...' : 'إعادة المحاولة'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
