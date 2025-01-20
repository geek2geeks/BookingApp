import { z } from 'zod'

export const bookingFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  studentNumber: z.string()
    .regex(/^\d{8}$/, 'Student number must be exactly 8 digits'),
  company: z.string()
    .max(100, 'Company name cannot exceed 100 characters')
    .optional(),
  notes: z.string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional(),
})

export type BookingFormData = z.infer<typeof bookingFormSchema> 