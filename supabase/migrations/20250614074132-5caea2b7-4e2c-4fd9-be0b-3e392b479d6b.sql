
-- Drop the problematic admin policies on appointments
DROP POLICY IF EXISTS "Admins can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can update appointments" ON public.appointments;

-- Recreate admin policies using the security definer function to avoid recursion
CREATE POLICY "Admins can view all appointments" 
  ON public.appointments 
  FOR SELECT 
  USING (
    (SELECT is_admin FROM public.get_user_profile(auth.uid()) LIMIT 1) = true
  );

CREATE POLICY "Admins can update appointments" 
  ON public.appointments 
  FOR UPDATE 
  USING (
    (SELECT is_admin FROM public.get_user_profile(auth.uid()) LIMIT 1) = true
  );
