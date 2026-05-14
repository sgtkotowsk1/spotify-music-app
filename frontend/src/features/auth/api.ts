import { apiClient } from '@/shared/api/client'
import type { AuthTokens } from '@/shared/types'

export const authApi = {
  getAuthUrl: () =>
    apiClient.get<{ url: string; state: string }>('/auth/yandex/authorize'),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthTokens>('/auth/refresh', { refreshToken }),

  logout: () => apiClient.post('/auth/logout'),
}
