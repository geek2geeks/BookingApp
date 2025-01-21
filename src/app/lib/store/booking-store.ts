import { create } from 'zustand';
import { TimeSlot, BookingData } from '@/app/types';
import { generateTimeSlots, isSlotAvailable, PRESENTATION_DATES } from '../utils/date-utils';

interface BookingFlowState {
  // Navigation
  currentStep: 'week' | 'day' | 'slot' | 'details';
  
  // Selection state
  selectedWeek: number | null;
  selectedDay: string | null;
  selectedTimeSlot: TimeSlot | null;
  
  // Data
  bookings: BookingData[];
  bookingData: {
    name: string;
    studentNumber: string;
    company?: string;
    notes?: string;
  } | null;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
}

interface BookingStore extends BookingFlowState {
  // Navigation actions
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  resetFlow: () => void;
  
  // Selection actions
  selectWeek: (week: number) => void;
  selectDay: (date: string) => void;
  selectTimeSlot: (slot: TimeSlot) => void;
  setBookingData: (data: BookingData) => void;
  
  // Booking actions
  createBooking: (data: BookingData) => Promise<void>;
  fetchBookings: () => Promise<void>;
  cancelBooking: (code: string) => Promise<void>;
  updateBooking: (code: string, data: Partial<BookingData>) => Promise<void>;
  setSelectedSlot: (slot: TimeSlot) => void;
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
    const { currentStep, validateCurrentStep } = get();
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

  setSelectedSlot: (slot: TimeSlot) => {
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
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          slot: `${selectedTimeSlot.date} - ${selectedTimeSlot.startTime}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      await get().fetchBookings();
      set({ bookingData: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create booking' });
    } finally {
      set({ isLoading: false });
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
      set({ bookings });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch bookings' });
    } finally {
      set({ isLoading: false });
    }
  },

  cancelBooking: async (code: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/bookings/${code}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      await get().fetchBookings();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to cancel booking' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateBooking: async (code: string, data: Partial<BookingData>) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/bookings/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      await get().fetchBookings();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update booking' });
    } finally {
      set({ isLoading: false });
    }
  }
}));

// Helper hook to get bookings
export const useBookings = () => useBookingStore(state => state.bookings);