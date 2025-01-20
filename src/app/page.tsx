'use client'

import { TimeSlotGrid } from './components/time-slot-grid'
import { BookingForm } from './components/booking-form'
import { useSelectedSlot } from './lib/store/booking-store'

export default function HomePage() {
  const selectedSlot = useSelectedSlot()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Book Your Presentation
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Select a time slot and fill in your details to book your MBA7060 presentation.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="lg:order-2">
          <BookingForm />
        </div>
        
        <div className="lg:order-1">
          <TimeSlotGrid />
        </div>
      </div>
    </div>
  )
}
