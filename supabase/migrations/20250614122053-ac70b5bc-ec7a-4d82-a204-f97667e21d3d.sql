
-- Enable Row Level Security on appointments table
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own appointments
CREATE POLICY "Users can view their own appointments" 
  ON public.appointments 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own appointments
CREATE POLICY "Users can create their own appointments" 
  ON public.appointments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to update their own appointments
CREATE POLICY "Users can update their own appointments" 
  ON public.appointments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows admins to view all appointments
CREATE POLICY "Admins can view all appointments" 
  ON public.appointments 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );
