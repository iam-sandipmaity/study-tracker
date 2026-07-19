import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  
  // Auth methods
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: { display_name?: string; avatar_url?: string }) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription?.unsubscribe();
  }, [isConfigured]);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    if (!isConfigured) {
      return { error: { message: 'Supabase is not configured' } as AuthError };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    return { error };
  }, [isConfigured]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isConfigured) {
      return { error: { message: 'Supabase is not configured' } as AuthError };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  }, [isConfigured]);

  const signOut = useCallback(async () => {
    if (!isConfigured) return;
    await supabase.auth.signOut();
  }, [isConfigured]);

  const resetPassword = useCallback(async (email: string) => {
    if (!isConfigured) {
      return { error: { message: 'Supabase is not configured' } as AuthError };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  }, [isConfigured]);

  const updateProfile = useCallback(async (updates: { display_name?: string; avatar_url?: string }) => {
    if (!isConfigured || !user) {
      return { error: { message: 'Supabase is not configured or not logged in' } as AuthError };
    }

    const { error } = await supabase.auth.updateUser({
      data: updates,
    });

    return { error };
  }, [isConfigured, user]);

  const value = {
    user,
    session,
    loading,
    isConfigured,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
