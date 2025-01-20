import { NextResponse } from 'next/server'
import { generateTimeSlots } from '@/app/lib/utils/date-utils'
import { type ApiResponse, type GetSlotsResponse } from '../types'

export async function GET(): Promise<NextResponse<ApiResponse<GetSlotsResponse>>> {
  try {
    // Generate all available time slots
    const slots = generateTimeSlots()

    // TODO: Get booked slots from database
    const bookedSlots: string[] = []

    return NextResponse.json({
      success: true,
      data: {
        slots,
        bookedSlots,
      },
    })
  } catch (error) {
    console.error('Failed to get slots:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get available slots',
      },
      { status: 500 }
    )
  }
} 