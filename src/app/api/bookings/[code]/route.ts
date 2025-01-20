import { NextRequest, NextResponse } from 'next/server'
import {
  getBookingByCode,
  modifyBooking,
  cancelBooking,
  type Booking,
} from '@/app/lib/utils/booking-utils'
import { type ApiResponse, type ModifyBookingRequest } from '../../types'

interface RouteParams {
  params: {
    code: string
  }
}

// Get booking details
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Booking>>> {
  try {
    const booking = await getBookingByCode(params.code)
    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: booking,
    })
  } catch (error) {
    console.error('Failed to get booking:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get booking',
      },
      { status: 500 }
    )
  }
}

// Modify booking
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Booking>>> {
  try {
    const body = (await request.json()) as ModifyBookingRequest

    // Get existing booking
    const existingBooking = await getBookingByCode(params.code)
    if (!existingBooking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking not found',
        },
        { status: 404 }
      )
    }

    // Modify booking
    const result = await modifyBooking(params.code, body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to modify booking',
        },
        { status: 400 }
      )
    }

    // TODO: Update booking in database
    const updatedBooking = {
      ...existingBooking,
      ...body,
    }

    return NextResponse.json({
      success: true,
      data: updatedBooking,
    })
  } catch (error) {
    console.error('Failed to modify booking:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to modify booking',
      },
      { status: 500 }
    )
  }
}

// Cancel booking
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    // Get existing booking
    const existingBooking = await getBookingByCode(params.code)
    if (!existingBooking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking not found',
        },
        { status: 404 }
      )
    }

    // Cancel booking
    const result = await cancelBooking(params.code)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to cancel booking',
        },
        { status: 400 }
      )
    }

    // TODO: Remove booking from database

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Failed to cancel booking:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cancel booking',
      },
      { status: 500 }
    )
  }
} 