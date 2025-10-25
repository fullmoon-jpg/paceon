// src/app/auth/success/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@paceon/lib/supabase';

export default function AuthSuccessPage() {
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;

  useEffect(() => {
    const completeAuth = async () => {
      try {
        console.log(`🔄 Attempt ${retryCount + 1}/${MAX_RETRIES}: Checking session...`);
        
        // ✅ Wait a bit for cookies to be available
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // ✅ Try to get session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session check error:', error);
          
          // ✅ Retry if not max attempts
          if (retryCount < MAX_RETRIES) {
            console.log('⏭️ Retrying...');
            setRetryCount(prev => prev + 1);
            return;
          }
          
          router.replace('/auth/login?error=session_refresh_failed');
          return;
        }

        if (!session) {
          console.error('❌ No session found');
          
          // ✅ Retry if not max attempts
          if (retryCount < MAX_RETRIES) {
            console.log('⏭️ No session yet, retrying...');
            setRetryCount(prev => prev + 1);
            return;
          }
          
          console.error('❌ Max retries reached, redirecting to login');
          router.replace('/auth/login?error=no_session');
          return;
        }

        console.log('✅ Session found:', session.user.email);

        // ✅ Check profile completion
        const { data: profile } = await supabase
          .from('users_profile')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        const { data: preferences } = await supabase
          .from('matchmaking_preferences')
          .select('completed_at')
          .eq('user_id', session.user.id)
          .maybeSingle();

        const hasCompletedMatchmaking = !!preferences?.completed_at;
        const userRole = profile?.role || 'user';

        // ✅ Redirect to appropriate page
        if (hasCompletedMatchmaking) {
          const redirectPath = userRole === 'admin' ? '/admin' : '/';
          console.log(`✅ Redirecting to ${redirectPath}`);
          router.replace(redirectPath);
        } else {
          console.log('⚠️ Incomplete profile → matchmaking form');
          router.replace('/auth/sign-up/matchmakingform?complete=true');
        }
      } catch (err) {
        console.error('💥 Error in auth success:', err);
        
        // ✅ Retry on error
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          return;
        }
        
        router.replace('/auth/login?error=unexpected');
      }
    };

    completeAuth();
  }, [router, retryCount]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#2a6435] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Completing sign in...
        </h2>
        <p className="text-gray-600">
          {retryCount > 0 ? `Verifying session (attempt ${retryCount + 1}/${MAX_RETRIES})...` : 'Please wait while we set up your session'}
        </p>
      </div>
    </div>
  );
}
