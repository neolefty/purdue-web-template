/**
 * Mutation hook factory for common patterns
 *
 * Reduces boilerplate for mutations that follow the pattern:
 * 1. Call API function
 * 2. Invalidate query cache on success
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'

/**
 * Creates a mutation hook that invalidates specified query keys on success.
 *
 * @example
 * // Before (10 lines):
 * export const useCreateUser = () => {
 *   const queryClient = useQueryClient()
 *   return useMutation({
 *     mutationFn: usersApi.createUser,
 *     onSuccess: () => {
 *       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
 *     },
 *   })
 * }
 *
 * // After (4 lines):
 * export const useCreateUser = createMutation(
 *   usersApi.createUser,
 *   { invalidates: QUERY_KEYS.USERS }
 * )
 */
export function createMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    invalidates?: readonly unknown[]
  }
) {
  return () => {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn,
      onSuccess: () => {
        if (options?.invalidates) {
          queryClient.invalidateQueries({ queryKey: options.invalidates })
        }
      },
    })
  }
}

/**
 * Creates a simple mutation hook with no side effects.
 *
 * @example
 * export const useChangePassword = createSimpleMutation(authApi.changePassword)
 */
export function createSimpleMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
) {
  return () => useMutation({ mutationFn })
}
