import { Booking } from '@/app/types'
import { db } from '../db'

export function generateBookingCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export function isValidBookingCode(code: string): boolean {
  return /^\d{4}$/.test(code)
}

export async function createBooking(data: Omit<Booking, 'code' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; code?: string; message?: string }> {
  try {
    const code = generateBookingCode()
    const booking = await db.addBooking({
      ...data,
      code,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    return { success: true, code: booking.code }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Failed to create booking' }
  }
}

export async function cancelBooking(code: string): Promise<{ success: boolean; message?: string }> {
  try {
    await db.deleteBooking(code)
    return { success: true }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Failed to cancel booking' }
  }
}

export async function modifyBooking(code: string, data: Partial<Booking>): Promise<{ success: boolean; message?: string }> {
  try {
    await db.updateBooking(code, {
      ...data,
      updatedAt: new Date().toISOString()
    })
    return { success: true }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Failed to modify booking' }
  }
}

export async function getBooking(code: string): Promise<{ success: boolean; booking?: Booking; message?: string }> {
  try {
    const booking = await db.getBookingByCode(code)
    return { success: true, booking }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Failed to get booking' }
  }
} 