// Redirect browser console logs to dev server terminal and disable in production
// - In development: send logs to Vite dev server via /__log endpoint
// - In production: no-op (no logs in browser console)

type LogLevel = 'log' | 'info' | 'warn' | 'error';

const toSafeString = (value: unknown): string => {
  try {
    if (typeof value === 'string') return value;
    if (value instanceof Error) return `${value.name}: ${value.message}`;
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const sendLog = async (level: LogLevel, args: unknown[]) => {
  if (!import.meta.env.DEV) return; // only forward logs in development
  try {
    await fetch('/__log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level,
        timestamp: new Date().toISOString(),
        messages: args.map(toSafeString),
      }),
    });
  } catch {
    // swallow errors to avoid console noise
  }
};

// Override global console methods
const overrideConsole = () => {
  const noop = () => {};

  // Always remove logs from browser console
  console.log = (...args: unknown[]) => { void sendLog('log', args); };
  console.info = (...args: unknown[]) => { void sendLog('info', args); };
  console.warn = (...args: unknown[]) => { void sendLog('warn', args); };
  console.error = (...args: unknown[]) => { void sendLog('error', args); };

  // Optional: silence other console methods
  console.debug = noop as any;
  console.trace = noop as any;
  console.table = noop as any;
};

overrideConsole();