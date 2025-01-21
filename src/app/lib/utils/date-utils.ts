import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Europe/London')
import { TimeSlot, BookingData } from '@/app/types'

dayjs.extend(customParseFormat)
dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)

// Constants for time slots
export const PRESENTATION_DATES = [
  '2025-02-02',  // First day
  '2025-02-08',  // Second day
  '2025-02-09'   // Third day
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

export function isSlotAvailable(slot: TimeSlot, bookings: BookingData[]): boolean {
  // Check if slot is in the past
  const slotStart = dayjs(`${slot.date} ${slot.startTime}`, 'YYYY-MM-DD HH:mm')
  if (slotStart.isBefore(dayjs())) {
    return false
  }

  // Check if slot is already booked
  return !(Array.isArray(bookings) ? bookings : []).some(booking => {
    if (!booking?.slot) return false
    return booking.slot === `${slot.date} - ${slot.startTime}`
  })
}

export function formatSlotDisplay(slot: TimeSlot): string {
  const date = dayjs(slot.date).format('dddd, MMMM D, YYYY')
  return `${date} - ${slot.startTime}`
}

export function validateSlotTiming(slot: TimeSlot): boolean {
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

export function isPresentationDate(): boolean {
  return PRESENTATION_DATES.includes(dayjs().tz('Europe/London').format('YYYY-MM-DD'))
}

export function getSessionType(date: string): string {
  const dayOfWeek = new Date(date).getDay()
  return dayOfWeek === 6 ? 'Saturday Session' : 'Sunday Session'
}

export function isSlotInPast(slot: TimeSlot): boolean {
  const slotStart = dayjs(`${slot.date} ${slot.startTime}`, 'YYYY-MM-DD HH:mm')
  return slotStart.isBefore(dayjs())
}

export function formatDate(date: string) {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}