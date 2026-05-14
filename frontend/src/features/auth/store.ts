import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthUser {
  id: number
  displayName: string | null
  email: string | null
  avatarUrl: string | null
  login: string
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: AuthUser) => void
  setAuth: (accessToken: string, refreshToken: string, user: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),

      setUser: user => set({ user }),

      setAuth: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user, isAuthenticated: true }),

      logout: () =>
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'music-dashboard-auth',
      partialize: state => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
