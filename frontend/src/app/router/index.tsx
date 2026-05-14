import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { PageLoader } from '@/shared/components/LoadingSpinner'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const AuthCallbackPage = lazy(() => import('@/pages/AuthCallbackPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'))
const ArtistsPage = lazy(() => import('@/pages/ArtistsPage'))
const AlbumsPage = lazy(() => import('@/pages/AlbumsPage'))
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
      { path: '/favorites', element: wrap(<FavoritesPage />) },
      { path: '/artists', element: wrap(<ArtistsPage />) },
      { path: '/albums', element: wrap(<AlbumsPage />) },
      { path: '/playlists', element: wrap(<PlaylistsPage />) },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
