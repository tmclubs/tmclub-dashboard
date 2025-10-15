// Export all stores
export { useAuthStore } from './authStore';
export { useUIStore } from './uiStore';

// Export types
export type { AuthState } from './authStore';
export type { UIState, Notification } from './uiStore';

// Re-export for convenience
export { useAuthStore as useAuth } from './authStore';
export { useUIStore as useUI } from './uiStore';