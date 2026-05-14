import { apiClient } from '@/shared/api/client'
import type { DashboardStats, RecentlyPlayed, SpotifyArtist, SpotifyPlaylist, SpotifyTrack, TimeRange } from '@/shared/types'

export const musicApi = {
  getDashboard: () =>
    apiClient.get<DashboardStats>('/spotify/dashboard'),
  getTopTracks: (timeRange: TimeRange = 'short_term') =>
    apiClient.get<SpotifyTrack[]>(`/spotify/top-tracks?timeRange=${timeRange}`),
  getTopArtists: (timeRange: TimeRange = 'short_term') =>
    apiClient.get<SpotifyArtist[]>(`/spotify/top-artists?timeRange=${timeRange}`),
  getRecentlyPlayed: () =>
    apiClient.get<RecentlyPlayed[]>('/spotify/recently-played'),
  getPlaylists: () =>
    apiClient.get<SpotifyPlaylist[]>('/spotify/playlists'),
}
