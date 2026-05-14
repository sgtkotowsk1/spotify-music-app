import { useQuery } from '@tanstack/react-query'
import { musicApi } from './api'

const STALE_TIME = 5 * 60 * 1000

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => musicApi.getDashboard().then(r => r.data),
    staleTime: STALE_TIME,
  })
}

export function useLikedTracks() {
  return useQuery({
    queryKey: ['tracks', 'liked'],
    queryFn: () => musicApi.getLikedTracks().then(r => r.data),
    staleTime: STALE_TIME,
  })
}

export function useLikedAlbums() {
  return useQuery({
    queryKey: ['albums', 'liked'],
    queryFn: () => musicApi.getLikedAlbums().then(r => r.data),
    staleTime: STALE_TIME,
  })
}

export function useLikedArtists() {
  return useQuery({
    queryKey: ['artists', 'liked'],
    queryFn: () => musicApi.getLikedArtists().then(r => r.data),
    staleTime: STALE_TIME,
  })
}

export function usePlaylists() {
  return useQuery({
    queryKey: ['playlists'],
    queryFn: () => musicApi.getPlaylists().then(r => r.data),
    staleTime: STALE_TIME,
  })
}
