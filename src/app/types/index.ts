export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Booking {
  id?: string;
  slot: string;  // Format: "YYYY-MM-DD - HH:mm"
  name: string;
  email: string;
  title: string;
  description: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}