import { BookingData } from "../types"

// In-memory storage
let bookings: BookingData[] = []

export const db = {
  getBookings: () => {
    return bookings
  },

  addBooking: (booking: BookingData) => {
    // Check if slot is already booked
    const existingBooking = bookings.find(b => b.slot === booking.slot)
    if (existingBooking) {
      throw new Error('This time slot is already booked')
    }

    // Check if code is already used
    const existingCode = bookings.find(b => b.code === booking.code)
    if (existingCode) {
      throw new Error('Booking code already exists')
    }

    const newBooking = {
      ...booking,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    bookings.push(newBooking)
    return newBooking
  },

  getBookingByCode: (code: string) => {
    return bookings.find(b => b.code === code)
  },

  updateBooking: (code: string, data: Partial<BookingData>) => {
    const index = bookings.findIndex(b => b.code === code)
    if (index === -1) throw new Error('Booking not found')

    bookings[index] = {
      ...bookings[index],
      ...data,
      updatedAt: new Date()
    }

    return bookings[index]
  },

  deleteBooking: (code: string) => {
    const index = bookings.findIndex(b => b.code === code)
    if (index === -1) throw new Error('Booking not found')

    bookings.splice(index, 1)
  }
}