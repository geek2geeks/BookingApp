import { BookingData } from '../types'
import { supabase } from './supabase'

// Helper function to convert snake_case to camelCase
function snakeToCamel(data: any): any {
  if (Array.isArray(data)) {
    return data.map(snakeToCamel)
  }
  if (data !== null && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
        value
      ])
    )
  }
  return data
}

export const db = {
  getBookings: async (): Promise<BookingData[]> => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookings:', error)
      return []
    }

    return snakeToCamel(data) || []
  },

  addBooking: async (booking: BookingData): Promise<BookingData> => {
    // Convert camelCase to snake_case for database
    const dbBooking = {
      code: booking.code,
      name: booking.name,
      student_number: booking.studentNumber,
      company: booking.company,
      notes: booking.notes,
      slot: booking.slot,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

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
      .insert(dbBooking)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return snakeToCamel(data)
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

    return snakeToCamel(data)
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

    // Convert camelCase to snake_case for database
    const dbUpdates = {
      company: updates.company,
      notes: updates.notes,
      updated_at: new Date().toISOString()
    }

    // Update the booking
    const { data, error } = await supabase
      .from('bookings')
      .update(dbUpdates)
      .eq('code', code)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return snakeToCamel(data)
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