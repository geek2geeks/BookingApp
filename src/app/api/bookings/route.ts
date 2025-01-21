import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/app/lib/db'

const bookingSchema = z.object({
  name: z.string().min(2),
  studentNumber: z.string().min(1),
  company: z.string().optional(),
  notes: z.string().optional(),
  slot: z.string(),
  code: z.string()
})

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const validatedData = bookingSchema.parse(data)
    
    const booking = db.addBooking(validatedData)
    return NextResponse.json({ success: true, code: booking.code })
  } catch (error) {
    console.error('Failed to create booking:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const bookings = db.getBookings()
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}