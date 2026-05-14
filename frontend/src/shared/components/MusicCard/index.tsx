import { motion } from 'framer-motion'
import { Music, Pause, Play } from 'lucide-react'
import { clsx } from 'clsx'
import type { Album, Artist, Playlist, Track } from '@/shared/types'
import { usePlayerStore } from '@/features/player/store'

function CoverImage({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  if (!src) {
    return (
      <div className={clsx('flex items-center justify-center bg-surface-50 text-white/30', className)}>
        <Music className="h-1/3 w-1/3" />
      </div>
    )
  }
  return <img src={src} alt={alt} className={clsx('object-cover', className)} loading="lazy" />
}

function formatDuration(ms: number | null): string {
  if (!ms) return ''
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

export function TrackCard({ track, queue }: { track: Track; queue?: Track[] }) {
  const playTrack = usePlayerStore(s => s.playTrack)
  const currentTrack = usePlayerStore(s => s.currentTrack)
  const isPlaying = usePlayerStore(s => s.isPlaying)
  const isActive = currentTrack?.id === track.id

  const artists = track.artists.map(a => a.name).join(', ')

  const handleClick = () => {
    playTrack(track, queue ?? [track])
  }

  return (
    <motion.div
      variants={cardVariants}
      onClick={handleClick}
      className={clsx(
        'group flex items-center gap-4 px-4 py-3 rounded-lg transition-colors cursor-pointer',
        isActive ? 'bg-white/10' : 'hover:bg-white/5'
      )}
    >
      <div className="relative shrink-0 h-12 w-12 rounded overflow-hidden">
        <CoverImage src={track.coverUri} alt={track.title} className="h-full w-full" />
        <div className={clsx(
          'absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity',
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        )}>
          {isActive && isPlaying
            ? <Pause className="h-5 w-5 fill-white text-white" />
            : <Play className="h-5 w-5 fill-white text-white" />
          }
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className={clsx('truncate font-medium text-sm', isActive && 'text-brand-400')}>{track.title}</p>
        <p className="truncate text-xs text-white/50">{artists || 'Unknown artist'}</p>
      </div>
      {track.album && (
        <p className="hidden md:block truncate max-w-[160px] text-xs text-white/40">{track.album.title}</p>
      )}
      <p className="shrink-0 text-xs text-white/40">{formatDuration(track.durationMs)}</p>
    </motion.div>
  )
}

export function AlbumCard({ album }: { album: Album }) {
  const artists = album.artists.map(a => a.name).join(', ')
  return (
    <motion.div variants={cardVariants} className="card group">
      <div className="relative mb-4 overflow-hidden rounded-lg aspect-square">
        <CoverImage src={album.coverUri} alt={album.title} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 shadow-lg">
            <Play className="h-5 w-5 fill-white text-white" />
          </div>
        </div>
      </div>
      <p className="truncate font-semibold text-sm">{album.title}</p>
      <p className="truncate text-xs text-white/50 mt-1">
        {album.year ? `${album.year} · ` : ''}{artists || 'Unknown artist'}
      </p>
    </motion.div>
  )
}

export function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <motion.div variants={cardVariants} className="card group text-center">
      <div className="relative mb-4 overflow-hidden rounded-full aspect-square mx-auto w-full max-w-[160px]">
        <CoverImage src={artist.coverUri} alt={artist.name} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
      </div>
      <p className="truncate font-semibold text-sm">{artist.name}</p>
      <p className="text-xs text-white/50 mt-1">
        {artist.genres?.slice(0, 2).join(' · ') || 'Artist'}
      </p>
    </motion.div>
  )
}

export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <motion.div variants={cardVariants} className="card group">
      <div className="relative mb-4 overflow-hidden rounded-lg aspect-square">
        <CoverImage src={playlist.coverUri} alt={playlist.title} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 shadow-lg">
            <Play className="h-5 w-5 fill-white text-white" />
          </div>
        </div>
      </div>
      <p className="truncate font-semibold text-sm">{playlist.title}</p>
      <p className="text-xs text-white/50 mt-1">
        {playlist.trackCount != null ? `${playlist.trackCount} tracks` : 'Playlist'}
        {playlist.ownerName ? ` · ${playlist.ownerName}` : ''}
      </p>
    </motion.div>
  )
}
