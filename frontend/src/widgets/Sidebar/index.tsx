import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { LayoutDashboard, TrendingUp, Users, Clock, ListMusic, LogOut } from 'lucide-react'
import { useCurrentUser, useLogout } from '@/features/auth/hooks'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/top-tracks', icon: TrendingUp, label: 'Top Tracks' },
  { to: '/top-artists', icon: Users, label: 'Top Artists' },
  { to: '/recently-played', icon: Clock, label: 'Recently Played' },
  { to: '/playlists', icon: ListMusic, label: 'Playlists' },
]

export function Sidebar() {
  const user = useCurrentUser()
  const logout = useLogout()

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-black/40 backdrop-blur-sm border-r border-white/5">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1DB954]">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-black">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>
        <span className="font-bold text-lg tracking-tight">Statsify</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 pb-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/5 p-4">
        <div className="flex items-center gap-3 mb-3">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.login} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-[#1DB954]/20 flex items-center justify-center text-sm font-bold uppercase text-[#1DB954]">
              {(user?.displayName ?? user?.login ?? '?')[0]}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.displayName ?? user?.login}</p>
            <p className="truncate text-xs text-white/50">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="btn-ghost w-full justify-start text-sm gap-2 flex items-center"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
