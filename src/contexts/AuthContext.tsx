import React, { createContext, useContext, useEffect, useState } from 'react';
import { DatabaseService } from '@/services/database';
import { AuthUser } from '@/types/database';

interface AuthContextType {
  user: AuthUser | null;
  profile: AuthUser | null;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const userData = await DatabaseService.verifyToken(token);
        if (userData) {
          setUser(userData);
        } else {
          localStorage.removeItem('auth_token');
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, username: string) => {
    try {
      const response = await DatabaseService.createUser({
        email,
        password,
        firstName,
        lastName,
        username,
      });
      
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
      
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    try {
      const response = await DatabaseService.signIn(emailOrUsername, password);
      
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
      
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signInAdmin = async (emailOrUsername: string, password: string) => {
    try {
      const response = await DatabaseService.signIn(emailOrUsername, password);
      
      if (!response.user.isAdmin) {
        return { 
          error: { message: 'Access denied. Admin privileges required.' }, 
          isAdmin: false 
        };
      }
      
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
      
      return { error: null, isAdmin: true };
    } catch (error: any) {
      return { error: { message: error.message }, isAdmin: false };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const value = {
    user,
    profile: user, // For compatibility with existing code
    loading,
    signUp,
    signIn,
    signInAdmin,
    signOut,
    isAdmin: user?.isAdmin || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};