import { Providers } from './providers'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { Player } from '@/widgets/Player'

export default function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <RouterProvider router={router} />
        <Player />
      </Providers>
    </ErrorBoundary>
  )
}
