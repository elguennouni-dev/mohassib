import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiClient, getStoredToken, setStoredToken } from '../api/client'

export type User = {
  id: number
  email: string
  firstName: string
  lastName: string
}

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

type LoginResponse = {
  access_token: string
  refresh_token?: string
  user: User
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    apiClient
      .get<User>('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => setStoredToken(null))
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post<LoginResponse>('/auth/login', { email, password })
    setStoredToken(res.data.access_token)
    setUser(res.data.user)
  }, [])

  const register = useCallback(
    async (firstName: string, lastName: string, email: string, password: string) => {
      await apiClient.post('/auth/register', { first_name: firstName, last_name: lastName, email, password })
    },
    [],
  )

  const logout = useCallback(() => {
    setStoredToken(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) {
    throw new Error('useAuth doit etre utilise a l\'interieur d\'un AuthProvider')
  }
  return ctx
}
