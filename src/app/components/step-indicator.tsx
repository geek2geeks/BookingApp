'use client'

import { useBookingStore } from '../lib/store/booking-store'
import { cn } from '../lib/utils'

const steps = [
  { id: 'week', title: 'Select Week' },
  { id: 'day', title: 'Select Day' },
  { id: 'slot', title: 'Select Time Slot' },
  { id: 'details', title: 'Enter Details' },
]

export function StepIndicator() {
  const { currentStep } = useBookingStore()

  return (
    <nav className="mb-8">
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isPast = steps.findIndex(s => s.id === currentStep) > index

          return (
            <li 
              key={step.id} 
              className={cn(
                'flex items-center',
                index !== steps.length - 1 ? 'w-full' : 'flex-none'
              )}
            >
              <div className="flex flex-col items-center">
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full',
                  'text-sm font-medium transition-colors',
                  isActive && 'bg-blue-600 text-white',
                  isPast && 'bg-green-600 text-white',
                  !isActive && !isPast && 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                )}>
                  {index + 1}
                </div>
                <span className={cn(
                  'mt-2 text-xs font-medium',
                  isActive && 'text-blue-600 dark:text-blue-400',
                  isPast && 'text-green-600 dark:text-green-400',
                  !isActive && !isPast && 'text-gray-500 dark:text-gray-400'
                )}>
                  {step.title}
                </span>
              </div>
              {index !== steps.length - 1 && (
                <div className={cn(
                  'w-full h-0.5 mx-2',
                  isPast ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                )} />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}