/**
 * API endpoint constants
 *
 * Centralizes all API endpoints for easier maintenance and refactoring.
 * All endpoints should be relative to the API base URL.
 */

export const API_ENDPOINTS = {
  AUTH: {
    CONFIG: '/auth/config/',
    USER: '/auth/user/',
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    REGISTER: '/auth/register/',
    CHANGE_PASSWORD: '/auth/change-password/',
    VERIFY_EMAIL: '/auth/verify-email/',
    RESEND_VERIFICATION: '/auth/resend-verification/',
    PASSWORD_RESET_REQUEST: '/auth/password-reset/',
    PASSWORD_RESET_CONFIRM: '/auth/password-reset/confirm/',
    USERS: '/auth/users/',
    USER_DETAIL: (id: number) => `/auth/users/${id}/`,
  },
  CONTACT: '/contact/',
} as const

/**
 * Query keys for React Query cache management
 */
export const QUERY_KEYS = {
  AUTH_CONFIG: ['authConfig'] as const,
  CURRENT_USER: ['currentUser'] as const,
  USERS: ['users'] as const,
} as const
