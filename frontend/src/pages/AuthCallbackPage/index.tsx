import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { apiClient } from '@/shared/api/client'
import type { UserProfile } from '@/shared/types'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'

export default function AuthCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const setTokens = useAuthStore(s => s.setTokens)
  const setAuth = useAuthStore(s => s.setAuth)
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const accessToken = params.get('accessToken')
    const refreshToken = params.get('refreshToken')

    if (!accessToken || !refreshToken) {
      navigate('/login', { replace: true })
      return
    }

    // Store tokens immediately so the API client can use them
    setTokens(accessToken, refreshToken)

    // Fetch full user profile
    apiClient
      .get<UserProfile>('/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(({ data }) => {
        setAuth(accessToken, refreshToken, {
          id: data.id,
          displayName: data.displayName,
          email: data.email,
          avatarUrl: data.avatarUrl,
          login: data.login,
        })
        navigate('/', { replace: true })
      })
      .catch(() => {
        navigate('/login', { replace: true })
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-white/50">Signing you in…</p>
      </div>
    </div>
  )
}
