import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiClient, getStoredToken, setStoredToken, setStoredRefreshToken } from '../api/client'

export type User = {
  id: number
  email: string
  firstName: string
  lastName: string
}

export type FiscalYearStart = 'JANUARY' | 'APRIL' | 'JULY' | 'OCTOBER'

export type Company = {
  id: number
  name: string
  tradeName: string | null
  iceNumber: string
  rcNumber: string
  cnssNumber: string
  sector: string | null
  address: string
  city: string
  postalCode: string | null
  phone: string
  email: string
  website: string | null
  employeesCount: number | null
  fiscalYearStart: FiscalYearStart
  createdAt: string
  updatedAt: string
}

type LoginResult = {
  user: User
  company: Company | null
}

type AuthContextValue = {
  user: User | null
  company: Company | null
  isAuthenticated: boolean
  hasCompany: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => void
  setCompany: (company: Company | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

type SessionResponse = {
  user: User
  company: Company | null
}

type LoginResponse = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: User
  company: Company | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [company, setCompanyState] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    apiClient
      .get<SessionResponse>('/auth/me')
      .then((res) => {
        setUser(res.data.user)
        setCompanyState(res.data.company)
      })
      .catch(() => {
        setStoredToken(null)
        setStoredRefreshToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const res = await apiClient.post<LoginResponse>('/auth/login', { email, password })
    setStoredToken(res.data.accessToken)
    setStoredRefreshToken(res.data.refreshToken)
    setUser(res.data.user)
    setCompanyState(res.data.company)
    return { user: res.data.user, company: res.data.company }
  }, [])

  const register = useCallback(
    async (firstName: string, lastName: string, email: string, password: string) => {
      await apiClient.post('/auth/register', { firstName, lastName, email, password })
    },
    [],
  )

  const logout = useCallback(() => {
    apiClient.post('/auth/logout').catch(() => undefined)
    setStoredToken(null)
    setStoredRefreshToken(null)
    setUser(null)
    setCompanyState(null)
  }, [])

  const setCompany = useCallback((next: Company | null) => {
    setCompanyState(next)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      company,
      isAuthenticated: user !== null,
      hasCompany: company !== null,
      isLoading,
      login,
      register,
      logout,
      setCompany,
    }),
    [user, company, isLoading, login, register, logout, setCompany],
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
