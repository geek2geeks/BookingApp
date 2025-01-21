CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  student_number TEXT NOT NULL,
  company TEXT,
  notes TEXT,
  slot TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bookings_code_idx ON public.bookings(code);
CREATE INDEX IF NOT EXISTS bookings_slot_idx ON public.bookings(slot);

-- Enable Row Level Security but allow all operations
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for all users" ON public.bookings
  USING (true)
  WITH CHECK (true);
