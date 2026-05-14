import { useQuery } from '@tanstack/react-query'
import type { TimeRange } from '@/shared/types'
import { musicApi } from './api'

const STALE = 5 * 60 * 1000

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => musicApi.getDashboard().then(r => r.data),
    staleTime: STALE,
  })
}

export function useTopTracks(timeRange: TimeRange) {
  return useQuery({
    queryKey: ['top-tracks', timeRange],
    queryFn: () => musicApi.getTopTracks(timeRange).then(r => r.data),
    staleTime: STALE,
  })
}

export function useTopArtists(timeRange: TimeRange) {
  return useQuery({
    queryKey: ['top-artists', timeRange],
    queryFn: () => musicApi.getTopArtists(timeRange).then(r => r.data),
    staleTime: STALE,
  })
}

export function useRecentlyPlayed() {
  return useQuery({
    queryKey: ['recently-played'],
    queryFn: () => musicApi.getRecentlyPlayed().then(r => r.data),
    staleTime: STALE,
  })
}

export function usePlaylists() {
  return useQuery({
    queryKey: ['playlists'],
    queryFn: () => musicApi.getPlaylists().then(r => r.data),
    staleTime: STALE,
  })
}
