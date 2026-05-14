import { useEffect, useRef, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music } from 'lucide-react'
import { usePlayerStore } from '@/features/player/store'
import { playerApi } from '@/features/player/api'

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [loadingUrl, setLoadingUrl] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(false)

  const currentTrack = usePlayerStore(s => s.currentTrack)
  const isPlaying = usePlayerStore(s => s.isPlaying)
  const volume = usePlayerStore(s => s.volume)
  const queueIndex = usePlayerStore(s => s.queueIndex)
  const queueLength = usePlayerStore(s => s.queue.length)
  const { pause, resume, next, prev, setVolume } = usePlayerStore()

  // Fetch stream URL whenever track changes
  useEffect(() => {
    if (!currentTrack) return
    setStreamUrl(null)
    setError(false)
    setCurrentTime(0)
    setDuration(0)
    setLoadingUrl(true)
    playerApi
      .getStreamUrl(currentTrack.id)
      .then(({ data }) => setStreamUrl(data.url))
      .catch(() => setError(true))
      .finally(() => setLoadingUrl(false))
  }, [currentTrack?.id])

  // Sync play/pause with audio element
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !streamUrl) return
    if (isPlaying) {
      audio.play().catch(() => pause())
    } else {
      audio.pause()
    }
  }, [isPlaying, streamUrl])

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  if (!currentTrack) return null

  const artists = currentTrack.artists.map(a => a.name).join(', ')
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * duration
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-100/95 backdrop-blur border-t border-white/10 px-4 py-3">
      <audio
        ref={audioRef}
        src={streamUrl ?? undefined}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={next}
        onCanPlay={() => { if (isPlaying) audioRef.current?.play().catch(() => {}) }}
      />

      <div className="mx-auto flex max-w-7xl items-center gap-4">
        {/* Track info */}
        <div className="flex w-56 shrink-0 items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded">
            {currentTrack.coverUri
              ? <img src={currentTrack.coverUri} alt={currentTrack.title} className="h-full w-full object-cover" />
              : <div className="flex h-full w-full items-center justify-center bg-surface-50"><Music className="h-4 w-4 text-white/30" /></div>
            }
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{currentTrack.title}</p>
            <p className="truncate text-xs text-white/50">{artists || 'Unknown artist'}</p>
          </div>
        </div>

        {/* Controls + progress */}
        <div className="flex flex-1 flex-col items-center gap-1">
          <div className="flex items-center gap-5">
            <button
              onClick={prev}
              disabled={queueIndex === 0}
              className="text-white/50 hover:text-white disabled:opacity-30 transition-colors"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              onClick={isPlaying ? pause : resume}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform"
            >
              {loadingUrl
                ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                : isPlaying
                  ? <Pause className="h-4 w-4 fill-black" />
                  : <Play className="h-4 w-4 fill-black ml-0.5" />
              }
            </button>

            <button
              onClick={next}
              disabled={queueIndex >= queueLength - 1}
              className="text-white/50 hover:text-white disabled:opacity-30 transition-colors"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex w-full max-w-lg items-center gap-2">
            <span className="w-8 text-right text-[10px] text-white/40">{formatTime(currentTime)}</span>
            <div
              className="relative h-1 flex-1 cursor-pointer rounded-full bg-white/20"
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full bg-white/80 transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="w-8 text-[10px] text-white/40">{formatTime(duration)}</span>
          </div>

          {error && <p className="text-[10px] text-red-400">Не удалось загрузить трек</p>}
        </div>

        {/* Volume */}
        <div className="flex w-32 shrink-0 items-center justify-end gap-2">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
            className="text-white/50 hover:text-white transition-colors"
          >
            {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="w-20 accent-white"
          />
        </div>
      </div>
    </div>
  )
}
