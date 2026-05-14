import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { PageLoader } from '@/shared/components/LoadingSpinner'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const AuthCallbackPage = lazy(() => import('@/pages/AuthCallbackPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const TopTracksPage = lazy(() => import('@/pages/AlbumsPage'))
const TopArtistsPage = lazy(() => import('@/pages/ArtistsPage'))
const RecentlyPlayedPage = lazy(() => import('@/pages/FavoritesPage'))
const PlaylistsPage = lazy(() => import('@/pages/PlaylistsPage'))

const wrap = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/login',
    element: wrap(<LoginPage />),
  },
  {
    path: '/auth/callback',
    element: wrap(<AuthCallbackPage />),
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: wrap(<DashboardPage />) },
      { path: '/top-tracks', element: wrap(<TopTracksPage />) },
      { path: '/top-artists', element: wrap(<TopArtistsPage />) },
      { path: '/recently-played', element: wrap(<RecentlyPlayedPage />) },
      { path: '/playlists', element: wrap(<PlaylistsPage />) },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
