// Time slot related types
export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Booking related types
export interface Booking {
  name: string;
  studentNumber: string;
  company?: string;
  notes?: string;
  slot: string;
  code: string;
}

export interface BookingData extends Booking {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Store related types
export interface BookingStore {
  bookings: BookingData[];
  selectedSlot: TimeSlot | null;
  isBooking: boolean;
  setSelectedSlot: (slot: TimeSlot) => void;
  addBooking: (booking: Booking) => void;
  removeBooking: (code: string) => void;
  modifyBooking: (code: string, newBooking: Booking) => void;
}

// Operation types
export type BookingOperation = 'create' | 'modify' | 'cancel';
export type ModificationState = 'verifying' | 'modifying' | 'cancelling' | 'completed';

// Validation related types
export interface BookingValidationError {
  field: string;
  message: string;
}

export interface BookingOperationResult {
  success: boolean;
  error?: string;
  code?: string;
} 