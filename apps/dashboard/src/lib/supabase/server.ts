import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            // ✅ Ensure proper cookie options for session persistence
            cookieStore.set(name, value, {
              ...options,
              // ✅ Critical: sameSite must be 'lax' for OAuth redirects
              sameSite: 'lax',
              // ✅ Secure only in production
              secure: process.env.NODE_ENV === 'production',
              // ✅ HttpOnly for security
              httpOnly: true,
              // ✅ Make accessible across entire site
              path: '/',
            });
          });
        } catch (error) {
          // ✅ Log error for debugging
          console.error('❌ Failed to set cookie:', error);
        }
      },
    },
  });
}
