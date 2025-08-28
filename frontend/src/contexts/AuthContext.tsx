import { ReactNode } from 'react'
import { useCurrentUser, useAuthConfig } from '@/api/auth'
import { AuthContext, AuthContextType } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading: userLoading, error: userError } = useCurrentUser()
  const { data: authConfig, isLoading: configLoading } = useAuthConfig()

  const value: AuthContextType = {
    user: user ?? null,
    authConfig,
    isLoading: userLoading || configLoading,
    isAuthenticated: !!user,
    error: userError as Error | null,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
