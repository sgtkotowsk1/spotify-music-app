export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface UserProfile {
  id: number
  displayName: string | null
  email: string | null
  avatarUrl: string | null
  login: string
}

export type TimeRange = 'short_term' | 'medium_term' | 'long_term'

export interface SpotifyArtist {
  id: string
  name: string
  imageUrl: string | null
  popularity: number
  followersTotal: number
  genres: string[]
  spotifyUrl: string | null
}

export interface SpotifyAlbum {
  id: string
  name: string
  imageUrl: string | null
  releaseDate: string | null
  totalTracks: number
  spotifyUrl: string | null
  artists: SpotifyArtist[]
}

export interface SpotifyTrack {
  id: string
  name: string
  durationMs: number
  popularity: number
  spotifyUrl: string | null
  album: SpotifyAlbum | null
  artists: SpotifyArtist[]
}

export interface RecentlyPlayed {
  track: SpotifyTrack
  playedAt: string
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  imageUrl: string | null
  totalTracks: number
  ownerName: string | null
  isPublic: boolean
  spotifyUrl: string | null
}

export interface DashboardStats {
  topTracks: SpotifyTrack[]
  topArtists: SpotifyArtist[]
  recentlyPlayed: RecentlyPlayed[]
  totalPlaylists: number
}

export interface ApiError {
  status: number
  title: string
  detail: string
}
