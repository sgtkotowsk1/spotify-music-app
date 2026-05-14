import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/features/auth/store'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = useAuthStore.getState().refreshToken
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken })
          useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
          return apiClient(originalRequest)
        } catch {
          useAuthStore.getState().logout()
          window.location.href = '/login'
        }
      } else {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)
