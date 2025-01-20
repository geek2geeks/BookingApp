'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '../lib/utils'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-md">
            {error.message || 'An unexpected error occurred. Please try again later.'}
          </p>
          {error.digest && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <button
          onClick={reset}
          className={cn(
            'inline-flex items-center px-4 py-2 rounded-md',
            'text-sm font-medium text-white',
            'bg-blue-600 hover:bg-blue-700',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          )}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try again
        </button>
      </div>
    </div>
  )
} 