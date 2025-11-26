/**
 * Environment Configuration
 * Provides type-safe access to environment variables
 */

interface EnvConfig {
  // API Configuration
  apiUrl: string;
  apiVersion: string;
  appUrl: string;
  apiTimeout: number;

  // Google OAuth2
  googleClientId: string;
  googleRedirectUri: string;

  // Faspay Payment
  faspayApiUrl: string;
  faspayMerchantId: string;
  faspayMerchantSecret: string;
  faspayEnvironment: 'sandbox' | 'production';

  // App Configuration
  appName: string;
  appDescription: string;
  appVersion: string;
  appSupportEmail: string;

  // Feature Flags
  enableGoogleAuth: boolean;
  enableAnalytics: boolean;
  enableNotifications: boolean;
  enablePayment: boolean;
  enableQrScanner: boolean;

  // Development
  devTools: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';

  // File Upload
  maxFileSize: number;
  allowedFileTypes: string[];

  // Token Storage Strategy
  tokenStorage: 'local' | 'session' | 'memory';
}

// Validate and parse environment variables
const sanitize = (value?: string): string => {
  if (value === undefined) return '';
  const trimmed = value.trim();
  const hasQuotes = (s: string) => (s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")) || (s.startsWith('`') && s.endsWith('`'));
  return hasQuotes(trimmed) ? trimmed.slice(1, -1).trim() : trimmed;
};

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return sanitize(defaultValue);
    }
    throw new Error(`Missing environment variable: ${key}`);
  }
  return sanitize(value);
};

const getEnvBoolean = (key: string, defaultValue = false): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const v = sanitize(value).toLowerCase();
  return v === 'true' || v === '1' || v === 'yes' || v === 'on';
};

const getEnvNumber = (key: string, defaultValue?: number): number => {
  const value = import.meta.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing environment variable: ${key}`);
  }
  const parsed = Number(sanitize(value));
  if (isNaN(parsed)) {
    throw new Error(`Invalid number for environment variable ${key}: ${value}`);
  }
  return parsed;
};

const getEnvArray = (key: string, defaultValue: string[] = []): string[] => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const s = sanitize(value);
  if (!s) return defaultValue;
  return s.split(',').map((item: string) => sanitize(item));
};

const getEnvEnum = <T extends string>(
  key: string,
  validValues: T[],
  defaultValue?: T
): T => {
  const value = import.meta.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing environment variable: ${key}`);
  }
  const s = sanitize(value);
  if (!validValues.includes(s as T)) {
    throw new Error(`Invalid value for ${key}: ${value}. Must be one of: ${validValues.join(', ')}`);
  }
  return s as T;
};

// Export validated environment configuration
export const env: EnvConfig = {
  // API Configuration
  apiUrl: getEnvVar('VITE_API_URL', 'https://api.tmclub.id'),
  apiVersion: getEnvVar('VITE_API_VERSION', 'v1'),
  appUrl: getEnvVar('VITE_APP_URL', 'http://localhost:5173'),
  apiTimeout: getEnvNumber('VITE_API_TIMEOUT', 10000),

  // Google OAuth2
  googleClientId: getEnvVar('VITE_GOOGLE_CLIENT_ID', ''),
  googleRedirectUri: getEnvVar(
    'VITE_GOOGLE_REDIRECT_URI',
    `${getEnvVar('VITE_APP_URL', import.meta.env.PROD ? 'http://localhost:8080' : 'http://localhost:5173')}/auth/callback`
  ),

  // Faspay Payment
  faspayApiUrl: getEnvVar('VITE_FASPAY_API_URL', 'https://api.faspay.id'),
  faspayMerchantId: getEnvVar('VITE_FASPAY_MERCHANT_ID', ''),
  faspayMerchantSecret: getEnvVar('VITE_FASPAY_MERCHANT_SECRET', ''),
  faspayEnvironment: getEnvEnum('VITE_FASPAY_ENVIRONMENT', ['sandbox', 'production'], 'sandbox'),

  // App Configuration
  appName: getEnvVar('VITE_APP_NAME', 'TMC Web App'),
  appDescription: getEnvVar('VITE_APP_DESCRIPTION', 'Toyota Manufacturers Club - Community Management Platform'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  appSupportEmail: getEnvVar('VITE_APP_SUPPORT_EMAIL', 'support@tmclub.id'),

  // Feature Flags
  enableGoogleAuth: getEnvBoolean('VITE_ENABLE_GOOGLE_AUTH', false),
  enableAnalytics: getEnvBoolean('VITE_ENABLE_ANALYTICS', false),
  enableNotifications: getEnvBoolean('VITE_ENABLE_NOTIFICATIONS', true),
  enablePayment: getEnvBoolean('VITE_ENABLE_PAYMENT', false),
  enableQrScanner: getEnvBoolean('VITE_ENABLE_QR_SCANNER', true),

  // Development
  devTools: getEnvBoolean('VITE_DEV_TOOLS', false),
  logLevel: getEnvEnum('VITE_LOG_LEVEL', ['error', 'warn', 'info', 'debug'], 'info'),

  // File Upload
  maxFileSize: getEnvNumber('VITE_MAX_FILE_SIZE', 209715200), // 200MB default
  allowedFileTypes: getEnvArray('VITE_ALLOWED_FILE_TYPES', ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']),

  // Token Storage Strategy
  tokenStorage: getEnvEnum('VITE_TOKEN_STORAGE', ['local', 'session', 'memory'], 'local'),
};

// Helper function to check if required environment variables are set
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required variables for production
  if (import.meta.env.PROD) {
    // Only require Google Client ID when Google Auth is enabled
    if (env.enableGoogleAuth && !env.googleClientId) {
      errors.push('VITE_GOOGLE_CLIENT_ID is required in production when Google Auth is enabled');
    }
    // Only require Faspay credentials when Payment is enabled
    if (env.enablePayment && !env.faspayMerchantId) errors.push('VITE_FASPAY_MERCHANT_ID is required in production when Payment is enabled');
    if (env.enablePayment && !env.faspayMerchantSecret) errors.push('VITE_FASPAY_MERCHANT_SECRET is required in production when Payment is enabled');
  }

  // Check feature dependencies
  if (env.enableGoogleAuth && !env.googleClientId) {
    if (import.meta.env.PROD) {
      errors.push('VITE_GOOGLE_CLIENT_ID is required when VITE_ENABLE_GOOGLE_AUTH is true');
    } else {
      console.warn('VITE_GOOGLE_CLIENT_ID is missing. Google Auth will be disabled in development.');
    }
  }

  if (env.enablePayment && (!env.faspayMerchantId || !env.faspayMerchantSecret)) {
    if (import.meta.env.PROD) {
      errors.push('Faspay credentials are required when VITE_ENABLE_PAYMENT is true');
    } else {
      console.warn('Faspay credentials are missing. Payment features will be disabled in development.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Development helper: log environment configuration (excluding secrets)
export const logEnvironment = (): void => {
  if (env.devTools || env.logLevel === 'debug') {
    console.group('🔧 Environment Configuration');
    console.log('API URL:', env.apiUrl);
    console.log('App URL:', env.appUrl);
    console.log('Google Auth:', env.enableGoogleAuth);
    console.log('Payment:', env.enablePayment);
    console.log('Notifications:', env.enableNotifications);
    console.log('QR Scanner:', env.enableQrScanner);
    console.log('Development Tools:', env.devTools);
    console.log('Log Level:', env.logLevel);
    console.groupEnd();
  }
};

// Raw env loader status: bantu verifikasi apakah .env dimuat
export const logEnvLoadStatus = (): void => {
  try {
    const raw = import.meta.env as Record<string, any>;
    const redact = (val?: string) => {
      if (!val) return '(undefined)';
      if (val.length <= 6) return '***';
      return `${val.slice(0,3)}***${val.slice(-2)}`;
    };

    console.group('🔎 Env Load Status');
    console.log('MODE:', raw.MODE);
    console.log('DEV:', raw.DEV, 'PROD:', raw.PROD);
    console.log('VITE_APP_URL:', raw.VITE_APP_URL ?? '(undefined)');
    console.log('VITE_API_URL:', raw.VITE_API_URL ?? '(undefined)');
    console.log('VITE_APP_NAME:', raw.VITE_APP_NAME ?? '(undefined)');
    console.log('VITE_APP_VERSION:', raw.VITE_APP_VERSION ?? '(undefined)');
    console.log('VITE_ENABLE_GOOGLE_AUTH:', raw.VITE_ENABLE_GOOGLE_AUTH ?? '(undefined)');
    console.log('VITE_GOOGLE_CLIENT_ID:', redact(raw.VITE_GOOGLE_CLIENT_ID));
    console.log('VITE_ENABLE_PAYMENT:', raw.VITE_ENABLE_PAYMENT ?? '(undefined)');
    console.log('VITE_FASPAY_MERCHANT_ID:', redact(raw.VITE_FASPAY_MERCHANT_ID));
    console.log('VITE_FASPAY_MERCHANT_SECRET:', redact(raw.VITE_FASPAY_MERCHANT_SECRET));
    console.groupEnd();
  } catch (e) {
    console.error('Failed to log raw env status:', e);
  }
};

export default env;
