import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { cn } from './lib/utils'

export default function NotFound() {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <FileQuestion className="w-12 h-12 text-gray-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Page not found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-md">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        <Link
          href="/"
          className={cn(
            'inline-flex items-center px-4 py-2 rounded-md',
            'text-sm font-medium text-white',
            'bg-blue-600 hover:bg-blue-700',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          )}
        >
          Go back home
        </Link>
      </div>
    </div>
  )
} 