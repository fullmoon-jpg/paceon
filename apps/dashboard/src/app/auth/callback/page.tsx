// src/app/auth/callback/page.tsx
"use client";

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@paceon/lib/supabaseclient';
import Image from 'next/image';

interface ProfileData {
    id: string;
    role: string;
}

interface PreferencesData {
    completed_at: string | null;
}

// Loading fallback component
function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F4F4EF] dark:bg-[#3F3E3D]">
            <div className="text-center">
                <div className="relative">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 rounded-full">
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FB6F7A] border-r-[#007AA6] animate-spin"></div>
                        </div>
                        
                        <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center bg-transparent rounded-full p-4">
                            <Image
                                src="/images/dark-logo.png"
                                alt="PACE ON"
                                width={120}
                                height={120}
                                className="object-contain dark:hidden"
                                priority
                            />
                            <Image
                                src="/images/light-logo.png"
                                alt="PACE ON"
                                width={120}
                                height={120}
                                className="object-contain hidden dark:block"
                                priority
                            />
                        </div>
                    </div>
                    
                    <p className="mt-6 text-[#3F3E3D] dark:text-white font-medium">
                        Loading...
                    </p>
                </div>
            </div>
        </div>
    );
}

// Callback handler component that uses useSearchParams
function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const handleCallback = async () => {
            try {
                const source = searchParams.get('source');
                const code = searchParams.get('code');
                
                console.log('[Callback] Starting authentication handler');
                console.log('[Callback] Code present:', code ? 'YES' : 'NO');
                console.log('[Callback] Source:', source);

                // Exchange code for session if code exists
                if (code) {
                    console.log('[Callback] Exchanging code for session');
                    const { data: { session: exchangedSession }, error: exchangeError } = 
                        await supabase.auth.exchangeCodeForSession(code);

                    if (exchangeError) {
                        console.error('[Callback] Exchange error:', exchangeError.message);
                        setError('Failed to authenticate with Google');
                        setTimeout(() => router.replace('/auth/login?error=exchange_failed'), 2000);
                        return;
                    }

                    if (!exchangedSession) {
                        console.error('[Callback] No session after exchange');
                        setError('Authentication failed');
                        setTimeout(() => router.replace('/auth/login?error=no_session'), 2000);
                        return;
                    }

                    console.log('[Callback] Code exchanged successfully for user:', exchangedSession.user.id);
                }

                // Get current session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('[Callback] Session error:', sessionError.message);
                    setError(sessionError.message);
                    setTimeout(() => router.replace('/auth/login?error=session_failed'), 2000);
                    return;
                }

                if (!session) {
                    console.error('[Callback] No session found');
                    setError('No session created');
                    setTimeout(() => router.replace('/auth/login?error=no_session'), 2000);
                    return;
                }

                console.log('[Callback] Session found for user:', session.user.id);

                // Check if coming from signup flow
                if (source === 'signup') {
                    console.log('[Callback] Redirecting to matchmaking form (signup source)');
                    router.replace('/auth/sign-up/matchmakingform?source=google');
                    return;
                }

                // Check if new user (created within last 10 seconds)
                const userCreatedAt = new Date(session.user.created_at || 0).getTime();
                const isNewUser = userCreatedAt > (Date.now() - 10000);

                if (isNewUser) {
                    console.log('[Callback] New user detected, redirecting to matchmaking');
                    router.replace('/auth/sign-up/matchmakingform?new=true');
                    return;
                }

                console.log('[Callback] Checking user profile and preferences');

                // Check profile and matchmaking preferences
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

                const profileData = profileResult.status === 'fulfilled' ? profileResult.value.data as ProfileData | null : null;
                const preferencesData = preferencesResult.status === 'fulfilled' ? preferencesResult.value.data as PreferencesData | null : null;

                const hasProfile = !!profileData;
                const hasCompletedMatchmaking = !!preferencesData?.completed_at;
                const userRole = profileData?.role || 'user';

                console.log('[Callback] Profile status:', {
                    hasProfile,
                    hasCompletedMatchmaking,
                    userRole
                });

                // Route based on profile status
                if (hasProfile && hasCompletedMatchmaking) {
                    if (userRole === 'admin') {
                        console.log('[Callback] Admin user, redirecting to admin dashboard');
                        router.replace('/admin/dashboard');
                    } else {
                        console.log('[Callback] Regular user, redirecting to home');
                        router.replace('/');
                    }
                } else {
                    console.log('[Callback] Profile incomplete, redirecting to matchmaking form');
                    router.replace('/auth/sign-up/matchmakingform?complete=true');
                }

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
                console.error('[Callback] Error during callback:', errorMessage);
                setError(errorMessage);
                setTimeout(() => router.replace('/auth/login?error=callback_failed'), 2000);
            }
        };

        // Small delay to ensure everything is mounted
        const timeoutId = setTimeout(() => {
            handleCallback();
        }, 100);

        // Fallback timeout - force redirect if stuck
        const fallbackTimeout = setTimeout(() => {
            console.warn('[Callback] Fallback timeout reached');
            router.replace('/');
        }, 10000);

        return () => {
            clearTimeout(timeoutId);
            clearTimeout(fallbackTimeout);
        };
        
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F4F4EF] dark:bg-[#3F3E3D]">
            <div className="text-center">
                {error ? (
                    <div className="bg-[#FB6F7A]/10 border border-[#FB6F7A] text-[#3F3E3D] dark:text-white px-6 py-4 rounded-lg max-w-md">
                        <p className="font-semibold">Authentication Failed</p>
                        <p className="text-sm mt-2">{error}</p>
                        <p className="text-sm mt-2">Redirecting...</p>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 rounded-full">
                                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FB6F7A] border-r-[#007AA6] animate-spin"></div>
                            </div>
                            
                            <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center bg-transparent rounded-full p-4">
                                <Image
                                    src="/images/dark-logo.png"
                                    alt="PACE ON"
                                    width={120}
                                    height={120}
                                    className="object-contain dark:hidden"
                                    priority
                                />
                                <Image
                                    src="/images/light-logo.png"
                                    alt="PACE ON"
                                    width={120}
                                    height={120}
                                    className="object-contain hidden dark:block"
                                    priority
                                />
                            </div>
                        </div>
                        
                        <p className="mt-6 text-[#3F3E3D] dark:text-white font-medium">
                            Processing authentication...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Main page component with Suspense boundary
export default function CallbackPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <CallbackHandler />
        </Suspense>
    );
}