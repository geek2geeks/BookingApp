import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateSchema = z.object({
  company: z.string().optional(),
  notes: z.string().max(500).optional(),
})

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { code: params.code }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Failed to fetch booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const data = await request.json()
    const validatedData = updateSchema.parse(data)

    const booking = await prisma.booking.update({
      where: { code: params.code },
      data: validatedData
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Failed to update booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { code: params.code }
    })

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

    await prisma.booking.delete({
      where: { code: params.code }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete booking:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}