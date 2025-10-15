/**
 * TMC Authentication Error Codes
 * Based on AUTH.md documentation
 */

export const AUTH_ERROR_CODES = {
  // Success codes
  REGISTRATION_SUCCESS: '2000101',
  LOGIN_SUCCESS: '2000102',
  
  // Error codes
  USER_NOT_FOUND: '4220101',
  INVALID_PASSWORD: '4220102',
  AUTHENTICATION_FAILED: '4220101',
} as const;

export type AuthErrorCode = typeof AUTH_ERROR_CODES[keyof typeof AUTH_ERROR_CODES];

/**
 * Get user-friendly error message based on error code
 */
export const getAuthErrorMessage = (code: string): string => {
  switch (code) {
    case AUTH_ERROR_CODES.USER_NOT_FOUND:
      return 'Pengguna tidak ditemukan. Periksa email/username Anda.';
    
    case AUTH_ERROR_CODES.INVALID_PASSWORD:
      return 'Password salah. Silakan coba lagi.';
    
    case AUTH_ERROR_CODES.AUTHENTICATION_FAILED:
      return 'Autentikasi gagal. Periksa kredensial Anda.';
    
    default:
      return 'Terjadi kesalahan autentikasi. Silakan coba lagi.';
  }
};

/**
 * Get success message based on success code
 */
export const getAuthSuccessMessage = (code: string): string => {
  switch (code) {
    case AUTH_ERROR_CODES.REGISTRATION_SUCCESS:
      return 'Registrasi berhasil! Silakan login dengan akun Anda.';
    
    case AUTH_ERROR_CODES.LOGIN_SUCCESS:
      return 'Login berhasil! Selamat datang.';
    
    default:
      return 'Operasi berhasil.';
  }
};

/**
 * Check if response is successful based on code
 */
export const isSuccessCode = (code: string): boolean => {
  return code === AUTH_ERROR_CODES.REGISTRATION_SUCCESS || 
         code === AUTH_ERROR_CODES.LOGIN_SUCCESS;
};

/**
 * Check if response is error based on code
 */
export const isErrorCode = (code: string): boolean => {
  return code === AUTH_ERROR_CODES.USER_NOT_FOUND || 
         code === AUTH_ERROR_CODES.INVALID_PASSWORD ||
         code === AUTH_ERROR_CODES.AUTHENTICATION_FAILED;
};