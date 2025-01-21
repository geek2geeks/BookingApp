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

  const buttonState = useMemo((): ButtonState => {
    if (isPast) return { state: 'past', label: 'Past' }
    if (isBooked) return { state: 'booked', label: 'Booked' }
    return { state: 'available', label: 'Available' }
  }, [isPast, isBooked])

  // Tailwind classes for different button states
  const buttonStyles = {
    past: 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700',
    booked: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    available: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800'
  }

  const handleManage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowManage(true)
  }

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await cancelBooking(bookingCode)
      setShowManage(false)
      setBookingCode('')
    } catch {
      setError('Invalid booking code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await updateBooking(bookingCode, { company: companyName })
      setShowManage(false)
      setBookingCode('')
      setCompanyName('')
      setIsEditing(false)
    } catch {
      setError('Invalid booking code')
    } finally {
      setIsLoading(false)
    }
  }

  const isPresentationDay = new Date(slot.date).getTime() === new Date().getTime()
  const canCancel = isBooked && !isPast && !isPresentationDay

  return (
    <>
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <div className="relative">
              <button
                className={cn(
                  'w-full p-2 text-sm rounded-md transition-colors',
                  buttonStyles[buttonState.state]
                )}
                onClick={onClick}
                disabled={isBooked || isPast}
              >
                <div className="flex flex-col items-center justify-center space-y-1">
                  <span>{formatTimeRange(slot.startTime, slot.endTime)}</span>
                  <span className="text-xs">{buttonState.label}</span>
                </div>
              </button>
              {canCancel && (
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
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  
  // Group dates by week
  const weeks = useMemo(() => {
    const slots = generateTimeSlots()
    const weekGroups: { weekStart: string; slots: TimeSlot[] }[] = []
    
    // Group slots by week pairs (Saturday and Sunday)
    for (let i = 0; i < PRESENTATION_DATES.length; i += 2) {
      const weekSlots = slots.filter(slot => 
        slot.date === PRESENTATION_DATES[i] || slot.date === PRESENTATION_DATES[i + 1]
      )
      
      if (weekSlots.length > 0) {
        weekGroups.push({
          weekStart: PRESENTATION_DATES[i],
          slots: weekSlots
        })
      }
    }
    
    return weekGroups
  }, [])

  // Filter slots based on selected week and day
  const filteredSlots = useMemo(() => {
    if (!selectedWeek) return []
    if (currentStep === 'week') return []
    
    const weekSlots = weeks[selectedWeek].slots
    let filtered = weekSlots

    if (currentStep === 'slot' && selectedDay) {
      filtered = filtered.filter(slot => slot.date === selectedDay)
    }
    
    return filtered
  }, [currentStep, selectedWeek, selectedDay, weeks])

  // Get unique dates for the selected week
  const datesForSelectedWeek = useMemo(() => {
    if (selectedWeek === null) return []
    const weekSlots = weeks[selectedWeek].slots
    return [...new Set(weekSlots.map(slot => slot.date))]
  }, [selectedWeek, weeks])

  // Split slots into morning and afternoon sessions
  const { morningSlots, afternoonSlots } = useMemo(() => {
    return {
      morningSlots: filteredSlots.filter(slot => {
        const hour = parseInt(slot.startTime.split(':')[0])
        return hour < 12 || (hour === 12 && parseInt(slot.startTime.split(':')[1]) === 0)
      }),
      afternoonSlots: filteredSlots.filter(slot => {
        const hour = parseInt(slot.startTime.split(':')[0])
        return hour >= 14
      })
    }
  }, [filteredSlots])

  // Handler for slot selection
  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    onNext()
  }

  // Render week selection
  if (currentStep === 'week') {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {weeks.map((week, index) => {
            const firstSlot = week.slots[0]
            const lastSlot = week.slots[week.slots.length - 1]
            return (
              <button
                key={week.weekStart}
                onClick={() => {
                  setSelectedWeek(index)
                  onNext()
                }}
                className={cn(
                  'p-4 rounded-lg text-left transition-colors',
                  'bg-white dark:bg-gray-800',
                  'hover:bg-gray-50 dark:hover:bg-gray-700',
                  'border border-gray-200 dark:border-gray-700'
                )}
              >
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Week {index + 1}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(firstSlot.date)} - {formatDate(lastSlot.date)}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Render day selection
  if (currentStep === 'day' && selectedWeek !== null) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Week Selection
        </button>

        <div className="grid gap-4 sm:grid-cols-2">
          {datesForSelectedWeek.map((date) => (
            <button
              key={date}
              onClick={() => {
                setSelectedDay(date)
                onNext()
              }}
              className={cn(
                'p-4 rounded-lg text-left transition-colors',
                'bg-white dark:bg-gray-800',
                'hover:bg-gray-50 dark:hover:bg-gray-700',
                'border border-gray-200 dark:border-gray-700'
              )}
            >
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formatDate(date)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getSessionType(date)}
              </p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Render slot selection
  if (currentStep === 'slot' && selectedDay) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Select a Time Slot
          </h2>
          <button
            onClick={onBack}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ChevronLeft className="w-4 h-4 inline mr-1" />
            Back to Day Selection
          </button>
        </div>

        <div className="space-y-6">
          {/* Morning Session */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              Morning Session (10:10 AM - 1:00 PM)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {morningSlots.map((slot, index) => {
                const isPast = isSlotInPast(slot)
                const isBooked = !isSlotAvailable(slot, bookings)
                
                return (
                  <TimeSlotButton
                    key={`${slot.date}-${slot.startTime}-${index}`}
                    slot={slot}
                    isBooked={isBooked}
                    isPast={isPast}
                    onClick={() => handleSlotClick(slot)}
                  />
                )
              })}
            </div>
          </div>

          {/* Afternoon Session */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              Afternoon Session (2:10 PM - 5:00 PM)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {afternoonSlots.map((slot, index) => {
                const isPast = isSlotInPast(slot)
                const isBooked = !isSlotAvailable(slot, bookings)
                
                return (
                  <TimeSlotButton
                    key={`${slot.date}-${slot.startTime}-${index}`}
                    slot={slot}
                    isBooked={isBooked}
                    isPast={isPast}
                    onClick={() => handleSlotClick(slot)}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm border-t pt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900 rounded" />
            <span className="text-gray-600 dark:text-gray-300">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 rounded" />
            <span className="text-gray-600 dark:text-gray-300">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="text-gray-600 dark:text-gray-300">Past</span>
          </div>
        </div>
      </div>
    )
  }

  return null
} 