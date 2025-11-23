// Silence browser console logs ONLY in production for security,
// keeping warn/error intact for error handling.
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  const noop = () => {};
  // General logging
  console.log = noop;
  console.debug = noop;
  console.info = noop;
  // Group logging
  console.group = noop as any;
  console.groupCollapsed = noop as any;
  console.groupEnd = noop as any;
}