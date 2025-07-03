
-- First, let's fix the RLS policies to ensure they work properly
-- Drop existing policies and recreate them with proper structure

DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can manage all appointments" ON public.appointments;

-- Recreate clean RLS policies
CREATE POLICY "Users can view their own appointments" 
  ON public.appointments 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own appointments" 
  ON public.appointments 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments" 
  ON public.appointments 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin policy for viewing and managing all appointments
CREATE POLICY "Admins can manage all appointments" 
  ON public.appointments 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Make sure the user_id column is not nullable (it should reference authenticated users)
ALTER TABLE public.appointments ALTER COLUMN user_id SET NOT NULL;

-- Add a check to ensure appointment_date is in the future when creating new appointments
-- (but allow existing past appointments to remain)
CREATE OR REPLACE FUNCTION validate_appointment_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate for new appointments, not updates to existing ones
  IF TG_OP = 'INSERT' AND NEW.appointment_date < NOW() THEN
    RAISE EXCEPTION 'Appointment date cannot be in the past';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for appointment date validation
DROP TRIGGER IF EXISTS validate_appointment_date_trigger ON public.appointments;
CREATE TRIGGER validate_appointment_date_trigger
  BEFORE INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION validate_appointment_date();
