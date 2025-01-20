import { Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'

interface LoadingProps {
  message?: string
  className?: string
}

export function Loading({ message = 'Loading...', className }: LoadingProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-6', className)}>
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        {message}
      </p>
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loading />
    </div>
  )
}

export function FullPageLoading() {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    </div>
  )
} 