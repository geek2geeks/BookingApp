'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '@/app/lib/utils'

export function ResetButton() {
  const [showDialog, setShowDialog] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleReset = async () => {
    if (code !== 'As!101010') {
      setError('Invalid reset code')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/bookings?resetCode=${code}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reset database')
      }

      // Reset successful
      window.location.reload()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to reset database')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
      <Dialog.Trigger asChild>
        <button
          className="text-2xl hover:scale-110 transition-transform"
          title="Reset Database"
        >
          💣
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className={cn(
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-md p-6 rounded-lg shadow-lg',
          'bg-white dark:bg-gray-800'
        )}>
          <Dialog.Title className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Reset Database
          </Dialog.Title>

          <Dialog.Description className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            🔒 This function is restricted to administrators only. 
            Regular users do not have access to the necessary 
            permissions or reset codes to execute this operation.
          </Dialog.Description>

          <div className="space-y-4">
            <p className="text-sm text-red-500">
              ⚠️ This action will permanently delete all bookings and 
              cannot be undone. Only authorized administrators may 
              perform this operation.
            </p>

            <div>
              <label
                htmlFor="resetCode"
                className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100"
              >
                Reset Code
              </label>
              <input
                id="resetCode"
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={cn(
                  'w-full px-3 py-2 border rounded-md',
                  'bg-white dark:bg-gray-800',
                  'text-gray-900 dark:text-gray-100',
                  'border-gray-300 dark:border-gray-600',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  error && 'border-red-500 focus:ring-red-500'
                )}
                disabled={isLoading}
              />
              {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  className={cn(
                    'px-4 py-2 rounded-md',
                    'text-gray-700 dark:text-gray-200',
                    'bg-gray-100 dark:bg-gray-700',
                    'hover:bg-gray-200 dark:hover:bg-gray-600',
                    'disabled:opacity-50'
                  )}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </Dialog.Close>

              <button
                onClick={handleReset}
                disabled={!code || isLoading}
                className={cn(
                  'px-4 py-2 rounded-md',
                  'text-white bg-red-600',
                  'hover:bg-red-700',
                  'focus:outline-none focus:ring-2 focus:ring-red-500',
                  'disabled:opacity-50',
                  'flex items-center'
                )}
              >
                {isLoading ? 'Resetting...' : 'Reset'}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}