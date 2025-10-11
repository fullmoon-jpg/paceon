// src/app/activity-feed/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../../../packages/lib/supabase';
import ActivityFeed from '../ui/components/ActivityFeed';
import { Loader2 } from 'lucide-react';

// Type definition jika perlu
type TabType = 'all' | 'yours' | 'saved';

export default function ActivityFeedPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'yours' | 'saved'>('all');

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        // Get profile data including role
        const { data: profileData } = await supabase
          .from('users_profile')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setProfile(profileData);
      }
      
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
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
            href="/login"
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
      {/* Header - Dipindahkan ke sini */}
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

      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        {/* Tabs Navigation - Dipindahkan ke sini */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors relative ${
                activeTab === 'all'
                  ? 'text-[#15b392] bg-gray-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Posts
              {activeTab === 'all' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#15b392]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('yours')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors relative ${
                activeTab === 'yours'
                  ? 'text-[#15b392] bg-gray-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Your Posts
              {activeTab === 'yours' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#15b392]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors relative ${
                activeTab === 'saved'
                  ? 'text-[#15b392] bg-gray-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Saved Posts
              {activeTab === 'saved' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#15b392]"></div>
              )}
            </button>
          </div>
        </div>

        {/* Activity Feed Component */}
        <ActivityFeed
          currentUserId={user.id}
          currentUserName={profile?.full_name || 'User'}
          currentUserSkillLevel={profile?.skill_level || 'Beginner'}
          currentUserRole={profile?.role || 'user'}
          activeTab={activeTab}
        />
      </div>
    </div>
  );
}