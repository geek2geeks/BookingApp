import { NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { generateBookingCode } from '@/app/lib/utils/booking-utils'
import { BookingData } from '@/app/types'
import dayjs from 'dayjs'

export async function GET() {
  try {
    const bookings = db.getBookings()
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const code = generateBookingCode()
    
    const booking: BookingData = {
      ...data,
      code,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Check if slot is already booked
    const existingBookings = db.getBookings()
    if (existingBookings.some(b => b.slot === booking.slot)) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 400 }
      )
    }

    const newBooking = db.addBooking(booking)
    return NextResponse.json(newBooking)
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Booking code is required' },
        { status: 400 }
      )
    }

    const booking = db.getBookingByCode(code)
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if the presentation is today or in the past
    const [bookingDate] = booking.slot.split(' - ')
    const presentationDate = new Date(bookingDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (presentationDate <= today) {
      return NextResponse.json(
        { error: 'Cannot cancel bookings on or after the presentation date' },
        { status: 400 }
      )
    }

    db.deleteBooking(code)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete booking:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (!code) {
      return NextResponse.json(
        { error: 'Booking code is required' },
        { status: 400 }
      )
    }

    const updates = await request.json()
    const updatedBooking = db.updateBooking(code, {
      ...updates,
      updatedAt: new Date().toISOString()
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}