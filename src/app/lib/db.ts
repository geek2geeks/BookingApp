import fs from 'fs'
import path from 'path'
import { BookingData } from '../types'

const DB_PATH = path.join(process.cwd(), 'data', 'bookings.json')

// Ensure the data directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
}

// Initialize empty database if it doesn't exist
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ bookings: [] }))
}

// Read the database
function readDB(): { bookings: BookingData[] } {
  const data = fs.readFileSync(DB_PATH, 'utf-8')
  return JSON.parse(data)
}

// Write to the database
function writeDB(data: { bookings: BookingData[] }) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

export const db = {
  getBookings: (): BookingData[] => {
    return readDB().bookings
  },

  addBooking: (booking: BookingData): BookingData => {
    const data = readDB()
    data.bookings.push(booking)
    writeDB(data)
    return booking
  },

  updateBooking: (code: string, updates: Partial<BookingData>): BookingData => {
    const data = readDB()
    const index = data.bookings.findIndex(b => b.code === code)
    
    if (index === -1) {
      throw new Error('Booking not found')
    }

    data.bookings[index] = { ...data.bookings[index], ...updates }
    writeDB(data)
    return data.bookings[index]
  },

  deleteBooking: (code: string): void => {
    const data = readDB()
    const index = data.bookings.findIndex(b => b.code === code)
    
    if (index === -1) {
      throw new Error('Booking not found')
    }

    data.bookings.splice(index, 1)
    writeDB(data)
  },

  getBookingByCode: (code: string): BookingData | null => {
    const data = readDB()
    return data.bookings.find(b => b.code === code) || null
  }
}