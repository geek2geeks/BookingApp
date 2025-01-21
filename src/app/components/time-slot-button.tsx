'use client'

import { useMemo, useState } from 'react'
import { Settings, X, Loader2 } from 'lucide-react'
import { useBookingStore } from '../lib/store/booking-store'
import { formatTimeRange } from '../lib/utils/date-utils'
import { cn } from '../lib/utils'
import { TimeSlot } from '../types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog"
import { Input } from "@/app/components/ui/input"

interface TimeSlotButtonProps {
  slot: TimeSlot
  isBooked: boolean
  isPast: boolean
  onClick: () => void
}

export function TimeSlotButton({ slot, isBooked, isPast, onClick }: TimeSlotButtonProps) {
  const [showManage, setShowManage] = useState(false)
  const [bookingCode, setBookingCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { bookings, cancelBooking } = useBookingStore()

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

  const booking = useMemo(() => {
    if (!isBooked) return null
    return bookings.find(b => b.slot === `${slot.date} - ${slot.startTime}`)
  }, [bookings, slot, isBooked])

  const canManageBooking = useMemo(() => {
    if (!isBooked || isPast || !booking) return false
    const [dateStr] = booking.slot.split(' - ')
    const presentationDate = new Date(dateStr)
    presentationDate.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return presentationDate > today
  }, [isBooked, isPast, booking])

  const handleManage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowManage(true)
  }

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingCode) return

    setIsLoading(true)
    setError(null)

    try {
      await cancelBooking(bookingCode)
      setShowManage(false)
      setBookingCode('')
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to cancel booking')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="relative">
        <button
          className={cn(
            'w-full p-2 text-sm rounded-md transition-colors min-h-[80px]',
            buttonStyles[buttonState.state]
          )}
          onClick={onClick}
          disabled={isBooked || isPast}
        >
          <div className="flex flex-col items-center justify-center space-y-1">
            <span>{formatTimeRange(slot.startTime, slot.endTime)}</span>
            <span className="text-xs whitespace-pre-line">{buttonState.label}</span>
          </div>
        </button>

        {canManageBooking && (
          <button
            onClick={handleManage}
            className="absolute top-1 right-1 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      <AlertDialog open={showManage} onOpenChange={setShowManage}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Manage Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your booking code to manage this time slot.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Input
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value)}
                placeholder="Enter booking code"
                className="w-full"
              />
              {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel 
                type="button"
                onClick={() => {
                  setShowManage(false)
                  setBookingCode('')
                  setError(null)
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancel}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                disabled={!bookingCode || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  'Cancel Booking'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 