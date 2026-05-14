import { create } from 'zustand'
import type { Track } from '@/shared/types'

interface PlayerState {
  currentTrack: Track | null
  queue: Track[]
  queueIndex: number
  isPlaying: boolean
  volume: number
  playTrack: (track: Track, queue: Track[]) => void
  pause: () => void
  resume: () => void
  next: () => void
  prev: () => void
  setVolume: (v: number) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  volume: 0.8,

  playTrack: (track, queue) => {
    const idx = queue.findIndex(t => t.id === track.id)
    set({ currentTrack: track, queue, queueIndex: idx >= 0 ? idx : 0, isPlaying: true })
  },

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),

  next: () => {
    const { queue, queueIndex } = get()
    const next = queueIndex + 1
    if (next < queue.length) {
      set({ queueIndex: next, currentTrack: queue[next], isPlaying: true })
    }
  },

  prev: () => {
    const { queue, queueIndex } = get()
    const prev = queueIndex - 1
    if (prev >= 0) {
      set({ queueIndex: prev, currentTrack: queue[prev], isPlaying: true })
    }
  },

  setVolume: (volume) => set({ volume }),
}))
