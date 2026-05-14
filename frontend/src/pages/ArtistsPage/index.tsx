import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { Layout } from '@/shared/components/Layout'
import { ArtistCard } from '@/shared/components/MusicCard'
import { SkeletonCard } from '@/shared/components/LoadingSpinner'
import { ErrorState } from '@/shared/components/ErrorBoundary'
import { useLikedArtists } from '@/features/music/hooks'

export default function ArtistsPage() {
  const [query, setQuery] = useState('')
  const { data: artists, isLoading, isError, refetch } = useLikedArtists()

  if (isLoading) {
    return (
      <Layout title="Artists">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </Layout>
    )
  }

  if (isError)
    return (
      <Layout title="Artists">
        <ErrorState onRetry={refetch} />
      </Layout>
    )

  const filtered = (artists ?? []).filter(
    a => !query || a.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <Layout title="Artists">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-white/50 text-sm">{artists?.length ?? 0} artists</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search artists..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-full bg-white/10 border border-white/10 focus:outline-none focus:border-brand-500 placeholder-white/30 transition-all w-64"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            {query ? 'No artists match your search' : 'No liked artists yet'}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {filtered.map(artist => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </motion.div>
        )}
      </div>
    </Layout>
  )
}
