// src/hooks/useAuth.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@paceon/lib/supabase';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email?: string;
  username?: string;
  role?: string;
}

interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const profileCache = new Map<string, { profile: Profile; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000;

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initializedRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string, forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = profileCache.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        if (mountedRef.current) {
          setProfile(cached.profile);
          setLoading(false);
        }
        return;
      }
    }

    if (fetchingRef.current) {
      return;
    }

    fetchingRef.current = true;
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      const [profileResponse, authResponse] = await Promise.all([
        supabase
          .from('users_profile')
          .select('id, full_name, avatar_url, username, role')
          .eq('id', userId)
          .abortSignal(abortControllerRef.current.signal)
          .single(),
        supabase.auth.getUser()
      ]);

      if (profileResponse.error) throw profileResponse.error;

      if (profileResponse.data && mountedRef.current) {
        const oauthAvatar = authResponse.data.user?.user_metadata?.avatar_url;
        const dbAvatar = profileResponse.data.avatar_url;
        const finalAvatar = dbAvatar || oauthAvatar || null;
        
        const enrichedProfile: Profile = {
          ...profileResponse.data,
          email: authResponse.data.user?.email,
          avatar_url: finalAvatar,
        };

        profileCache.set(userId, {
          profile: enrichedProfile,
          timestamp: Date.now()
        });

        setProfile(enrichedProfile);

        if (!dbAvatar && oauthAvatar) {
          supabase
            .from('users_profile')
            .update({ 
              avatar_url: oauthAvatar,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .then(({ error }) => {
              if (!error) {
                profileCache.delete(userId);
              }
            });
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      
      if (mountedRef.current) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const fallbackProfile: Profile = {
          id: userId,
          full_name: authUser?.user_metadata?.full_name || 
                     authUser?.user_metadata?.name || 
                     authUser?.email?.split('@')[0] || 'User',
          avatar_url: authUser?.user_metadata?.avatar_url || null,
          email: authUser?.email,
          username: authUser?.user_metadata?.preferred_username || 
                    authUser?.email?.split('@')[0],
        };
        
        setProfile(fallbackProfile);
      }
    } finally {
      fetchingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        
        if (mountedRef.current) {
          setUser(currentUser);
        }

        if (currentUser) {
          await fetchProfile(currentUser.id);
          initializedRef.current = true;
        } else if (mountedRef.current) {
          setProfile(null);
          setLoading(false);
        }
      } catch (err) {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        
        if (mountedRef.current) {
          setUser(currentUser);
        }

        switch (event) {
          case 'SIGNED_OUT':
            if (mountedRef.current) {
              setProfile(null);
              setLoading(false);
            }
            profileCache.clear();
            initializedRef.current = false;
            break;
            
          case 'SIGNED_IN':
            if (currentUser && !initializedRef.current) {
              await fetchProfile(currentUser.id, true);
              initializedRef.current = true;
            }
            break;

          case 'USER_UPDATED':
            if (currentUser) {
              await fetchProfile(currentUser.id, true);
            }
            break;
            
          case 'TOKEN_REFRESHED':
            break;
            
          default:
            if (currentUser && !profile) {
              await fetchProfile(currentUser.id);
            }
        }
      }
    );

    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      fetchingRef.current = false;
      await fetchProfile(user.id, true);
    }
  }, [user, fetchProfile]);

  const signOut = useCallback(async () => {
    try {
      abortControllerRef.current?.abort();
      
      if (mountedRef.current) {
        setProfile(null);
        setUser(null);
        setLoading(true);
      }
      
      profileCache.clear();
      initializedRef.current = false;
      await supabase.auth.signOut();
      
    } catch (error) {
      // Silent fail
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  return {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
  };
}
