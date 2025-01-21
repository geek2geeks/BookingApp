'use client'

import { useEffect } from 'react'
import { useBookingStore } from './lib/store/booking-store'
import { WeekSelection } from './components/week-selection'
import { DaySelection } from './components/day-selection'
import { TimeSlotSelection } from './components/time-slot-selection'
import { BookingForm } from './components/booking-form'
import { StepIndicator } from './components/step-indicator'
import { Alert } from './components/ui/alert'

export default function Home() {
  const { 
    currentStep, 
    error,
    fetchBookings
  } = useBookingStore()

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'week':
        return <WeekSelection />
      case 'day':
        return <DaySelection />
      case 'slot':
        return <TimeSlotSelection />
      case 'details':
        return <BookingForm />
      default:
        return null
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Book Your Presentation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select a time slot for your presentation. Each slot is 20 minutes long.
          </p>
        </div>

        <StepIndicator />

        {error && (
          <Alert variant="destructive" className="mb-6">
            {error}
          </Alert>
        )}

        <div className="mb-8">
          {renderCurrentStep()}
        </div>
      </div>
    </main>
  )
}