import { createContext, useContext, ReactNode } from 'react'
import { useCurrentUser, useAuthConfig, User, AuthConfig } from '@/api/auth'

interface AuthContextType {
  user: User | null | undefined
  authConfig: AuthConfig | undefined
  isLoading: boolean
  isAuthenticated: boolean
  error: Error | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}