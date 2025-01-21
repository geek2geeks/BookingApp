'use client'

import { useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useBookingStore } from '../lib/store/booking-store'
import { generateTimeSlots, isSlotAvailable, isSlotInPast, formatTimeRange } from '../lib/utils/date-utils'
import { cn } from '../lib/utils'
import { Button } from '@/app/components/ui/button'
import { TimeSlot } from '../types'
import { TimeSlotButton } from './time-slot-button'

export function TimeSlotSelection() {
  const { 
    selectedDay,
    selectedWeek,
    goToPreviousStep,
    goToNextStep,
    setSelectedSlot,
    bookings
  } = useBookingStore()

  const slots = useMemo(() => {
    if (!selectedDay) return { morningSlots: [], afternoonSlots: [] }

    const allSlots = generateTimeSlots()
    const daySlots = allSlots.filter(slot => slot.date === selectedDay)

    return {
      morningSlots: daySlots.filter(slot => {
        const hour = parseInt(slot.startTime.split(':')[0])
        return hour < 13  // Include all slots before 1:00 PM
      }),
      afternoonSlots: daySlots.filter(slot => {
        const hour = parseInt(slot.startTime.split(':')[0])
        return hour >= 14  // Include all slots from 2:00 PM onwards
      })
    }
  }, [selectedDay])

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    goToNextStep()
  }

  if (!selectedDay) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Select a Time Slot
        </h2>
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          className="flex items-center text-sm bg-gray-800 text-gray-300 hover:text-gray-100 border-gray-700 hover:bg-gray-700"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Day Selection
        </Button>
      </div>

      <div className="space-y-8">
        {/* Morning Session */}
        <div>
          <h3 className="text-lg text-gray-500 dark:text-gray-400 mb-4">
            Morning Session (10.10 am - 1.00 pm)
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
                  onClick={() => handleSlotClick(slot)}
                />
              )
            })}
          </div>
        </div>

        {/* Afternoon Session */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Afternoon Session (2.10 pm - 5.00 pm)
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
                  onClick={() => handleSlotClick(slot)}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}