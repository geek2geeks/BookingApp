import { z } from 'zod'

export const bookingFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),
  studentNumber: z.string()
    .min(1, 'Student number is required')
    .length(8, 'Student number must be exactly 8 digits')
    .regex(/^\d+$/, 'Student number must contain only digits'),
  company: z.string().optional(),
  notes: z.string().max(20, 'Notes cannot exceed 20 characters').optional(),
})

export type BookingFormData = z.infer<typeof bookingFormSchema> 