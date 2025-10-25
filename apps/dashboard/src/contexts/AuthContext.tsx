// apps/dashboard/src/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@paceon/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null; // ✅ Add profile
  loading: boolean;
  refreshProfile: () => Promise<void>; // ✅ Add refresh function
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null); // ✅ Add profile state
  const [loading, setLoading] = useState(true);

  // ✅ Function to load profile from database
  const loadProfile = async (userId: string) => {
    try {
      console.log('👤 Loading profile for:', userId);
      
      const { data, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Profile error:', error);
        throw error;
      }

      console.log('✅ Profile loaded:', data);
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
      return null;
    }
  };

  // ✅ Refresh profile function (for updates)
  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  useEffect(() => {
    // ✅ Get initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);

        // ✅ Load profile if user exists
        if (session?.user) {
          await loadProfile(session.user.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // ✅ Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth event:', event);
      
      setSession(session);
      setUser(session?.user ?? null);

      // ✅ Handle specific events
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in:', session.user.email);
        await loadProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        setProfile(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('🔄 Token refreshed');
        // Optionally reload profile on token refresh
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
