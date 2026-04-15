/**
 * Error Boundary Component for React
 * Catches errors in child components and displays fallback UI
 */

import React, { ReactNode, ReactElement } from 'react'
import { ErrorHandler, AppError } from '@/lib/errorHandling'

interface Props {
  children: ReactNode
  fallback?: ReactElement
  onError?: (error: Error) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    // Log error
    ErrorHandler.handle(error)

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-red-900/20">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 max-w-md text-center">
              <div className="text-red-600 dark:text-red-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4v2m0 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Something went wrong
              </h2>

              <p className="text-slate-600 dark:text-slate-300 mb-4">
                {this.state.error?.message ||
                  'An unexpected error occurred. Please try again.'}
              </p>

              <button
                onClick={this.resetError}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>

              {/* Show error details in development */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                    Error Details
                  </summary>
                  <pre className="mt-2 p-2 bg-slate-100 dark:bg-slate-900 rounded text-xs overflow-auto max-h-48">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

/**
 * Async Error Boundary Hook for handling async errors
 */
export const useAsyncErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const handler = (event: ErrorEvent) => {
      setError(event.error)
      ErrorHandler.handle(event.error)
    }

    window.addEventListener('error', handler)

    return () => {
      window.removeEventListener('error', handler)
    }
  }, [])

  return { error, clearError: () => setError(null) }
}

/**
 * Async wrapper for error handling
 */
export const withAsyncErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R | void> => {
    try {
      return await fn(...args)
    } catch (error) {
      ErrorHandler.handle(error)
      throw error
    }
  }
}
