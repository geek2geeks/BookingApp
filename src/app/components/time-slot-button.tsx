'use client'

import { useMemo, useState } from 'react'
import { Settings, X, Loader2 } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { useBookingStore, useBookings } from '@/app/lib/store/booking-store'
import { formatTimeRange } from '@/app/lib/utils/date-utils'
import { cn } from '@/app/lib/utils'
import type { TimeSlot } from '@/app/types'

interface TimeSlotButtonProps {
  slot: TimeSlot
  isBooked: boolean
  isPast: boolean
  onClick: () => void
}

interface ButtonState {
  state: 'past' | 'booked' | 'available'
  label: string
}

export function TimeSlotButton({ slot, isBooked, isPast, onClick }: TimeSlotButtonProps) {
  const [showManage, setShowManage] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingCode, setBookingCode] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const cancelBooking = useBookingStore((state) => state.cancelBooking)
  const updateBooking = useBookingStore((state) => state.updateBooking)
  const bookings = useBookings()

  const booking = useMemo(() => {
    return bookings.find(b => b.slot === `${slot.date} - ${slot.startTime}`)
  }, [bookings, slot])

  const buttonState = useMemo((): ButtonState => {
    if (isPast) return { state: 'past', label: 'Past' }
    if (isBooked) return { 
      state: 'booked', 
      label: booking ? `${booking.name}\n${booking.studentNumber}\n${booking.company || 'No company'}` : 'Booked'
    }
    return { state: 'available', label: 'Available' }
  }, [isPast, isBooked, booking])

  // Check if management is allowed (not on or after the presentation day)
  const canManageBooking = useMemo(() => {
    if (!isBooked || isPast || !booking) return false
    if (!isBooked || isPast || !booking) return false
    
    // Compare dates in London timezone for consistency
    const presentationDate = new Date(slot.date + 'T00:00:00Z')
    const today = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00Z')
    
    // Can manage if presentation is in the future
    return presentationDate > today
  }, [isBooked, isPast, slot.date, booking])

  // Tailwind classes for different button states
  const buttonStyles = {
    past: 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700',
    booked: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    available: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800'
  }

  const handleManage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (booking) {
      setCompanyName(booking.company || '')
    }
    setShowManage(true)
  }

  const handleCancel = async () => {
    if (!booking) return

    setIsLoading(true)
    setError(null)

    try {
      if (!booking || booking.code !== bookingCode) {
        throw new Error('Invalid booking code')
      }
      await cancelBooking(bookingCode)
      setShowManage(false)
      setBookingCode('')
      setError(null)
    } catch (error) {
      console.error('Cancel booking error:', error);
      setError(error instanceof Error ? error.message : 'Failed to cancel booking')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!booking) return

    setIsLoading(true)
    setError(null)

    try {
      if (booking.code !== bookingCode) {
        throw new Error('Invalid booking code')
      }
      await updateBooking(bookingCode, { company: companyName })
      
      // Refetch bookings to ensure latest state
      const updatedBookings = useBookingStore.getState().fetchBookings()
      await updatedBookings
      
      setShowManage(false)
      setBookingCode('')
      setCompanyName('')
      setIsEditing(false)
      setError(null)
    } catch (error) {
      console.error('Update booking error:', error)
      setError(error instanceof Error ? error.message : 'Failed to update booking')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="relative">
        <button
          className={cn(
            'w-full p-2 text-sm rounded-md transition-colors min-h-[80px]',
            buttonStyles[buttonState.state]
          )}
          onClick={onClick}
          disabled={isBooked || isPast}
        >
          <div className="flex flex-col items-center justify-center space-y-1">
            <span>{formatTimeRange(slot.startTime, slot.endTime)}</span>
            <span className="text-xs whitespace-pre-line">{buttonState.label}</span>
          </div>
        </button>
        {canManageBooking && (
          <button
            onClick={handleManage}
            className="absolute top-1 right-1 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      <Dialog.Root open={showManage} onOpenChange={setShowManage}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-md p-6 rounded-lg shadow-lg',
            'bg-white dark:bg-gray-800'
          )}>
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Manage Booking
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              <Dialog.Description className="text-gray-600 dark:text-gray-300">
                Enter your booking code to manage your presentation slot.
              </Dialog.Description>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Note: You can only cancel bookings up until the day before your presentation.
              </p>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="bookingCode"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Booking Code
                  </label>
                  <input
                    type="text"
                    id="bookingCode"
                    value={bookingCode}
                    onChange={(e) => setBookingCode(e.target.value)}
                    placeholder="Enter 4-digit code"
                    className={cn(
                      'mt-1 w-full px-3 py-2 rounded-md border',
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

                {isEditing && (
                  <div>
                    <label
                      htmlFor="companyName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Company Name (Optional)
                    </label>
                    <p className="mt-1 mb-2 text-xs text-gray-600 dark:text-gray-400">
                      To prevent multiple students from presenting on the same company
                    </p>
                    <input
                      type="text"
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter new company name"
                      className={cn(
                        'mt-1 w-full px-3 py-2 rounded-md border',
                        'text-gray-900 dark:text-gray-100',
                        'bg-white dark:bg-gray-800',
                        'border-gray-300 dark:border-gray-600',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className={cn(
                        'px-4 py-2 rounded-md text-sm font-medium',
                        'text-gray-700 dark:text-gray-200',
                        'bg-gray-100 dark:bg-gray-700',
                        'hover:bg-gray-200 dark:hover:bg-gray-600',
                        'focus:outline-none focus:ring-2 focus:ring-gray-500',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                      disabled={isLoading}
                      onClick={() => {
                        setIsEditing(false)
                        setBookingCode('')
                        setCompanyName('')
                      }}
                    >
                      Close
                    </button>
                  </Dialog.Close>

                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className={cn(
                        'px-4 py-2 rounded-md text-sm font-medium',
                        'text-blue-600 hover:text-blue-700',
                        'focus:outline-none',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                      disabled={isLoading}
                    >
                      {isEditing ? 'Cancel Edit' : 'Edit Company'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={isEditing ? handleUpdate : handleCancel}
                      className={cn(
                        'px-4 py-2 rounded-md text-sm font-medium',
                        isEditing ? (
                          'text-blue-600 bg-blue-50 hover:bg-blue-100'
                        ) : (
                          'text-red-600 bg-red-50 hover:bg-red-100'
                        ),
                        'focus:outline-none focus:ring-2',
                        isEditing
                          ? 'focus:ring-blue-500'
                          : 'focus:ring-red-500',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'flex items-center'
                      )}
                      disabled={!bookingCode || isLoading || (isEditing && !companyName)}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isEditing ? 'Updating...' : 'Canceling...'}
                        </>
                      ) : (
                        isEditing ? 'Update Company' : 'Cancel Booking'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
} 