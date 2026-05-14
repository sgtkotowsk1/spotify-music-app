import { useRecentlyPlayed } from '@/features/music/hooks'
import { Layout } from '@/shared/components/Layout'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
import { formatDuration, formatPlayedAt } from '@/shared/utils/format'

export default function RecentlyPlayedPage() {
  const { data, isLoading } = useRecentlyPlayed()

  return (
    <Layout title="Recently Played">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Recently Played</h1>
          <p className="text-white/50 mt-1">Your last 50 tracks</p>
        </div>

        {isLoading && <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}

        {data && (
          <div className="space-y-1">
            {data.map((item, i) => (
              <a key={`${item.track.id}-${i}`} href={item.track.spotifyUrl ?? '#'} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 transition group">
                <div className="h-12 w-12 rounded overflow-hidden bg-white/10 flex-shrink-0">
                  {item.track.album?.imageUrl
                    ? <img src={item.track.album.imageUrl} alt={item.track.name} className="h-full w-full object-cover" />
                    : <div className="h-full w-full flex items-center justify-center">🎵</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate group-hover:text-[#1DB954] transition">{item.track.name}</p>
                  <p className="text-white/50 text-sm truncate">{item.track.artists.map(a => a.name).join(', ')}</p>
                  <p className="text-white/30 text-xs mt-0.5">{item.track.album?.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white/30 text-sm tabular-nums">{formatDuration(item.track.durationMs)}</p>
                  <p className="text-white/20 text-xs mt-0.5">{formatPlayedAt(item.playedAt)}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
