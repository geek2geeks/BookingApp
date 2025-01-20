import { type Booking } from '../lib/utils/booking-utils'

// Common API response type
export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}

// Booking endpoints
export interface CreateBookingRequest {
  name: string
  studentNumber: string
  company?: string
  notes?: string
  slot: string
}

export interface CreateBookingResponse {
  booking: Booking
  code: string
}

export interface GetBookingRequest {
  code: string
}

export interface ModifyBookingRequest {
  code: string
  name?: string
  studentNumber?: string
  company?: string
  notes?: string
  slot?: string
}

export interface CancelBookingRequest {
  code: string
}

// Slot endpoints
export interface GetSlotsResponse {
  slots: string[]
  bookedSlots: string[]
} 