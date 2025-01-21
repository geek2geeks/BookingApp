'use client'

import { useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useBookingStore } from '../lib/store/booking-store'
import { generateTimeSlots, isSlotAvailable, PRESENTATION_DATES, getSessionType } from '../lib/utils/date-utils'
import { cn } from '../lib/utils'
import { Button } from '@/app/components/ui/button'

export function DaySelection() {
  const { 
    selectedWeek,
    selectDay,
    goToNextStep,
    goToPreviousStep,
    bookings
  } = useBookingStore()

  const selectedDate = useMemo(() => {
    if (selectedWeek === null) return null
    return PRESENTATION_DATES[selectedWeek]
  }, [selectedWeek])

  const dayData = useMemo(() => {
    if (!selectedDate) return null

    const slots = generateTimeSlots()
    const daySlots = slots.filter(slot => slot.date === selectedDate)
    const availableSlots = daySlots.filter(slot => isSlotAvailable(slot, bookings))
    
    return {
      date: selectedDate,
      availableSlots: availableSlots.length,
      totalSlots: daySlots.length,
      isFull: availableSlots.length === 0,
      isPast: new Date(selectedDate) < new Date()
    }
  }, [selectedDate, bookings])

  const handleDaySelect = (date: string) => {
    selectDay(date)
    goToNextStep()
  }

  if (!dayData) {
    return null
  }

  const formattedDate = new Date(dayData.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Confirm Day Selection
        </h2>
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Day Selection
        </Button>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => !dayData.isPast && !dayData.isFull && handleDaySelect(dayData.date)}
          disabled={dayData.isPast || dayData.isFull}
          className={cn(
            'p-4 rounded-lg text-left transition-colors',
            'bg-white dark:bg-gray-800',
            !dayData.isPast && !dayData.isFull && 'hover:bg-gray-50 dark:hover:bg-gray-700',
            'border border-gray-200 dark:border-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            (dayData.isPast || dayData.isFull) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {formattedDate}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {getSessionType(dayData.date)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {dayData.isPast ? (
              <span className="text-red-500">Past date</span>
            ) : dayData.isFull ? (
              <span className="text-yellow-500">Fully booked</span>
            ) : (
              `${dayData.availableSlots} of ${dayData.totalSlots} slots available`
            )}
          </p>
        </button>
      </div>
    </div>
  )
}