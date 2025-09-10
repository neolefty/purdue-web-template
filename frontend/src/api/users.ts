import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from './client'
import type { User } from './auth'

export interface UserListItem extends User {
  is_staff: boolean
  is_superuser: boolean
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface CreateUserData {
  username: string
  email: string
  first_name: string
  last_name: string
  is_active?: boolean
  is_staff?: boolean
  is_superuser?: boolean
}

// API functions
const usersApi = {
  getUsers: async () => {
    const response = await apiClient.get<PaginatedResponse<UserListItem>>('/auth/users/')
    console.log('Users API response:', response)
    // Return just the results array for simpler component usage
    return response.results || []
  },

  createUser: (data: CreateUserData) =>
    apiClient.post<UserListItem>('/auth/users/', data),

  updateUser: (id: number, data: Partial<UserListItem>) =>
    apiClient.patch<UserListItem>(`/auth/users/${id}/`, data),

  deleteUser: (id: number) =>
    apiClient.delete(`/auth/users/${id}/`),
}

// React Query hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getUsers,
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserListItem> }) =>
      usersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
