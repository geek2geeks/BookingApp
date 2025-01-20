import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BookingStore, BookingData, Booking, TimeSlot, BookingOperationResult } from '@/app/types'

interface State extends BookingStore {
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  reset: () => void;
}

const initialState = {
  bookings: [],
  selectedSlot: null,
  isBooking: false,
  isLoading: false,
  error: null,
}

export const useBookingStore = create<State>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Loading and error states
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string) => set({ error }),
      clearError: () => set({ error: null }),

      // Slot selection
      setSelectedSlot: (slot: TimeSlot) => 
        set({ selectedSlot: slot, isBooking: true }),

      // Booking operations
      addBooking: async (booking: Booking) => {
        try {
          set({ isLoading: true, error: null });
          
          // Create BookingData from Booking
          const newBooking: BookingData = {
            ...booking,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Validate no overlapping bookings
          const hasOverlap = get().bookings.some(b => b.slot === booking.slot);
          if (hasOverlap) {
            throw new Error('This slot has already been booked');
          }

          // Add to state
          set(state => ({ 
            bookings: [...state.bookings, newBooking],
            isBooking: false,
            selectedSlot: null,
          }));

          return { success: true, code: booking.code };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to add booking';
          set({ error: message });
          return { success: false, error: message };
        } finally {
          set({ isLoading: false });
        }
      },

      removeBooking: async (code: string): Promise<BookingOperationResult> => {
        try {
          set({ isLoading: true, error: null });

          // Find booking
          const booking = get().bookings.find(b => b.code === code);
          if (!booking) {
            throw new Error('Booking not found');
          }

          // Remove from state
          set(state => ({
            bookings: state.bookings.filter(b => b.code !== code)
          }));

          return { success: true };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to remove booking';
          set({ error: message });
          return { success: false, error: message };
        } finally {
          set({ isLoading: false });
        }
      },

      modifyBooking: async (code: string, newBooking: Booking): Promise<BookingOperationResult> => {
        try {
          set({ isLoading: true, error: null });

          // Find existing booking
          const existingBooking = get().bookings.find(b => b.code === code);
          if (!existingBooking) {
            throw new Error('Booking not found');
          }

          // Check for slot overlap if slot is being changed
          if (newBooking.slot !== existingBooking.slot) {
            const hasOverlap = get().bookings.some(
              b => b.slot === newBooking.slot && b.code !== code
            );
            if (hasOverlap) {
              throw new Error('This slot has already been booked');
            }
          }

          // Update booking
          const updatedBooking: BookingData = {
            ...newBooking,
            id: existingBooking.id,
            createdAt: existingBooking.createdAt,
            updatedAt: new Date().toISOString(),
          };

          set(state => ({
            bookings: state.bookings.map(b => 
              b.code === code ? updatedBooking : b
            )
          }));

          return { success: true };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to modify booking';
          set({ error: message });
          return { success: false, error: message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Reset store
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'booking-store',
      // Only persist bookings, not UI state
      partialize: (state) => ({ 
        bookings: state.bookings 
      }),
    }
  )
);

// Selector hooks for better performance
export const useBookings = () => useBookingStore(state => state.bookings);
export const useSelectedSlot = () => useBookingStore(state => state.selectedSlot);
export const useIsBooking = () => useBookingStore(state => state.isBooking);
export const useLoadingState = () => useBookingStore(state => ({
  isLoading: state.isLoading,
  error: state.error,
})); 