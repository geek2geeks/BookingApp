'use client'

import { useState } from 'react'
import { Loader2, Search, X } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { useBookingStore } from '../lib/store/booking-store'
import { type Booking } from '../lib/utils/booking-utils'
import { formatSlotDisplay } from '../lib/utils/date-utils'
import { cn } from '../lib/utils'

// Booking details dialog component
function BookingDetailsDialog({
  booking,
  onClose,
  onCancel,
}: {
  booking: Booking
  onClose: () => void
  onCancel: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCancel = async () => {
    setIsLoading(true)
    try {
      await onCancel()
    } finally {
      setIsLoading(false)
      onClose()
    }
  }

  return (
    <Dialog.Root open onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className={cn(
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-md p-6 rounded-lg shadow-lg',
          'bg-white dark:bg-gray-800'
        )}>
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Booking Details
            </Dialog.Title>
            <Dialog.Close className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Slot</h4>
              <p className="text-gray-900 dark:text-gray-100">{formatSlotDisplay(booking.slot)}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h4>
              <p className="text-gray-900 dark:text-gray-100">{booking.name}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Student Number</h4>
              <p className="text-gray-900 dark:text-gray-100">{booking.studentNumber}</p>
            </div>

            {booking.company && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</h4>
                <p className="text-gray-900 dark:text-gray-100">{booking.company}</p>
              </div>
            )}

            {booking.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</h4>
                <p className="text-gray-900 dark:text-gray-100">{booking.notes}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Booking Code</h4>
              <p className="text-gray-900 dark:text-gray-100 font-mono">{booking.code}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</h4>
              <p className="text-gray-900 dark:text-gray-100">
                {new Date(booking.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium',
                'text-white bg-red-600 hover:bg-red-700',
                'focus:outline-none focus:ring-2 focus:ring-red-500',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Canceling...
                </>
              ) : (
                'Cancel Booking'
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Booking lookup form component
function BookingLookup({
  onFound,
}: {
  onFound: (booking: Booking) => void
}) {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const getBooking = useBookingStore((state) => state.getBooking)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const booking = await getBooking(code)
      if (booking) {
        onFound(booking)
        setCode('')
      } else {
        setError('No booking found with this code')
      }
    } catch (error) {
      setError('Failed to lookup booking')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="bookingCode"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Enter Booking Code
        </label>
        <div className="mt-1 relative">
          <input
            type="text"
            id="bookingCode"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 4-digit code"
            className={cn(
              'w-full px-3 py-2 rounded-md border',
              'text-gray-900 dark:text-gray-100',
              'bg-white dark:bg-gray-800',
              'border-gray-300 dark:border-gray-600',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-500 focus:ring-red-500'
            )}
            disabled={isLoading}
          />
          {error && (
            <p className="mt-1 text-sm text-red-500">
              {error}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={!code || isLoading}
        className={cn(
          'w-full px-4 py-2 rounded-md text-sm font-medium',
          'text-white bg-blue-600 hover:bg-blue-700',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center'
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Looking up...
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            Look up Booking
          </>
        )}
      </button>
    </form>
  )
}

// Main booking management component
export function BookingManagement() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const cancelBooking = useBookingStore((state) => state.cancelBooking)

  const handleCancel = async () => {
    if (selectedBooking) {
      await cancelBooking(selectedBooking.code)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
          Manage Your Booking
        </h2>

        <BookingLookup onFound={setSelectedBooking} />
      </div>

      {selectedBooking && (
        <BookingDetailsDialog
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
} 