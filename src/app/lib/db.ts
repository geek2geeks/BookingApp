import { BookingData } from '../types'
import { supabase } from './supabase'

export const db = {
  getBookings: async (): Promise<BookingData[]> => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching bookings:', error)
      return []
    }

    return data || []
  },

  addBooking: async (booking: BookingData): Promise<BookingData> => {
    // Check if slot is available
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('*')
      .eq('slot', booking.slot)
      .single()

    if (existingBooking) {
      throw new Error('This time slot is already booked')
    }

    // Add new booking
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  getBookingByCode: async (code: string): Promise<BookingData | null> => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('code', code)
      .single()

    if (error) {
      console.error('Error fetching booking:', error)
      return null
    }

    return data
  },

  updateBooking: async (code: string, updates: Partial<BookingData>): Promise<BookingData> => {
    // First get the existing booking
    const { data: existingBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('code', code)
      .single()

    if (fetchError || !existingBooking) {
      throw new Error('Booking not found')
    }

    // Prepare the update data while preserving essential fields
    const updateData = {
      ...updates,
      code: existingBooking.code,      // preserve code
      slot: existingBooking.slot,      // preserve slot
      name: existingBooking.name,      // preserve name
      studentNumber: existingBooking.studentNumber,  // preserve student number
      updatedAt: new Date().toISOString()
    }

    // Update the booking
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('code', code)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  deleteBooking: async (code: string): Promise<void> => {
    // First get the booking to check date
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('code', code)
      .single()

    if (fetchError || !booking) {
      throw new Error('Booking not found')
    }

    // Check if booking can be cancelled
    const [dateStr] = booking.slot.split(' - ')
    const presentationDate = new Date(dateStr)
    presentationDate.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (presentationDate <= today) {
      throw new Error('Cannot cancel bookings on or after the presentation date')
    }

    // Delete the booking
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('code', code)

    if (error) {
      throw new Error(error.message)
    }
  },

  resetDatabase: async (): Promise<void> => {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .neq('code', 'dummy') // This deletes all records

    if (error) {
      throw new Error(error.message)
    }
  }
}