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

function enabled(): boolean {
  // NOTE: Never enable in production builds by default.
  // For store builds, turn on explicitly only if needed:
  // - EXPO_PUBLIC_DEVTOOLS=1
  return Boolean(__DEV__ || process.env.EXPO_PUBLIC_DEVTOOLS === '1');
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

