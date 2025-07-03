
-- First, create the security definer function to safely fetch profiles without RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS TABLE(
  id UUID,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  email TEXT,
  phone TEXT,
  is_admin BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.username,
    au.email::TEXT,
    p.phone,
    p.is_admin
  FROM public.profiles p
  JOIN auth.users au ON p.id = au.id
  WHERE p.id = user_id;
END;
$$;

-- Drop all existing RLS policies on the profiles table to stop the recursion
DROP POLICY IF EXISTS "Enable read access for users to their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for users to create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create simple, non-recursive RLS policies for profiles table
CREATE POLICY "Users can read own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO anon;
