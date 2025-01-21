import { NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { generateBookingCode } from '@/app/lib/utils/booking-utils'
import { BookingData } from '@/app/types'

// Database reset endpoint
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const resetCode = searchParams.get('resetCode')
    const code = searchParams.get('code')

    // Handle database reset
    if (resetCode) {
      if (resetCode !== 'As!101010') {
        return NextResponse.json(
          { error: 'Invalid reset code' },
          { status: 403 }
        )
      }
      await db.resetDatabase()
      return NextResponse.json({ success: true })
    }

    // Handle booking deletion
    if (code) {
      const booking = await db.getBookingByCode(code)
      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }

      await db.deleteBooking(code)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Missing code parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Operation failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Operation failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const bookings = await db.getBookings()
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

    // Let db.addBooking handle slot availability check
    const newBooking = await db.addBooking(booking)
    return NextResponse.json(newBooking)
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
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
    console.log('Updating booking:', { code, updates });

    // First get existing booking
    const existingBooking = await db.getBookingByCode(code);
    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Update with new data while preserving existing fields
    const updatedBooking = await db.updateBooking(code, {
      ...updates,
      updatedAt: new Date().toISOString()
    })
    
    console.log('Updated booking result:', updatedBooking);
    return NextResponse.json({ 
      ...existingBooking,
      ...updatedBooking,
      code  // ensure code is preserved
    })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}