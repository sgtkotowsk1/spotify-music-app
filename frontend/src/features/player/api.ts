import { apiClient } from '@/shared/api/client'

export const playerApi = {
  getStreamUrl: (trackId: number) =>
    apiClient.get<{ trackId: number; url: string }>(`/music/tracks/${trackId}/stream-url`),
}
