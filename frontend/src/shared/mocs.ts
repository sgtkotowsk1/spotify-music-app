import { Album, Artist, DashboardStats, Playlist, Track } from './types'

const artists: Artist[] = [
  {
    id: 1,
    name: 'Linkin Park',
    coverUri: 'https://avatars.yandex.net/get-music-content/12345/artist1.jpg',
    genres: ['rock', 'alternative'],
    trackCount: 120,
    albumCount: 8,
  },
  {
    id: 2,
    name: 'Daft Punk',
    coverUri: 'https://avatars.yandex.net/get-music-content/12345/artist2.jpg',
    genres: ['electronic', 'house'],
    trackCount: 85,
    albumCount: 6,
  },
  {
    id: 3,
    name: 'Hans Zimmer',
    coverUri: 'https://avatars.yandex.net/get-music-content/12345/artist3.jpg',
    genres: ['soundtrack'],
    trackCount: 240,
    albumCount: 24,
  },
]

const albums: Album[] = [
  {
    id: 101,
    title: 'Meteora',
    coverUri: 'https://avatars.yandex.net/get-music-content/12345/album1.jpg',
    artists: [artists[0]],
    year: 2003,
    trackCount: 13,
    genre: 'Rock',
    type: 'album',
  },
  {
    id: 102,
    title: 'Random Access Memories',
    coverUri: 'https://avatars.yandex.net/get-music-content/12345/album2.jpg',
    artists: [artists[1]],
    year: 2013,
    trackCount: 14,
    genre: 'Electronic',
    type: 'album',
  },
  {
    id: 103,
    title: 'Interstellar OST',
    coverUri: 'https://avatars.yandex.net/get-music-content/12345/album3.jpg',
    artists: [artists[2]],
    year: 2014,
    trackCount: 16,
    genre: 'Soundtrack',
    type: 'album',
  },
]

const tracks: Track[] = [
  {
    id: 1001,
    title: 'Numb',
    artists: [artists[0]],
    album: albums[0],
    durationMs: 185000,
    coverUri: albums[0].coverUri,
    available: true,
    explicit: false,
  },
  {
    id: 1002,
    title: 'In the End',
    artists: [artists[0]],
    album: albums[0],
    durationMs: 216000,
    coverUri: albums[0].coverUri,
    available: true,
    explicit: false,
  },
  {
    id: 1003,
    title: 'Get Lucky',
    artists: [artists[1]],
    album: albums[1],
    durationMs: 248000,
    coverUri: albums[1].coverUri,
    available: true,
    explicit: false,
  },
  {
    id: 1004,
    title: 'Time',
    artists: [artists[2]],
    album: albums[2],
    durationMs: 274000,
    coverUri: albums[2].coverUri,
    available: true,
    explicit: false,
  },
]

const playlists: Playlist[] = [
  {
    kind: 1,
    title: 'Coding Night',
    description: 'Music for late-night coding sessions',
    coverUri: 'https://avatars.yandex.net/get-music-content/12345/playlist1.jpg',
    trackCount: 24,
    durationMs: 5400000,
    isPublic: true,
    ownerName: 'kirya',
    tracks,
  },
  {
    kind: 2,
    title: 'Gym Motivation',
    description: 'Energy boost playlist',
    coverUri: 'https://avatars.yandex.net/get-music-content/12345/playlist2.jpg',
    trackCount: 18,
    durationMs: 4200000,
    isPublic: false,
    ownerName: 'kirya',
    tracks: [tracks[0], tracks[2]],
  },
]

export const dashboardMock: DashboardStats = {
  totalLikedTracks: tracks.length,
  totalLikedAlbums: albums.length,
  totalLikedArtists: artists.length,
  totalPlaylists: playlists.length,

  recentTracks: tracks,
  topArtists: artists,
  recentAlbums: albums,
}

export const musicApi = {
  getDashboard: async () => ({
    data: dashboardMock,
  }),

  getLikedTracks: async () => ({
    data: tracks,
  }),

  getLikedAlbums: async () => ({
    data: albums,
  }),

  getLikedArtists: async () => ({
    data: artists,
  }),

  getPlaylists: async () => ({
    data: playlists,
  }),
}
