"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@paceon/lib/supabase';

export default function CallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                console.log('🔍 Client-side callback handler started');

                // Get source from query params
                const source = searchParams.get('source');
                console.log('Source:', source);

                // Supabase akan otomatis handle session dari URL fragment
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('❌ Session error:', sessionError);
                    setError(sessionError.message);
                    setTimeout(() => router.replace('/auth/login?error=session_failed'), 2000);
                    return;
                }

                if (!session) {
                    console.error('❌ No session found');
                    setError('No session created');
                    setTimeout(() => router.replace('/auth/login?error=no_session'), 2000);
                    return;
                }

                console.log('✅ Session created:', session.user.email);

                // Check if this is from signup
                if (source === 'signup') {
                    console.log('ℹ️ Signup flow → redirect to matchmaking');
                    router.replace('/auth/sign-up/matchmakingform?source=google');
                    return;
                }

                // Check if new user (created within last 10 seconds)
                const userCreatedAt = new Date(session.user.created_at || 0).getTime();
                const isNewUser = userCreatedAt > (Date.now() - 10000);

                if (isNewUser) {
                    console.log('ℹ️ Fresh signup detected → matchmaking');
                    router.replace('/auth/sign-up/matchmakingform?new=true');
                    return;
                }

                // Check existing user profile
                console.log('🔍 Checking user profile...');
                
                const [profileResult, preferencesResult] = await Promise.allSettled([
                    supabase
                        .from('users_profile')
                        .select('id, role')
                        .eq('id', session.user.id)
                        .maybeSingle(),
                    
                    supabase
                        .from('matchmaking_preferences')
                        .select('completed_at')
                        .eq('user_id', session.user.id)
                        .maybeSingle()
                ]);

                const profileData = profileResult.status === 'fulfilled' ? profileResult.value.data : null;
                const preferencesData = preferencesResult.status === 'fulfilled' ? preferencesResult.value.data : null;

                const hasProfile = !!profileData;
                const hasCompletedMatchmaking = !!preferencesData?.completed_at;
                const userRole = profileData?.role || 'user';

                console.log('📊 Profile check:', { hasProfile, hasCompletedMatchmaking, userRole });

                // Redirect based on profile status
                if (hasProfile && hasCompletedMatchmaking) {
                    if (userRole === 'admin') {
                        console.log('🔀 Admin → /admin');
                        router.replace('/admin');
                    } else {
                        console.log('🔀 User → /');
                        router.replace('/');
                    }
                } else {
                    console.log('ℹ️ Incomplete profile → matchmaking');
                    router.replace('/auth/sign-up/matchmakingform?complete=true');
                }

            } catch (err: any) {
                console.error('❌ Callback error:', err);
                setError(err.message);
                setTimeout(() => router.replace('/auth/login?error=callback_failed'), 2000);
            }
        };

        handleCallback();
    }, [router, searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                {error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                        <p className="font-semibold">Authentication Failed</p>
                        <p className="text-sm mt-2">{error}</p>
                        <p className="text-sm mt-2">Redirecting...</p>
                    </div>
                ) : (
                    <div>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2a6435] mx-auto"></div>
                        <p className="mt-4 text-gray-600">Processing authentication...</p>
                    </div>
                )}
            </div>
        </div>
    );
}