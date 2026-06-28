'use client';

/**
 * Aden Dot — Confirmation Dialog & Toast System
 * ===============================================
 * Two reusable primitives:
 *   1. <ConfirmDialog> — for destructive / irreversible actions
 *      (delete post, unfollow, suspend, delete account, etc.)
 *   2. <ToastProvider> + useToast() — for non-blocking notifications
 *      (success green, error red, warning gold, info blue)
 *
 * Every dialog auto-includes:
 *   - Haptic feedback (medium impact on open, heavy on confirm)
 *   - Backdrop blur + slide-up animation
 *   - Color-coded by action type (danger=red, warning=gold, info=blue, success=green)
 *   - Two-button layout (cancel / confirm) — confirm button is colored
 *   - Disabled state while async action is in-flight
 *   - "تأكيد" requires typing exact text for very destructive actions (optional)
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconAlert, IconCheck, IconInfo, IconX, IconSpinner } from './icons';
import { COLORS, hapticFeedback } from './utils';

// ============ Confirm Dialog ============
export type ConfirmAction = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  action?: ConfirmAction;
  requireText?: string; // user must type this exact text to confirm (e.g., "حذف")
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  busy?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  action = 'danger',
  requireText,
  onConfirm,
  onCancel,
  busy = false,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');
  const [localBusy, setLocalBusy] = useState(false);
  const actionColors: Record<ConfirmAction, string> = {
    danger: COLORS.danger,
    warning: COLORS.warning,
    info: COLORS.info,
    success: COLORS.success,
  };
  const color = actionColors[action];

  useEffect(() => {
    if (open) {
      setTyped('');
      setLocalBusy(false);
      hapticFeedback('medium');
    }
  }, [open]);

  const canConfirm = !requireText || typed.trim() === requireText;
  const isBusy = busy || localBusy;

  const handleConfirm = async () => {
    if (!canConfirm || isBusy) return;
    setLocalBusy(true);
    await hapticFeedback('heavy');
    try {
      await onConfirm();
    } finally {
      setLocalBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isBusy) onCancel?.();
          }}
        >
          <motion.div
            initial={{ scale: 0.92, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            style={{
              background: COLORS.surface,
              borderRadius: 18,
              padding: 24,
              maxWidth: 420,
              width: '100%',
              boxShadow: `0 30px 80px -20px rgba(0,0,0,0.4)`,
              border: `1px solid ${COLORS.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: color + '20',
                  color: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconAlert size={24} color={color} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: COLORS.text, margin: 0, marginBottom: 6 }}>
                  {title}
                </h3>
                <p style={{ fontSize: 14, color: COLORS.textSecondary, margin: 0, lineHeight: 1.55 }}>
                  {message}
                </p>
              </div>
              <button
                onClick={() => !isBusy && onCancel?.()}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: isBusy ? 'wait' : 'pointer',
                  padding: 4,
                  color: COLORS.textMuted,
                }}
                aria-label="إغلاق"
              >
                <IconX size={18} color={COLORS.textMuted} />
              </button>
            </div>

            {/* Require text input */}
            {requireText && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 }}>
                  للتأكيد، اكتب: <strong style={{ color: color }}>{requireText}</strong>
                </p>
                <input
                  type="text"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoFocus
                  disabled={isBusy}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1.5px solid ${canConfirm ? color : COLORS.border}`,
                    borderRadius: 10,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    background: COLORS.surfaceMuted,
                    color: COLORS.text,
                  }}
                  placeholder={requireText}
                />
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                onClick={() => !isBusy && onCancel?.()}
                disabled={isBusy}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: `1.5px solid ${COLORS.border}`,
                  background: 'transparent',
                  color: COLORS.text,
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isBusy ? 'wait' : 'pointer',
                  opacity: isBusy ? 0.5 : 1,
                }}
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={!canConfirm || isBusy}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: 'none',
                  background: canConfirm ? color : COLORS.border,
                  color: '#fff',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: !canConfirm || isBusy ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {isBusy ? <IconSpinner size={16} color="#fff" /> : null}
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============ Toast System ============
type ToastType = 'success' | 'error' | 'warning' | 'info';
interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
}
interface ToastContextValue {
  show: (type: ToastType, message: string, duration?: number) => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
  warning: (msg: string) => void;
  info: (msg: string) => void;
}
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type: ToastType, message: string, duration = 3500) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, type, message, duration }]);
      // Haptic feedback by type
      hapticFeedback(type === 'error' ? 'heavy' : 'light');
      // Auto-remove
      setTimeout(() => remove(id), duration);
    },
    [remove],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (m) => show('success', m),
      error: (m) => show('error', m, 5000),
      warning: (m) => show('warning', m, 4500),
      info: (m) => show('info', m),
    }),
    [show],
  );

  const colorMap: Record<ToastType, string> = {
    success: COLORS.success,
    error: COLORS.danger,
    warning: COLORS.warning,
    info: COLORS.info,
  };
  const iconMap: Record<ToastType, React.ReactNode> = {
    success: <IconCheck size={18} color="#fff" />,
    error: <IconX size={18} color="#fff" />,
    warning: <IconAlert size={18} color="#fff" />,
    info: <IconInfo size={18} color="#fff" />,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px',
          pointerEvents: 'none',
          gap: 8,
        }}
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              onClick={() => remove(t.id)}
              style={{
                background: colorMap[t.type],
                color: '#fff',
                padding: '12px 18px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                boxShadow: '0 10px 30px -8px rgba(0,0,0,0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                maxWidth: 460,
                pointerEvents: 'auto',
                cursor: 'pointer',
              }}
            >
              {iconMap[t.type]}
              <span style={{ flex: 1 }}>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Safe fallback if used outside provider — silent no-op
    return {
      show: (type, msg) => console.log(`[toast:${type}]`, msg),
      success: (m) => console.log('[toast:success]', m),
      error: (m) => console.error('[toast:error]', m),
      warning: (m) => console.warn('[toast:warning]', m),
      info: (m) => console.log('[toast:info]', m),
    };
  }
  return ctx;
}

// ============ Confirmation hook (declarative API) ============
export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  action?: ConfirmAction;
  requireText?: string;
}
export function useConfirm() {
  const [state, setState] = useState<{ open: boolean; options: ConfirmOptions; resolve?: (v: boolean) => void; busy: boolean }>({
    open: false,
    options: { title: '', message: '' },
    busy: false,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, options, resolve, busy: false });
    });
  }, []);

  const setBusy = useCallback((busy: boolean) => setState((s) => ({ ...s, busy })), []);

  const dialog = (
    <ConfirmDialog
      open={state.open}
      title={state.options.title}
      message={state.options.message}
      confirmText={state.options.confirmText}
      cancelText={state.options.cancelText}
      action={state.options.action}
      requireText={state.options.requireText}
      busy={state.busy}
      onCancel={() => {
        state.resolve?.(false);
        setState((s) => ({ ...s, open: false }));
      }}
      onConfirm={async () => {
        state.resolve?.(true);
        // Note: caller should close the dialog by setting open=false via re-render
        setState((s) => ({ ...s, open: false }));
      }}
    />
  );

  return { confirm, dialog, setBusy };
}
