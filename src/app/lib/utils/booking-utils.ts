import { type BookingFormData } from '../schemas/booking-form-schema'
import { generateTimeSlots, validateSlotTiming } from './date-utils'

export interface Booking extends BookingFormData {
  slot: string
  code: string
  createdAt: string
}

export interface BookingResult {
  success: boolean
  code?: string
  error?: string
}

// Generate a unique booking code
export function generateBookingCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// Validate a booking code format
export function isValidBookingCode(code: string): boolean {
  return /^\d{4}$/.test(code)
}

// Create a new booking
export async function createBooking(
  data: BookingFormData & { slot: string }
): Promise<BookingResult> {
  try {
    // Validate slot timing
    if (!validateSlotTiming(data.slot)) {
      return {
        success: false,
        error: 'Invalid time slot selected',
      }
    }

    const code = generateBookingCode()
    const booking: Booking = {
      ...data,
      code,
      createdAt: new Date().toISOString(),
    }

    return {
      success: true,
      code: booking.code,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to create booking',
    }
  }
}

// Cancel a booking
export async function cancelBooking(code: string): Promise<BookingResult> {
  try {
    if (!isValidBookingCode(code)) {
      return {
        success: false,
        error: 'Invalid booking code',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to cancel booking',
    }
  }
}

// Modify a booking
export async function modifyBooking(
  code: string,
  data: Partial<BookingFormData> & { slot?: string }
): Promise<BookingResult> {
  try {
    if (!isValidBookingCode(code)) {
      return {
        success: false,
        error: 'Invalid booking code',
      }
    }

    if (data.slot && !validateSlotTiming(data.slot)) {
      return {
        success: false,
        error: 'Invalid time slot selected',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to modify booking',
    }
  }
}

// Get booking details by code
export async function getBookingByCode(code: string): Promise<Booking | null> {
  try {
    if (!isValidBookingCode(code)) {
      return null
    }

    // Mock booking data for demonstration
    return {
      name: 'John Doe',
      studentNumber: '20231234',
      company: 'Example Corp',
      notes: 'Sample booking',
      slot: '2024-03-15 09:00-09:30',
      code: code,
      createdAt: new Date().toISOString(),
    }
  } catch (error) {
    return null
  }
} 