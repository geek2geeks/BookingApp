'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { useBookingStore } from '../lib/store/booking-store'
import { formatSlotDisplay } from '../lib/utils/date-utils'
import { Button } from '@/app/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/components/ui/form'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from '@/app/components/ui/alert-dialog'

const bookingSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  studentNumber: z.string().min(1, 'Student number is required'),
  company: z.string().optional(),
  notes: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

interface BookingFormProps {
  onCancel: () => void
}

export function BookingForm({ onCancel }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [bookingCode, setBookingCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { 
    selectedTimeSlot,
    createBooking,
    resetFlow
  } = useBookingStore()

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: '',
      studentNumber: '',
      company: '',
      notes: '',
    },
  })

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedTimeSlot) {
      setError('No time slot selected')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createBooking({
        ...data,
        slot: `${selectedTimeSlot.date} - ${selectedTimeSlot.startTime}`
      })
      
      if (result.success && result.code) {
        setBookingCode(result.code)
        setShowConfirmation(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmationClose = () => {
    setShowConfirmation(false)
    setBookingCode(null)
    resetFlow()
  }

  if (!selectedTimeSlot) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Enter Details
        </h2>
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Time Slot Selection
        </Button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Selected Time Slot
        </h3>
        <p className="mt-1 text-gray-800 dark:text-gray-200">
          {formatSlotDisplay(selectedTimeSlot)}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-900 dark:text-gray-100">Full Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="John Doe" 
                    className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="studentNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-900 dark:text-gray-100">Student Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="he12345" 
                    className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-900 dark:text-gray-100">Company Name (Optional)</FormLabel>
                <p className="mt-1 mb-2 text-xs italic text-gray-600 dark:text-gray-400">
                  To prevent multiple students from presenting on the same company
                </p>
                <FormControl>
                  <Input 
                    placeholder="Company Ltd" 
                    className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-900 dark:text-gray-100">Additional Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any special requirements"
                    className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                'Book Slot'
              )}
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">
              Booking Confirmed!
            </AlertDialogTitle>
          </AlertDialogHeader>
          
          <div className="mt-4 space-y-4">
            <AlertDialogDescription>
              Your presentation has been successfully booked.
            </AlertDialogDescription>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Your booking code is:
              </div>
              <div className="text-2xl font-mono font-bold text-gray-900 dark:text-gray-100">
                {bookingCode}
              </div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Please save this code - you'll need it to modify or cancel your booking.
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogAction onClick={handleConfirmationClose}>
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}