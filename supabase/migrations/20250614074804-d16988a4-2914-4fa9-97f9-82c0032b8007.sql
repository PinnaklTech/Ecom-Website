
-- Add foreign key constraint between appointments and profiles
ALTER TABLE public.appointments 
ADD CONSTRAINT fk_appointments_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update appointments RLS policies to use security definer function to avoid recursion
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can update appointments" ON public.appointments;

-- Create new RLS policies using the security definer function
CREATE POLICY "Users can view their own appointments" 
  ON public.appointments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own appointments" 
  ON public.appointments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all appointments using function" 
  ON public.appointments 
  FOR SELECT 
  USING (
    (SELECT is_admin FROM public.get_user_profile(auth.uid()) LIMIT 1) = true
  );

CREATE POLICY "Admins can update appointments using function" 
  ON public.appointments 
  FOR UPDATE 
  USING (
    (SELECT is_admin FROM public.get_user_profile(auth.uid()) LIMIT 1) = true
  );
