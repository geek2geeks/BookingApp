import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const bookingSchema = z.object({
  name: z.string().min(2),
  studentNumber: z.string().regex(/^\d{8}$/),
  company: z.string().optional(),
  notes: z.string().max(500).optional(),
  slot: z.string()
})

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const validatedData = bookingSchema.parse(data)
    
    // Generate a unique 4-digit booking code
    let code: string
    let isUnique = false
    
    while (!isUnique) {
      code = Math.floor(1000 + Math.random() * 9000).toString()
      const existing = await prisma.booking.findUnique({
        where: { code }
      })
      if (!existing) {
        isUnique = true
      }
    }

    // Check if slot is already booked
    const existingBooking = await prisma.booking.findFirst({
      where: { slot: validatedData.slot }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 409 }
      )
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        ...validatedData,
        code
      }
    })

    return NextResponse.json({ success: true, code: booking.code })
  } catch (error) {
    console.error('Failed to create booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}