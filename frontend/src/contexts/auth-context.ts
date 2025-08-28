import { createContext } from 'react'
import { User, AuthConfig } from '@/api/auth'

export interface AuthContextType {
  user: User | null | undefined
  authConfig: AuthConfig | undefined
  isLoading: boolean
  isAuthenticated: boolean
  error: Error | null
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
