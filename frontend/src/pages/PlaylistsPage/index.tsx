import { usePlaylists } from '@/features/music/hooks'
import { Layout } from '@/shared/components/Layout'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'

export default function PlaylistsPage() {
  const { data, isLoading } = usePlaylists()

  return (
    <Layout title="Playlists">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Playlists</h1>
          <p className="text-white/50 mt-1">{data ? `${data.length} playlists` : 'Your library'}</p>
        </div>

        {isLoading && <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}

        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {data.map(playlist => (
              <a key={playlist.id} href={playlist.spotifyUrl ?? '#'} target="_blank" rel="noopener noreferrer"
                className="group flex flex-col gap-3">
                <div className="aspect-square rounded-lg overflow-hidden bg-white/10">
                  {playlist.imageUrl
                    ? <img src={playlist.imageUrl} alt={playlist.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                    : <div className="h-full w-full flex items-center justify-center text-4xl">🎵</div>}
                </div>
                <div>
                  <p className="font-semibold truncate group-hover:text-[#1DB954] transition">{playlist.name}</p>
                  <p className="text-white/40 text-sm mt-0.5">{playlist.totalTracks} tracks</p>
                  {playlist.ownerName && (
                    <p className="text-white/30 text-xs mt-0.5">by {playlist.ownerName}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
