import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-sm text-white/60">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn-primary"
            >
              Try again
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Failed to load data', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center min-h-[300px]">
      <AlertCircle className="h-10 w-10 text-red-400" />
      <p className="text-white/70">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary text-sm">
          Retry
        </button>
      )}
    </div>
  )
}
