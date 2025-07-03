
-- Add username column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Update the handle_new_user function to also store username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, username)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'username'
  );
  RETURN NEW;
END;
$$;

-- Create a function to find user by username or email (for login)
CREATE OR REPLACE FUNCTION public.get_user_by_username_or_email(identifier TEXT)
RETURNS TABLE(user_id UUID, email TEXT, is_admin BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First try to find by username
  RETURN QUERY
  SELECT p.id, au.email, p.is_admin
  FROM public.profiles p
  JOIN auth.users au ON p.id = au.id
  WHERE p.username = identifier;
  
  -- If no result found, try by email
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT p.id, au.email, p.is_admin
    FROM public.profiles p
    JOIN auth.users au ON p.id = au.id
    WHERE au.email = identifier;
  END IF;
END;
$$;
