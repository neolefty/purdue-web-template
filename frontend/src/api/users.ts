import { useQuery } from '@tanstack/react-query'
import apiClient from './client'
import { API_ENDPOINTS, QUERY_KEYS } from './endpoints'
import { createMutation } from './mutations'
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
    const response = await apiClient.get<PaginatedResponse<UserListItem>>(API_ENDPOINTS.AUTH.USERS)
    // Return just the results array for simpler component usage
    return response.results || []
  },

  createUser: (data: CreateUserData) =>
    apiClient.post<UserListItem>(API_ENDPOINTS.AUTH.USERS, data),

  updateUser: ({ id, data }: { id: number; data: Partial<UserListItem> }) =>
    apiClient.patch<UserListItem>(API_ENDPOINTS.AUTH.USER_DETAIL(id), data),

  deleteUser: (id: number) =>
    apiClient.delete(API_ENDPOINTS.AUTH.USER_DETAIL(id)),
}

// React Query hooks
export const useUsers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USERS,
    queryFn: usersApi.getUsers,
  })
}

export const useUpdateUser = createMutation(usersApi.updateUser, { invalidates: QUERY_KEYS.USERS })
export const useCreateUser = createMutation(usersApi.createUser, { invalidates: QUERY_KEYS.USERS })
export const useDeleteUser = createMutation(usersApi.deleteUser, { invalidates: QUERY_KEYS.USERS })
