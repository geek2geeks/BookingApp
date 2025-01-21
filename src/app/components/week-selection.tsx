'use client'

import { useMemo } from 'react'
import { useBookingStore } from '../lib/store/booking-store'
import { generateTimeSlots, isSlotAvailable, isSlotInPast, PRESENTATION_DATES } from '../lib/utils/date-utils'
import { cn } from '../lib/utils'

export function WeekSelection() {
  const { 
    selectWeek, 
    goToNextStep,
    bookings
  } = useBookingStore()

  const weeks = useMemo(() => {
    const slots = generateTimeSlots()
    const weekGroups = []
    
    // Group slots by week pairs (Saturday and Sunday)
    for (let i = 0; i < PRESENTATION_DATES.length; i += 2) {
      const weekSlots = slots.filter(slot => 
        slot.date === PRESENTATION_DATES[i] || slot.date === PRESENTATION_DATES[i + 1]
      )
      
      if (weekSlots.length > 0) {
        const availableSlots = weekSlots.filter(slot => {
          const isPast = isSlotInPast(slot)
          const isBooked = !isSlotAvailable(slot, bookings)
          return !isPast && !isBooked
        })
        
        weekGroups.push({
          weekNumber: i / 2 + 1,
          startDate: PRESENTATION_DATES[i],
          endDate: PRESENTATION_DATES[i + 1],
          availableSlots: availableSlots.length,
          totalSlots: 28 // 14 slots per day * 2 days
        })
      }
    }
    
    return weekGroups
  }, [bookings])

  const handleWeekSelect = (weekIndex: number) => {
    selectWeek(weekIndex)
    goToNextStep()
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {weeks.map((week) => {
          const startDate = new Date(week.startDate).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })
          const endDate = new Date(week.endDate).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })

          return (
            <button
              key={week.weekNumber}
              onClick={() => handleWeekSelect(week.weekNumber - 1)}
              className={cn(
                'p-4 rounded-lg text-left transition-colors',
                'bg-white dark:bg-gray-800',
                'hover:bg-gray-50 dark:hover:bg-gray-700',
                'border border-gray-200 dark:border-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}
            >
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Week {week.weekNumber}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {startDate} - {endDate}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {week.availableSlots} of {week.totalSlots} slots available
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}