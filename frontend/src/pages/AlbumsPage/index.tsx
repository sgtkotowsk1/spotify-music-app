import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { Layout } from '@/shared/components/Layout'
import { AlbumCard } from '@/shared/components/MusicCard'
import { SkeletonCard } from '@/shared/components/LoadingSpinner'
import { ErrorState } from '@/shared/components/ErrorBoundary'
import { useLikedAlbums } from '@/features/music/hooks'

export default function AlbumsPage() {
  const [query, setQuery] = useState('')
  const { data: albums, isLoading, isError, refetch } = useLikedAlbums()

  if (isLoading) {
    return (
      <Layout title="Albums">
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
      <Layout title="Albums">
        <ErrorState onRetry={refetch} />
      </Layout>
    )

  const filtered = (albums ?? []).filter(
    a =>
      !query ||
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.artists.some(ar => ar.name.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <Layout title="Albums">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-white/50 text-sm">{albums?.length ?? 0} albums</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search albums..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-full bg-white/10 border border-white/10 focus:outline-none focus:border-brand-500 placeholder-white/30 transition-all w-64"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            {query ? 'No albums match your search' : 'No liked albums yet'}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {filtered.map(album => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </motion.div>
        )}
      </div>
    </Layout>
  )
}
