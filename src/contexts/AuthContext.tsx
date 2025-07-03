
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string, username: string) => Promise<{ error: any }>;
  signIn: (emailOrUsername: string, password: string) => Promise<{ error: any }>;
  signInAdmin: (emailOrUsername: string, password: string) => Promise<{ error: any; isAdmin?: boolean }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminStatus, setAdminStatus] = useState<boolean>(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .rpc('get_user_profile', { user_id: userId });
      
      if (error) {
        return null;
      }
      
      if (profileData && profileData.length > 0) {
        const profile = profileData[0];
        return {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          username: profile.username,
          email: profile.email,
          phone: profile.phone,
          is_admin: profile.is_admin
        };
      }
      
      return null;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            setLoading(false);
          }, 100);
        } else {
          setProfile(null);
          setAdminStatus(false);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
          setLoading(false);
        }, 100);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string, username: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
          username: username,
        }
      }
    });
    return { error };
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    const { data: userLookup, error: lookupError } = await supabase.rpc('get_user_by_username_or_email', {
      identifier: emailOrUsername
    });

    if (lookupError) {
      return { error: lookupError };
    }

    let email = emailOrUsername;
    if (userLookup && userLookup.length > 0) {
      email = userLookup[0].email;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signInAdmin = async (emailOrUsername: string, password: string) => {
    const { data: userLookup, error: lookupError } = await supabase.rpc('get_user_by_username_or_email', {
      identifier: emailOrUsername
    });

    if (lookupError) {
      return { error: lookupError };
    }

    let email = emailOrUsername;
    let isAdmin = false;
    
    if (userLookup && userLookup.length > 0) {
      email = userLookup[0].email;
      isAdmin = userLookup[0].is_admin;
    } else {
      return { error: { message: 'User not found.' }, isAdmin: false };
    }

    if (!isAdmin) {
      return { error: { message: 'Access denied. Admin privileges required.' }, isAdmin: false };
    }
    
    setAdminStatus(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setAdminStatus(false);
    }
    
    return { error, isAdmin };
  };

  const signOut = async () => {
    setAdminStatus(false);
    await supabase.auth.signOut();
  };

  const isAdmin = profile?.is_admin || adminStatus;

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signInAdmin,
    signOut,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
