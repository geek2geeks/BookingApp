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

  const days = useMemo(() => {
    if (selectedWeek === null) return []

    const weekStartIndex = selectedWeek * 2
    const weekDates = PRESENTATION_DATES.slice(weekStartIndex, weekStartIndex + 2)
    const slots = generateTimeSlots()

    return weekDates.map(date => {
      const daySlots = slots.filter(slot => slot.date === date)
      const availableSlots = daySlots.filter(slot => isSlotAvailable(slot, bookings))
      
      return {
        date,
        availableSlots: availableSlots.length,
        totalSlots: daySlots.length,
        isFull: availableSlots.length === 0,
        isPast: new Date(date) < new Date()
      }
    })
  }, [selectedWeek, bookings])

  const handleDaySelect = (date: string) => {
    selectDay(date)
    goToNextStep()
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={goToPreviousStep}
        className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Week Selection
      </Button>

      <div className="grid gap-4 sm:grid-cols-2">
        {days.map((day) => {
          const date = new Date(day.date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })

          return (
            <button
              key={day.date}
              onClick={() => !day.isPast && !day.isFull && handleDaySelect(day.date)}
              disabled={day.isPast || day.isFull}
              className={cn(
                'p-4 rounded-lg text-left transition-colors',
                'bg-white dark:bg-gray-800',
                !day.isPast && !day.isFull && 'hover:bg-gray-50 dark:hover:bg-gray-700',
                'border border-gray-200 dark:border-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                (day.isPast || day.isFull) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {date}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {getSessionType(day.date)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {day.isPast ? (
                  <span className="text-red-500">Past date</span>
                ) : day.isFull ? (
                  <span className="text-yellow-500">Fully booked</span>
                ) : (
                  `${day.availableSlots} of ${day.totalSlots} slots available`
                )}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}