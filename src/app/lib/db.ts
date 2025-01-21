import { promises as fs } from 'fs'
import path from 'path'
import { BookingData } from '../types'

const dbPath = path.join(process.cwd(), 'data', 'bookings.json')

// Helper functions for file operations
async function readDB(): Promise<BookingData[]> {
  try {
    // Ensure data directory exists
    await fs.mkdir(path.dirname(dbPath), { recursive: true })
    
    // Check if file exists
    try {
      await fs.access(dbPath)
    } catch {
      // Initialize empty database if it doesn't exist
      await fs.writeFile(dbPath, JSON.stringify({ bookings: [] }))
      return []
    }

    // Read and parse database
    const data = await fs.readFile(dbPath, 'utf-8')
    return JSON.parse(data).bookings
  } catch (error) {
    console.error('Error reading database:', error)
    return []
  }
}

async function writeDB(bookings: BookingData[]): Promise<void> {
  try {
    await fs.writeFile(dbPath, JSON.stringify({ bookings }, null, 2))
  } catch (error) {
    console.error('Error writing database:', error)
    throw error
  }
}

// Database operations
export const db = {
  getBookings: async (): Promise<BookingData[]> => {
    return await readDB()
  },

  addBooking: async (booking: BookingData): Promise<BookingData> => {
    const bookings = await readDB()
    
    // Validate slot availability
    const isSlotTaken = bookings.some(b => b.slot === booking.slot)
    if (isSlotTaken) {
      throw new Error('This time slot is already booked')
    }

    // Check if code is unique
    const isCodeTaken = bookings.some(b => b.code === booking.code)
    if (isCodeTaken) {
      throw new Error('Booking code already exists')
    }

    // Add the new booking
    const newBookings = [...bookings, booking]
    await writeDB(newBookings)
    return booking
  },

  getBookingByCode: async (code: string): Promise<BookingData | null> => {
    const bookings = await readDB()
    return bookings.find(b => b.code === code) || null
  },

  updateBooking: async (code: string, data: Partial<BookingData>): Promise<BookingData> => {
    const bookings = await readDB()
    const index = bookings.findIndex(b => b.code === code)
    
    if (index === -1) {
      throw new Error('Booking not found')
    }

    const existingBooking = bookings[index];
    console.log('Existing booking:', existingBooking);
    
    // Preserve essential fields and update with new data
    bookings[index] = {
      ...existingBooking,              // preserve all existing fields
      ...data,                         // apply updates
      code: existingBooking.code,      // ensure code is preserved
      slot: existingBooking.slot,      // ensure slot is preserved
      name: existingBooking.name,      // ensure name is preserved
      studentNumber: existingBooking.studentNumber,  // ensure student number is preserved
      updatedAt: new Date().toISOString()
    }
    
    console.log('Updated booking:', bookings[index]);

    await writeDB(bookings)
    return bookings[index]
  },

  deleteBooking: async (code: string): Promise<void> => {
    const bookings = await readDB()
    const booking = bookings.find(b => b.code === code)

    if (!booking) {
      throw new Error('Booking not found')
    }

    // Check if booking can be cancelled (not on or after presentation date)
    const [dateStr] = booking.slot.split(' - ')
    const presentationDate = new Date(dateStr)
    presentationDate.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (presentationDate <= today) {
      throw new Error('Cannot cancel bookings on or after the presentation date')
    }

    // Remove booking
    const newBookings = bookings.filter(b => b.code !== code)
    await writeDB(newBookings)
  },

  resetDatabase: async (): Promise<void> => {
    try {
      await writeDB([])
      console.log('Database reset successfully')
    } catch (error) {
      console.error('Failed to reset database:', error)
      throw error
    }
  }
}