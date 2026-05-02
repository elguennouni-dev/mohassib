import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1'

const ACCESS_TOKEN_KEY = 'mohassib.accessToken'
const REFRESH_TOKEN_KEY = 'mohassib.refreshToken'

export function getStoredToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setStoredToken(token: string | null): void {
  if (token === null) {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  } else {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  }
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setStoredRefreshToken(token: string | null): void {
  if (token === null) {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  } else {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

type RetryableConfig = AxiosRequestConfig & { _retry?: boolean }

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getStoredRefreshToken()
  if (!refreshToken) return null

  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ accessToken: string; expiresIn: number }>(
        `${API_BASE_URL}/auth/refresh-token`,
        { refreshToken },
      )
      .then((res) => {
        setStoredToken(res.data.accessToken)
        return res.data.accessToken
      })
      .catch(() => {
        setStoredToken(null)
        setStoredRefreshToken(null)
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined
    const status = error.response?.status

    const isAuthEndpoint = typeof original?.url === 'string' && original.url.includes('/auth/')
    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true
      const newToken = await refreshAccessToken()
      if (newToken) {
        original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${newToken}` }
        return apiClient.request(original)
      }
    }

    if (status === 401) {
      setStoredToken(null)
      setStoredRefreshToken(null)
    }
    return Promise.reject(error)
  },
)
