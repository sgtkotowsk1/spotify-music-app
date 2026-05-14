import { useState } from 'react'
import { useTopArtists } from '@/features/music/hooks'
import { Layout } from '@/shared/components/Layout'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
import { formatFollowers } from '@/shared/utils/format'
import type { TimeRange } from '@/shared/types'

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'short_term', label: 'Last 4 weeks' },
  { value: 'medium_term', label: 'Last 6 months' },
  { value: 'long_term', label: 'All time' },
]

export default function ArtistsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('short_term')
  const { data, isLoading } = useTopArtists(timeRange)

  return (
    <Layout title="Top Artists">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Top Artists</h1>
            <p className="text-white/50 mt-1">Your most-listened artists</p>
          </div>
          <TimeRangePicker value={timeRange} onChange={setTimeRange} />
        </div>

        {isLoading && <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}

        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {data.map((artist, i) => (
              <a key={artist.id} href={artist.spotifyUrl ?? '#'} target="_blank" rel="noopener noreferrer"
                className="group flex flex-col gap-3">
                <div className="relative aspect-square rounded-full overflow-hidden bg-white/10">
                  {artist.imageUrl
                    ? <img src={artist.imageUrl} alt={artist.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                    : <div className="h-full w-full flex items-center justify-center text-4xl">🎤</div>}
                  <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-black/60 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-semibold truncate group-hover:text-[#1DB954] transition">{artist.name}</p>
                  {artist.genres.length > 0 && (
                    <p className="text-white/40 text-xs truncate mt-0.5">{artist.genres[0]}</p>
                  )}
                  <p className="text-white/30 text-xs mt-0.5">{formatFollowers(artist.followersTotal)} followers</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

function TimeRangePicker({ value, onChange }: { value: TimeRange; onChange: (v: TimeRange) => void }) {
  return (
    <div className="flex gap-2 rounded-lg border border-white/10 bg-white/5 p-1">
      {TIME_RANGES.map(r => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${value === r.value ? 'bg-[#1DB954] text-black' : 'text-white/60 hover:text-white'}`}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}
