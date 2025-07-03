
-- Drop the problematic admin policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- Drop any duplicate policies to clean up
DROP POLICY IF EXISTS "Enable insert for users to create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for users to their own profile" ON public.profiles;

-- Create new admin policies using the security definer function to avoid recursion
CREATE POLICY "Admins can view all profiles using function" 
  ON public.profiles 
  FOR SELECT 
  USING (
    (SELECT is_admin FROM public.get_user_profile(auth.uid()) LIMIT 1) = true
    OR auth.uid() = id
  );

CREATE POLICY "Admins can update all profiles using function" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    (SELECT is_admin FROM public.get_user_profile(auth.uid()) LIMIT 1) = true
    OR auth.uid() = id
  );

CREATE POLICY "Admins can insert profiles using function" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (
    (SELECT is_admin FROM public.get_user_profile(auth.uid()) LIMIT 1) = true
    OR auth.uid() = id
  );
