import { apiClient } from '@/shared/api/client'
import type { Album, Artist, DashboardStats, Playlist, Track } from '@/shared/types'

export const musicApi = {
  getDashboard: () => apiClient.get<DashboardStats>('/music/dashboard'),
  getLikedTracks: () => apiClient.get<Track[]>('/music/tracks/liked'),
  getLikedAlbums: () => apiClient.get<Album[]>('/music/albums/liked'),
  getLikedArtists: () => apiClient.get<Artist[]>('/music/artists/liked'),
  getPlaylists: () => apiClient.get<Playlist[]>('/music/playlists'),
}
