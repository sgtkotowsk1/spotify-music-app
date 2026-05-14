import { motion } from 'framer-motion'
import { Heart, Users, Disc3, ListMusic } from 'lucide-react'
import { Layout } from '@/shared/components/Layout'
import { AlbumCard, ArtistCard, TrackCard } from '@/shared/components/MusicCard'
import { PageLoader } from '@/shared/components/LoadingSpinner'
import { ErrorState } from '@/shared/components/ErrorBoundary'
import { useDashboard } from '@/features/music/hooks'
import { useCurrentUser } from '@/features/auth/hooks'

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card flex items-center gap-4"
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        <p className="text-sm text-white/50">{label}</p>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const user = useCurrentUser()
  const { data, isLoading, isError, refetch } = useDashboard()

  if (isLoading)
    return (
      <Layout title="Dashboard">
        <PageLoader />
      </Layout>
    )
  if (isError)
    return (
      <Layout title="Dashboard">
        <ErrorState onRetry={refetch} />
      </Layout>
    )

  const greeting =
    new Date().getHours() < 12
      ? 'Good morning'
      : new Date().getHours() < 18
        ? 'Good afternoon'
        : 'Good evening'

  return (
    <Layout title="Dashboard">
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-xl font-semibold text-white/70">
            {greeting}, <span className="text-white">{user?.displayName ?? user?.login}</span>
          </h2>
          <p className="text-sm text-white/40 mt-1">Here's what's in your music library</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Heart}
            label="Liked Tracks"
            value={data!.totalLikedTracks}
            color="bg-pink-600"
          />
          <StatCard
            icon={Disc3}
            label="Liked Albums"
            value={data!.totalLikedAlbums}
            color="bg-brand-600"
          />
          <StatCard
            icon={Users}
            label="Liked Artists"
            value={data!.totalLikedArtists}
            color="bg-emerald-600"
          />
          <StatCard
            icon={ListMusic}
            label="Playlists"
            value={data!.totalPlaylists}
            color="bg-amber-600"
          />
        </div>

        {data!.recentTracks.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-4">Recent Liked Tracks</h3>
            <div className="rounded-xl bg-surface-50 overflow-hidden">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              >
                {data!.recentTracks.map(track => (
                  <TrackCard key={track.id} track={track} queue={data!.recentTracks} />
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {data!.topArtists.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-4">Liked Artists</h3>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
            >
              {data!.topArtists.map(artist => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </motion.div>
          </section>
        )}

        {data!.recentAlbums.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-4">Recent Albums</h3>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
            >
              {data!.recentAlbums.map(album => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </motion.div>
          </section>
        )}
      </div>
    </Layout>
  )
}
