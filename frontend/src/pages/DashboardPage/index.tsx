import { Link } from 'react-router-dom'
import { useDashboard } from '@/features/music/hooks'
import { Layout } from '@/shared/components/Layout'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
import { formatDuration, formatPlayedAt } from '@/shared/utils/format'
import type { SpotifyArtist, SpotifyTrack } from '@/shared/types'

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard()

  if (isLoading) return <Layout title="Dashboard"><div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div></Layout>
  if (error || !data) return <Layout title="Dashboard"><p className="text-red-400 py-10 text-center">Failed to load dashboard.</p></Layout>

  return (
    <Layout title="Dashboard">
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-bold">Good to see you 👋</h1>
          <p className="text-white/50 mt-1">Here's your Spotify listening summary</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Top Tracks" value={String(data.topTracks.length)} sub="this month" href="/top-tracks" color="#1DB954" />
          <StatCard label="Top Artists" value={String(data.topArtists.length)} sub="this month" href="/top-artists" color="#1DB954" />
          <StatCard label="Playlists" value={String(data.totalPlaylists)} sub="in your library" href="/playlists" color="#1DB954" />
        </div>

        <Section title="Top Tracks This Month" href="/top-tracks">
          <div className="space-y-1">
            {data.topTracks.map((track, i) => (
              <TrackRow key={track.id} track={track} rank={i + 1} right={formatDuration(track.durationMs)} />
            ))}
          </div>
        </Section>

        <Section title="Top Artists This Month" href="/top-artists">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {data.topArtists.map((artist) => <ArtistChip key={artist.id} artist={artist} />)}
          </div>
        </Section>

        <Section title="Recently Played" href="/recently-played">
          <div className="space-y-1">
            {data.recentlyPlayed.slice(0, 5).map((item, i) => (
              <TrackRow key={`${item.track.id}-${i}`} track={item.track} right={formatPlayedAt(item.playedAt)} />
            ))}
          </div>
        </Section>
      </div>
    </Layout>
  )
}

function StatCard({ label, value, sub, href, color }: { label: string; value: string; sub: string; href: string; color: string }) {
  return (
    <Link to={href} className="rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition group">
      <p className="text-white/50 text-sm">{label}</p>
      <p className="text-3xl font-bold mt-1" style={{ color }}>{value}</p>
      <p className="text-white/30 text-xs mt-1">{sub}</p>
    </Link>
  )
}

function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link to={href} className="text-sm text-[#1DB954] hover:underline">See all →</Link>
      </div>
      {children}
    </div>
  )
}

function TrackRow({ track, rank, right }: { track: SpotifyTrack; rank?: number; right?: string }) {
  return (
    <a href={track.spotifyUrl ?? '#'} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 transition group">
      {rank !== undefined && <span className="w-5 text-right text-white/30 text-sm tabular-nums">{rank}</span>}
      <div className="h-10 w-10 rounded overflow-hidden bg-white/10 flex-shrink-0">
        {track.album?.imageUrl
          ? <img src={track.album.imageUrl} alt={track.name} className="h-full w-full object-cover" />
          : <div className="h-full w-full flex items-center justify-center">🎵</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate group-hover:text-[#1DB954] transition text-sm">{track.name}</p>
        <p className="text-white/50 text-xs truncate">{track.artists.map(a => a.name).join(', ')}</p>
      </div>
      {right && <span className="text-white/30 text-xs tabular-nums flex-shrink-0">{right}</span>}
    </a>
  )
}

function ArtistChip({ artist }: { artist: SpotifyArtist }) {
  return (
    <a href={artist.spotifyUrl ?? '#'} target="_blank" rel="noopener noreferrer"
      className="group flex flex-col items-center gap-2 text-center">
      <div className="h-20 w-20 rounded-full overflow-hidden bg-white/10">
        {artist.imageUrl
          ? <img src={artist.imageUrl} alt={artist.name} className="h-full w-full object-cover group-hover:scale-105 transition" />
          : <div className="h-full w-full flex items-center justify-center text-2xl">🎤</div>}
      </div>
      <span className="text-xs font-medium truncate w-full">{artist.name}</span>
    </a>
  )
}
