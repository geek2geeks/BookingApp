import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isBetween from 'dayjs/plugin/isBetween'
import { TimeSlot, Booking } from '@/app/types'

dayjs.extend(customParseFormat)
dayjs.extend(isBetween)

// Constants for time slots
export const PRESENTATION_DATES = [
  '2025-01-25', '2025-01-26',  // First weekend
  '2025-02-01', '2025-02-02',  // Second weekend
  '2025-02-08', '2025-02-09'   // Third weekend
]

const MORNING_START = '10:00'
const MORNING_FIRST_SLOT = '10:10'
const MORNING_END = '13:00'
const AFTERNOON_START = '14:00'
const AFTERNOON_FIRST_SLOT = '14:10'
const AFTERNOON_END = '17:00'

const SLOT_DURATION = 20  // minutes
const BREAK_DURATION = 5  // minutes
const TOTAL_SLOT_DURATION = SLOT_DURATION + BREAK_DURATION

// Helper function to generate slots for a specific time range
function generateSlotsForTimeRange(
  date: string,
  startTime: string,
  endTime: string,
  firstSlotTime: string
): TimeSlot[] {
  const slots: TimeSlot[] = []
  const start = dayjs(`${date} ${firstSlotTime}`, 'YYYY-MM-DD HH:mm')
  const end = dayjs(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm')

  let currentSlotStart = start
  
  while (currentSlotStart.isBefore(end)) {
    const slotEnd = currentSlotStart.add(SLOT_DURATION, 'minute')
    
    // Only add slot if it ends before or at the session end time
    if (slotEnd.isSameOrBefore(end)) {
      slots.push({
        date: date,
        startTime: currentSlotStart.format('HH:mm'),
        endTime: slotEnd.format('HH:mm'),
        isAvailable: true
      })
    }
    
    // Move to next slot start time (including break)
    currentSlotStart = currentSlotStart.add(TOTAL_SLOT_DURATION, 'minute')
  }

  return slots
}

export function generateTimeSlots(): TimeSlot[] {
  const allSlots: TimeSlot[] = []

  PRESENTATION_DATES.forEach(date => {
    // Generate morning slots (10:10 AM to 1:00 PM)
    const morningSlots = generateSlotsForTimeRange(
      date,
      MORNING_START,
      MORNING_END,
      MORNING_FIRST_SLOT
    )
    
    // Generate afternoon slots (2:10 PM to 5:00 PM)
    const afternoonSlots = generateSlotsForTimeRange(
      date,
      AFTERNOON_START,
      AFTERNOON_END,
      AFTERNOON_FIRST_SLOT
    )

    allSlots.push(...morningSlots, ...afternoonSlots)
  })

  return allSlots
}

// Utility functions for slot validation and formatting
export function isSlotAvailable(slot: TimeSlot, bookings: Booking[]): boolean {
  // Check if slot is in the past
  const slotStart = dayjs(`${slot.date} ${slot.startTime}`, 'YYYY-MM-DD HH:mm')
  if (slotStart.isBefore(dayjs())) {
    return false
  }

  // Check if slot is already booked
  return !bookings.some(booking => {
    const [bookingDate, bookingTime] = booking.slot.split(' - ')
    return booking.slot === `${slot.date} - ${slot.startTime}`
  })
}

export function formatSlotDisplay(slot: TimeSlot): string {
  const date = dayjs(slot.date).format('dddd, MMMM D, YYYY')
  return `${date} - ${slot.startTime}`
}

export function validateSlotTiming(slot: TimeSlot): boolean {
  const startTime = dayjs(`${slot.date} ${slot.startTime}`, 'YYYY-MM-DD HH:mm')
  const endTime = dayjs(`${slot.date} ${slot.endTime}`, 'YYYY-MM-DD HH:mm')

  // Validate date is in allowed dates
  if (!PRESENTATION_DATES.includes(slot.date)) {
    return false
  }

  // Validate slot duration
  const durationMinutes = endTime.diff(startTime, 'minute')
  if (durationMinutes !== SLOT_DURATION) {
    return false
  }

  // Validate slot starts at valid time
  const morningValid = startTime.format('HH:mm') >= MORNING_FIRST_SLOT && 
                      endTime.format('HH:mm') <= MORNING_END
  const afternoonValid = startTime.format('HH:mm') >= AFTERNOON_FIRST_SLOT && 
                        endTime.format('HH:mm') <= AFTERNOON_END

  return morningValid || afternoonValid
}

// Helper function to get the next available slot
export function getNextAvailableSlot(slots: TimeSlot[]): TimeSlot | null {
  const now = dayjs()
  return slots.find(slot => {
    const slotStart = dayjs(`${slot.date} ${slot.startTime}`, 'YYYY-MM-DD HH:mm')
    return slotStart.isAfter(now) && slot.isAvailable
  }) || null
}

// Format time range for display
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`
}

// Check if a date is a presentation date
export function isPresentationDate(date: string): boolean {
  return PRESENTATION_DATES.includes(date)
}

// Get session type (morning or afternoon)
export function getSessionType(time: string): 'morning' | 'afternoon' | null {
  if (time >= MORNING_FIRST_SLOT && time <= MORNING_END) {
    return 'morning'
  }
  if (time >= AFTERNOON_FIRST_SLOT && time <= AFTERNOON_END) {
    return 'afternoon'
  }
  return null
}

// Calculate available slots count
export function getAvailableSlotsCount(slots: TimeSlot[]): number {
  return slots.filter(slot => slot.isAvailable && !isSlotInPast(slot)).length
}

// Check if slot is in the past
export function isSlotInPast(slot: TimeSlot): boolean {
  const slotStart = dayjs(`${slot.date} ${slot.startTime}`, 'YYYY-MM-DD HH:mm')
  return slotStart.isBefore(dayjs())
}

// Group slots by date
export function groupSlotsByDate(slots: TimeSlot[]): Record<string, TimeSlot[]> {
  return slots.reduce((groups, slot) => {
    const date = slot.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(slot)
    return groups
  }, {} as Record<string, TimeSlot[]>)
} 