import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from './client'
import { API_ENDPOINTS, QUERY_KEYS } from './endpoints'
import { createMutation, createSimpleMutation } from './mutations'

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_staff?: boolean
  is_superuser?: boolean
  is_email_verified: boolean
  date_joined: string
  last_login: string | null
}

export interface AuthConfig {
  auth_method: 'email' | 'saml'
  saml_login_url: string | null
  allow_registration: boolean
  require_email_verification: boolean
}

export interface LoginCredentials {
  username_or_email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name?: string
  last_name?: string
}

// API functions
const authApi = {
  getConfig: () =>
    apiClient.get<AuthConfig>(API_ENDPOINTS.AUTH.CONFIG),

  getCurrentUser: () =>
    apiClient.get<User>(API_ENDPOINTS.AUTH.USER),

  login: (credentials: LoginCredentials) =>
    apiClient.post<{ user: User; message: string }>(API_ENDPOINTS.AUTH.LOGIN, credentials),

  register: (data: RegisterData) =>
    apiClient.post<{ user: User; message: string }>(API_ENDPOINTS.AUTH.REGISTER, data),

  logout: () =>
    apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),

  changePassword: (data: { old_password: string; new_password: string }) =>
    apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data),

  verifyEmail: (token: string) =>
    apiClient.post<{ message: string }>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token }),

  resendVerification: (email: string) =>
    apiClient.post<{ message: string }>(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email }),
}

// React Query hooks
export const useAuthConfig = () => {
  return useQuery({
    queryKey: QUERY_KEYS.AUTH_CONFIG,
    queryFn: authApi.getConfig,
    staleTime: Infinity,
  })
}

export const useCurrentUser = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CURRENT_USER,
    queryFn: authApi.getCurrentUser,
    retry: false,
    // Always attempt to fetch user - backend will return 403 if no valid session
  })
}

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Set the user data immediately
      queryClient.setQueryData(QUERY_KEYS.CURRENT_USER, data.user)
      // Invalidate to ensure fresh data (session cookie is now set)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CURRENT_USER })
    },
  })
}

export const useRegister = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Only set user data if email verification is not required
      // When verification is required, no session is created on backend
      const requiresVerification = (data as { requires_verification?: boolean }).requires_verification
      if (!requiresVerification) {
        // Set the user data immediately
        queryClient.setQueryData(QUERY_KEYS.CURRENT_USER, data.user)
        // Invalidate to ensure fresh data (session cookie is now set)
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CURRENT_USER })
      }
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear user from cache immediately
      queryClient.setQueryData(QUERY_KEYS.CURRENT_USER, null)
      // Redirect to home - this will clear all client state
      // No need to invalidateQueries since we're reloading anyway
      window.location.href = '/'
    },
  })
}

export const useChangePassword = createSimpleMutation(authApi.changePassword)
export const useVerifyEmail = createMutation(authApi.verifyEmail, { invalidates: QUERY_KEYS.CURRENT_USER })
export const useResendVerification = createSimpleMutation(authApi.resendVerification)
