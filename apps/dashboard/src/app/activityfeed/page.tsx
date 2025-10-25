// src/app/activity-feed/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@paceon/lib/supabase';
import ActivityFeed from '../components';
import { Loader2 } from 'lucide-react';

// Type definitions
type TabType = 'all' | 'yours' | 'saved';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  position?: string;
  company?: string;
}

export default function ActivityFeedPage() {
  const [user, setUser] = useState<{
    id: string;
    email?: string;
  } | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        console.log('=== AUTH DEBUG START ===');
        console.log('1. Session exists:', !!session);
        console.log('2. Session user ID:', session?.user?.id);
        console.log('3. Session access token:', session?.access_token ? 'Present ✅' : 'Missing ❌');
        console.log('4. Session expires at:', session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A');
        
        if (sessionError) {
          console.error('❌ Session Error:', sessionError);
          console.log('=== AUTH DEBUG END ===');
          setLoading(false);
          return;
        }

        if (!session?.user) {
          console.warn('⚠️ No session found');
          console.log('=== AUTH DEBUG END ===');
          setLoading(false);
          return;
        }

        if (session.access_token) {
          try {
            const tokenParts = session.access_token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log('5. JWT Payload:', {
                sub: payload.sub,
                role: payload.role,
                exp: new Date(payload.exp * 1000).toISOString()
              });
            }
          } catch (e) {
            console.error('Failed to parse JWT:', e);
          }
        }

        setUser({
          id: session.user.id,
          email: session.user.email ?? undefined,
        });

        console.log('6. Fetching profile for user:', session.user.id);

        const profileStart = Date.now();
        const { data: profileData, error: profileError } = await supabase
          .from('users_profile')
          .select('id, full_name, avatar_url, role')
          .eq('id', session.user.id)
          .maybeSingle();

        const profileTime = Date.now() - profileStart;
        console.log(`7. Profile query took: ${profileTime}ms`);
        console.log('8. Profile Data:', profileData);
        console.log('9. Profile Error:', profileError);

        const prefsStart = Date.now();
        const { data: preferencesData, error: preferencesError } = await supabase
          .from('matchmaking_preferences')
          .select('position, company')
          .eq('user_id', session.user.id)
          .maybeSingle();

        const prefsTime = Date.now() - prefsStart;
        console.log(`10. Preferences query took: ${prefsTime}ms`);
        console.log('11. Preferences Data:', preferencesData);
        console.log('12. Preferences Error:', preferencesError);

        if (profileData) {
          console.log('✅ Profile loaded successfully');
          setProfile({
            id: profileData.id,
            full_name: profileData.full_name,
            avatar_url: profileData.avatar_url,
            role: profileData.role,
            position: preferencesData?.position,
            company: preferencesData?.company,
          });
        } else {
          console.warn('⚠️ No profile data found. Using fallback.');
          const userName = session.user.user_metadata?.full_name 
            || session.user.email?.split('@')[0] 
            || 'User';
          
          setProfile({
            id: session.user.id,
            full_name: userName,
            avatar_url: session.user.user_metadata?.avatar_url,
            role: 'user',
            position: preferencesData?.position,
            company: preferencesData?.company,
          });
        }

        console.log('=== AUTH DEBUG END ===');
      } catch (error) {
        console.error('💥 Unexpected error in getUser:', error);
        console.log('=== AUTH DEBUG END ===');
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event);
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? undefined,
          });

          const { data: profileData } = await supabase
            .from('users_profile')
            .select('id, full_name, avatar_url, role')
            .eq('id', session.user.id)
            .maybeSingle();

          const { data: preferencesData } = await supabase
            .from('matchmaking_preferences')
            .select('position, company')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (profileData) {
            setProfile({
              ...profileData,
              position: preferencesData?.position,
              company: preferencesData?.company,
            });
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#15b392]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Please Sign In
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view the activity feed.
          </p>
          <a
            href="/auth/login"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white rounded-lg font-bold hover:shadow-lg transition-all"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Will scroll away */}
      <div className="bg-gray-100">
        <div className="p-4 sm:p-6 max-w-3xl mx-auto">
          <h1 className="text-3xl text-black font-bold mb-2">Activity Feed</h1>
          <p className="text-black">Share your sports moments with the community</p>
          {isAdmin && (
            <span className="inline-block mt-2 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
              ADMIN
            </span>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* ✅ Sticky Tabs */}
        <div className="sticky top-0 z-20 bg-gray-100 pb-4 -mx-4 px-4">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="flex border-b border-gray-200">
              {(['all', 'yours', 'saved'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 font-semibold transition-colors relative ${
                    activeTab === tab
                      ? 'text-[#15b392] bg-gray-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab === 'all'
                    ? 'All Posts'
                    : tab === 'yours'
                    ? 'Your Posts'
                    : 'Saved Posts'}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#15b392]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed - Scrollable */}
        <div className="pb-6">
          <ActivityFeed
            currentUserId={user.id}
            currentUserName={profile?.full_name || user.email?.split('@')[0] || 'User'}
            avatar_url={profile?.avatar_url}
            currentUserPosition={profile?.position}
            currentUserCompany={profile?.company}
            currentUserRole={profile?.role || 'user'}
            activeTab={activeTab}
          />
        </div>
      </div>
    </div>
  );
}
