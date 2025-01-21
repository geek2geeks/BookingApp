import { z } from 'zod'

export const bookingFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces'),
  studentNumber: z.string()
    .length(7, 'Student number must be exactly 7 characters')
    .regex(/^he\d{5}$/, 'Student number must be in format "heXXXXX" where X are digits')
    .transform(val => val.toLowerCase()),
  company: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters')
    .optional(),
  notes: z.string()
    .max(20, 'Notes cannot exceed 20 characters')
    .optional(),
  slot: z.string()
})

export type BookingFormData = z.infer<typeof bookingFormSchema> 