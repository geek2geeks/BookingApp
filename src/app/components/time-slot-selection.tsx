'use client'

import { useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useBookingStore } from '../lib/store/booking-store'
import { generateTimeSlots, isSlotAvailable, isSlotInPast } from '../lib/utils/date-utils'
import { cn } from '../lib/utils'
import { Button } from '@/app/components/ui/button'
import { TimeSlot } from '../types'

function TimeSlotButton({ slot, isBooked, isPast, onClick }: {
  slot: TimeSlot
  isBooked: boolean
  isPast: boolean
  onClick: () => void
}) {
  const buttonState = useMemo(() => {
    if (isPast) return { state: 'past', label: 'Past' }
    if (isBooked) return { state: 'booked', label: 'Booked' }
    return { state: 'available', label: 'Available' }
  }, [isPast, isBooked])

  const buttonStyles = {
    past: 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700',
    booked: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    available: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800'
  }

  return (
    <button
      className={cn(
        'w-full p-2 text-sm rounded-md transition-colors',
        buttonStyles[buttonState.state]
      )}
      onClick={onClick}
      disabled={isBooked || isPast}
    >
      <div className="flex flex-col items-center justify-center space-y-1">
        <span>{`${slot.startTime} - ${slot.endTime}`}</span>
        <span className="text-xs">{buttonState.label}</span>
      </div>
    </button>
  )
}

export function TimeSlotSelection() {
  const { 
    selectedDay,
    bookings,
    selectTimeSlot,
    goToNextStep,
    goToPreviousStep
  } = useBookingStore()

  const slots = useMemo(() => {
    if (!selectedDay) return { morningSlots: [], afternoonSlots: [] }

    const daySlots = generateTimeSlots().filter(slot => slot.date === selectedDay)
    
    return {
      morningSlots: daySlots.filter(slot => {
        const [hours, minutes] = slot.startTime.split(':').map(Number)
        const timeInMinutes = hours * 60 + minutes
        return timeInMinutes >= 10 * 60 + 10 && timeInMinutes <= 13 * 60  // 10:10 to 13:00
      }),
      afternoonSlots: daySlots.filter(slot => {
        const [hours, minutes] = slot.startTime.split(':').map(Number)
        const timeInMinutes = hours * 60 + minutes
        return timeInMinutes >= 14 * 60 + 10 && timeInMinutes <= 17 * 60  // 14:10 to 17:00
      })
    }
  }, [selectedDay])

  const handleSlotSelect = (slot: TimeSlot) => {
    selectTimeSlot(slot)
    goToNextStep()
  }

  if (!selectedDay) {
    return null
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={goToPreviousStep}
        className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Day Selection
      </Button>

      <div className="space-y-6">
        {/* Morning Session */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Morning Session (10:10 AM - 1:00 PM)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {slots.morningSlots.map((slot) => {
              const isPast = isSlotInPast(slot)
              const isBooked = !isSlotAvailable(slot, bookings)
              
              return (
                <TimeSlotButton
                  key={`${slot.date}-${slot.startTime}`}
                  slot={slot}
                  isBooked={isBooked}
                  isPast={isPast}
                  onClick={() => handleSlotSelect(slot)}
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
            {slots.afternoonSlots.map((slot) => {
              const isPast = isSlotInPast(slot)
              const isBooked = !isSlotAvailable(slot, bookings)
              
              return (
                <TimeSlotButton
                  key={`${slot.date}-${slot.startTime}`}
                  slot={slot}
                  isBooked={isBooked}
                  isPast={isPast}
                  onClick={() => handleSlotSelect(slot)}
                />
              )
            })}
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
    </div>
  )
}