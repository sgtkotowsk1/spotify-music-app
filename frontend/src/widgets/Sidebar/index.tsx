import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  Heart,
  Users,
  Disc3,
  ListMusic,
  Music2,
  LogOut,
} from 'lucide-react'
import { useCurrentUser, useLogout } from '@/features/auth/hooks'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/favorites', icon: Heart, label: 'Liked Tracks' },
  { to: '/artists', icon: Users, label: 'Artists' },
  { to: '/albums', icon: Disc3, label: 'Albums' },
  { to: '/playlists', icon: ListMusic, label: 'Playlists' },
]

export function Sidebar() {
  const user = useCurrentUser()
  const logout = useLogout()

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-black/40 backdrop-blur-sm border-r border-white/5">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
          <Music2 className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">MusicHub</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 pb-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx('sidebar-link', isActive && 'active')
            }
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
            <div className="h-9 w-9 rounded-full bg-brand-700 flex items-center justify-center text-sm font-bold uppercase">
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
