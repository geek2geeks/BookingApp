import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type BookingFormData } from '../schemas/booking-form-schema'
import { type Booking, type BookingResult, createBooking, cancelBooking, modifyBooking, getBookingByCode } from '../utils/booking-utils'

interface BookingState {
  selectedSlot: string | null
  bookings: Booking[]
  isLoading: boolean
  error: string | null
  setSelectedSlot: (slot: string | null) => void
  addBooking: (data: BookingFormData & { slot: string }) => Promise<BookingResult>
  cancelBooking: (code: string) => Promise<BookingResult>
  modifyBooking: (code: string, data: Partial<BookingFormData> & { slot?: string }) => Promise<BookingResult>
  getBooking: (code: string) => Promise<Booking | null>
  clearError: () => void
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      selectedSlot: null,
      bookings: [],
      isLoading: false,
      error: null,

      setSelectedSlot: (slot) => set({ selectedSlot: slot }),

      addBooking: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const result = await createBooking(data)
          if (result.success && result.code) {
            const newBooking: Booking = {
              ...data,
              code: result.code,
              createdAt: new Date().toISOString(),
            }
            set((state) => ({
              bookings: [...state.bookings, newBooking],
              selectedSlot: null,
            }))
          } else {
            set({ error: result.error || 'Failed to create booking' })
          }
          return result
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create booking'
          set({ error: errorMessage })
          return { success: false, error: errorMessage }
        } finally {
          set({ isLoading: false })
        }
      },

      cancelBooking: async (code) => {
        set({ isLoading: true, error: null })
        try {
          const result = await cancelBooking(code)
          if (result.success) {
            set((state) => ({
              bookings: state.bookings.filter((booking) => booking.code !== code),
            }))
          } else {
            set({ error: result.error || 'Failed to cancel booking' })
          }
          return result
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking'
          set({ error: errorMessage })
          return { success: false, error: errorMessage }
        } finally {
          set({ isLoading: false })
        }
      },

      modifyBooking: async (code, data) => {
        set({ isLoading: true, error: null })
        try {
          const result = await modifyBooking(code, data)
          if (result.success) {
            set((state) => ({
              bookings: state.bookings.map((booking) =>
                booking.code === code
                  ? { ...booking, ...data }
                  : booking
              ),
            }))
          } else {
            set({ error: result.error || 'Failed to modify booking' })
          }
          return result
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to modify booking'
          set({ error: errorMessage })
          return { success: false, error: errorMessage }
        } finally {
          set({ isLoading: false })
        }
      },

      getBooking: async (code) => {
        set({ isLoading: true, error: null })
        try {
          const booking = await getBookingByCode(code)
          if (!booking) {
            set({ error: 'Booking not found' })
          }
          return booking
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to get booking'
          set({ error: errorMessage })
          return null
        } finally {
          set({ isLoading: false })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'booking-store',
    }
  )
)

// Selector hooks
export const useSelectedSlot = () => useBookingStore((state) => state.selectedSlot)
export const useBookings = () => useBookingStore((state) => state.bookings)
export const useBookingError = () => useBookingStore((state) => state.error)
export const useBookingLoading = () => useBookingStore((state) => state.isLoading) 