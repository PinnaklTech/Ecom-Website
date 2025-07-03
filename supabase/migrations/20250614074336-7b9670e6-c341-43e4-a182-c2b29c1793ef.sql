
-- Create a security definer function to safely fetch profiles without RLS recursion
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;
