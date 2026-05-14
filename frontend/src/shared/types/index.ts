export interface Artist {
  id: number
  name: string
  coverUri: string | null
  genres: string[] | null
  trackCount: number | null
  albumCount: number | null
}

export interface Album {
  id: number
  title: string
  coverUri: string | null
  artists: Artist[]
  year: number | null
  trackCount: number | null
  genre: string | null
  type: string | null
}

export interface Track {
  id: number
  title: string
  artists: Artist[]
  album: Album | null
  durationMs: number | null
  coverUri: string | null
  available: boolean | null
  explicit: boolean | null
}

export interface Playlist {
  kind: number
  title: string
  description: string | null
  coverUri: string | null
  trackCount: number | null
  durationMs: number | null
  isPublic: boolean | null
  ownerName: string | null
  tracks: Track[] | null
}

export interface DashboardStats {
  totalLikedTracks: number
  totalLikedAlbums: number
  totalLikedArtists: number
  totalPlaylists: number
  recentTracks: Track[]
  topArtists: Artist[]
  recentAlbums: Album[]
}

export interface UserProfile {
  id: number
  yandexId: string
  email: string | null
  displayName: string | null
  login: string
  avatarUrl: string | null
  memberSince: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: {
    id: number
    displayName: string | null
    email: string | null
    avatarUrl: string | null
    login: string
  }
}

export interface ApiError {
  status: number
  title: string
  detail: string
}
