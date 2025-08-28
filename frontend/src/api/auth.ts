import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from './client'

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  date_joined: string
}

export interface AuthConfig {
  auth_method: 'email' | 'saml'
  saml_login_url: string | null
  allow_registration: boolean
}

export interface LoginCredentials {
  email: string
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
    apiClient.get<AuthConfig>('/auth/config/'),

  getCurrentUser: () =>
    apiClient.get<User>('/auth/user/'),

  login: (credentials: LoginCredentials) =>
    apiClient.post<{ user: User; message: string }>('/auth/login/', credentials),

  register: (data: RegisterData) =>
    apiClient.post<{ user: User; message: string }>('/auth/register/', data),

  logout: () =>
    apiClient.post('/auth/logout/'),

  changePassword: (data: { old_password: string; new_password: string }) =>
    apiClient.post('/auth/change-password/', data),
}

// React Query hooks
export const useAuthConfig = () => {
  return useQuery({
    queryKey: ['authConfig'],
    queryFn: authApi.getConfig,
    staleTime: Infinity,
  })
}

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
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
      queryClient.setQueryData(['currentUser'], data.user)
      // Invalidate to ensure fresh data (session cookie is now set)
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

export const useRegister = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Set the user data immediately
      queryClient.setQueryData(['currentUser'], data.user)
      // Invalidate to ensure fresh data (session cookie is now set)
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear user from cache immediately
      queryClient.setQueryData(['currentUser'], null)
      // Redirect to home - this will clear all client state
      // No need to invalidateQueries since we're reloading anyway
      window.location.href = '/'
    },
  })
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
  })
}
