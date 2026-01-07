export type DevLogLevel = 'info' | 'warn' | 'error';
export type DevLogScope = 'API' | 'KAKAO' | 'NAV' | 'SYS';

export type DevLogEntry = {
  ts: number;
  level: DevLogLevel;
  scope: DevLogScope;
  message: string;
  meta?: Record<string, unknown>;
};

const MAX_LOGS = 200;
let buffer: DevLogEntry[] = [];
const subs = new Set<(logs: DevLogEntry[]) => void>();

import Constants from 'expo-constants';

export function isDevtoolsEnabled(): boolean {
  // Release builds: __DEV__ is false, and process.env inlining can be flaky depending on build path.
  // We use a 2nd deterministic gate via app config extra.devtools.
  if (__DEV__) return true;
  if (process.env.EXPO_PUBLIC_DEVTOOLS === '1') return true;
  const extra =
    (Constants as any)?.expoConfig?.extra ||
    (Constants as any)?.manifest?.extra ||
    {};
  return Boolean((extra as any)?.devtools === true);
}

function enabled(): boolean {
  // NOTE: Never enable in production builds by default.
  return isDevtoolsEnabled();
}

function snapshot(): DevLogEntry[] {
  return buffer;
}

function notify() {
  const snap = snapshot();
  subs.forEach((fn) => fn(snap));
}

export function devlog(entry: Omit<DevLogEntry, 'ts'>) {
  if (!enabled()) return;
  buffer = [...buffer, { ...entry, ts: Date.now() }].slice(-MAX_LOGS);
  notify();
}

export function getDevLogs(): DevLogEntry[] {
  return snapshot();
}

export function clearDevLogs() {
  if (!enabled()) return;
  buffer = [];
  notify();
}

export function subscribeDevLogs(fn: (logs: DevLogEntry[]) => void): () => void {
  if (!enabled()) return () => {};
  subs.add(fn);
  // immediate sync
  fn(snapshot());
  return () => subs.delete(fn);
}

