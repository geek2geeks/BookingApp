export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface BookingData {
  id?: string;
  code?: string;
  name: string;
  studentNumber: string;
  company?: string;
  notes?: string;
  slot?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WeekData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  availableSlots: number;
  totalSlots: number;
}

export interface DayData {
  date: string;
  availableSlots: number;
  totalSlots: number;
  isFull: boolean;
  isPast: boolean;
}