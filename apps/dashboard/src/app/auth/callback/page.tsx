"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@paceon/lib/supabase';
import Image from 'next/image';

interface ProfileData {
    id: string;
    role: string;
}

interface PreferencesData {
    completed_at: string | null;
}

export default function CallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const source = searchParams.get('source');
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    setError(sessionError.message);
                    setTimeout(() => router.replace('/auth/login?error=session_failed'), 2000);
                    return;
                }

                if (!session) {
                    setError('No session created');
                    setTimeout(() => router.replace('/auth/login?error=no_session'), 2000);
                    return;
                }

                if (source === 'signup') {
                    router.replace('/auth/sign-up/matchmakingform?source=google');
                    return;
                }

                const userCreatedAt = new Date(session.user.created_at || 0).getTime();
                const isNewUser = userCreatedAt > (Date.now() - 10000);

                if (isNewUser) {
                    router.replace('/auth/sign-up/matchmakingform?new=true');
                    return;
                }

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

                if (hasProfile && hasCompletedMatchmaking) {
                    if (userRole === 'admin') {
                        router.replace('/admin/dashboard');
                    } else {
                        router.replace('/');
                    }
                } else {
                    router.replace('/auth/sign-up/matchmakingform?complete=true');
                }

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
                setError(errorMessage);
                setTimeout(() => router.replace('/auth/login?error=callback_failed'), 2000);
            }
        };

        handleCallback();
    }, [router, searchParams]);

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
                        {/* Spinning Border */}
                        <div className="relative inline-block">
                            <div className="absolute inset-0 rounded-full">
                                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FB6F7A] border-r-[#007AA6] animate-spin"></div>
                            </div>
                            
                            {/* Logo Container */}
                            <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center bg-transparent rounded-full p-4">
                                {/* Light mode logo (dark logo) */}
                                <Image
                                    src="/images/dark-logo.png"
                                    alt="PACE ON"
                                    width={120}
                                    height={120}
                                    className="object-contain dark:hidden"
                                    priority
                                />
                                {/* Dark mode logo (light logo) */}
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

            <style jsx>{`
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}