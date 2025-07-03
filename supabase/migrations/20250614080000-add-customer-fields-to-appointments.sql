
-- Add customer fields to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Update the appointments table to make user_id nullable since we might have guests
ALTER TABLE public.appointments 
ALTER COLUMN user_id DROP NOT NULL;
