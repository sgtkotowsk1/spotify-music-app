import { motion } from 'framer-motion'
import { Layout } from '@/shared/components/Layout'
import { PlaylistCard } from '@/shared/components/MusicCard'
import { SkeletonCard } from '@/shared/components/LoadingSpinner'
import { ErrorState } from '@/shared/components/ErrorBoundary'
import { usePlaylists } from '@/features/music/hooks'

export default function PlaylistsPage() {
  const { data: playlists, isLoading, isError, refetch } = usePlaylists()

  if (isLoading) {
    return (
      <Layout title="Playlists">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </Layout>
    )
  }

  if (isError) return <Layout title="Playlists"><ErrorState onRetry={refetch} /></Layout>

  return (
    <Layout title="Playlists">
      <div className="space-y-6">
        <p className="text-white/50 text-sm">{playlists?.length ?? 0} playlists</p>

        {(playlists?.length ?? 0) === 0 ? (
          <div className="text-center py-16 text-white/40">No playlists found</div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {(playlists ?? []).map(playlist => (
              <PlaylistCard key={playlist.kind} playlist={playlist} />
            ))}
          </motion.div>
        )}
      </div>
    </Layout>
  )
}
