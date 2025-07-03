
-- Fix the get_user_by_username_or_email function to match the expected return type
DROP FUNCTION IF EXISTS public.get_user_by_username_or_email(text);

CREATE OR REPLACE FUNCTION public.get_user_by_username_or_email(identifier TEXT)
RETURNS TABLE(user_id UUID, email TEXT, is_admin BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First try to find by username
  RETURN QUERY
  SELECT p.id as user_id, au.email::TEXT, p.is_admin
  FROM public.profiles p
  JOIN auth.users au ON p.id = au.id
  WHERE p.username = identifier;
  
  -- If no result found, try by email
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT p.id as user_id, au.email::TEXT, p.is_admin
    FROM public.profiles p
    JOIN auth.users au ON p.id = au.id
    WHERE au.email = identifier;
  END IF;
END;
$$;
