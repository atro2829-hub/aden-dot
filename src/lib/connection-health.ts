/**
 * Connection Health Monitor
 * Periodically checks Supabase reachability and reports status.
 * Used by the UI to show a connection banner when offline.
 */
import { testSupabaseConnection } from './supabase-browser';

export type ConnectionStatus = 'online' | 'degraded' | 'offline' | 'checking';

export interface ConnectionState {
  status: ConnectionStatus;
  latencyMs: number;
  lastCheck: number;
  errorMessage?: string;
}

type Listener = (state: ConnectionState) => void;

class ConnectionHealthMonitor {
  private listeners = new Set<Listener>();
  private state: ConnectionState = {
    status: 'checking',
    latencyMs: 0,
    lastCheck: 0,
  };
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isPolling = false;

  /** Start polling every `intervalMs` ms. Default 30s. */
  start(intervalMs = 30000): void {
    if (this.intervalId) return;
    // Initial check immediately
    void this.check();
    this.intervalId = setInterval(() => void this.check(), intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getState(): ConnectionState {
    return { ...this.state };
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Manually trigger a check (e.g. when user taps "Retry"). */
  async check(): Promise<ConnectionState> {
    if (this.isPolling) return this.getState();
    this.isPolling = true;

    const result = await testSupabaseConnection();

    let status: ConnectionStatus;
    if (result.ok && result.latencyMs < 1500) {
      status = 'online';
    } else if (result.ok && result.latencyMs < 4000) {
      status = 'degraded';
    } else if (result.ok) {
      status = 'degraded';
    } else {
      status = 'offline';
    }

    this.state = {
      status,
      latencyMs: result.latencyMs,
      lastCheck: Date.now(),
      errorMessage: result.error,
    };

    this.notify();
    this.isPolling = false;
    return this.getState();
  }

  private notify(): void {
    const snapshot = this.getState();
    this.listeners.forEach((l) => l(snapshot));
  }
}

export const connectionHealth = new ConnectionHealthMonitor();
