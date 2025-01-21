import { create } from 'zustand';
import { TimeSlot, BookingData } from '@/app/types';
import { generateTimeSlots, isSlotAvailable, PRESENTATION_DATES } from '../utils/date-utils';
import { isValidBookingCode } from '../utils/booking-utils';

interface BookingFlowState {
  currentStep: 'week' | 'day' | 'slot' | 'details';
  selectedWeek: number | null;
  selectedDay: string | null;
  selectedTimeSlot: TimeSlot | null;
  bookings: BookingData[];
  bookingData: {
    name: string;
    studentNumber: string;
    company?: string;
    notes?: string;
  } | null;
  isLoading: boolean;
  error: string | null;
}

interface BookingStore extends BookingFlowState {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  resetFlow: () => void;
  selectWeek: (week: number) => void;
  selectDay: (date: string) => void;
  selectTimeSlot: (slot: TimeSlot) => void;
  setBookingData: (data: BookingData) => void;
  createBooking: (data: BookingData) => Promise<{ success: boolean; code?: string }>;
  fetchBookings: () => Promise<void>;
  cancelBooking: (code: string) => Promise<void>;
  updateBooking: (code: string, data: Partial<BookingData>) => Promise<void>;
  getBooking: (code: string) => Promise<BookingData | null>;
  setSelectedSlot: (slot: TimeSlot | null) => void;
  clearError: () => void;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  // Initial state
  currentStep: 'week',
  selectedWeek: null,
  selectedDay: null,
  selectedTimeSlot: null,
  bookings: [],
  bookingData: null,
  isLoading: false,
  error: null,

  // Navigation actions
  goToNextStep: () => {
    const { currentStep } = get();
    const steps: BookingFlowState['currentStep'][] = ['week', 'day', 'slot', 'details'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      set({ currentStep: steps[currentIndex + 1] });
    }
  },

  goToPreviousStep: () => {
    const { currentStep } = get();
    const steps: BookingFlowState['currentStep'][] = ['week', 'day', 'slot', 'details'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      set({ currentStep: steps[currentIndex - 1] });
    }
  },

  resetFlow: () => {
    set({
      currentStep: 'week',
      selectedWeek: null,
      selectedDay: null,
      selectedTimeSlot: null,
      bookingData: null,
      error: null
    });
  },

  // Selection actions
  selectWeek: (week: number) => {
    set({ selectedWeek: week, selectedDay: null, selectedTimeSlot: null, error: null });
  },

  selectDay: (date: string) => {
    if (!PRESENTATION_DATES.includes(date)) {
      set({ error: 'Invalid date selected' });
      return;
    }
    set({ selectedDay: date, selectedTimeSlot: null, error: null });
  },

  selectTimeSlot: (slot: TimeSlot) => {
    const { bookings } = get();
    if (!isSlotAvailable(slot, bookings)) {
      set({ error: 'Selected time slot is not available' });
      return;
    }
    set({ selectedTimeSlot: slot, error: null });
  },

  setBookingData: (data: BookingData) => {
    set({ bookingData: data, error: null });
  },

  // Booking actions
  createBooking: async (data: BookingData) => {
    const { selectedTimeSlot } = get();
    if (!selectedTimeSlot) {
      set({ error: 'No time slot selected' });
      return { success: false };
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          slot: `${selectedTimeSlot.date} - ${selectedTimeSlot.startTime}`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      const newBooking = await response.json();
      set(state => ({ 
        bookings: [...state.bookings, newBooking],
        bookingData: null,
        isLoading: false 
      }));

      return { success: true, code: newBooking.code };
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create booking',
        isLoading: false 
      });
      return { success: false };
    }
  },

  fetchBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const bookings = await response.json();
      set({ bookings, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch bookings', isLoading: false });
    }
  },

  cancelBooking: async (code: string) => {
    if (!isValidBookingCode(code)) {
      set({ error: 'Invalid booking code' });
      throw new Error('Invalid booking code');
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/bookings/${code}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel booking');
      }

      set(state => ({
        bookings: state.bookings.filter(b => b.code !== code),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to cancel booking', 
        isLoading: false 
      });
      throw error;
    }
  },

  updateBooking: async (code: string, data: Partial<BookingData>) => {
    if (!isValidBookingCode(code)) {
      set({ error: 'Invalid booking code' });
      throw new Error('Invalid booking code');
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/bookings/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update booking');
      }

      const updatedBooking = await response.json();
      set(state => ({
        bookings: state.bookings.map(b => b.code === code ? updatedBooking : b),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update booking', 
        isLoading: false 
      });
      throw error;
    }
  },

  getBooking: async (code: string) => {
    if (!isValidBookingCode(code)) {
      set({ error: 'Invalid booking code' });
      return null;
    }

    const booking = get().bookings.find(b => b.code === code);
    if (booking) {
      return booking;
    }

    // If not found in state, fetch all bookings and try again
    await get().fetchBookings();
    return get().bookings.find(b => b.code === code) || null;
  },

  setSelectedSlot: (slot) => set({ selectedTimeSlot: slot }),
  clearError: () => set({ error: null })
}));

// Helper hook to access bookings
export const useBookings = () => useBookingStore(state => state.bookings);