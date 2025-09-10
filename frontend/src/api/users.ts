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

// API functions
const usersApi = {
  getUsers: async () => {
    const response = await apiClient.get<PaginatedResponse<UserListItem>>('/auth/users/')
    console.log('Users API response:', response)
    // Return just the results array for simpler component usage
    return response.results || []
  },

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

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
