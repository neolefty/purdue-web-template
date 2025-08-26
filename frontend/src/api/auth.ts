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
    apiClient.get<AuthConfig>('/auth/config/').then(res => res.data),
  
  getCurrentUser: () =>
    apiClient.get<User>('/auth/user/').then(res => res.data),
  
  login: (credentials: LoginCredentials) =>
    apiClient.post<{ user: User; message: string }>('/auth/login/', credentials)
      .then(res => res.data),
  
  register: (data: RegisterData) =>
    apiClient.post<{ user: User; message: string }>('/auth/register/', data)
      .then(res => res.data),
  
  logout: () =>
    apiClient.post('/auth/logout/').then(res => res.data),
  
  changePassword: (data: { old_password: string; new_password: string }) =>
    apiClient.post('/auth/change-password/', data).then(res => res.data),
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
  })
}

export const useLogin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user)
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

export const useRegister = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user)
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null)
      queryClient.invalidateQueries()
    },
  })
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
  })
}