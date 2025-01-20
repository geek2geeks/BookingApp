'use client'

import { useEffect, useMemo } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useBookingStore, useBookings } from '@/app/lib/store/booking-store'
import { 
  generateTimeSlots,
  formatSlotDisplay,
  isSlotAvailable,
  groupSlotsByDate,
  getSessionType,
  isSlotInPast,
  formatTimeRange
} from '@/app/lib/utils/date-utils'
import type { TimeSlot } from '@/app/types'
import { cn } from '@/app/lib/utils'

interface TimeSlotButtonProps {
  slot: TimeSlot
  isBooked: boolean
  isPast: boolean
  onClick: () => void
}

// Component for individual time slot button
function TimeSlotButton({ slot, isBooked, isPast, onClick }: TimeSlotButtonProps) {
  const buttonState = useMemo(() => {
    if (isPast) return { state: 'past', label: 'Past' }
    if (isBooked) return { state: 'booked', label: 'Booked' }
    return { state: 'available', label: 'Available' }
  }, [isPast, isBooked])

  // Tailwind classes for different button states
  const buttonStyles = {
    past: 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700',
    booked: 'bg-yellow-100 text-yellow-800 cursor-not-allowed dark:bg-yellow-900 dark:text-yellow-100',
    available: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800'
  }

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
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
  )
}

// Main TimeSlotGrid component
export function TimeSlotGrid() {
  const bookings = useBookings()
  const { setSelectedSlot } = useBookingStore()
  
  // Generate all time slots
  const allSlots = useMemo(() => generateTimeSlots(), [])

  // Group slots by date for tabbed interface
  const slotsByDate = useMemo(() => groupSlotsByDate(allSlots), [allSlots])

  // Format date for tab display
  const formatTabDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  // Handler for slot selection
  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot)
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="p-6">
        <Tabs.Root defaultValue={Object.keys(slotsByDate)[0]} className="w-full">
          <Tabs.List className="flex space-x-2 border-b mb-4">
            {Object.keys(slotsByDate).map(date => (
              <Tabs.Trigger
                key={date}
                value={date}
                className={cn(
                  'px-4 py-2 text-sm font-medium',
                  'text-gray-600 dark:text-gray-300',
                  'border-b-2 border-transparent',
                  'hover:text-gray-900 dark:hover:text-white',
                  'data-[state=active]:border-blue-500',
                  'data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400'
                )}
              >
                {formatTabDate(date)}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {Object.entries(slotsByDate).map(([date, slots]) => (
            <Tabs.Content key={date} value={date} className="outline-none">
              <div className="space-y-6">
                {/* Morning Session */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Morning Session (10:10 AM - 1:00 PM)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {slots
                      .filter(slot => getSessionType(slot.startTime) === 'morning')
                      .map((slot, index) => {
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
                    {slots
                      .filter(slot => getSessionType(slot.startTime) === 'afternoon')
                      .map((slot, index) => {
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
            </Tabs.Content>
          ))}
        </Tabs.Root>

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
    </div>
  )
} 