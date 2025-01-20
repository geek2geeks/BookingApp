import { NextRequest, NextResponse } from 'next/server'
import { createBooking } from '@/app/lib/utils/booking-utils'
import { type ApiResponse, type CreateBookingRequest, type CreateBookingResponse } from '../types'

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<CreateBookingResponse>>> {
  try {
    const body = (await request.json()) as CreateBookingRequest

    // Validate request body
    if (!body.name || !body.studentNumber || !body.slot) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    // Create booking
    const result = await createBooking(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to create booking',
        },
        { status: 400 }
      )
    }

    // TODO: Save booking to database
    const booking = {
      ...body,
      code: result.code!,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: {
        booking,
        code: result.code!,
      },
    })
  } catch (error) {
    console.error('Failed to create booking:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create booking',
      },
      { status: 500 }
    )
  }
} 