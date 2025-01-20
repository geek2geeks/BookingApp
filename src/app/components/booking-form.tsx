'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as Label from '@radix-ui/react-label'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Loader2 } from 'lucide-react'
import { useBookingStore, useSelectedSlot } from '@/app/lib/store/booking-store'
import { formatSlotDisplay } from '@/app/lib/utils/date-utils'
import { bookingFormSchema, type BookingFormData } from '@/app/lib/schemas/booking-form-schema'
import { cn } from '@/app/lib/utils'

interface FormFieldProps {
  label: string
  name: keyof BookingFormData
  type?: string
  placeholder?: string
  required?: boolean
  description?: string
  error?: string
  className?: string
}

// Form field component
function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  description,
  error,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label.Root
        htmlFor={name}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label.Root>
      
      <input
        type={type}
        id={name}
        placeholder={placeholder}
        className={cn(
          'w-full px-3 py-2 rounded-md border',
          'text-gray-900 dark:text-gray-100',
          'bg-white dark:bg-gray-800',
          'border-gray-300 dark:border-gray-600',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500'
        )}
      />
      
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      
      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}

// Textarea component
function TextArea({
  label,
  name,
  placeholder,
  required,
  description,
  error,
  className,
}: Omit<FormFieldProps, 'type'>) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label.Root
        htmlFor={name}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label.Root>
      
      <textarea
        id={name}
        placeholder={placeholder}
        rows={4}
        className={cn(
          'w-full px-3 py-2 rounded-md border',
          'text-gray-900 dark:text-gray-100',
          'bg-white dark:bg-gray-800',
          'border-gray-300 dark:border-gray-600',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500'
        )}
      />
      
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      
      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}

// Main BookingForm component
export function BookingForm() {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null)
  const selectedSlot = useSelectedSlot()
  const { addBooking } = useBookingStore()

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: '',
      studentNumber: '',
      company: '',
      notes: '',
    },
  })

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = form

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedSlot) return

    try {
      const result = await addBooking({
        ...data,
        slot: formatSlotDisplay(selectedSlot),
        code: Math.floor(1000 + Math.random() * 9000).toString(), // 4-digit code
      })

      if (result.success && result.code) {
        setConfirmationCode(result.code)
        setShowConfirmation(true)
      }
    } catch (error) {
      console.error('Failed to book slot:', error)
    }
  }

  const handleConfirmation = () => {
    setShowConfirmation(false)
    setConfirmationCode(null)
    reset()
  }

  if (!selectedSlot) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Please select a time slot to book your presentation
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
          Book Presentation Slot
        </h2>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className="text-blue-700 dark:text-blue-300">
            Selected Time: {formatSlotDisplay(selectedSlot)}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            label="Full Name"
            name="name"
            placeholder="John Doe"
            required
            error={errors.name?.message}
            {...register('name')}
          />

          <FormField
            label="Student Number"
            name="studentNumber"
            placeholder="20231234"
            required
            description="Your 8-digit student identification number"
            error={errors.studentNumber?.message}
            {...register('studentNumber')}
          />

          <FormField
            label="Company Name"
            name="company"
            placeholder="Company Ltd"
            description="Optional - Enter if you're currently employed"
            error={errors.company?.message}
            {...register('company')}
          />

          <TextArea
            label="Additional Notes"
            name="notes"
            placeholder="Any special requirements or information"
            description="Optional - Maximum 500 characters"
            error={errors.notes?.message}
            {...register('notes')}
          />

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => reset()}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium',
                'text-gray-700 dark:text-gray-200',
                'bg-gray-100 dark:bg-gray-700',
                'hover:bg-gray-200 dark:hover:bg-gray-600',
                'focus:outline-none focus:ring-2 focus:ring-gray-500',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium',
                'text-white',
                'bg-blue-600 dark:bg-blue-500',
                'hover:bg-blue-700 dark:hover:bg-blue-600',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
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
            </button>
          </div>
        </form>
      </div>

      <AlertDialog.Root open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-md p-6 rounded-lg shadow-lg',
            'bg-white dark:bg-gray-800'
          )}>
            <AlertDialog.Title className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Booking Confirmed!
            </AlertDialog.Title>
            <AlertDialog.Description className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Your presentation has been successfully booked.
              </p>
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Your confirmation code is:
                </p>
                <p className="text-2xl font-mono font-bold text-gray-900 dark:text-gray-100">
                  {confirmationCode}
                </p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please save this code - you'll need it to modify or cancel your booking.
              </p>
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end">
              <AlertDialog.Action asChild>
                <button
                  onClick={handleConfirmation}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium',
                    'text-white',
                    'bg-blue-600 dark:bg-blue-500',
                    'hover:bg-blue-700 dark:hover:bg-blue-600',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )}
                >
                  Done
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  )
} 