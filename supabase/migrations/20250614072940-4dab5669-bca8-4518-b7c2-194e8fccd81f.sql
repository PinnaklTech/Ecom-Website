
-- Drop existing RLS policies on profiles table that might be causing recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create simple, non-recursive RLS policies for profiles table
CREATE POLICY "Enable read access for users to their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Enable insert for users to create their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users to update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);
