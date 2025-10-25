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

// ✅ In-memory cache to prevent redundant fetches
const profileCache = new Map<string, { profile: Profile; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initializedRef = useRef(false);

  // ✅ Fetch profile with OAuth fallback and background update
  const fetchProfile = useCallback(async (userId: string, forceRefresh = false) => {
    // Check cache first
    if (!forceRefresh) {
      const cached = profileCache.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('✅ Using cached profile');
        if (mountedRef.current) {
          setProfile(cached.profile);
          setLoading(false);
        }
        return;
      }
    }

    // Prevent concurrent fetches
    if (fetchingRef.current) {
      console.log('⏭️ Profile fetch already in progress');
      return;
    }

    fetchingRef.current = true;

    // Cancel previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      // Parallel fetch
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
        
        // ✅ Use OAuth avatar as fallback if DB avatar is null
        const finalAvatar = dbAvatar || oauthAvatar || null;
        
        const enrichedProfile: Profile = {
          ...profileResponse.data,
          email: authResponse.data.user?.email,
          avatar_url: finalAvatar, // Use fallback
        };

        // Cache the profile
        profileCache.set(userId, {
          profile: enrichedProfile,
          timestamp: Date.now()
        });

        setProfile(enrichedProfile);
        console.log('✅ Profile loaded', { 
          dbAvatar: !!dbAvatar, 
          oauthAvatar: !!oauthAvatar,
          usingFallback: !dbAvatar && !!oauthAvatar 
        });

        // ✅ Background update: If using OAuth fallback, update DB
        if (!dbAvatar && oauthAvatar) {
          console.log('📸 Updating avatar from OAuth metadata...');
          
          supabase
            .from('users_profile')
            .update({ 
              avatar_url: oauthAvatar,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .then(({ error }) => {
              if (error) {
                console.error('❌ Avatar update failed:', error);
              } else {
                console.log('✅ Avatar synced to database');
                // Clear cache to force fresh fetch next time
                profileCache.delete(userId);
              }
            });
        }
      }
    } catch (err: any) {
      // Ignore abort errors
      if (err.name === 'AbortError') return;
      
      console.error('❌ Error fetching profile:', err);
      
      if (mountedRef.current) {
        // Fallback profile from auth metadata
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
        console.log('⚠️ Using fallback profile from auth metadata');
      }
    } finally {
      fetchingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // ✅ Main effect - only runs once
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
        console.error('❌ Error checking user:', err);
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    checkUser();

    // ✅ Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event !== 'TOKEN_REFRESHED') {
          console.log('🔐 Auth event:', event);
        }
        
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
              console.log('🔄 First login - fetching profile with OAuth fallback');
              await fetchProfile(currentUser.id, true);
              initializedRef.current = true;
            } else {
              console.log('⏭️ Already initialized - skipping fetch');
            }
            break;

          case 'USER_UPDATED':
            if (currentUser) {
              console.log('🔄 User updated - refetching profile');
              await fetchProfile(currentUser.id, true);
            }
            break;
            
          case 'TOKEN_REFRESHED':
            // Skip fetch - profile hasn't changed
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

  // ✅ Manual profile refresh
  const refreshProfile = useCallback(async () => {
    if (user) {
      fetchingRef.current = false;
      await fetchProfile(user.id, true);
    }
  }, [user, fetchProfile]);

  // ✅ Sign out
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
      console.error('Error signing out:', error);
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
