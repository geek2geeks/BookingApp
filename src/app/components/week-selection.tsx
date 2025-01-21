'use client'

import { useMemo } from 'react'
import { useBookingStore } from '../lib/store/booking-store'
import { generateTimeSlots, isSlotAvailable, isSlotInPast, PRESENTATION_DATES } from '../lib/utils/date-utils'
import { cn } from '../lib/utils'
import { Button } from '@/app/components/ui/button'

export function WeekSelection() {
  const { 
    selectWeek, 
    goToNextStep,
    bookings
  } = useBookingStore()

  const presentationDays = useMemo(() => {
    const slots = generateTimeSlots()
    const dayGroups = []
    
    // Process each presentation date
    for (let i = 0; i < PRESENTATION_DATES.length; i++) {
      const daySlots = slots.filter(slot => slot.date === PRESENTATION_DATES[i])
      
      if (daySlots.length > 0) {
        const availableSlots = daySlots.filter(slot => {
          const isPast = isSlotInPast(slot)
          const isBooked = !isSlotAvailable(slot, bookings)
          return !isPast && !isBooked
        })
        
        dayGroups.push({
          dayIndex: i,
          date: PRESENTATION_DATES[i],
          availableSlots: availableSlots.length,
          totalSlots: 14 // 14 slots per day
        })
      }
    }
    
    return dayGroups
  }, [bookings])

  const handleDaySelect = (dayIndex: number) => {
    selectWeek(dayIndex)
    goToNextStep()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Select a Presentation Day
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {presentationDays.map((day) => {
          const date = new Date(day.date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })

          return (
            <button
              key={day.dayIndex}
              onClick={() => handleDaySelect(day.dayIndex)}
              className={cn(
                'p-4 rounded-lg text-left transition-colors',
                'bg-white dark:bg-gray-800',
                'hover:bg-gray-50 dark:hover:bg-gray-700',
                'border border-gray-200 dark:border-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}
            >
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {date}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {day.availableSlots} of {day.totalSlots} slots available
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}