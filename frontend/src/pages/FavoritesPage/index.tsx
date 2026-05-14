import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { Layout } from '@/shared/components/Layout'
import { TrackCard } from '@/shared/components/MusicCard'
import { PageLoader } from '@/shared/components/LoadingSpinner'
import { ErrorState } from '@/shared/components/ErrorBoundary'
import { useLikedTracks } from '@/features/music/hooks'

export default function FavoritesPage() {
  const [query, setQuery] = useState('')
  const { data: tracks, isLoading, isError, refetch } = useLikedTracks()

  if (isLoading) return <Layout title="Liked Tracks"><PageLoader /></Layout>
  if (isError) return <Layout title="Liked Tracks"><ErrorState onRetry={refetch} /></Layout>

  const filtered = (tracks ?? []).filter(t =>
    !query ||
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.artists.some(a => a.name.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <Layout title="Liked Tracks">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-white/50 text-sm">{tracks?.length ?? 0} tracks</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search tracks..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-full bg-white/10 border border-white/10 focus:outline-none focus:border-brand-500 focus:bg-white/15 placeholder-white/30 transition-all w-64"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            {query ? 'No tracks match your search' : 'No liked tracks yet'}
          </div>
        ) : (
          <div className="rounded-xl bg-surface-50 overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5 text-xs text-white/30 uppercase tracking-wider">
              <div className="w-12" />
              <div className="flex-1">Title</div>
              <div className="hidden md:block w-40">Album</div>
              <div className="w-12 text-right">Time</div>
            </div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
            >
              {filtered.map(track => (
                <TrackCard key={track.id} track={track} queue={tracks ?? []} />
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  )
}
