import { useState } from 'react'
import { useTopTracks } from '@/features/music/hooks'
import { Layout } from '@/shared/components/Layout'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
import { formatDuration } from '@/shared/utils/format'
import type { TimeRange } from '@/shared/types'

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'short_term', label: 'Last 4 weeks' },
  { value: 'medium_term', label: 'Last 6 months' },
  { value: 'long_term', label: 'All time' },
]

export default function TopTracksPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('short_term')
  const { data, isLoading } = useTopTracks(timeRange)

  return (
    <Layout title="Top Tracks">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Top Tracks</h1>
            <p className="text-white/50 mt-1">Your most-played songs</p>
          </div>
          <div className="flex gap-2 rounded-lg border border-white/10 bg-white/5 p-1">
            {TIME_RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setTimeRange(r.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${timeRange === r.value ? 'bg-[#1DB954] text-black' : 'text-white/60 hover:text-white'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}

        {data && (
          <div className="space-y-1">
            {data.map((track, i) => (
              <a key={track.id} href={track.spotifyUrl ?? '#'} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 transition group">
                <span className="w-6 text-right text-white/30 text-sm tabular-nums flex-shrink-0">{i + 1}</span>
                <div className="h-12 w-12 rounded overflow-hidden bg-white/10 flex-shrink-0">
                  {track.album?.imageUrl
                    ? <img src={track.album.imageUrl} alt={track.name} className="h-full w-full object-cover" />
                    : <div className="h-full w-full flex items-center justify-center">🎵</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate group-hover:text-[#1DB954] transition">{track.name}</p>
                  <p className="text-white/50 text-sm truncate">{track.artists.map(a => a.name).join(', ')}</p>
                </div>
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-white/30 text-sm">{track.album?.name}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-20 h-1 bg-white/10 rounded-full hidden sm:block">
                    <div className="h-full bg-[#1DB954] rounded-full" style={{ width: `${track.popularity}%` }} />
                  </div>
                  <span className="text-white/30 text-sm tabular-nums">{formatDuration(track.durationMs)}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
