'use client'

import { useMemo, useState } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import * as Dialog from '@radix-ui/react-dialog'
import { ChevronLeft, Settings, X, Loader2 } from 'lucide-react'
import { useBookingStore, useBookings } from '@/app/lib/store/booking-store'
import { 
  generateTimeSlots,
  formatSlotDisplay,
  isSlotAvailable,
  getSessionType,
  isSlotInPast,
  formatTimeRange,
  formatDate,
  PRESENTATION_DATES
} from '@/app/lib/utils/date-utils'
import type { TimeSlot } from '@/app/types'
import { cn } from '@/app/lib/utils'
import { Button } from '@/app/components/ui/button'

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

// Component for individual time slot button
function TimeSlotButton({ slot, isBooked, isPast, onClick }: TimeSlotButtonProps) {
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
      label: booking ? `${booking.name}\n${booking.company || 'No company'}` : 'Booked'
    }
    return { state: 'available', label: 'Available' }
  }, [isPast, isBooked, booking])

  // Check if management is allowed (not on or after the presentation day)
  const canManageBooking = useMemo(() => {
    if (!isBooked || isPast || !booking) return false
    const presentationDate = new Date(slot.date)
    presentationDate.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
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

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking) return

    setIsLoading(true)
    setError(null)

    try {
      if (booking.code !== bookingCode) {
        throw new Error('Invalid booking code')
      }
      await cancelBooking(bookingCode)
      setShowManage(false)
      setBookingCode('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid booking code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking) return

    setIsLoading(true)
    setError(null)

    try {
      if (booking.code !== bookingCode) {
        throw new Error('Invalid booking code')
      }
      await updateBooking(bookingCode, { company: companyName })
      setShowManage(false)
      setBookingCode('')
      setCompanyName('')
      setIsEditing(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid booking code')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
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
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-white dark:bg-gray-800 text-sm p-2 rounded-md shadow-lg"
              sideOffset={5}
            >
              <p>{formatSlotDisplay(slot)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Duration: 20 minutes</p>
              {booking && (
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <p>Booked by: {booking.name}</p>
                  <p>Company: {booking.company || 'No company'}</p>
                </div>
              )}
              <Tooltip.Arrow className="fill-white dark:fill-gray-800" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

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
                <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Enter your booking code to manage your presentation slot.
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Note: You can only cancel bookings up until the day before your presentation.
              </p>

              <form onSubmit={isEditing ? handleUpdate : handleCancel} className="space-y-4">
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
                      Company Name
                    </label>
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
                      type="submit"
                      className={cn(
                        'px-4 py-2 rounded-md text-sm font-medium',
                        'text-white',
                        isEditing 
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-red-600 hover:bg-red-700',
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
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

interface TimeSlotGridProps {
  currentStep: string
  onNext: () => void
  onBack: () => void
}

// Main TimeSlotGrid component
export function TimeSlotGrid({ currentStep, onNext, onBack }: TimeSlotGridProps) {
  const bookings = useBookings()
  const { setSelectedSlot } = useBookingStore()
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  
  // Filter slots for the selected day
  const filteredSlots = useMemo(() => {
    if (!selectedDay) return []
    
    const slots = generateTimeSlots()
    return slots.filter(slot => slot.date === selectedDay)
  }, [selectedDay])

  // Group slots into morning and afternoon sessions
  const groupedSlots = useMemo(() => {
    return {
      morningSlots: filteredSlots.filter(slot => {
        const hour = parseInt(slot.startTime.split(':')[0])
        return hour < 13
      }),
      afternoonSlots: filteredSlots.filter(slot => {
        const hour = parseInt(slot.startTime.split(':')[0])
        return hour >= 14
      })
    }
  }, [filteredSlots])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Select a Time Slot
        </h2>
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Day Selection
        </Button>
      </div>

      <div className="space-y-8">
        {/* Morning Session */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Morning Session (10:10 AM - 1:00 PM)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {groupedSlots.morningSlots.map((slot) => {
              const isPast = isSlotInPast(slot)
              const isBooked = !isSlotAvailable(slot, bookings)
              
              return (
                <TimeSlotButton
                  key={`${slot.date}-${slot.startTime}`}
                  slot={slot}
                  isBooked={isBooked}
                  isPast={isPast}
                  onClick={() => {
                    setSelectedSlot(slot)
                    onNext()
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Afternoon Session */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Afternoon Session (2:10 PM - 5:00 PM)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {groupedSlots.afternoonSlots.map((slot) => {
              const isPast = isSlotInPast(slot)
              const isBooked = !isSlotAvailable(slot, bookings)
              
              return (
                <TimeSlotButton
                  key={`${slot.date}-${slot.startTime}`}
                  slot={slot}
                  isBooked={isBooked}
                  isPast={isPast}
                  onClick={() => {
                    setSelectedSlot(slot)
                    onNext()
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 