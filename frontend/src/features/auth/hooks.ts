import { useCallback } from 'react'
import { useAuthStore } from './store'
import { authApi } from './api'

export function useLogin() {
  return useCallback(async () => {
    const { data } = await authApi.getAuthUrl()
    window.location.href = data.url
  }, [])
}

export function useLogout() {
  const logout = useAuthStore(state => state.logout)
  return useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      logout()
    }
  }, [logout])
}

export function useCurrentUser() {
  return useAuthStore(state => state.user)
}

export function useIsAuthenticated() {
  return useAuthStore(state => state.isAuthenticated)
}
