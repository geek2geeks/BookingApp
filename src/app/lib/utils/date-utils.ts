import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { TimeSlot, Booking } from '@/app/types'

dayjs.extend(customParseFormat)
dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)

// Constants for time slots
export const PRESENTATION_DATES = [
  '2025-01-25', '2025-01-26',  // First weekend
  '2025-02-01', '2025-02-02',  // Second weekend
  '2025-02-08', '2025-02-09'   // Third weekend
]

// Morning time slots (7 slots)
const MORNING_SLOTS = [
  { start: '10:10', end: '10:30' },
  { start: '10:35', end: '10:55' },
  { start: '11:00', end: '11:20' },
  { start: '11:25', end: '11:45' },
  { start: '11:50', end: '12:10' },
  { start: '12:15', end: '12:35' },
  { start: '12:40', end: '13:00' }
]

// Afternoon time slots (7 slots)
const AFTERNOON_SLOTS = [
  { start: '14:10', end: '14:30' },
  { start: '14:35', end: '14:55' },
  { start: '15:00', end: '15:20' },
  { start: '15:25', end: '15:45' },
  { start: '15:50', end: '16:10' },
  { start: '16:15', end: '16:35' },
  { start: '16:40', end: '17:00' }
]

function generateSlotsForSession(date: string, sessionSlots: { start: string; end: string }[]): TimeSlot[] {
  return sessionSlots.map(slot => ({
    date,
    startTime: slot.start,
    endTime: slot.end,
    isAvailable: true
  }))
}

export function generateTimeSlots(): TimeSlot[] {
  const allSlots: TimeSlot[] = []

  PRESENTATION_DATES.forEach(date => {
    // Generate morning slots
    const morningSlots = generateSlotsForSession(date, MORNING_SLOTS)
    
    // Generate afternoon slots
    const afternoonSlots = generateSlotsForSession(date, AFTERNOON_SLOTS)

    allSlots.push(...morningSlots, ...afternoonSlots)
  })

  return allSlots
}

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
  
  // Check if this is a valid slot time
  const isValidMorningSlot = MORNING_SLOTS.some(
    morningSlot => morningSlot.start === slot.startTime && morningSlot.end === slot.endTime
  )
  const isValidAfternoonSlot = AFTERNOON_SLOTS.some(
    afternoonSlot => afternoonSlot.start === slot.startTime && afternoonSlot.end === slot.endTime
  )

  return isValidMorningSlot || isValidAfternoonSlot
}

export function getNextAvailableSlot(slots: TimeSlot[]): TimeSlot | null {
  const now = dayjs()
  return slots.find(slot => {
    const slotStart = dayjs(`${slot.date} ${slot.startTime}`, 'YYYY-MM-DD HH:mm')
    return slotStart.isAfter(now) && slot.isAvailable
  }) || null
}

export function formatTimeRange(startTime: string, endTime: string): string {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const period = hour >= 12 ? 'pm' : 'am'
    const displayHour = hour > 12 ? hour - 12 : hour
    return `${displayHour}.${minutes} ${period}`
  }

  return `${formatTime(startTime)} - ${formatTime(endTime)}`
}

export function isPresentationDate(date: string): boolean {
  return PRESENTATION_DATES.includes(date)
}

export function getSessionType(date: string): string {
  return 'Presentation Day'
}

export function getAvailableSlotsCount(slots: TimeSlot[]): number {
  return slots.filter(slot => slot.isAvailable && !isSlotInPast(slot)).length
}

export function isSlotInPast(slot: TimeSlot): boolean {
  const slotStart = dayjs(`${slot.date} ${slot.startTime}`, 'YYYY-MM-DD HH:mm')
  return slotStart.isBefore(dayjs())
}

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

export function formatDate(date: string) {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}