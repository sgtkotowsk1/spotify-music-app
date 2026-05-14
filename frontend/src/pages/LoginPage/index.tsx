import { motion } from 'framer-motion'
import { Music2 } from 'lucide-react'
import { useLogin } from '@/features/auth/hooks'

export default function LoginPage() {
  const login = useLogin()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-brand-800/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-surface-100/80 p-10 backdrop-blur-sm text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600">
          <Music2 className="h-8 w-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold mb-2">MusicHub</h1>
        <p className="text-white/60 mb-8">
          Your personal Yandex Music dashboard.
          <br />
          Discover your stats, playlists, and favorites.
        </p>

        <button onClick={login} className="btn-primary w-full flex items-center justify-center gap-3 text-base">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
            <path d="M13.807 1H10.24C6.345 1 4 3.315 4 7.2v9.6C4 20.685 6.345 23 10.24 23h3.567V13.01h-2.38v-3.02h2.38V7.8c0-2.34 1.394-3.61 3.51-3.61.999 0 2.044.178 2.044.178V6.7h-1.151c-1.134 0-1.488.704-1.488 1.426v1.864h2.532l-.405 3.02h-2.127V23H13.807z" />
          </svg>
          Continue with Yandex
        </button>

        <p className="mt-6 text-xs text-white/30">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  )
}
