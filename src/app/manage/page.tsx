'use client'

import { BookingManagement } from '../components/booking-management'

export default function ManagePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Manage Your Booking
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Enter your booking code to view, modify, or cancel your presentation booking.
        </p>
      </div>

      <BookingManagement />
    </div>
  )
} 